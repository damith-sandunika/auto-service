<?php

namespace App\Http\Controllers\SaasAdmin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleMake;
use App\Models\VehicleModel;
use App\Models\Subscription;
use App\Models\PaymentRecord;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. Central database metrics
        $totalCompanies = Tenant::count();
        $totalVehicles = Vehicle::count();
        $totalMakes = VehicleMake::count();
        $totalModels = VehicleModel::count();
        $activeSubscriptions = Subscription::where('status', 'active')->count();

        // 2. Aggregate tenant statistics with caching (120 seconds) for high performance
        $tenantData = Cache::remember('saas_superadmin_dashboard_aggregates', 120, function () {
            $tenants = Tenant::with('domains')->latest()->get();

            $aggregated = [
                'total_branches' => 0,
                'total_staff' => 0,
                'total_customers' => 0,
                'total_jobs' => 0,
                'total_invoices' => 0,
                'total_revenue' => 0,
            ];

            $companies = [];

            foreach ($tenants as $t) {
                try {
                    $t->run(function () use ($t, &$aggregated, &$companies) {
                        $branchesCount = DB::table('garages')->count();
                        $staffCount = DB::table('users')->count();
                        $customersCount = DB::table('vehicle_owners')->count();
                        $jobsCount = DB::table('service_jobs')->count();
                        $invoicesCount = DB::table('invoices')->count();
                        $revenue = (float) DB::table('invoices')->sum('total_amount');

                        $aggregated['total_branches'] += $branchesCount;
                        $aggregated['total_staff'] += $staffCount;
                        $aggregated['total_customers'] += $customersCount;
                        $aggregated['total_jobs'] += $jobsCount;
                        $aggregated['total_invoices'] += $invoicesCount;
                        $aggregated['total_revenue'] += $revenue;

                        $domain = $t->domains->first()?->domain ?? ($t->id . '.localhost');

                        $companies[] = [
                            'id' => $t->id,
                            'name' => $t->company_name ?? ucfirst($t->id),
                            'domain' => $domain,
                            'branches_count' => $branchesCount,
                            'staff_count' => $staffCount,
                            'customers_count' => $customersCount,
                            'jobs_count' => $jobsCount,
                            'invoices_count' => $invoicesCount,
                            'revenue' => $revenue,
                            'status' => 'active',
                            'created_at' => $t->created_at ? $t->created_at->format('M d, Y') : 'Active',
                        ];
                    });
                } catch (\Throwable $e) {
                    $companies[] = [
                        'id' => $t->id,
                        'name' => $t->company_name ?? ucfirst($t->id),
                        'domain' => $t->domains->first()?->domain ?? ($t->id . '.localhost'),
                        'branches_count' => 0,
                        'staff_count' => 0,
                        'customers_count' => 0,
                        'jobs_count' => 0,
                        'invoices_count' => 0,
                        'revenue' => 0,
                        'status' => 'offline',
                        'created_at' => $t->created_at ? $t->created_at->format('M d, Y') : 'Active',
                    ];
                }
            }

            return [
                'aggregated' => $aggregated,
                'companies' => $companies,
            ];
        });

        // 3. Top Vehicle Brands in Central Fleet (for distribution chart)
        $topMakesRaw = Vehicle::select('make', DB::raw('count(*) as count'))
            ->whereNotNull('make')
            ->where('make', '!=', '')
            ->groupBy('make')
            ->orderByDesc('count')
            ->take(5)
            ->get();

        $topMakes = $topMakesRaw->map(function ($item) {
            return [
                'name' => $item->make,
                'count' => (int) $item->count,
            ];
        });

        // 4. 7-Day Vehicle Onboarding Trend (for area/line chart)
        $vehicleTrend = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $count = Vehicle::whereDate('created_at', $date->toDateString())->count();
            $vehicleTrend[] = [
                'name' => $date->format('D'),
                'date' => $date->format('M d'),
                'vehicles' => $count,
            ];
        }

        // 5. Recent Vehicles registered into central DB
        $recentVehicles = Vehicle::latest()->take(5)->get()->map(function ($v) {
            return [
                'id' => $v->id,
                'vehicle_number' => $v->vehicle_number ?? $v->license_plate ?? 'N/A',
                'make' => $v->make ?? 'Unknown',
                'model' => $v->model ?? '-',
                'year' => $v->year ?? '-',
                'created_at' => $v->created_at ? $v->created_at->diffForHumans() : 'Just now',
            ];
        });

        $stats = [
            'total_companies' => $totalCompanies,
            'total_branches' => $tenantData['aggregated']['total_branches'],
            'total_vehicles' => $totalVehicles,
            'total_makes' => $totalMakes,
            'total_models' => $totalModels,
            'total_staff' => $tenantData['aggregated']['total_staff'],
            'total_customers' => $tenantData['aggregated']['total_customers'],
            'total_jobs' => $tenantData['aggregated']['total_jobs'],
            'total_invoices' => $tenantData['aggregated']['total_invoices'],
            'total_revenue' => $tenantData['aggregated']['total_revenue'],
            'active_subscriptions' => $activeSubscriptions > 0 ? $activeSubscriptions : $totalCompanies,
        ];

        return Inertia::render('SuperAdmin/Dashboard', [
            'stats' => $stats,
            'companies' => $tenantData['companies'],
            'topMakes' => $topMakes,
            'vehicleTrend' => $vehicleTrend,
            'recentVehicles' => $recentVehicles,
        ]);
    }
}
