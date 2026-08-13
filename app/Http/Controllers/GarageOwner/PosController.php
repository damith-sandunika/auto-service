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

        $services = ServiceCatalog::where('garage_id', $garageId)->get();
        $inventory = Inventory::where('garage_id', $garageId)->get();
        $mechanics = User::where('role', 'garage_staff')->where('garage_id', $garageId)->get();
        $customers = User::where('role', 'vehicle_owner')->with('vehicles')->get();

        return Inertia::render('GarageOwner/POS', [
            'services' => $services,
            'inventory' => $inventory,
            'mechanics' => $mechanics,
            'customers' => $customers
        ]);
    }

    public function store(Request $request)
    {
        $garageId = $this->getGarageId();

        $request->validate([
            'vehicle_number' => 'required|string',
            'customer_name' => 'required|string',
            'mechanic_id' => 'required|exists:users,id',
            'items' => 'required|array|min:1',
            'items.*.item_type' => 'required|in:service,part',
            'items.*.id' => 'required',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'payment_status' => 'required|in:pending,paid',
            'payment_method' => 'nullable|string',
            'amount_paid' => 'nullable|numeric|min:0'
        ]);

        DB::beginTransaction();

        try {
            // Find or Create Customer
            $customer = User::where('name', $request->customer_name)
                ->where('role', 'vehicle_owner')
                ->first();
            
            if (!$customer) {
                $customer = User::create([
                    'name' => $request->customer_name,
                    'email' => strtolower(str_replace(' ', '', $request->customer_name)) . rand(100,999) . '@garage.local',
                    'password' => bcrypt('password'),
                    'role' => 'vehicle_owner'
                ]);
            }

            // Find or Create Vehicle
            $vehicle = Vehicle::firstOrCreate(
                ['vehicle_number' => $request->vehicle_number],
                ['owner_id' => $customer->id, 'make' => 'Unknown', 'model' => 'Unknown']
            );

            if (!$vehicle->owner_id) {
                $vehicle->update(['owner_id' => $customer->id]);
            }

            // Create Job
            $job = Job::create([
                'garage_id' => $garageId,
                'vehicle_id' => $vehicle->id,
                'assigned_mechanic_id' => $request->mechanic_id,
                'status' => 'completed',
                'description' => 'POS Checkout Job',
                'total_cost' => collect($request->items)->sum(function($item) { return $item['price'] * $item['quantity']; })
            ]);

            // Create Job Items
            $totalAmount = 0;
            foreach ($request->items as $itemData) {
                $subtotal = $itemData['price'] * $itemData['quantity'];
                $totalAmount += $subtotal;

                JobItem::create([
                    'job_id' => $job->id,
                    'item_type' => $itemData['item_type'],
                    'description' => $itemData['description'],
                    'quantity' => $itemData['quantity'],
                    'price' => $itemData['price']
                ]);

                if ($itemData['item_type'] === 'part') {
                    $inv = Inventory::find($itemData['id']);
                    if ($inv) {
                        $inv->decrement('quantity', $itemData['quantity']);
                    }
                }
            }

            // Create Invoice
            $invoice = Invoice::create([
                'garage_id' => $garageId,
                'job_id' => $job->id,
                'total_amount' => $totalAmount,
                'status' => $request->payment_status
            ]);

            // Add Payment if provided
            if ($request->payment_status === 'paid' || $request->amount_paid > 0) {
                $payAmount = $request->amount_paid > 0 ? $request->amount_paid : $totalAmount;
                Payment::create([
                    'invoice_id' => $invoice->id,
                    'amount' => $payAmount,
                    'payment_method' => $request->payment_method ?? 'cash',
                    'payment_date' => now()
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'invoice_id' => $invoice->id,
                'message' => 'Checkout completed successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'POS checkout failed: ' . $e->getMessage()], 500);
        }
    }

    public function registerVehicle(Request $request)
    {
        $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'vehicle_number' => 'required|string|max:50|unique:vehicles,vehicle_number',
            'make' => 'required|string|max:100',
            'model' => 'required|string|max:100',
            'year' => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
        ]);

        DB::beginTransaction();
        try {
            // Find or create customer
            $customer = User::firstOrCreate(
                ['name' => $request->customer_name, 'role' => 'vehicle_owner'],
                [
                    'email' => strtolower(str_replace(' ', '', $request->customer_name)) . rand(1000, 9999) . '@customer.local',
                    'password' => bcrypt('password'),
                    'phone' => $request->customer_phone
                ]
            );

            // Create vehicle
            $vehicle = Vehicle::create([
                'vehicle_number' => strtoupper($request->vehicle_number),
                'make' => $request->make,
                'model' => $request->model,
                'year' => $request->year,
                'owner_id' => $customer->id
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'Vehicle registered successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Registration failed: ' . $e->getMessage()]);
        }
    }
}
