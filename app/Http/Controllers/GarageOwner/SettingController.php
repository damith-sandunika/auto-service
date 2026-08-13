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

    public function update(Request $request)
    {
        $garage = \App\Models\Garage::where('owner_id', Auth::id())->first() ?? \App\Models\Garage::first();

        $request->validate([
            'name' => 'required|string',
            'address' => 'required|string',
            'phone' => 'required|string',
            'tagline' => 'nullable|string',
            'logo_size' => 'nullable|integer|min:20|max:300',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        $garage->update($request->only('name', 'address', 'phone', 'tagline', 'logo_size'));

        if ($request->hasFile('logo')) {
            if ($garage->logo_path) {
                Storage::disk('public')->delete($garage->logo_path);
            }
            $path = $request->file('logo')->store('logos', 'public');
            $garage->update(['logo_path' => $path]);
        }

        return redirect()->back()->with('success', 'Settings updated.');
    }
}
