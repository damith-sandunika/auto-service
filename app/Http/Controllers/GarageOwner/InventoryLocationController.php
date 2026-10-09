<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\InventoryLocation;
use Illuminate\Support\Facades\Auth;

class InventoryLocationController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $locations = InventoryLocation::where('garage_id', $user->garage_id)->get();
        return response()->json($locations);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive'
        ]);

        $location = InventoryLocation::create([
            'garage_id' => Auth::user()->garage_id,
            'name' => $validated['name'],
            'description' => $validated['description'],
            'status' => $validated['status'],
        ]);

        return redirect()->back()->with('success', 'Location created successfully');
    }

    public function update(Request $request, InventoryLocation $inventoryLocation)
    {
        if ($inventoryLocation->garage_id !== Auth::user()->garage_id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive'
        ]);

        $inventoryLocation->update($validated);

        return redirect()->back()->with('success', 'Location updated successfully');
    }

    public function destroy(InventoryLocation $inventoryLocation)
    {
        if ($inventoryLocation->garage_id !== Auth::user()->garage_id) {
            abort(403);
        }

        // Check if there are inventories tied to it
        if ($inventoryLocation->inventories()->exists()) {
            return redirect()->back()->with('error', 'Cannot delete location because items are stored in it.');
        }

        $inventoryLocation->delete();

        return redirect()->back()->with('success', 'Location deleted successfully');
    }
}
