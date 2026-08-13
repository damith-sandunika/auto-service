<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class StaffController extends Controller
{
    public function index()
    {
        $garageId = Auth::user()->garage_id;
        $staff = User::where('garage_id', $garageId)
            ->whereIn('role', ['garage_staff', 'garage_owner'])
            ->get();

        return Inertia::render('GarageOwner/Staff', [
            'staff' => $staff
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        $validated['role'] = 'garage_staff';
        $validated['garage_id'] = Auth::user()->garage_id;
        $validated['password'] = \Illuminate\Support\Facades\Hash::make($validated['password']);
        
        User::create($validated);
        return redirect()->back()->with('success', 'Staff member added successfully.');
    }

    public function update(Request $request, string $id)
    {
        $staff = User::where('garage_id', Auth::user()->garage_id)->findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', \Illuminate\Validation\Rule::unique('users')->ignore($staff->id)],
        ]);

        if ($request->filled('password')) {
            $request->validate(['password' => 'string|min:8']);
            $validated['password'] = \Illuminate\Support\Facades\Hash::make($request->password);
        }

        $staff->update($validated);
        return redirect()->back()->with('success', 'Staff updated successfully.');
    }

    public function destroy(string $id)
    {
        $staff = User::where('garage_id', Auth::user()->garage_id)->findOrFail($id);
        
        // Prevent deleting oneself
        if ($staff->id === Auth::id()) {
            return redirect()->back()->with('error', 'You cannot delete yourself.');
        }

        $staff->delete();
        
        return redirect()->back()->with('success', 'Staff deleted successfully.');
    }
}
