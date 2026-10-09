<?php

namespace App\Http\Controllers\SaasAdmin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $totalCompanies = Tenant::count();
        $totalUsers = User::where('role', 'saas_admin')->count(); // Central users. (Tenant users are in their DBs, tracking total system users requires cross-db query, so we'll approximate or skip for now)
        
        // Cache total users to prevent looping through 200+ DBs on every page load
        $tenantUsers = \Illuminate\Support\Facades\Cache::remember('saas_total_tenant_users', 3600, function () {
            $count = 0;
            Tenant::chunk(50, function ($tenants) use (&$count) {
                foreach ($tenants as $tenant) {
                    $tenant->run(function () use (&$count) {
                        $count += DB::table('users')->count();
                    });
                }
            });
            return $count;
        });

        $stats = [
            'total_branches' => $totalCompanies, // We use 'branches' key to match the frontend prop, but it means Companies
            'total_users' => $totalUsers + $tenantUsers,
            'total_revenue' => 150000, // Placeholder for subscriptions
            'active_subscriptions' => $totalCompanies, // Placeholder
        ];

        return Inertia::render('SuperAdmin/Dashboard', [
            'stats' => $stats,
            'recentActivities' => []
        ]);
    }
}
