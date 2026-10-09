<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Garage;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class HRDashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        if ($user->role !== 'company_owner' && $user->role !== 'hr_manager') {
            abort(403, 'Unauthorized.');
        }

        $branchId = $request->query('branch_id');
        $month = (int) $request->query('month', now()->month);
        $year = (int) $request->query('year', now()->year);
        $monthStr = sprintf("%04d-%02d", $year, $month);

        $carbonMonth = Carbon::createFromFormat('Y-m', $monthStr);
        $startOfMonth = $carbonMonth->copy()->startOfMonth();
        $endOfMonth = $carbonMonth->copy()->endOfMonth();

        $staffQuery = User::whereIn('role', ['branch_admin', 'staff', 'accountant', 'hr_manager', 'garage_owner']);
        
        if ($branchId) {
            $staffQuery->where('garage_id', $branchId);
        }

        $staff = $staffQuery->with(['staffProfile', 'garage'])
            ->withSum(['attendances' => function($q) use ($monthStr) {
                $q->where('date', 'like', $monthStr . '%');
            }], 'ot_hours')
            ->withCount(['attendances' => function($q) use ($monthStr) {
                $q->where('date', 'like', $monthStr . '%')->whereIn('status', ['present', 'half_day']);
            }])
            ->withCount(['attendances as leaves_count' => function($q) use ($monthStr) {
                $q->where('date', 'like', $monthStr . '%')->whereIn('status', ['casual_leave', 'medical_leave', 'vacation_leave']);
            }])
            ->withSum(['jobs' => function($q) use ($startOfMonth, $endOfMonth) {
                $q->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                  ->where('status', 'completed');
            }], 'total_cost')
            ->withSum(['salaryAdvances' => function($q) {
                $q->where('status', 'pending');
            }], 'amount')
            ->get();

        $totalStaff = $staff->count();
        $totalSalaryPay = 0;
        $totalOtPay = 0;
        $totalWorkingHours = 0;

        $staffSummary = $staff->map(function ($mechanic) use (&$totalSalaryPay, &$totalOtPay, &$totalWorkingHours) {
            $profile = $mechanic->staffProfile;
            
            $basicPay = $profile ? $profile->basic_salary : 0;
            $otRate = $profile ? $profile->ot_rate_per_hour : 0;
            $commissionRate = $profile ? $profile->commission_rate : 0;
            $stdHours = $profile ? $profile->standard_working_hours : 8;

            $totalOTHours = $mechanic->attendances_sum_ot_hours ?? 0;
            $otPay = $totalOTHours * $otRate;

            $totalJobRevenue = $mechanic->jobs_sum_total_cost ?? 0;
            $commissionPay = $totalJobRevenue * ($commissionRate / 100);

            $deductions = $mechanic->salary_advances_sum_amount ?? 0;
            $netPay = $basicPay + $otPay + $commissionPay - $deductions;

            $presentDays = $mechanic->attendances_count ?? 0;
            $leaveDays = $mechanic->leaves_count ?? 0;
            $dayHours = $presentDays * $stdHours;
            $totalWorkedHours = $dayHours + $totalOTHours;

            // Metrics sums
            $totalSalaryPay += $netPay;
            $totalOtPay += $otPay;
            $totalWorkingHours += $totalWorkedHours;

            return [
                'id' => $mechanic->id,
                'name' => $mechanic->name,
                'role' => $mechanic->role,
                'branch' => $mechanic->garage ? $mechanic->garage->name : 'Global',
                'present_days' => $presentDays,
                'leave_days' => $leaveDays,
                'total_worked_hours' => $totalWorkedHours,
                'day_hours' => $dayHours,
                'ot_hours' => $totalOTHours,
                'adjusted_basic_salary' => $basicPay,
                'ot_amount' => $otPay,
                'net_adjustments' => $commissionPay - $deductions,
                'net_salary' => $netPay,
            ];
        });

        $garages = Garage::all();

        return Inertia::render('GarageOwner/HR/Dashboard', [
            'totalStaff' => $totalStaff,
            'totalSalaryPay' => $totalSalaryPay,
            'totalOtPay' => $totalOtPay,
            'totalWorkingHours' => $totalWorkingHours,
            'branches' => $garages,
            'branchId' => $branchId,
            'month' => $month,
            'year' => $year,
            'staffSummary' => $staffSummary
        ]);
    }
}
