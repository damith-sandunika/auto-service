<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $alerts = [];
        $activeGarage = null;
        $branches = [];
        $company = null;

        // Resolve Company (Tenant Level)
        if (function_exists('tenant') && tenant()) {
            $tenant = tenant();
            $companySetting = null;
            try {
                $companySetting = \App\Models\CompanySetting::first();
            } catch (\Throwable $e) {}

            $companyName = $companySetting?->name ?: ($tenant->company_name ?: $tenant->id);
            $logoPath = $companySetting?->logo_path ?: ($tenant->logo_path ?? null);
            $companyLogoUrl = $logoPath ? '/tenant-media/' . $logoPath : '/images/auto-service-logo.png';

            $company = [
                'id' => $tenant->id,
                'name' => $companyName,
                'tagline' => $companySetting?->tagline ?: ($tenant->tagline ?? ''),
                'address' => $companySetting?->address ?: ($tenant->address ?? ''),
                'phone' => $companySetting?->phone ?: ($tenant->phone ?? ''),
                'logo_url' => $companyLogoUrl,
            ];
        }

        if ($request->user() && in_array($request->user()->role, ['company_owner', 'garage_owner', 'branch_admin', 'garage_staff'])) {
            $ownerId = $request->user()->role === 'company_owner' ? $request->user()->id : null;

            if ($request->user()->role === 'company_owner') {
                $branches = \App\Models\Garage::where('owner_id', $request->user()->id)->orderBy('name')->get(['id', 'name', 'address', 'phone']);
            }

            // Resolve Active Branch
            $garageId = null;
            if ($request->user()->role === 'company_owner') {
                $garageId = session('active_branch_id') ?? ($branches->first()?->id);
            } else {
                $garageId = $request->user()->garage_id;
            }

            $garage = $garageId ? \App\Models\Garage::find($garageId) : null;
            if ($garage) {
                $activeGarage = [
                    'id' => $garage->id,
                    'name' => $garage->name,
                    'address' => $garage->address,
                    'phone' => $garage->phone,
                    'logo_url' => $garage->logo_path ? '/tenant-media/' . $garage->logo_path : ($company['logo_url'] ?? '/images/auto-service-logo.png'),
                ];

                // Low Stock Alerts (Only if owner or admin)
                if (in_array($request->user()->role, ['company_owner', 'garage_owner', 'branch_admin'])) {
                    $lowStockItems = \App\Models\Inventory::where('garage_id', $garage->id)
                        ->whereColumn('quantity', '<=', 'min_stock_level')
                        ->get();
                    foreach ($lowStockItems as $item) {
                        $alerts[] = [
                            'type' => 'error',
                            'message' => "Low Stock Alert ({$garage->name}): {$item->item_name} has only {$item->quantity} left!"
                        ];
                    }

                    // Pending Cheques Due
                    $dueCheques = \App\Models\SupplierPayment::where('garage_id', $garage->id)
                        ->where('payment_method', 'cheque')
                        ->where('cheque_status', 'pending')
                        ->whereNotNull('cheque_due_date')
                        ->whereDate('cheque_due_date', '<=', now()->toDateString())
                        ->with('supplier')
                        ->get();
                    foreach ($dueCheques as $cheque) {
                        $alerts[] = [
                            'type' => 'warning',
                            'message' => "Cheque Due Today/Overdue ({$garage->name}): Rs. {$cheque->amount} for {$cheque->supplier->name} (Due: {$cheque->cheque_due_date})"
                        ];
                    }
                }
            }
        }

        $permissions = [];
        if ($request->user()) {
            if (in_array($request->user()->role, ['company_owner', 'saas_admin'])) {
                $permissions = 'all';
            } else {
                $request->user()->load('tenantRoles');
                foreach ($request->user()->tenantRoles as $role) {
                    $rolePerms = $role->permissions ?? [];
                    foreach ($rolePerms as $module => $actions) {
                        if (!isset($permissions[$module])) {
                            $permissions[$module] = [];
                        }
                        $permissions[$module] = array_unique(array_merge($permissions[$module], $actions));
                    }
                }
            }
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
                'permissions' => $permissions,
            ],
            'company' => $company,
            'branches' => $branches,
            'has_branches' => count($branches) > 0,
            'global_alerts' => $alerts,
            'active_garage' => $activeGarage,
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'info' => fn () => $request->session()->get('info'),
                'message' => fn () => $request->session()->get('message'),
            ],
        ];
    }
}
