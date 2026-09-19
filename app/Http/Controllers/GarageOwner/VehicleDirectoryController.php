<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class VehicleDirectoryController extends Controller
{
    public function index()
    {
        $garageId = Auth::user()->garage_id;

        $customers = User::where('garage_id', $garageId)
            ->where('role', 'vehicle_owner')
            ->orderBy('created_at', 'desc')
            ->get();

        $customerIds = $customers->pluck('id');
        
        $vehicles = Vehicle::whereIn('owner_id', $customerIds)
            ->with('owner')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('GarageOwner/Vehicles/Index', [
            'customers' => $customers,
            'vehicles' => $vehicles
        ]);
    }

    public function storeCustomer(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
        ]);

        User::create([
            'garage_id' => Auth::user()->garage_id,
            'name' => $request->name,
            'email' => $request->email ?? (strtolower(str_replace(' ', '', $request->name)) . rand(1000,9999) . '@garage.local'),
            'password' => bcrypt('password'),
            'role' => 'vehicle_owner',
            'phone' => $request->phone,
            'address' => $request->address,
        ]);

        return back()->with('success', 'Customer added successfully.');
    }

    public function storeVehicle(Request $request)
    {
        $request->validate([
            'owner_id' => 'required|exists:users,id',
            'vehicle_number' => 'required|string|max:50',
            'make' => 'nullable|string|max:100',
            'model' => 'nullable|string|max:100',
            'year' => 'nullable|integer',
        ]);

        Vehicle::create([
            'owner_id' => $request->owner_id,
            'vehicle_number' => $request->vehicle_number,
            'make' => $request->make,
            'model' => $request->model,
            'year' => $request->year,
        ]);

        return back()->with('success', 'Vehicle added successfully.');
    }

    public function destroyVehicle(Vehicle $vehicle)
    {
        // Simple check to ensure vehicle belongs to a customer in this garage
        $garageId = Auth::user()->garage_id;
        $customer = User::find($vehicle->owner_id);
        
        if ($customer && $customer->garage_id === $garageId) {
            $vehicle->delete();
            return back()->with('success', 'Vehicle removed.');
        }

        abort(403);
    }
}
