<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\GarageInvoiceSetting;
use Illuminate\Support\Facades\Storage;

class InvoiceSettingController extends Controller
{
    public function edit()
    {
        $garage = Auth::user()->garage;
        $settings = GarageInvoiceSetting::firstOrCreate(
            ['garage_id' => $garage->id],
            [
                'business_name' => $garage->name,
                'email' => $garage->email,
                'phone' => $garage->phone,
                'logo_url' => $garage->logo_path ? Storage::url($garage->logo_path) : null,
                'primary_color' => '#2563eb',
                'secondary_color' => '#f8fafc',
                'text_color' => '#334155',
                'heading_size' => 'text-2xl',
                'text_size' => 'text-sm',
                'paper_size' => 'A4'
            ]
        );
        
        return Inertia::render('GarageOwner/Settings/InvoiceSettings', [
            'settings' => $settings
        ]);
    }

    public function update(Request $request)
    {
        $settings = GarageInvoiceSetting::where('garage_id', Auth::user()->garage_id)->firstOrFail();
        
        $validated = $request->validate([
            'business_name' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|string|max:255',
            'tax_number' => 'nullable|string|max:100',
            'primary_color' => 'required|string|max:20',
            'secondary_color' => 'required|string|max:20',
            'text_color' => 'required|string|max:20',
            'heading_size' => 'required|string|max:20',
            'text_size' => 'required|string|max:20',
            'footer_text' => 'nullable|string',
            'terms_and_conditions' => 'nullable|string',
            'paper_size' => 'required|string|max:20',
            'logo_size' => 'nullable|numeric',
            'logo' => 'nullable|image|max:2048'
        ]);

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('public/invoice_logos');
            $validated['logo_url'] = Storage::url($path);
        }

        $settings->update($validated);

        return back()->with('success', 'Invoice settings updated successfully.');
    }
}
