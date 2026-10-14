<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use App\Models\VehicleMake;
use App\Models\VehicleModel;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VehicleMasterController extends Controller
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

        return Inertia::render('SuperAdmin/VehicleMaster/Index', [
            'makes' => $makes,
            'vehicles' => $vehicles,
            'filters' => $request->only('search', 'tab'),
            'totalVehicles' => Vehicle::count(),
        ]);
    }

    public function storeMake(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:vehicle_makes,name'
        ]);

        VehicleMake::create($request->only('name'));
        return redirect()->back()->with('success', 'Vehicle Make added successfully');
    }

    public function storeModel(Request $request)
    {
        $request->validate([
            'make_id' => 'required|exists:vehicle_makes,id',
            'name' => 'required|string|max:255',
            'type' => 'nullable|string|max:255'
        ]);

        VehicleModel::create($request->all());
        return redirect()->back()->with('success', 'Vehicle Model added successfully');
    }

    public function storeVehicle(Request $request)
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
