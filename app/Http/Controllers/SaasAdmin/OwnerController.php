<?php

namespace App\Http\Controllers\SaasAdmin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class OwnerController extends Controller
{
    public function index()
    {
        $owners = [];
        $tenants = Tenant::paginate(15);

        foreach ($tenants as $tenant) {
            $tenant->run(function () use (&$owners, $tenant) {
                $tenantOwners = User::where('role', 'company_owner')->get();
                foreach ($tenantOwners as $owner) {
                    $owner->setAttribute('garage', [
                        'id' => $tenant->id,
                        'name' => $tenant->company_name ?? $tenant->id
                    ]);
                    $owner->setAttribute('garage_id', $tenant->id);
                    $owners[] = $owner->toArray();
                }
            });
        }

        return Inertia::render('SuperAdmin/Users', [
            'users' => collect($owners),
            'garages' => $tenants->map(function($t) {
                return ['id' => $t->id, 'name' => $t->company_name ?? $t->id];
            }),
            'pagination' => $tenants->toArray()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255',
            'password' => 'required|string|min:8',
            'garage_id' => 'required|exists:tenants,id',
        ]);

        $tenant = Tenant::findOrFail($validated['garage_id']);
        
        tenancy()->initialize($tenant);
        
        // Check uniqueness in tenant db
        if (User::where('email', $validated['email'])->exists()) {
            tenancy()->end();
            return redirect()->back()->withErrors(['email' => 'The email has already been taken in this company.']);
        }

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'company_owner',
        ]);
        
        tenancy()->end();

        return redirect()->back()->with('success', 'Company Owner created successfully.');
    }

    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255',
            'garage_id' => 'required|exists:tenants,id',
        ]);

        $tenant = Tenant::findOrFail($validated['garage_id']);
        tenancy()->initialize($tenant);

        $user = User::findOrFail($id);

        if (User::where('email', $validated['email'])->where('id', '!=', $user->id)->exists()) {
            tenancy()->end();
            return redirect()->back()->withErrors(['email' => 'The email has already been taken in this company.']);
        }

        $user->name = $validated['name'];
        $user->email = $validated['email'];

        if ($request->filled('password')) {
            $request->validate(['password' => 'string|min:8']);
            $user->password = Hash::make($request->password);
        }

        $user->save();
        tenancy()->end();

        return redirect()->back()->with('success', 'Company Owner updated successfully.');
    }

    public function destroy(Request $request, string $id)
    {
        // Since we don't have garage_id in the URL, we have to find which tenant this user belongs to
        // Or we can expect garage_id in the request if we modify the frontend.
        // For simplicity, let's search through tenants.
        foreach (Tenant::all() as $tenant) {
            try {
                tenancy()->initialize($tenant);
                $user = User::find($id);
                if ($user && $user->role === 'company_owner') {
                    $user->delete();
                    tenancy()->end();
                    return redirect()->back()->with('success', 'Company Owner deleted successfully.');
                }
                tenancy()->end();
            } catch (\Exception $e) {
                // Do nothing if init fails
            }
        }
        
        return redirect()->back()->withErrors(['error' => 'User not found.']);
    }
}
