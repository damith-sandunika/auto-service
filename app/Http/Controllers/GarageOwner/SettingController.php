<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class SettingController extends Controller
{
    public function index()
    {
        $garage = \App\Models\Garage::where('owner_id', Auth::id())->first() ?? \App\Models\Garage::first();

        return Inertia::render('GarageOwner/Settings', [
            'garage' => $garage
        ]);
    }

    public function dangerZone()
    {
        return Inertia::render('GarageOwner/Settings/DangerZone');
    }

    public function update(Request $request)
    {

        $request->validate([
            'name' => 'required|string',
            'address' => 'required|string',
            'phone' => 'required|string',
            'tagline' => 'nullable|string',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        $garage = \App\Models\Garage::updateOrCreate(
            ['owner_id' => Auth::id()],
            $request->only('name', 'address', 'phone', 'tagline')
        );

        if ($request->hasFile('logo')) {
            if ($garage->logo_path) {
                Storage::disk('public')->delete($garage->logo_path);
            }
            $path = $request->file('logo')->store('logos', 'public');
            $garage->update(['logo_path' => $path]);
        }

        return redirect()->back()->with('success', 'Settings updated.');
    }

    public function wipeBranch(Request $request)
    {
        $garage = \App\Models\Garage::where('owner_id', Auth::id())->first();

        if ($garage) {
            \Illuminate\Support\Facades\DB::transaction(function () use ($garage) {
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
        }

        Auth::logout();

        return redirect('/login')->with('success', 'Your branch data has been completely removed.');
    }
}
