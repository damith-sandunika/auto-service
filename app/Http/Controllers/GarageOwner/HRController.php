<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\StaffProfile;
use App\Models\StaffAttendance;
use Illuminate\Support\Facades\Auth;
use App\Traits\JobAccessTrait;

class HRController extends Controller
{
    use JobAccessTrait;
    public function index(Request $request)
    {
        $user = Auth::user();
        if ($user->role === 'company_owner') {
            $staff = User::whereIn('role', ['branch_admin', 'staff', 'accountant', 'hr_manager', 'garage_owner'])
                ->with(['staffProfile', 'tenantRoles', 'tenantGarages', 'attendances' => function($q) {
                    $q->whereMonth('date', now()->month)
                      ->whereYear('date', now()->year);
                }])
                ->paginate(15);
            $garages = \App\Models\Garage::all();
        } else {
            $garageId = $this->getGarageId($request);
            $staff = User::where('garage_id', $garageId)
                ->whereIn('role', ['branch_admin', 'staff', 'accountant', 'hr_manager', 'garage_owner'])
                ->with(['staffProfile', 'tenantRoles', 'tenantGarages', 'attendances' => function($q) {
                    $q->whereMonth('date', now()->month)
                      ->whereYear('date', now()->year);
                }])
                ->paginate(15);
            $garages = \App\Models\Garage::where('id', $garageId)->get();
        }

        $roles = \App\Models\TenantRole::all();

        return Inertia::render('GarageOwner/HR/Index', [
            'staff' => $staff,
            'garages' => $garages,
            'roles' => $roles
        ]);
    }

