<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Models\Inventory;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Traits\JobAccessTrait;

class InventoryController extends Controller
{
    use JobAccessTrait;
    public function index(Request $request)
    {
        $garageId = $this->getGarageId($request);
        $inventory = Inventory::with('location')->where('garage_id', $garageId)->orderBy('id', 'desc')->paginate(20);
        $lowStockCount = Inventory::where('garage_id', $garageId)->where('quantity', '<=', 5)->count();
        $locations = \App\Models\InventoryLocation::where('garage_id', $garageId)->get();
        $activeOrders = \App\Models\Job::with('vehicle:id,vehicle_number,license_plate')
            ->select(['id', 'vehicle_id', 'status', 'garage_id'])
            ->where('garage_id', $garageId)
            ->whereNotIn('status', ['completed', 'done'])
            ->orderBy('id', 'desc')
            ->take(100)
            ->get();

        return Inertia::render('GarageOwner/Inventory', [
            'inventory' => $inventory,
            'lowStockCount' => $lowStockCount,
            'locations' => $locations,
            'activeOrders' => $activeOrders
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'item_name' => 'required|string|max:255',
            'sku' => 'nullable|string|max:255',
            'quantity' => 'required|numeric|min:0.01',
            'price' => 'required|numeric|min:0',
            'inventory_location_id' => 'nullable|exists:inventory_locations,id',
            'job_id' => 'nullable|exists:service_jobs,id'
        ]);

        $garageId = $this->getGarageId($request);
        $validated['garage_id'] = $garageId;
        
        $jobId = $validated['job_id'] ?? null;
        unset($validated['job_id']); // Not in inventories table
        
        return DB::transaction(function () use ($validated, $jobId) {
            $inventory = Inventory::create($validated);

            if ($jobId) {
                \App\Models\JobItem::create([
                    'job_id' => $jobId,
                    'item_type' => 'part',
                    'inventory_id' => $inventory->id,
                    'description' => $validated['item_name'],
                    'quantity' => $validated['quantity'],
                    'price' => $validated['price'],
                    'cost_price' => $validated['price'],
                    'inventory_location_id' => $validated['inventory_location_id']
                ]);

                // Recalculate job and invoice totals
                $job = \App\Models\Job::find($jobId);
                if ($job) {
                    $newSubTotal = $job->items()->sum(DB::raw('price * quantity'));
                    $job->total_cost = $newSubTotal;
                    $job->save();

                    if ($job->invoice) {
                        $job->invoice->total_amount = $newSubTotal;
                        $job->invoice->save();
                    }
                }
            }

            return redirect()->back()->with('success', 'Item added to inventory.');
        });
    }

    public function update(Request $request, string $id)
    {
        $inventory = Inventory::findOrFail($id);
        $this->checkGarageAccess($inventory->garage_id);

        $validated = $request->validate([
            'item_name' => 'required|string|max:255',
            'sku' => 'nullable|string|max:255',
            'quantity' => 'required|numeric|min:0',
            'price' => 'required|numeric|min:0',
        ]);

        return DB::transaction(function () use ($inventory, $validated) {
            $inventory->update($validated);
            return redirect()->back()->with('success', 'Item updated successfully.');
        });
    }

    public function destroy(string $id)
    {
        $inventory = Inventory::findOrFail($id);
        $this->checkGarageAccess($inventory->garage_id);
        $inventory->delete();
        
        return redirect()->back()->with('success', 'Item deleted from inventory.');
    }
}
