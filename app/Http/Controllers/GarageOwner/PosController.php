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
use App\Traits\JobAccessTrait;

class PosController extends Controller
{
    use JobAccessTrait;


    public function index(Request $request)
    {
        $garageId = $this->getGarageId($request);
        $garage = \App\Models\Garage::find($garageId);
        
        $branches = [];
        if (Auth::user()->role === 'company_owner') {
            $branches = \App\Models\Garage::where('owner_id', Auth::id())->get(['id', 'name']);
        }

        $activeSession = \App\Models\RegisterSession::where('garage_id', $garageId)
            ->where('status', 'open')
            ->first();

        if (!$activeSession) {
            return redirect()->route('owner.dashboard')->with('error', 'Please open a branch shift before accessing the POS.');
        }

        $services = ServiceCatalog::where('garage_id', $garageId)->get(); // Catalogs are usually small
        $inventory = Inventory::where('garage_id', $garageId)->where('quantity', '>', 0)->orderBy('updated_at', 'desc')->take(500)->get();
        $mechanics = User::where('role', 'garage_staff')->where('garage_id', $garageId)->get();
        
        // Limit customers to recent 100 to prevent JSON payload from exceeding megabytes and crashing React
        $customers = User::where('role', 'vehicle_owner')->with('vehicleOwners.vehicle')->orderBy('created_at', 'desc')->take(100)->get();
        
        $customers->transform(function ($customer) {
            $customer->vehicles = $customer->vehicleOwners->map(function ($vo) {
                return $vo->vehicle;
            })->filter()->values();
            unset($customer->vehicleOwners);
            return $customer;
        });
        
        $templates = [];
        if ($garage && $garage->branch_category_id) {
            $templates = \App\Models\ServiceTemplate::where('branch_category_id', $garage->branch_category_id)
                ->where('is_active', true)
                ->get();
        }

        // Only these 3 tabs are shown on the board; 'done' orders are archived off-board
        $allowedTabs = ['checking', 'working', 'completed'];
        $activeTab = in_array($request->query('tab'), $allowedTabs)
            ? $request->query('tab')
            : 'checking';

        // Tab counts (checking, working, completed only — done orders are removed from board)
        $tabCounts = [
            'checking'  => Job::where('garage_id', $garageId)->where('status', 'checking')->count(),
            'working'   => Job::where('garage_id', $garageId)->where('status', 'working')->count(),
            'completed' => Job::where('garage_id', $garageId)->where('status', 'completed')->count(),
        ];

        $jobs = Job::where('garage_id', $garageId)
            ->where('status', $activeTab)
            ->with(['vehicle', 'owner', 'mechanic', 'invoice.payments', 'payments'])
            ->orderBy('created_at', 'desc')
            ->paginate(15)->withQueryString();

        return Inertia::render('GarageOwner/POS', [
            'services' => $services,
            'inventory' => $inventory,
            'mechanics' => $mechanics,
            'customers' => $customers,
            'jobs' => $jobs,
            'service_templates' => $templates,
            'branches' => $branches,
            'selectedBranchId' => $garageId,
            'activeSession' => $activeSession,
            'activeTab' => $activeTab,
            'tabCounts' => $tabCounts,
        ]);
    }

    public function storeJob(Request $request)
    {
        if (in_array(Auth::user()->role, ['company_owner', 'garage_owner', 'owner'])) {
            return redirect()->back()->with('error', 'Company owners cannot create jobs directly from POS. Jobs must be created by branch staff.');
        }

        $garageId = $this->getGarageId($request);

        $centralConn = config('tenancy.database.central_connection', 'mysql');
        $request->validate([
            'vehicle_id' => "nullable|exists:{$centralConn}.vehicles,id",
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
                $cleanName = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $request->new_customer_name)) ?: 'customer';
                $uniqueEmail = $cleanName . '_' . time() . '_' . rand(1000, 9999) . '@garage.local';
                $customer = User::create([
                    'garage_id' => $garageId,
                    'name' => $request->new_customer_name,
                    'email' => $uniqueEmail,
                    'phone' => $request->new_customer_phone,
                    'password' => bcrypt(\Illuminate\Support\Str::random(16)),
                    'role' => 'vehicle_owner'
                ]);
                $customerId = $customer->id;
            }

