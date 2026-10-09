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
    public function index(\App\Actions\Dashboard\GetDashboardDataAction $action)
    {
        $garage = \App\Models\Garage::where('owner_id', Auth::id())->first();
        
        if (!$garage) {
            // If no garage exists yet, return an empty dashboard state
            // The owner should probably see a prompt to create a branch
            return Inertia::render('GarageOwner/Dashboard', [
                'stats' => ['activeJobs' => 0, 'todayRevenue' => 0, 'availableStaff' => '0 / 0', 'completedJobsToday' => 0],
                'charts' => ['revenue' => [], 'jobs' => []],
                'shift' => [
                    'active' => false,
                    'opening_cash' => 0,
                    'current_balance' => 0,
                    'cash_sales' => 0,
                    'card_sales' => 0,
                    'expenses' => 0,
                    'opened_at' => null
                ],
                'recentJobs' => [],
                'mechanics' => [],
                'garage' => null
            ]);
        }

        $data = $action->execute($garage->id);
        $data['garage'] = $garage;

        return Inertia::render('GarageOwner/Dashboard', $data);
    }

    public function openShift(Request $request, \App\Actions\Dashboard\ManageShiftAction $manageShiftAction)
    {
        $validated = $request->validate([
            'opening_cash' => 'required|numeric|min:0',
            'attendance' => 'nullable|array',
            'attendance.*.user_id' => 'required|exists:users,id',
            'attendance.*.status' => 'required|in:present,absent,casual_leave,medical_leave,vacation_leave,half_day'
        ]);

        $garage = \App\Models\Garage::where('owner_id', Auth::id())->first();
        if (!$garage) return redirect()->back()->with('error', 'Garage not found.');

        try {
            $manageShiftAction->openShift($validated, $garage);
            return redirect()->back()->with('success', 'Branch shift opened and attendance marked successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function closeShift(Request $request, \App\Actions\Dashboard\ManageShiftAction $manageShiftAction)
    {
        $garage = \App\Models\Garage::where('owner_id', Auth::id())->first();
        if (!$garage) return redirect()->back()->with('error', 'Garage not found.');

        try {
            $manageShiftAction->closeShift($garage);
            return redirect()->back()->with('success', 'Branch shift closed successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
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
