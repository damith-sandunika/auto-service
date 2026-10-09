<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use App\Models\Job;
use App\Models\JobItem;
use App\Models\Inventory;
use App\Models\ServiceCatalog;
use App\Models\User;
use App\Models\CashbookTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

use App\Traits\JobAccessTrait;

class JobWorkspaceController extends Controller
{
    use JobAccessTrait;
    public function show(Job $job)
    {
        $this->checkGarageAccess($job->garage_id);

        $job->load(['vehicle', 'owner', 'mechanic', 'items.location', 'payments', 'notes.user', 'media', 'invoice']);
        
        $inventory = Inventory::where('garage_id', $job->garage_id)->get(['id', 'item_name', 'price', 'quantity']);
        $services = ServiceCatalog::where('garage_id', $job->garage_id)->get(['id', 'service_name', 'default_price as price']);
        $suppliers = \App\Models\Supplier::where('garage_id', $job->garage_id)->get(['id', 'name', 'phone']);

        return Inertia::render('GarageOwner/Jobs/Workspace', [
            'job' => $job,
            'inventory' => $inventory,
            'services' => $services,
            'suppliers' => $suppliers,
        ]);
    }

    public function print(Request $request, Job $job)
    {
        $this->checkGarageAccess($job->garage_id);

        $job->load(['vehicle', 'owner', 'items', 'mechanic']);
        $garage = \App\Models\Garage::find($job->garage_id);
        
        if ($request->type === 'thermal') {
            $settings = \App\Models\GarageThermalSetting::where('garage_id', $job->garage_id)->first();
            if (!$settings) {
                $settings = new \App\Models\GarageThermalSetting([
                    'paper_width' => '80mm',
                    'font_family' => 'sans-serif',
                    'logo_size' => 140,
                ]);
            }
            $settings->paper_size = 'thermal';
        } else {
            $settings = \App\Models\GarageInvoiceSetting::where('garage_id', $job->garage_id)->first();
        }

        // Mock invoice for the React component
        $invoice = (object)[
            'id' => $job->id,
            'invoice_number' => (string) $job->id,
            'created_at' => $job->created_at,
            'total_amount' => $job->total_cost,
            'discount' => 0,
            'payments' => [],
            'job' => $job,
            'garage' => $garage,
            'status' => 'pending'
        ];

        return Inertia::render('GarageOwner/PrintInvoice', [
            'invoice' => $invoice,
            'settings' => $settings
        ]);
    }


}