            // Handle Vehicle
            $vehicleId = $request->vehicle_id;
            if (!$vehicleId && $request->new_vehicle_number) {
                $vehicle = Vehicle::where('vehicle_number', $request->new_vehicle_number)->first();
                if (!$vehicle) {
                    $vehicle = Vehicle::create([
                        'vehicle_number' => $request->new_vehicle_number,
                        'make' => $request->new_vehicle_make ?? 'Unknown',
                        'model' => $request->new_vehicle_model ?? 'Unknown'
                    ]);
                    
                    \App\Models\VehicleOwner::create([
                        'vehicle_id' => $vehicle->id,
                        'customer_id' => $customerId,
                        'garage_id' => $garageId,
                        'is_current' => true,
                        'start_date' => now()
                    ]);
                } else {
                    // Update current owner globally since this garage is taking over
                    if ($vehicle->owner_id != $customerId) {
                        \App\Models\VehicleOwner::where('vehicle_id', $vehicle->id)->where('is_current', true)->update([
                            'is_current' => false,
                            'end_date' => now()
                        ]);
                        
                        \App\Models\VehicleOwner::create([
                            'vehicle_id' => $vehicle->id,
                            'customer_id' => $customerId,
                            'garage_id' => $garageId,
                            'is_current' => true,
                            'start_date' => now()
                        ]);
                        $vehicle->update(['owner_id' => $customerId]);
                    }
                }
                
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

    public function updateState(Request $request, $id)
    {
        $job = \App\Models\Job::findOrFail($id);
        $this->checkGarageAccess($job->garage_id);
        
        $request->validate([
            'status' => 'required|in:checking,working,completed,done'
        ]);

        $job->status = $request->status;
        $job->save();

        if ($request->status === 'completed') {
            // Generate invoice if it doesn't exist
            if (!$job->invoice) {
                $invoiceNumber = (string) \App\Services\SequenceGenerator::getNextNumber($job->garage_id, 'invoice');
                \App\Models\Invoice::firstOrCreate(
                    ['job_id' => $job->id, 'garage_id' => $job->garage_id],
                    [
                        'invoice_number' => $invoiceNumber,
                        'total_amount' => $job->total_cost ?? 0,
                        'discount' => $job->discount ?? 0,
                        'status' => 'pending'
                    ]
                );
            }
        }

        if (\Illuminate\Support\Facades\Schema::hasTable('job_timelines')) {
            \App\Models\JobTimeline::create([
                'garage_id' => $job->garage_id,
                'job_id' => $job->id,
                'user_id' => Auth::id(),
                'action' => 'status_changed',
                'description' => 'Moved order to ' . ucfirst($request->status)
            ]);
        }

        return redirect()->back()->with('success', 'Order status updated.');
    }

    /**
     * Mark a completed job as done and record a payment.
     * Called from the POS "completed" tab pay & done popup.
     */
    public function markDone(Request $request, $id)
    {
        $job = \App\Models\Job::with('invoice')->findOrFail($id);
        $this->checkGarageAccess($job->garage_id);

        $validated = $request->validate([
            'amount'         => 'required|numeric|min:0',
            'payment_method' => 'required|in:cash,card,bank_transfer,credit',
        ]);

        DB::beginTransaction();
        try {
            // Record payment if amount > 0
            if ($validated['amount'] > 0 && $job->invoice) {
                \App\Models\Payment::create([
                    'garage_id'      => $job->garage_id,
                    'invoice_id'     => $job->invoice->id,
                    'amount'         => $validated['amount'],
                    'payment_method' => $validated['payment_method'],
                    'payment_date'   => now()->toDateString(),
                ]);
            }

            // Auto-assign any remaining balance as credit
            if ($job->invoice) {
                $totalPaid = \App\Models\Payment::where('invoice_id', $job->invoice->id)->sum('amount');
                $balance = max(0, $job->invoice->total_amount - $totalPaid);

                if ($balance > 0) {
                    \App\Models\Payment::create([
                        'garage_id'      => $job->garage_id,
                        'invoice_id'     => $job->invoice->id,
                        'amount'         => $balance,
                        'payment_method' => 'credit',
                        'payment_date'   => now()->toDateString(),
                    ]);
                }

                // Since we auto-credited the balance, the invoice is now settled
                $job->invoice->update(['status' => 'paid']);
            }

            // Move job to done
            $job->status = 'done';
            $job->save();

            if (\Illuminate\Support\Facades\Schema::hasTable('job_timelines')) {
                \App\Models\JobTimeline::create([
                    'garage_id'   => $job->garage_id,
                    'job_id'      => $job->id,
                    'user_id'     => Auth::id(),
                    'action'      => 'marked_done',
                    'description' => 'Marked as Done' . ($validated['amount'] > 0 ? ' with ' . strtoupper($validated['payment_method']) . ' payment of Rs.' . number_format($validated['amount'], 2) : ''),
                ]);
            }

            DB::commit();
            return redirect()->back()->with('success', 'Order marked as done.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Failed: ' . $e->getMessage()]);
        }
    }

}