    public function storeStaff(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'nullable|string|max:50',
            'password' => 'required|string|min:8',
            'role' => 'required|in:branch_admin,staff,accountant,hr_manager',
            'garage_id' => $user->role === 'company_owner' ? 'required|exists:garages,id' : 'nullable',
            'tenant_role_id' => 'nullable|exists:tenant_roles,id',
            'tenant_garage_ids' => 'nullable|array',
            
            // Profile fields
            'nic' => 'nullable|string|max:20',
            'dob' => 'nullable|date',
            'address' => 'nullable|string',
            'emergency_contact' => 'nullable|string|max:255',
            'standard_working_hours' => 'nullable|numeric|min:0',
            'basic_salary' => 'nullable|numeric|min:0',
            'ot_rate_per_hour' => 'nullable|numeric|min:0',
            'casual_leaves_allowed' => 'nullable|integer|min:0',
        ]);

        $garageId = $user->role === 'company_owner' ? $request->garage_id : $user->garage_id;

        \Illuminate\Support\Facades\DB::transaction(function () use ($validated, $garageId) {
            $newUser = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
                'role' => $validated['role'],
                'garage_id' => $garageId,
            ]);

            // Assign tenant role and garages if provided
            if (!empty($validated['tenant_role_id'])) {
                $newUser->tenantRoles()->sync([$validated['tenant_role_id']]);
            }
            if (!empty($validated['tenant_garage_ids'])) {
                $newUser->tenantGarages()->sync($validated['tenant_garage_ids']);
            }

            \App\Models\StaffProfile::create([
                'user_id' => $newUser->id,
                'nic' => $validated['nic'] ?? null,
                'dob' => $validated['dob'] ?? null,
                'address' => $validated['address'] ?? null,
                'emergency_contact' => $validated['emergency_contact'] ?? null,
                'standard_working_hours' => $validated['standard_working_hours'] ?? 8.0,
                'basic_salary' => $validated['basic_salary'] ?? 0,
                'ot_rate_per_hour' => $validated['ot_rate_per_hour'] ?? 0,
                'casual_leaves_allowed' => $validated['casual_leaves_allowed'] ?? 14,
            ]);
        });

        return redirect()->back()->with('success', 'Staff member created successfully.');
    }

    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $query = User::query();
        if ($user->role !== 'company_owner') {
            $query->where('garage_id', $this->getGarageId($request));
        }
        $staffUser = $query->findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$id,
            'phone' => 'nullable|string|max:50',
            'role' => 'required|in:branch_admin,staff,accountant,hr_manager',
            'garage_id' => $user->role === 'company_owner' ? 'required|exists:garages,id' : 'nullable',
            'tenant_role_id' => 'nullable|exists:tenant_roles,id',
            'tenant_garage_ids' => 'nullable|array',
            
            // Profile fields
            'nic' => 'nullable|string|max:20',
            'dob' => 'nullable|date',
            'address' => 'nullable|string',
            'emergency_contact' => 'nullable|string|max:255',
            'standard_working_hours' => 'nullable|numeric|min:0',
            'basic_salary' => 'nullable|numeric|min:0',
            'ot_rate_per_hour' => 'nullable|numeric|min:0',
            'casual_leaves_allowed' => 'nullable|integer|min:0',
            'medical_leaves_allowed' => 'nullable|integer|min:0',
            'vacation_leaves_allowed' => 'nullable|integer|min:0',
            'commission_rate' => 'nullable|numeric|min:0|max:100',
        ]);

        if ($request->filled('password')) {
            $request->validate(['password' => 'string|min:8']);
            $staffUser->password = \Illuminate\Support\Facades\Hash::make($request->password);
        }

        $staffUser->name = $validated['name'];
        $staffUser->email = $validated['email'];
        $staffUser->phone = $validated['phone'] ?? null;
        $staffUser->role = $validated['role'];
        if ($user->role === 'company_owner' && $request->filled('garage_id')) {
            $staffUser->garage_id = $validated['garage_id'];
        }

        \Illuminate\Support\Facades\DB::transaction(function () use ($staffUser, $validated) {
            $staffUser->save();
            
            if (array_key_exists('tenant_role_id', $validated)) {
                $staffUser->tenantRoles()->sync(array_filter([$validated['tenant_role_id']]));
            }
            if (isset($validated['tenant_garage_ids'])) {
                $staffUser->tenantGarages()->sync($validated['tenant_garage_ids']);
            }

            \App\Models\StaffProfile::updateOrCreate(
                ['user_id' => $staffUser->id],
                [
                    'nic' => $validated['nic'] ?? null,
                    'dob' => $validated['dob'] ?? null,
                    'address' => $validated['address'] ?? null,
                    'emergency_contact' => $validated['emergency_contact'] ?? null,
                    'standard_working_hours' => $validated['standard_working_hours'] ?? 8.0,
                    'basic_salary' => $validated['basic_salary'] ?? 0,
                    'ot_rate_per_hour' => $validated['ot_rate_per_hour'] ?? 0,
                    'commission_rate' => $validated['commission_rate'] ?? 0,
                    'casual_leaves_allowed' => $validated['casual_leaves_allowed'] ?? 14,
                    'medical_leaves_allowed' => $validated['medical_leaves_allowed'] ?? 7,
                    'vacation_leaves_allowed' => $validated['vacation_leaves_allowed'] ?? 14,
                ]
            );
        });

        return redirect()->back()->with('success', 'Staff profile updated successfully.');
    }

    public function storeAttendance(Request $request)
    {
        $garageId = $this->getGarageId($request);
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'date' => 'required|date',
            'status' => 'required|in:present,absent,half_day,casual_leave,medical_leave,vacation_leave',
            'ot_hours' => 'nullable|numeric|min:0'
        ]);

        // Ensure user belongs to this garage
        $staffUser = User::findOrFail($validated['user_id']);
        $this->checkGarageAccess($staffUser->garage_id);

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

    public function show(Request $request, $id)
    {
        $staffUser = User::whereIn('role', ['garage_staff', 'garage_owner', 'branch_admin', 'staff', 'hr_manager', 'accountant'])
            ->with(['staffProfile', 'salaryAdvances', 'jobs.invoice', 'attendances'])
            ->findOrFail($id);
        
        $this->checkGarageAccess($staffUser->garage_id);

        return Inertia::render('GarageOwner/HR/ShowProfile', [
            'staff' => $staffUser
        ]);
    }

    public function storeAdvance(Request $request, $id)
    {
        $garageId = $this->getGarageId($request);
        $staffUser = User::findOrFail($id);
        $this->checkGarageAccess($staffUser->garage_id);

        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
            'date' => 'required|date',
            'reason' => 'nullable|string'
        ]);

        \Illuminate\Support\Facades\DB::transaction(function () use ($staffUser, $validated, $garageId) {
            $advance = $staffUser->salaryAdvances()->create([
                'amount' => $validated['amount'],
                'date' => $validated['date'],
                'reason' => $validated['reason'],
                'status' => 'pending'
            ]);

            \App\Models\CashbookTransaction::create([
                'garage_id' => $garageId,
                'bank_account_id' => null,
                'type' => 'out',
                'amount' => $validated['amount'],
                'reference_type' => 'manual',
                'description' => 'Salary Advance: ' . $staffUser->name . ($validated['reason'] ? ' - ' . $validated['reason'] : ''),
                'date' => $validated['date'],
            ]);
        });

        return redirect()->back()->with('success', 'Salary advance issued successfully.');
    }
}
