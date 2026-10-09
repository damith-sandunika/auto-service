<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\TenantRole;
use App\Models\Garage;
use App\Models\User;

class RoleController extends Controller
{
    public function index()
    {
        $roles = TenantRole::withCount('users')->latest()->get();
        return Inertia::render('GarageOwner/Settings/Roles/Index', [
            'roles' => $roles,
        ]);
    }

    private function getModules()
    {
        return [
                'pos' => ['view', 'add', 'edit'],
                'invoices' => ['view', 'add', 'edit', 'delete'],
                'inventory' => ['view', 'add', 'edit', 'delete'],
                'purchases' => ['view', 'add', 'edit', 'delete'],
                'suppliers' => ['view', 'add', 'edit', 'delete'],
                'expenses' => ['view', 'add', 'edit', 'delete'],
                'reports' => ['view'],
                'vehicles' => ['view', 'add', 'edit', 'delete'],
                'inspections' => ['view', 'add', 'edit', 'delete'],
                'warranties' => ['view', 'add', 'edit', 'delete'],
            'hr' => ['view', 'add', 'edit', 'delete'],
            'roles' => ['view', 'add', 'edit', 'delete'], // The meta permission
        ];
    }

    public function create()
    {
        return Inertia::render('GarageOwner/Settings/Roles/Create', [
            'modules' => $this->getModules()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'permissions' => 'nullable|array',
        ]);

        TenantRole::create([
            'name' => $validated['name'],
            'permissions' => $validated['permissions'] ?? [],
            'is_system' => false,
        ]);

        return redirect()->route('owner.roles.index')->with('success', 'Role created successfully.');
    }

    public function edit(string $id)
    {
        $role = TenantRole::findOrFail($id);
        
        return Inertia::render('GarageOwner/Settings/Roles/Edit', [
            'role' => $role,
            'modules' => $this->getModules()
        ]);
    }

    public function update(Request $request, string $id)
    {
        $role = TenantRole::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'permissions' => 'nullable|array',
        ]);

        $role->update([
            'name' => $validated['name'],
            'permissions' => $validated['permissions'] ?? [],
        ]);

        return redirect()->route('owner.roles.index')->with('success', 'Role updated successfully.');
    }

    public function destroy(string $id)
    {
        $role = TenantRole::findOrFail($id);
        
        if ($role->is_system) {
            return redirect()->back()->with('error', 'Cannot delete a system default role.');
        }

        if ($role->users()->count() > 0) {
            return redirect()->back()->with('error', 'Cannot delete role assigned to users. Reassign them first.');
        }

        $role->delete();

        return redirect()->back()->with('success', 'Role deleted successfully.');
    }
}
