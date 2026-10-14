<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Traits\JobAccessTrait;

class VehicleDirectoryController extends Controller
{
    use JobAccessTrait;
    public function index(Request $request)
    {
        $garageId = $this->getGarageId($request);

        $customers = User::where('garage_id', $garageId)
            ->where('role', 'vehicle_owner')
            ->orderBy('created_at', 'desc')
            ->get();

        $customerIds = $customers->pluck('id');
        
        $vehicleOwners = \App\Models\VehicleOwner::whereIn('customer_id', $customerIds)
            ->with('customer')
            ->get()
            ->keyBy('vehicle_id');
        $vehicleIds = $vehicleOwners->keys();
        
        $vehicles = Vehicle::whereIn('id', $vehicleIds)
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        $vehicles->getCollection()->transform(function ($v) use ($vehicleOwners) {
            $ownerRec = $vehicleOwners->get($v->id);
            $v->owner = $ownerRec?->customer;
            return $v;
        });

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
            'garage_id' => $this->getGarageId($request),
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

        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            $vehicle = Vehicle::where('vehicle_number', $request->vehicle_number)->first();
            
            if (!$vehicle) {
                $vehicle = Vehicle::create([
                    'vehicle_number' => $request->vehicle_number,
                    'make' => $request->make,
                    'model' => $request->model,
                    'year' => $request->year,
                ]);

                \App\Models\VehicleOwner::create([
                    'vehicle_id' => $vehicle->id,
                    'customer_id' => $request->owner_id,
                    'garage_id' => $this->getGarageId($request),
                    'is_current' => true,
                    'start_date' => now()
                ]);
                $currentOwner = \App\Models\VehicleOwner::where('vehicle_id', $vehicle->id)->where('is_current', true)->first();
                if (!$currentOwner || $currentOwner->customer_id != $request->owner_id) {
                    \App\Models\VehicleOwner::where('vehicle_id', $vehicle->id)->where('is_current', true)->update([
                        'is_current' => false,
                        'end_date' => now()
                    ]);
                    
                    \App\Models\VehicleOwner::create([
                        'vehicle_id' => $vehicle->id,
                        'customer_id' => $request->owner_id,
                        'garage_id' => $this->getGarageId($request),
                        'is_current' => true,
                        'start_date' => now()
                    ]);
                }
            }

            \Illuminate\Support\Facades\DB::commit();
            return back()->with('success', 'Vehicle added successfully.');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return back()->withErrors(['error' => 'Failed to add vehicle: ' . $e->getMessage()]);
        }
    }

    public function destroyVehicle(Request $request, Vehicle $vehicle)
    {
        // Simple check to ensure vehicle belongs to a customer in this garage
        $garageId = $this->getGarageId($request);
        $currentOwner = \App\Models\VehicleOwner::where('vehicle_id', $vehicle->id)->where('is_current', true)->first();
        $customer = $currentOwner ? User::find($currentOwner->customer_id) : null;
        
        if ($customer && $customer->garage_id === $garageId) {
            $vehicle->delete();
            return back()->with('success', 'Vehicle removed.');
        }

        abort(403);
    }
}
