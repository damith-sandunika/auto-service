<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Garage;

class GarageController extends Controller
{
    public function index()
    {
        return Inertia::render('SuperAdmin/Branches', [
            'garages' => Garage::with('owner')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
        ]);

        Garage::create($validated);
        return redirect()->back()->with('success', 'Branch created successfully.');
    }

    public function update(Request $request, Garage $garage)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
        ]);

        $garage->update($validated);
        return redirect()->back()->with('success', 'Branch updated successfully.');
    }

    public function destroy(Garage $garage)
    {
        $garage->delete();
        return redirect()->back()->with('success', 'Branch deleted successfully.');
    }
}
