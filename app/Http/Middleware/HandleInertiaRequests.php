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
        if ($request->user() && in_array($request->user()->role, ['company_owner', 'garage_owner', 'branch_admin', 'garage_staff'])) {
            // For company_owner, they might have multiple branches, just pick the first one or the one they selected
            $garageId = $request->user()->garage_id ?? \App\Models\Garage::where('owner_id', $request->user()->id)->value('id');
            $garage = \App\Models\Garage::find($garageId);
            if ($garage) {
                $activeGarage = [
                    'name' => $garage->name,
                    'logo_url' => $garage->logo_path ? '/tenant-media/' . $garage->logo_path : '/images/auto-service-logo.png',
                ];

                // Low Stock Alerts (Only if owner or admin)
                if (in_array($request->user()->role, ['company_owner', 'garage_owner', 'branch_admin'])) {
                    $lowStockItems = \App\Models\Inventory::where('garage_id', $garage->id)
                        ->whereColumn('quantity', '<=', 'min_stock_level')
                        ->get();
                    foreach ($lowStockItems as $item) {
                        $alerts[] = [
                            'type' => 'error',
                            'message' => "Low Stock Alert: {$item->item_name} has only {$item->quantity} left!"
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
                            'message' => "Cheque Due Today/Overdue: Rs. {$cheque->amount} for {$cheque->supplier->name} (Due: {$cheque->cheque_due_date})"
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
            'global_alerts' => $alerts,
            'active_garage' => $activeGarage,
        ];
    }
}
