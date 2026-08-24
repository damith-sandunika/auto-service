<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\StaffProfile;
use App\Models\StaffAttendance;
use Illuminate\Support\Facades\Auth;

class HRController extends Controller
{
    public function index()
    {
        $garageId = Auth::user()->garage_id;
        $staff = User::where('garage_id', $garageId)
            ->whereIn('role', ['garage_staff', 'garage_owner']) // maybe only garage_staff? Owner might want their own payroll
            ->with(['staffProfile', 'attendances' => function($q) {
                $q->whereMonth('date', now()->month)
                  ->whereYear('date', now()->year);
            }])
            ->get();

        return Inertia::render('GarageOwner/HR/Index', [
            'staff' => $staff
        ]);
    }

    public function storeStaff(Request $request)
    {
        $garageId = Auth::user()->garage_id;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        \Illuminate\Support\Facades\DB::transaction(function () use ($validated, $garageId) {
            User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
                'role' => 'garage_staff',
                'garage_id' => $garageId,
            ]);
        });

        return redirect()->back()->with('success', 'Staff member created successfully.');
    }

    public function update(Request $request, $id)
    {
        $garageId = Auth::user()->garage_id;
        $staffUser = User::where('garage_id', $garageId)->findOrFail($id);

        $validated = $request->validate([
            'basic_salary' => 'required|numeric|min:0',
            'ot_rate_per_hour' => 'required|numeric|min:0',
            'commission_rate' => 'required|numeric|min:0|max:100',
            'casual_leaves_allowed' => 'required|integer|min:0',
            'medical_leaves_allowed' => 'required|integer|min:0',
            'vacation_leaves_allowed' => 'required|integer|min:0',
        ]);

        \Illuminate\Support\Facades\DB::transaction(function () use ($staffUser, $validated) {
            StaffProfile::updateOrCreate(
                ['user_id' => $staffUser->id],
                $validated
            );
        });

        return redirect()->back()->with('success', 'Staff profile updated successfully.');
    }

    public function storeAttendance(Request $request)
    {
        $garageId = Auth::user()->garage_id;
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'date' => 'required|date',
            'status' => 'required|in:present,absent,half_day,casual_leave,medical_leave,vacation_leave',
            'ot_hours' => 'nullable|numeric|min:0'
        ]);

        // Ensure user belongs to this garage
        $staffUser = User::where('garage_id', $garageId)->findOrFail($validated['user_id']);

        \Illuminate\Support\Facades\DB::transaction(function () use ($staffUser, $validated) {
            StaffAttendance::updateOrCreate(
                [
                    'user_id' => $staffUser->id,
                    'date' => $validated['date']
                ],
                [
                    'status' => $validated['status'],
                    'ot_hours' => $validated['ot_hours'] ?? 0
                ]
            );
        });

        return redirect()->back()->with('success', 'Attendance marked successfully.');
    }

    public function show($id)
    {
        $garageId = Auth::user()->garage_id;
        $staffUser = User::where('garage_id', $garageId)
            ->whereIn('role', ['garage_staff', 'garage_owner'])
            ->with(['staffProfile', 'salaryAdvances', 'jobs.invoice', 'attendances'])
            ->findOrFail($id);

        return Inertia::render('GarageOwner/HR/ShowProfile', [
            'staff' => $staffUser
        ]);
    }

    public function storeAdvance(Request $request, $id)
    {
        $garageId = Auth::user()->garage_id;
        $staffUser = User::where('garage_id', $garageId)->findOrFail($id);

        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
            'date' => 'required|date',
            'reason' => 'nullable|string'
        ]);

        \Illuminate\Support\Facades\DB::transaction(function () use ($staffUser, $validated) {
            $staffUser->salaryAdvances()->create([
                'amount' => $validated['amount'],
                'date' => $validated['date'],
                'reason' => $validated['reason'],
                'status' => 'pending'
            ]);
        });

        return redirect()->back()->with('success', 'Salary advance issued successfully.');
    }
}
