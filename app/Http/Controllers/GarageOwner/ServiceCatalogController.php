<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Models\ServiceCatalog;
use Illuminate\Support\Facades\Auth;

class ServiceCatalogController extends Controller
{
    public function index()
    {
        $garageId = Auth::user()->garage_id;
        $services = ServiceCatalog::where('garage_id', $garageId)->get();

        return Inertia::render('GarageOwner/Services', [
            'services' => $services
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'service_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'default_price' => 'required|numeric|min:0',
        ]);

        $validated['garage_id'] = Auth::user()->garage_id;
        
        ServiceCatalog::create($validated);
        return redirect()->back()->with('success', 'Service added successfully.');
    }

    public function update(Request $request, string $id)
    {
        $service = ServiceCatalog::where('garage_id', Auth::user()->garage_id)->findOrFail($id);

        $validated = $request->validate([
            'service_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'default_price' => 'required|numeric|min:0',
        ]);

        $service->update($validated);
        return redirect()->back()->with('success', 'Service updated successfully.');
    }

    public function destroy(string $id)
    {
        $service = ServiceCatalog::where('garage_id', Auth::user()->garage_id)->findOrFail($id);
        $service->delete();
        
        return redirect()->back()->with('success', 'Service deleted successfully.');
    }
}
