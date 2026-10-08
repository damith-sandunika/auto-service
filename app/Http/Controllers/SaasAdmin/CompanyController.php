<?php

namespace App\Http\Controllers\SaasAdmin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CompanyController extends Controller
{
    public function index()
    {
        $companies = Tenant::with('domains')->latest()->paginate(15);
        return Inertia::render('SaasAdmin/Companies/Index', [
            'companies' => $companies
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'company_name' => 'required|string|max:255',
            'domain' => 'required|string|unique:domains,domain',
            'admin_name' => 'required|string|max:255',
            'admin_email' => 'required|email|max:255',
            'admin_password' => 'required|string|min:8',
        ]);

        // Create Tenant DB
        $tenant = Tenant::create([
            'id' => $request->company_name, // Typically a slug, but id generator handles it if not provided
            'company_name' => $request->company_name,
        ]);

        $inputDomain = $request->domain;
        $centralDomain = config('tenancy.central_domains')[0] ?? 'localhost';
        
        // Auto-append .localhost or .autozone.dsrzone.com if the user just typed the prefix
        if (!str_contains($inputDomain, '.')) {
            $inputDomain = $inputDomain . '.' . $centralDomain;
        }

        // Create Domain
        $tenant->domains()->create([
            'domain' => $inputDomain
        ]);

        // Seed Company Owner in Tenant DB
        $tenant->run(function () use ($request) {
            \App\Models\User::create([
                'name' => $request->admin_name,
                'email' => $request->admin_email,
                'password' => bcrypt($request->admin_password),
                'role' => 'company_owner',
            ]);
        });

        return redirect()->back()->with('success', 'Company created successfully with isolated database.');
    }
}
