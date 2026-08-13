<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Models\Inventory;
use Illuminate\Support\Facades\Auth;

class InventoryController extends Controller
{
    public function index()
    {
        $garageId = Auth::user()->garage_id;
        $inventory = Inventory::where('garage_id', $garageId)->get();

        return Inertia::render('GarageOwner/Inventory', [
            'inventory' => $inventory
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'item_name' => 'required|string|max:255',
            'sku' => 'nullable|string|max:255',
            'quantity' => 'required|integer|min:0',
            'price' => 'required|numeric|min:0',
        ]);

        $validated['garage_id'] = Auth::user()->garage_id;
        
        Inventory::create($validated);
        return redirect()->back()->with('success', 'Item added to inventory.');
    }

    public function update(Request $request, string $id)
    {
        $inventory = Inventory::where('garage_id', Auth::user()->garage_id)->findOrFail($id);

        $validated = $request->validate([
            'item_name' => 'required|string|max:255',
            'sku' => 'nullable|string|max:255',
            'quantity' => 'required|integer|min:0',
            'price' => 'required|numeric|min:0',
        ]);

        $inventory->update($validated);
        return redirect()->back()->with('success', 'Item updated successfully.');
    }

    public function destroy(string $id)
    {
        $inventory = Inventory::where('garage_id', Auth::user()->garage_id)->findOrFail($id);
        $inventory->delete();
        
        return redirect()->back()->with('success', 'Item deleted from inventory.');
    }
}
