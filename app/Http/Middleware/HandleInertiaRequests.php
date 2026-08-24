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
        if ($request->user() && $request->user()->role === 'garage_owner') {
            $garage = \App\Models\Garage::where('owner_id', $request->user()->id)->first();
            if ($garage) {
                // Low Stock Alerts
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

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'global_alerts' => $alerts,
        ];
    }
}
