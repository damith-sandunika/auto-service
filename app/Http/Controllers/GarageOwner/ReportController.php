<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\Invoice;
use App\Models\JobItem;
use App\Models\Payment;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $garage = \App\Models\Garage::where('owner_id', Auth::id())->first();
        if (!$garage) abort(404);
        
        $garage_id = $garage->id;

        $startDate = $request->query('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->query('end_date', now()->endOfMonth()->toDateString());

        // 1. Orders (Invoices)
        $invoicesQuery = Invoice::with(['job.vehicle', 'job.mechanic', 'payments'])
            ->whereHas('job', function($q) use ($garage_id) {
                $q->where('garage_id', $garage_id);
            })
            ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
            
        $orders = $invoicesQuery->get();

        $totalSales = $orders->sum('total_amount');
        
        // 2. Payments
        $payments = Payment::whereHas('invoice.job', function($q) use ($garage_id) {
                $q->where('garage_id', $garage_id);
            })
            ->whereBetween('payment_date', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->get();

        $totalCollected = $payments->sum('amount');
        $collectedCash = $payments->where('payment_method', 'cash')->sum('amount');
        $collectedCard = $payments->where('payment_method', 'card')->sum('amount');

        $totalPending = max(0, $totalSales - $totalCollected);

        // 3. Service Breakdown
        // Aggregate job items
        $jobItems = JobItem::whereHas('job', function($q) use ($garage_id, $startDate, $endDate) {
                $q->where('garage_id', $garage_id)
                  ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
            })->get();

        $servicesGrouped = $jobItems->groupBy('description')->map(function($items, $desc) {
            return [
                'name' => $desc,
                'total_qty' => $items->sum('quantity'),
                'total_revenue' => $items->sum(function($item) {
                    return $item->quantity * $item->price;
                })
            ];
        })->values();

        // 4. Salaries / Expenses Log
        $expenses = Expense::where('garage_id', $garage_id)
            ->whereBetween('expense_date', [$startDate, $endDate])
            ->orderBy('expense_date', 'desc')
            ->get();

        // 5. Credit Customers
        $creditOrders = $orders->filter(function($inv) {
            $paid = $inv->payments->sum('amount');
            return $inv->total_amount > $paid;
        })->values();

        return Inertia::render('GarageOwner/Reports', [
            'startDate' => $startDate,
            'endDate' => $endDate,
            'stats' => [
                'totalSales' => (float) $totalSales,
                'totalCollected' => (float) $totalCollected,
                'collectedCash' => (float) $collectedCash,
                'collectedCard' => (float) $collectedCard,
                'totalPending' => (float) $totalPending,
            ],
            'orders' => $orders,
            'services' => $servicesGrouped,
            'expenses' => $expenses,
            'creditOrders' => $creditOrders
        ]);
    }
}
