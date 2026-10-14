<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use App\Models\VehicleMake;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Models\Tenant;
use App\Models\Job;
use App\Models\VehicleOwner;

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

    public function show(Vehicle $vehicle)
    {
        $tenants = Tenant::with('domains')->get();
        $serviceHistory = [];
        $ownershipHistory = [];

        foreach ($tenants as $tenant) {
            try {
                $tenant->run(function () use ($tenant, $vehicle, &$serviceHistory, &$ownershipHistory) {
                    // 1. Fetch service jobs for this vehicle in this tenant DB
                    $jobs = Job::where('vehicle_id', $vehicle->id)
                        ->with(['garage', 'items'])
                        ->orderBy('created_at', 'desc')
                        ->get();

                    foreach ($jobs as $j) {
                        $serviceHistory[] = [
                            'id' => $j->id,
                            'company_id' => $tenant->id,
                            'company_name' => $tenant->company_name ?? ucfirst($tenant->id),
                            'company_domain' => $tenant->domains->first()?->domain ?? ($tenant->id . '.localhost'),
                            'branch_id' => $j->garage_id,
                            'branch_name' => $j->garage?->name ?? 'Main Branch',
                            'branch_address' => $j->garage?->address,
                            'branch_phone' => $j->garage?->phone,
                            'status' => $j->status,
                            'description' => $j->description,
                            'mileage' => $j->mileage ?? 'N/A',
                            'total_cost' => (float) $j->total_cost,
                            'date' => $j->created_at ? $j->created_at->format('Y-m-d') : 'N/A',
                            'time' => $j->created_at ? $j->created_at->format('h:i A') : 'N/A',
                            'created_at' => $j->created_at ? $j->created_at->format('M d, Y h:i A') : 'N/A',
                            'raw_date' => $j->created_at ? $j->created_at->timestamp : 0,
                            'items_count' => $j->items->count(),
                            'items' => $j->items->map(fn($it) => [
                                'type' => $it->item_type,
                                'description' => $it->description,
                                'quantity' => $it->quantity,
                                'price' => (float) $it->price,
                            ]),
                        ];
                    }

                    // 2. Fetch customers registered as owners for this vehicle in this tenant
                    $owners = VehicleOwner::where('vehicle_id', $vehicle->id)
                        ->with('customer')
                        ->get();

                    foreach ($owners as $o) {
                        if ($o->customer) {
                            $ownershipHistory[] = [
                                'customer_id' => $o->customer->id,
                                'name' => $o->customer->name,
                                'phone' => $o->customer->phone,
                                'email' => $o->customer->email,
                                'company_name' => $tenant->company_name ?? ucfirst($tenant->id),
                                'company_domain' => $tenant->domains->first()?->domain ?? ($tenant->id . '.localhost'),
                                'is_current' => (bool) $o->is_current,
                                'registered_at' => $o->created_at ? $o->created_at->format('M d, Y') : 'N/A',
                            ];
                        }
                    }
                });
            } catch (\Throwable $e) {
                // Ignore individual tenant DB issues gracefully
            }
        }

        // Sort all cross-tenant service jobs chronologically descending
        usort($serviceHistory, fn($a, $b) => $b['raw_date'] <=> $a['raw_date']);

        $totalSpend = array_sum(array_column($serviceHistory, 'total_cost'));
        $companiesCount = count(array_unique(array_column($serviceHistory, 'company_id')));
        $branchesCount = count(array_unique(array_column($serviceHistory, 'branch_id')));

        $currentOwner = collect($ownershipHistory)->firstWhere('is_current', true) ?? collect($ownershipHistory)->first();
        if ($currentOwner) {
            $vehicle->setRelation('owner', (object) [
                'name' => $currentOwner['name'],
                'phone' => $currentOwner['phone'],
                'email' => $currentOwner['email'] ?? null,
            ]);
        }

        return Inertia::render('SuperAdmin/Vehicles/Show', [
            'vehicle' => $vehicle,
            'serviceHistory' => $serviceHistory,
            'ownershipHistory' => $ownershipHistory,
            'stats' => [
                'total_jobs' => count($serviceHistory),
                'total_spend' => $totalSpend,
                'companies_count' => $companiesCount,
                'branches_count' => $branchesCount,
            ]
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
