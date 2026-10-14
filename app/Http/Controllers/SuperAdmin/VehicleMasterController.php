<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\VehicleMake;
use App\Models\VehicleModel;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VehicleMasterController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $query = VehicleMake::withCount('models');

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        $makes = $query->orderBy('name')->paginate(15)->withQueryString();
        $allMakes = VehicleMake::select('id', 'name')->orderBy('name')->get();
        $totalMakes = VehicleMake::count();
        $totalModels = VehicleModel::count();

        return Inertia::render('SuperAdmin/VehicleMaster/Index', [
            'makes' => $makes,
            'allMakes' => $allMakes,
            'totalMakes' => $totalMakes,
            'totalModels' => $totalModels,
            'filters' => $request->only('search'),
        ]);
    }

    public function getModels(VehicleMake $make)
    {
        return response()->json($make->models()->orderBy('name')->get());
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

    public function updateMake(Request $request, VehicleMake $make)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:vehicle_makes,name,' . $make->id
        ]);

        $make->update($request->only('name'));
        return redirect()->back()->with('success', 'Vehicle Make updated successfully');
    }

    public function destroyMake(VehicleMake $make)
    {
        $name = $make->name;
        $make->delete();
        return redirect()->back()->with('success', "Vehicle Make '{$name}' deleted successfully");
    }

    public function updateModel(Request $request, VehicleModel $model)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'nullable|string|max:255',
            'make_id' => 'sometimes|required|exists:vehicle_makes,id'
        ]);

        $model->update($request->only('name', 'type', 'make_id'));
        return redirect()->back()->with('success', 'Vehicle Model updated successfully');
    }

    public function destroyModel(VehicleModel $model)
    {
        $name = $model->name;
        $model->delete();
        return redirect()->back()->with('success', "Vehicle Model '{$name}' deleted successfully");
    }
}
