<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\CompanySetting;
use App\Models\Garage;
use Illuminate\Support\Facades\DB;

class SettingController extends Controller
{
    public function index()
    {
        $tenant = function_exists('tenant') ? tenant() : null;
        $company = CompanySetting::first();

        if (!$company) {
            $company = CompanySetting::create([
                'name' => $tenant?->company_name ?: ($tenant?->id ?? 'My Company'),
                'tagline' => $tenant?->tagline ?? null,
                'address' => $tenant?->address ?? null,
                'phone' => $tenant?->phone ?? null,
                'logo_path' => $tenant?->logo_path ?? null,
            ]);
        }

        return Inertia::render('GarageOwner/Settings', [
            'company' => $company,
            'garage' => $company, // for backward compatibility with view
        ]);
    }

    public function dangerZone()
    {
        return Inertia::render('GarageOwner/Settings/DangerZone');
    }

    public function update(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:50',
            'tagline' => 'nullable|string|max:255',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048'
        ]);

        $company = CompanySetting::first() ?? new CompanySetting();
        $company->name = $request->name;
        $company->address = $request->address;
        $company->phone = $request->phone;
        $company->tagline = $request->tagline;

        if ($request->hasFile('logo')) {
            if ($company->logo_path) {
                Storage::disk('public')->delete($company->logo_path);
            }
            $path = $request->file('logo')->store('logos', 'public');
            $company->logo_path = $path;
        }

        $company->save();

        // Sync to central Tenant model
        if (function_exists('tenant') && tenant()) {
            try {
                tenant()->update([
                    'company_name' => $company->name,
                    'address' => $company->address,
                    'phone' => $company->phone,
                    'tagline' => $company->tagline,
                    'logo_path' => $company->logo_path,
                ]);
            } catch (\Throwable $e) {
                // Ignore if central tenant attributes not supported
            }
        }

        return redirect()->back()->with('success', 'Company settings updated successfully.');
    }

    public function wipeBranch(Request $request)
    {
        $branchId = $request->input('branch_id') ?? session('active_branch_id');
        $garage = $branchId 
            ? Garage::where('id', $branchId)->where('owner_id', Auth::id())->first() 
            : Garage::where('owner_id', Auth::id())->first();

        if ($garage) {
            DB::transaction(function () use ($garage) {
                // Delete related specific data
                $garage->users()->where('id', '!=', Auth::id())->delete();
                $garage->inventory()->delete();
                $garage->expenses()->delete();
                $garage->appointments()->delete();
                $garage->suppliers()->delete();
                $garage->purchaseOrders()->delete();
                $garage->bankAccounts()->delete();
                $garage->cashbookTransactions()->delete();
                $garage->serviceReminders()->delete();
                $garage->branchActivityLogs()->delete();
                $garage->inspections()->delete();
                $garage->estimates()->delete();
                $garage->warranties()->delete();

                // Finally, soft delete the garage
                $garage->delete();
            });

            if (session('active_branch_id') == $garage->id) {
                session()->forget('active_branch_id');
            }
        }

        return redirect()->route('owner.branches.index')->with('success', 'Branch data has been removed.');
    }
}
