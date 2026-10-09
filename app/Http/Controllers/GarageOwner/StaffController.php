<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use App\Traits\JobAccessTrait;

class StaffController extends Controller
{
    use JobAccessTrait;
    public function index(Request $request)
    {
        $user = Auth::user();
        if ($user->role === 'company_owner') {
            $staff = User::whereIn('role', ['branch_admin', 'staff', 'accountant', 'hr_manager'])
                ->with('garage')
                ->get();
            $garages = \App\Models\Garage::all();
        } else {
            $garageId = $this->getGarageId($request);
            $staff = User::where('garage_id', $garageId)
                ->whereIn('role', ['branch_admin', 'staff', 'accountant', 'hr_manager'])
                ->with('garage')
                ->get();
            $garages = \App\Models\Garage::where('id', $garageId)->get();
        }

        return Inertia::render('GarageOwner/Staff', [
            'staff' => $staff,
            'garages' => $garages
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:branch_admin,staff,accountant,hr_manager',
            'garage_id' => $user->role === 'company_owner' ? 'required|exists:garages,id' : 'nullable',
        ]);

        $validated['garage_id'] = $user->role === 'company_owner' ? $request->garage_id : $user->garage_id;
        $validated['password'] = \Illuminate\Support\Facades\Hash::make($validated['password']);
        
        User::create($validated);
        return redirect()->back()->with('success', 'Staff member added successfully.');
    }

    public function update(Request $request, string $id)
    {
        $user = Auth::user();
        $query = User::query();
        if ($user->role !== 'company_owner') {
            $query->where('garage_id', $this->getGarageId($request));
        }
        $staff = $query->findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', \Illuminate\Validation\Rule::unique('users')->ignore($staff->id)],
            'role' => 'required|in:branch_admin,staff,accountant,hr_manager',
            'garage_id' => $user->role === 'company_owner' ? 'required|exists:garages,id' : 'nullable',
        ]);

        if ($request->filled('password')) {
            $request->validate(['password' => 'string|min:8']);
            $validated['password'] = \Illuminate\Support\Facades\Hash::make($request->password);
        }

        if ($user->role === 'company_owner') {
            $validated['garage_id'] = $request->garage_id;
        }

        $staff->update($validated);
        return redirect()->back()->with('success', 'Staff updated successfully.');
    }

    public function destroy(Request $request, string $id)
    {
        $staff = User::findOrFail($id);
        $this->checkGarageAccess($staff->garage_id);
        
        // Prevent deleting oneself
        if ($staff->id === Auth::id()) {
            return redirect()->back()->with('error', 'You cannot delete yourself.');
        }

        $staff->delete();
        
        return redirect()->back()->with('success', 'Staff deleted successfully.');
    }
}
