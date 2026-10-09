<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Models\ServiceCatalog;
use Illuminate\Support\Facades\Auth;
use App\Traits\JobAccessTrait;

class ServiceCatalogController extends Controller
{
    use JobAccessTrait;
    public function index(Request $request)
    {
        $garageId = $this->getGarageId($request);
        $services = ServiceCatalog::where('garage_id', $garageId)->paginate(20);

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

        $validated['garage_id'] = $this->getGarageId($request);
        
        ServiceCatalog::create($validated);
        return redirect()->back()->with('success', 'Service added successfully.');
    }

    public function update(Request $request, string $id)
    {
        $service = ServiceCatalog::findOrFail($id);
        $this->checkGarageAccess($service->garage_id);

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
        $service = ServiceCatalog::findOrFail($id);
        $this->checkGarageAccess($service->garage_id);
        $service->delete();
        
        return redirect()->back()->with('success', 'Service deleted successfully.');
    }
}
