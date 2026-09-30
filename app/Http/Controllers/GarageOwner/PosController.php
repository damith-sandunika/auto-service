<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use App\Models\ServiceCatalog;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\Job;
use App\Models\JobItem;
use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PosController extends Controller
{
    private function getGarageId()
    {
        return Auth::user()->garage_id ?? \App\Models\Garage::where('owner_id', Auth::id())->value('id') ?? 1;
    }

    public function index()
    {
        $garageId = $this->getGarageId();

        $activeSession = \App\Models\RegisterSession::where('garage_id', $garageId)
            ->where('status', 'open')
            ->first();

        if (!$activeSession) {
            return redirect()->route('owner.dashboard')->with('error', 'Please open a branch shift before accessing the POS.');
        }

        $services = ServiceCatalog::where('garage_id', $garageId)->get();
        $inventory = Inventory::where('garage_id', $garageId)->get();
        $mechanics = User::where('role', 'garage_staff')->where('garage_id', $garageId)->get();
        $customers = User::where('role', 'vehicle_owner')->with('vehicles')->get();
        
        $jobs = Job::where('garage_id', $garageId)
            ->where('status', '!=', 'completed')
            ->with(['vehicle.owner', 'mechanic'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('GarageOwner/POS', [
            'services' => $services,
            'inventory' => $inventory,
            'mechanics' => $mechanics,
            'customers' => $customers,
            'jobs' => $jobs
        ]);
    }

    public function storeJob(Request $request)
    {
        $garageId = $this->getGarageId();

        $request->validate([
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'new_vehicle_number' => 'required_without:vehicle_id|nullable|string|max:255',
            'new_vehicle_make' => 'nullable|string',
            'new_vehicle_model' => 'nullable|string',
            
            'customer_id' => 'nullable|exists:users,id',
            'new_customer_name' => 'required_without:customer_id|nullable|string|max:255',
            'new_customer_phone' => 'nullable|string',

            'mechanic_id' => 'nullable|exists:users,id',
            'description' => 'nullable|string'
        ]);

        DB::beginTransaction();
        try {
            // Handle Customer
            $customerId = $request->customer_id;
            if (!$customerId && $request->new_customer_name) {
                $customer = User::create([
                    'garage_id' => $garageId,
                    'name' => $request->new_customer_name,
                    'email' => strtolower(str_replace(' ', '', $request->new_customer_name)) . rand(100,999) . '@garage.local',
                    'phone' => $request->new_customer_phone,
                    'password' => bcrypt('password'),
                    'role' => 'vehicle_owner'
                ]);
                $customerId = $customer->id;
            }

            // Handle Vehicle
            $vehicleId = $request->vehicle_id;
            if (!$vehicleId && $request->new_vehicle_number) {
                $vehicle = Vehicle::create([
                    'garage_id' => $garageId,
                    'owner_id' => $customerId,
                    'vehicle_number' => $request->new_vehicle_number,
                    'make' => $request->new_vehicle_make ?? 'Unknown',
                    'model' => $request->new_vehicle_model ?? 'Unknown'
                ]);
                $vehicleId = $vehicle->id;
            }

            $job = Job::create([
                'garage_id' => $garageId,
                'vehicle_id' => $vehicleId,
                'assigned_mechanic_id' => $request->mechanic_id,
                'description' => $request->description,
                'status' => 'in_progress',
                'total_cost' => 0
            ]);

            DB::commit();
            return redirect()->route('owner.jobs.workspace', $job->id)->with('success', 'Job created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to create job: ' . $e->getMessage()]);
        }
    }

}
