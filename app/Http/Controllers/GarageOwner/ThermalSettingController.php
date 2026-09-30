<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\GarageThermalSetting;
use Illuminate\Support\Facades\Storage;

class ThermalSettingController extends Controller
{
    public function edit()
    {
        $garage = Auth::user()->garage;
        $settings = GarageThermalSetting::firstOrCreate(
            ['garage_id' => $garage->id],
            [
                'store_name' => $garage->name,
                'tagline' => $garage->tagline,
                'email' => $garage->email,
                'phone' => $garage->phone,
                'address' => $garage->address,
                'show_logo' => true,
                'paper_width' => '80mm',
                'footer_message_1' => 'Thank you! Drive safely',
                'footer_message_2' => 'Powered by DSRZone'
            ]
        );
        
        // Append original garage logo and thermal logo so the preview can use it
        $settings->original_logo_url = $garage->logo_path ? Storage::url($garage->logo_path) : null;
        $settings->logo_url = $settings->logo_path ? Storage::url($settings->logo_path) : null;
        
        return Inertia::render('GarageOwner/Settings/ThermalSettings', [
            'settings' => $settings
        ]);
    }

    public function update(Request $request)
    {
        $settings = GarageThermalSetting::where('garage_id', Auth::user()->garage_id)->firstOrFail();
        
        $validated = $request->validate([
            'store_name' => 'nullable|string|max:255',
            'tagline' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'show_logo' => 'boolean',
            'paper_width' => 'required|string|max:20',
            'footer_message_1' => 'nullable|string',
            'logo_size' => 'nullable|numeric',
            'logo' => 'nullable|image|max:2048'
        ]);

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('thermal_logos', 'public');
            $validated['logo_path'] = $path;
        }

        $settings->update($validated);

        return back()->with('success', 'Thermal Bill settings updated successfully.');
    }
}
