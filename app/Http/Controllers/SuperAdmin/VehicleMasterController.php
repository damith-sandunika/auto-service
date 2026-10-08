<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\VehicleMake;
use App\Models\VehicleModel;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VehicleMasterController extends Controller
{
    public function index()
    {
        $makes = VehicleMake::with('models')->get();
        return Inertia::render('SuperAdmin/VehicleMaster/Index', [
            'makes' => $makes
        ]);
    }

    public function storeMake(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:vehicle_makes,name'
        ]);

        VehicleMake::create($request->only('name'));
        return redirect()->route('admin.vehicle-master.index')->with('success', 'Make added successfully');
    }

    public function storeModel(Request $request)
    {
        $request->validate([
            'make_id' => 'required|exists:vehicle_makes,id',
            'name' => 'required|string|max:255',
            'type' => 'nullable|string|max:255'
        ]);

        VehicleModel::create($request->all());
        return redirect()->route('admin.vehicle-master.index')->with('success', 'Model added successfully');
    }
}
