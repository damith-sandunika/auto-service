<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use App\Models\Estimate;
use App\Models\EstimateItem;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\Inventory;
use App\Models\ServiceCatalog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class EstimateController extends Controller
{
    public function index()
    {
        $garageId = Auth::user()->garage_id;
        
        $estimates = Estimate::where('garage_id', $garageId)
            ->with(['customer', 'vehicle'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('GarageOwner/Estimates/Index', [
            'estimates' => $estimates,
        ]);
    }

    public function create()
    {
        $garageId = Auth::user()->garage_id;
        
        $customers = User::where('garage_id', $garageId)
            ->where('role', 'vehicle_owner')
            ->get(['id', 'name', 'email']);

        $customerIds = clone $customers;
        $vehicles = Vehicle::whereIn('owner_id', $customerIds->pluck('id'))->get(['id', 'owner_id', 'vehicle_number', 'make', 'model']);
        
        $inventory = Inventory::where('garage_id', $garageId)->get(['id', 'item_name', 'price']);
        $services = ServiceCatalog::where('garage_id', $garageId)->get(['id', 'service_name', 'price']);

        return Inertia::render('GarageOwner/Estimates/Create', [
            'customers' => $customers,
            'vehicles' => $vehicles,
            'inventory' => $inventory,
            'services' => $services,
            // Generate next estimate number using SequenceGenerator
            'nextEstimateNumber' => 'EST-' . \App\Services\SequenceGenerator::peekNextNumber($garageId, 'estimate'),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'customer_id' => 'required|exists:users,id',
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'estimate_date' => 'required|date',
            'expiry_date' => 'nullable|date',
            'items' => 'required|array|min:1',
            'items.*.type' => 'required|in:service,part',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'terms' => 'nullable|string',
        ]);

        DB::beginTransaction();

        try {
            $garageId = Auth::user()->garage_id;
            
            // Calculate totals
            $subtotal = 0;
            foreach ($request->items as $item) {
                $subtotal += ($item['quantity'] * $item['unit_price']);
            }
            
            $discount = $request->discount ?? 0;
            $tax = $request->tax ?? 0;
            $total = ($subtotal - $discount) + $tax;

            // Generate estimate number using SequenceGenerator
            $estimateNumber = 'EST-' . \App\Services\SequenceGenerator::getNextNumber($garageId, 'estimate');

            $estimate = Estimate::create([
                'garage_id' => $garageId,
                'customer_id' => $request->customer_id,
                'vehicle_id' => $request->vehicle_id,
                'estimate_number' => $estimateNumber,
                'estimate_date' => $request->estimate_date,
                'expiry_date' => $request->expiry_date,
                'subtotal' => $subtotal,
                'tax' => $tax,
                'discount' => $discount,
                'total' => $total,
                'status' => 'draft',
                'notes' => $request->notes,
                'terms' => $request->terms,
            ]);

            foreach ($request->items as $item) {
                EstimateItem::create([
                    'estimate_id' => $estimate->id,
                    'type' => $item['type'],
                    'item_id' => $item['item_id'] ?? null,
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total' => $item['quantity'] * $item['unit_price'],
                ]);
            }

            DB::commit();
            return redirect()->route('owner.estimates.index')->with('success', 'Estimate created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to create estimate: ' . $e->getMessage()]);
        }
    }

    public function show(Estimate $estimate)
    {
        if ($estimate->garage_id !== Auth::user()->garage_id) {
            abort(403);
        }

        $estimate->load(['customer', 'vehicle', 'items', 'garage']);
        
        return Inertia::render('GarageOwner/Estimates/Show', [
            'estimate' => $estimate,
        ]);
    }
    
    public function updateStatus(Request $request, Estimate $estimate)
    {
        if ($estimate->garage_id !== Auth::user()->garage_id) {
            abort(403);
        }

        $request->validate([
            'status' => 'required|in:draft,sent,accepted,rejected,expired',
        ]);

        $estimate->update([
            'status' => $request->status
        ]);

        return back()->with('success', 'Estimate status updated successfully.');
    }

    public function destroy(Estimate $estimate)
    {
        if ($estimate->garage_id !== Auth::user()->garage_id) {
            abort(403);
        }

        $estimate->delete();

        return redirect()->route('owner.estimates.index')->with('success', 'Estimate deleted successfully.');
    }
}
