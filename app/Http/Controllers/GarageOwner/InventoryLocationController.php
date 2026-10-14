<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\InventoryLocation;
use App\Models\JobItem;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Traits\JobAccessTrait;

class InventoryLocationController extends Controller
{
    use JobAccessTrait;

    public function index(Request $request)
    {
        $garageId = $this->getGarageId($request);
        $locations = InventoryLocation::where('garage_id', $garageId)->get();
        return response()->json($locations);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive'
        ]);

        $garageId = $this->getGarageId($request);

        return DB::transaction(function () use ($garageId, $validated) {
            InventoryLocation::create([
                'garage_id' => $garageId,
                'name' => $validated['name'],
                'description' => $validated['description'],
                'status' => $validated['status'],
            ]);

            return redirect()->back()->with('success', 'Location created successfully');
        });
    }

    public function update(Request $request, InventoryLocation $inventoryLocation)
    {
        $this->checkGarageAccess($inventoryLocation->garage_id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive'
        ]);

        return DB::transaction(function () use ($inventoryLocation, $validated) {
            $inventoryLocation->update($validated);
            return redirect()->back()->with('success', 'Location updated successfully');
        });
    }

    public function destroy(InventoryLocation $inventoryLocation)
    {
        $this->checkGarageAccess($inventoryLocation->garage_id);

        return DB::transaction(function () use ($inventoryLocation) {
            // Check if there are inventories or job items tied to it
            if ($inventoryLocation->inventories()->exists() || JobItem::where('inventory_location_id', $inventoryLocation->id)->exists()) {
                return redirect()->back()->with('error', 'Cannot delete location because parts or active jobs are stored in it.');
            }

            $inventoryLocation->delete();

            return redirect()->back()->with('success', 'Location deleted successfully');
        });
    }
}
