<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Payroll;
use App\Models\Expense;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PayrollController extends Controller
{
    public function index(Request $request)
    {
        $garageId = Auth::user()->garage_id;
        $month = $request->input('month', now()->format('Y-m')); // e.g., '2026-08'
        
        $carbonMonth = Carbon::createFromFormat('Y-m', $month);
        $startOfMonth = $carbonMonth->copy()->startOfMonth();
        $endOfMonth = $carbonMonth->copy()->endOfMonth();

        $staff = User::where('garage_id', $garageId)
            ->whereIn('role', ['garage_staff', 'garage_owner'])
            ->with(['staffProfile', 
                'attendances' => function($q) use ($month) {
                    $q->where('date', 'like', $month . '%');
                },
                'jobs' => function($q) use ($startOfMonth, $endOfMonth) {
                    $q->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                      ->where('status', 'completed');
                },
                'payrolls' => function($q) use ($month) {
                    $q->where('month', $month);
                },
                'salaryAdvances' => function($q) {
                    $q->where('status', 'pending');
                }
            ])
            ->paginate(20)
            ->through(function ($mechanic) use ($month) {
                $profile = $mechanic->staffProfile;
                $savedPayroll = $mechanic->payrolls->first();

                if ($savedPayroll) {
                    return [
                        'id' => $mechanic->id,
                        'name' => $mechanic->name,
                        'role' => $mechanic->role,
                        'is_processed' => true,
                        'payroll' => $savedPayroll
                    ];
                }

                $basicPay = $profile ? $profile->basic_salary : 0;
                $otRate = $profile ? $profile->ot_rate_per_hour : 0;
                $commissionRate = $profile ? $profile->commission_rate : 0;

                $totalOTHours = $mechanic->attendances->sum('ot_hours');
                $otPay = $totalOTHours * $otRate;

                $totalJobRevenue = $mechanic->jobs->sum('total_cost');
                $commissionPay = $totalJobRevenue * ($commissionRate / 100);

                // Deduct any pending salary advances
                $advanceDeductions = $mechanic->salaryAdvances->sum('amount');
                $deductions = $advanceDeductions;
                
                $netPay = $basicPay + $otPay + $commissionPay - $deductions;

                return [
                    'id' => $mechanic->id,
                    'name' => $mechanic->name,
                    'role' => $mechanic->role,
                    'is_processed' => false,
                    'calculated' => [
                        'month' => $month,
                        'basic_pay' => $basicPay,
                        'ot_hours' => $totalOTHours,
                        'ot_pay' => $otPay,
                        'jobs_completed' => $mechanic->jobs->count(),
                        'total_job_revenue' => $totalJobRevenue,
                        'commission_pay' => $commissionPay,
                        'deductions' => $deductions,
                        'net_pay' => $netPay
                    ]
                ];
            });

        return Inertia::render('GarageOwner/HR/Payroll', [
            'staff' => $staff,
            'selectedMonth' => $month
        ]);
    }

    public function store(Request $request, \App\Actions\HR\ProcessPayrollAction $processPayrollAction)
    {
        $garageId = Auth::user()->garage_id;
        
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'month' => 'required|string',
            'basic_pay' => 'required|numeric',
            'ot_pay' => 'required|numeric',
            'commission_pay' => 'required|numeric',
            'deductions' => 'required|numeric',
            'net_pay' => 'required|numeric',
        ]);

        $staffUser = User::where('garage_id', $garageId)->findOrFail($validated['user_id']);

        $processPayrollAction->execute($staffUser, $validated, $garageId);

        return redirect()->back()->with('success', 'Payroll processed and marked as paid.');
    }
}
