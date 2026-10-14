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
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // company_owner sees all branches they own; branch_admin sees only their branch
        if ($user->role === 'branch_admin' && $user->garage_id) {
            $branches = \App\Models\Garage::where('id', $user->garage_id)->get();
        } else {
            $branches = \App\Models\Garage::where('owner_id', $user->id)->get();
        }
        
        if ($branches->isEmpty()) abort(404);
        
        $branchId = $request->query('branch_id');
        $garageIds = $branchId ? [$branchId] : $branches->pluck('id')->toArray();

        $startDate = $request->query('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->query('end_date', now()->endOfMonth()->toDateString());

        // 1. Orders (Invoices) Stats (Direct Index Scan on garage_id)
        $ordersStats = Invoice::whereIn('garage_id', $garageIds)
            ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->selectRaw('SUM(total_amount) as total_sales, COUNT(id) as total_count')
            ->first();

        $totalSales = $ordersStats->total_sales ?? 0;
        
        // 2. Payments (Aggregates using direct invoice relation)
        $paymentStats = Payment::whereHas('invoice', function($q) use ($garageIds) {
                $q->whereIn('garage_id', $garageIds);
            })
            ->where('payment_method', '!=', 'credit')
            ->whereBetween('payment_date', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->selectRaw("
                SUM(amount) as total_collected,
                SUM(CASE WHEN payment_method = 'cash' THEN amount ELSE 0 END) as collected_cash,
                SUM(CASE WHEN payment_method = 'card' THEN amount ELSE 0 END) as collected_card,
                SUM(CASE WHEN payment_method = 'bank_transfer' THEN amount ELSE 0 END) as collected_bank_transfer
            ")
            ->first();

        $totalCollected = $paymentStats->total_collected ?? 0;
        $collectedCash = $paymentStats->collected_cash ?? 0;
        $collectedCard = $paymentStats->collected_card ?? 0;
        $collectedBankTransfer = $paymentStats->collected_bank_transfer ?? 0;

        $totalPending = max(0, $totalSales - $totalCollected);

        // 3. Service Breakdown (DB Level Group By)
        $servicesGrouped = JobItem::whereHas('job', function($q) use ($garageIds, $startDate, $endDate) {
                $q->whereIn('garage_id', $garageIds)
                  ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
            })
            ->select(
                'description as name', 
                DB::raw('SUM(quantity) as total_qty'), 
                DB::raw('SUM(quantity * price) as total_revenue')
            )
            ->groupBy('description')
            ->orderByDesc('total_revenue')
            ->take(50)
            ->get();

        // 4. Paginated Lists for UI to avoid crashing browser
        $orders = Payment::with(['invoice.job.vehicle', 'invoice.job.owner', 'invoice.job.garage'])
            ->whereHas('invoice', function($q) use ($garageIds) {
                $q->whereIn('garage_id', $garageIds);
            })
            ->where('payment_method', '!=', 'credit')
            ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->orderByDesc('created_at')
            ->paginate(15, ['*'], 'orders_page')->withQueryString();

        $expenses = Expense::with('garage')->whereIn('garage_id', $garageIds)
            ->whereBetween('expense_date', [$startDate, $endDate])
            ->orderBy('expense_date', 'desc')
            ->paginate(15, ['*'], 'expenses_page')->withQueryString();

        // 5. Credit Customers (Direct garage_id filter on invoices)
        $creditOrders = Invoice::with(['job.vehicle', 'job.owner', 'payments', 'job.garage'])
            ->whereIn('garage_id', $garageIds)
            ->whereRaw('total_amount > (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE payments.invoice_id = invoices.id AND payments.payment_method != "credit")')
            ->orderByDesc('created_at')
            ->paginate(15, ['*'], 'credit_page')->withQueryString();

        // 6. Pending Orders (Active Jobs)
        $pendingJobsQuery = \App\Models\Job::with(['vehicle', 'owner', 'garage', 'payments'])
            ->whereIn('garage_id', $garageIds)
            ->whereIn('status', ['pending', 'in_progress']);
            
        $totalPendingJobsCount = $pendingJobsQuery->count();
        
        $pendingJobs = $pendingJobsQuery
            ->orderBy('created_at', 'desc')
            ->paginate(15, ['*'], 'pending_page')->withQueryString();

        // 7. Customers Report (Top Customers)
        $topCustomers = \App\Models\User::where('role', 'vehicle_owner')
            ->leftJoin('vehicle_owners', 'users.id', '=', 'vehicle_owners.customer_id')
            ->leftJoin('service_jobs', 'vehicle_owners.vehicle_id', '=', 'service_jobs.vehicle_id')
            ->leftJoin('invoices', 'service_jobs.id', '=', 'invoices.job_id')
            ->whereIn('service_jobs.garage_id', $garageIds)
            ->selectRaw('
                users.id, 
                users.name, 
                users.phone, 
                users.email, 
                COUNT(DISTINCT service_jobs.id) as jobs_count, 
                SUM(service_jobs.total_cost) as jobs_sum_total_cost,
                (SUM(invoices.total_amount) - COALESCE((SELECT SUM(amount) FROM payments WHERE payments.payment_method != "credit" AND payments.invoice_id IN (SELECT id FROM invoices WHERE job_id IN (SELECT id FROM service_jobs sj WHERE sj.vehicle_id IN (SELECT vehicle_id FROM vehicle_owners vo WHERE vo.customer_id = users.id)))), 0)) as pending_balance
            ')
            ->groupBy('users.id', 'users.name', 'users.phone', 'users.email')
            ->orderByDesc('jobs_sum_total_cost')
            ->paginate(15, ['*'], 'customers_page')->withQueryString();

        // 8. Shift Reports (Register Sessions)
        $shiftReports = \App\Models\RegisterSession::with(['user', 'garage'])
            ->whereIn('garage_id', $garageIds)
            ->whereBetween('opened_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->orderByDesc('opened_at')
            ->paginate(15, ['*'], 'shifts_page')->withQueryString();

        $deletedOrders = \App\Models\DeletedOrder::whereIn('garage_id', $garageIds)
            ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->orderByDesc('created_at')
            ->paginate(15, ['*'], 'deleted_page')->withQueryString();

        $activeTab = request()->query('tab', 'sales');

        return Inertia::render('GarageOwner/Reports', [
            'activeTab' => $activeTab,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'branches' => $branches,
            'branchId' => $branchId,
            'stats' => [
                'totalSales' => (float) $totalSales,
                'totalCollected' => (float) $totalCollected,
                'collectedCash' => (float) $collectedCash,
                'collectedCard' => (float) $collectedCard,
                'collectedBankTransfer' => (float) $collectedBankTransfer,
                'totalPending' => (float) $totalPending,
                'totalExpenses' => (float) Expense::whereIn('garage_id', $garageIds)->whereBetween('expense_date', [$startDate, $endDate])->sum('amount'),
                'totalServicesCount' => (float) $servicesGrouped->sum('total_qty'),
                'pendingJobsCount' => $totalPendingJobsCount,
                'totalCreditValue' => (float) $totalPending,
                'deletedOrdersCount' => $deletedOrders->total(),
            ],
            'deletedOrders' => $deletedOrders,
            'orders' => $orders,
            'services' => $servicesGrouped,
            'expenses' => $expenses,
            'creditOrders' => $creditOrders,
            'pendingJobs' => $pendingJobs,
            'topCustomers' => $topCustomers,
            'shiftReports' => $shiftReports
        ]);
    }

    public function exportCsv(Request $request)
    {
        $branches = \App\Models\Garage::where('owner_id', Auth::id())->get();
        if ($branches->isEmpty()) abort(404);

        $branchId = $request->query('branch_id');
        $garageIds = $branchId ? [$branchId] : $branches->pluck('id')->toArray();

        $startDate = $request->query('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->query('end_date', now()->endOfMonth()->toDateString());
        $tab = $request->query('tab', 'sales');
        $format = $request->query('format', 'csv');

        $rows = [];
        $headersList = ['No'];

        if ($tab === 'sales') {
            $headersList = array_merge($headersList, ['Order ID', 'Date', 'Status', 'Total Amount']);
            $invoices = Invoice::whereIn('garage_id', $garageIds)
                ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                ->get();
            foreach ($invoices as $index => $invoice) {
                $rows[] = [
                    $index + 1,
                    $invoice->id,
                    $invoice->created_at->format('Y-m-d H:i:s'),
                    ucfirst($invoice->status),
                    number_format($invoice->total_amount, 2)
                ];
            }
        } elseif ($tab === 'services') {
            $headersList = array_merge($headersList, ['Service Name', 'Cost']);
            $services = \App\Models\JobItem::join('service_jobs', 'service_jobs.id', '=', 'service_job_items.job_id')
                ->whereIn('service_jobs.garage_id', $garageIds)
                ->whereBetween('service_jobs.created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                ->get();
            foreach ($services as $index => $svc) {
                $rows[] = [
                    $index + 1,
                    $svc->name,
                    number_format($svc->price * $svc->quantity, 2)
                ];
            }
        } else {
            $headersList = array_merge($headersList, ['Record ID', 'Date']);
            // Dummy fallback
            $rows[] = [1, 'N/A', 'N/A'];
        }

        if ($format === 'pdf') {
            $garageForPdf = $branchId ? $branches->firstWhere('id', $branchId) : $branches->first();
            return view('reports.print', [
                'garage' => $garageForPdf,
                'startDate' => $startDate,
                'endDate' => $endDate,
                'tab' => $tab,
                'headers' => $headersList,
                'rows' => $rows
            ]);
        }

        $csvHeaders = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename={$tab}_report_{$startDate}_to_{$endDate}.csv",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $callback = function() use ($headersList, $rows) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $headersList);
            foreach ($rows as $row) {
                fputcsv($file, $row);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $csvHeaders);
    }
}
