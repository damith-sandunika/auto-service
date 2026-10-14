<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use App\Models\VehicleMake;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VehicleController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $query = Vehicle::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('vehicle_number', 'like', "%{$search}%")
                  ->orWhere('make', 'like', "%{$search}%")
                  ->orWhere('model', 'like', "%{$search}%");
            });
        }

        $vehicles = $query->latest()->paginate(15)->withQueryString();
        $makes = VehicleMake::with('models')->orderBy('name')->get();

        return Inertia::render('SuperAdmin/Vehicles/Index', [
            'vehicles' => $vehicles,
            'makes' => $makes,
            'filters' => $request->only('search'),
            'totalVehicles' => Vehicle::count(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'vehicle_number' => 'required|string|max:50|unique:vehicles,vehicle_number',
            'make' => 'nullable|string|max:100',
            'model' => 'nullable|string|max:100',
            'year' => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
        ]);

        Vehicle::create([
            'vehicle_number' => strtoupper(trim($request->vehicle_number)),
            'make' => $request->make,
            'model' => $request->model,
            'year' => $request->year,
        ]);

        return redirect()->back()->with('success', 'Vehicle registered into central database successfully.');
    }
}
