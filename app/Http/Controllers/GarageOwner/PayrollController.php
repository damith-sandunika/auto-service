<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Payroll;
use App\Models\Expense;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Traits\JobAccessTrait;

class PayrollController extends Controller
{
    use JobAccessTrait;
    public function index(Request $request)
    {
        $garageId = $this->getGarageId($request);
        $month = $request->input('month', now()->format('Y-m')); // e.g., '2026-08'
        
        $carbonMonth = Carbon::createFromFormat('Y-m', $month);
        $startOfMonth = $carbonMonth->copy()->startOfMonth();
        $endOfMonth = $carbonMonth->copy()->endOfMonth();

        $staff = User::where('garage_id', $garageId)
            ->whereIn('role', ['garage_staff', 'garage_owner'])
            ->with(['staffProfile', 
                'payrolls' => function($q) use ($month) {
                    $q->where('month', $month);
                }
            ])
            ->withSum(['attendances' => function($q) use ($month) {
                $q->where('date', 'like', $month . '%');
            }], 'ot_hours')
            ->withSum(['jobs' => function($q) use ($startOfMonth, $endOfMonth) {
                $q->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                  ->where('status', 'completed');
            }], 'total_cost')
            ->withCount(['jobs' => function($q) use ($startOfMonth, $endOfMonth) {
                $q->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                  ->where('status', 'completed');
            }])
            ->withSum(['salaryAdvances' => function($q) {
                $q->where('status', 'pending');
            }], 'amount')
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

                $totalOTHours = $mechanic->attendances_sum_ot_hours ?? 0;
                $otPay = $totalOTHours * $otRate;

                $totalJobRevenue = $mechanic->jobs_sum_total_cost ?? 0;
                $commissionPay = $totalJobRevenue * ($commissionRate / 100);

                // Deduct any pending salary advances
                $deductions = $mechanic->salary_advances_sum_amount ?? 0;
                
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
                        'jobs_completed' => $mechanic->jobs_count ?? 0,
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
        $garageId = $this->getGarageId($request);
        
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'month' => 'required|string',
            'basic_pay' => 'required|numeric',
            'ot_pay' => 'required|numeric',
            'commission_pay' => 'required|numeric',
            'deductions' => 'required|numeric',
            'net_pay' => 'required|numeric',
        ]);

        $staffUser = User::findOrFail($validated['user_id']);
        $this->checkGarageAccess($staffUser->garage_id);

        $processPayrollAction->execute($staffUser, $validated, $garageId);

        return redirect()->back()->with('success', 'Payroll processed and marked as paid.');
    }
}
