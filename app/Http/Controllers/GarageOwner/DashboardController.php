<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Job;
use App\Models\User;
use App\Models\Expense;
use App\Models\Payment;
use App\Models\RegisterSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $garage = \App\Models\Garage::where('owner_id', Auth::id())->first();
        if (!$garage) abort(404);
        
        $garage_id = $garage->id;
        $today = Carbon::today();

        // 1. Shift Management
        $activeSession = RegisterSession::where('garage_id', $garage_id)
            ->where('status', 'open')
            ->first();

        $currentBalance = 0;
        $cashSales = 0;
        $cardSales = 0;
        $expensesLogged = 0;

        if ($activeSession) {
            // Cash collected during this shift (Payments made in cash)
            $cashSales = Payment::whereHas('invoice', function($q) use ($garage_id) {
                    $q->where('garage_id', $garage_id);
                })
                ->where('payment_method', 'cash')
                ->where('created_at', '>=', $activeSession->opened_at)
                ->sum('amount');

            // Card collected during this shift
            $cardSales = Payment::whereHas('invoice', function($q) use ($garage_id) {
                    $q->where('garage_id', $garage_id);
                })
                ->where('payment_method', 'card')
                ->where('created_at', '>=', $activeSession->opened_at)
                ->sum('amount');

            // Expenses logged during this shift
            $expensesLogged = Expense::where('garage_id', $garage_id)
                ->where('created_at', '>=', $activeSession->opened_at)
                ->sum('amount');

            $currentBalance = $activeSession->opening_cash + $cashSales - $expensesLogged;
        }

        // Stats: Active Jobs
        $activeJobsCount = Job::where('garage_id', $garage_id)
            ->whereIn('status', ['pending', 'in_progress'])
            ->count();

        // Stats: Today's Revenue (Total Invoices)
        $todayRevenue = Invoice::where('garage_id', $garage_id)
            ->whereDate('created_at', $today)
            ->sum('total_amount');

        // Stats: Available Staff
        $totalStaff = User::where('role', 'garage_staff')
            ->where('garage_id', $garage_id)
            ->count();
            
        $availableStaffText = "$totalStaff / $totalStaff";

        // Stats: Completed Jobs Today
        $completedJobsToday = Job::where('garage_id', $garage_id)
            ->where('status', 'completed')
            ->whereDate('updated_at', $today)
            ->count();

        // Recent Jobs
        $recentJobs = Job::with(['vehicle.owner', 'mechanic'])
            ->where('garage_id', $garage_id)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($job) {
                return [
                    'id' => $job->id,
                    'vehicle' => $job->vehicle ? $job->vehicle->make . ' ' . $job->vehicle->model : 'Unknown',
                    'vehicle_number' => $job->vehicle ? $job->vehicle->vehicle_number : 'WALK-IN',
                    'customer' => ($job->vehicle && $job->vehicle->owner) ? $job->vehicle->owner->name : 'Walk-in Customer',
                    'mechanic' => $job->mechanic ? $job->mechanic->name : 'Unassigned',
                    'status' => $job->status,
                    'cost' => $job->total_cost,
                    'created_at' => $job->created_at ? $job->created_at->format('M d, Y h:i A') : 'N/A'
                ];
            });

        // Chart 1: 7-Day Revenue Trend
        $last7Days = collect();
        for ($i = 6; $i >= 0; $i--) {
            $date = \Carbon\Carbon::now()->subDays($i)->format('Y-m-d');
            $last7Days->put($date, 0);
        }

        $revenueData = Invoice::where('garage_id', $garage_id)
            ->whereDate('created_at', '>=', \Carbon\Carbon::now()->subDays(6))
            ->selectRaw('DATE(created_at) as date, SUM(total_amount) as total')
            ->groupBy('date')
            ->get();

        foreach ($revenueData as $data) {
            $last7Days[$data->date] = (float)$data->total;
        }

        $revenueChartData = $last7Days->map(function ($total, $date) {
            return [
                'name' => \Carbon\Carbon::parse($date)->format('D'),
                'revenue' => $total
            ];
        })->values();

        // Chart 2: Job Status Pie Chart
        $jobStatuses = Job::where('garage_id', $garage_id)
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->get();

        $pieChartData = $jobStatuses->map(function ($status) {
            return [
                'name' => ucfirst(str_replace('_', ' ', $status->status)),
                'value' => $status->count
            ];
        });

        return Inertia::render('GarageOwner/Dashboard', [
            'stats' => [
                'activeJobs' => $activeJobsCount,
                'todayRevenue' => (float) $todayRevenue,
                'availableStaff' => $availableStaffText,
                'completedJobsToday' => $completedJobsToday
            ],
            'charts' => [
                'revenue' => $revenueChartData,
                'jobs' => $pieChartData
            ],
            'shift' => [
                'active' => $activeSession ? true : false,
                'opening_cash' => $activeSession ? (float) $activeSession->opening_cash : 0,
                'current_balance' => (float) $currentBalance,
                'cash_sales' => (float) $cashSales,
                'card_sales' => (float) $cardSales,
                'expenses' => (float) $expensesLogged,
                'opened_at' => $activeSession ? $activeSession->opened_at->format('h:i A') : null,
            ],
            'recentJobs' => $recentJobs,
            'mechanics' => User::where('role', 'garage_staff')
                ->where('garage_id', $garage_id)
                ->get()
                ->map(function ($mechanic) use ($today) {
                    $attendance = \App\Models\StaffAttendance::where('user_id', $mechanic->id)
                        ->whereDate('date', $today)
                        ->first();
                    return [
                        'id' => $mechanic->id,
                        'name' => $mechanic->name,
                        'attendance' => $attendance ? [
                            'status' => $attendance->status,
                            'arrival_time' => $attendance->arrival_time,
                            'departure_time' => $attendance->departure_time,
                        ] : null
                    ];
                })
        ]);
    }

    public function openShift(Request $request)
    {
        $request->validate([
            'opening_cash' => 'required|numeric|min:0',
            'attendance' => 'nullable|array',
            'attendance.*.user_id' => 'required|exists:users,id',
            'attendance.*.status' => 'required|in:present,absent,casual_leave,medical_leave,vacation_leave,half_day'
        ]);

        $garage = \App\Models\Garage::where('owner_id', Auth::id())->first();
        if (!$garage) return redirect()->back()->with('error', 'Garage not found.');

        $existing = RegisterSession::where('garage_id', $garage->id)
            ->where('status', 'open')
            ->first();

        if ($existing) {
            return redirect()->back()->with('error', 'Branch is already open.');
        }

        $now = now();

        \Illuminate\Support\Facades\DB::transaction(function () use ($garage, $request, $now) {
            RegisterSession::create([
                'garage_id'    => $garage->id,
                'user_id'      => Auth::id(),
                'opening_cash' => $request->opening_cash,
                'opened_at'    => $now,
                'status'       => 'open',
            ]);

            if ($request->has('attendance')) {
                foreach ($request->attendance as $att) {
                    \App\Models\StaffAttendance::updateOrCreate(
                        [
                            'user_id' => $att['user_id'],
                            'date' => $now->toDateString(),
                        ],
                        [
                            'status' => $att['status'],
                            'arrival_time' => $att['status'] === 'present' || $att['status'] === 'half_day' ? $now->toTimeString() : null,
                            'ot_hours' => 0
                        ]
                    );
                }
            }
        });

        return redirect()->back()->with('success', 'Branch shift opened and attendance marked successfully.');
    }

    public function closeShift(Request $request)
    {
        $garage = \App\Models\Garage::where('owner_id', Auth::id())->first();
        if (!$garage) return redirect()->back()->with('error', 'Garage not found.');

        $session = RegisterSession::where('garage_id', $garage->id)
            ->where('status', 'open')
            ->first();

        if (!$session) {
            return redirect()->back()->with('error', 'No active branch shift found.');
        }

        // Calculate closing balance
        $cashSales = Payment::whereHas('invoice', function($q) use ($garage) {
                $q->where('garage_id', $garage->id);
            })
            ->where('payment_method', 'cash')
            ->where('created_at', '>=', $session->opened_at)
            ->sum('amount');

        $expensesLogged = Expense::where('garage_id', $garage->id)
            ->where('created_at', '>=', $session->opened_at)
            ->sum('amount');

        $finalCash = $session->opening_cash + $cashSales - $expensesLogged;

        \Illuminate\Support\Facades\DB::transaction(function () use ($session, $finalCash, $garage) {
            $session->update([
                'closing_cash' => $finalCash,
                'closed_at' => now(),
                'status' => 'closed',
                'closed_by' => Auth::id(),
            ]);

            // Mark all active staff as OFF
            \App\Models\StaffAttendance::whereDate('date', now()->toDateString())
                ->whereHas('user', function($q) use ($garage) {
                    $q->where('garage_id', $garage->id);
                })
                ->whereNotNull('arrival_time')
                ->whereNull('departure_time')
                ->update([
                    'departure_time' => now()->toTimeString()
                ]);
        });

        return redirect()->back()->with('success', 'Branch shift closed successfully.');
    }

    public function markStaffIn(Request $request, $userId)
    {
        $garage = \App\Models\Garage::where('owner_id', Auth::id())->first();
        if (!$garage) return redirect()->back();

        \App\Models\StaffAttendance::updateOrCreate(
            [
                'user_id' => $userId,
                'date' => now()->toDateString(),
            ],
            [
                'status' => 'present',
                'arrival_time' => now()->toTimeString(),
                'ot_hours' => 0
            ]
        );
        return redirect()->back()->with('success', 'Staff marked IN successfully.');
    }

    public function markStaffOut(Request $request, $userId)
    {
        $garage = \App\Models\Garage::where('owner_id', Auth::id())->first();
        if (!$garage) return redirect()->back();

        $att = \App\Models\StaffAttendance::where('user_id', $userId)
            ->where('date', now()->toDateString())
            ->first();

        if ($att) {
            $att->update(['departure_time' => now()->toTimeString()]);
        }
        return redirect()->back()->with('success', 'Staff marked OFF successfully.');
    }
}
