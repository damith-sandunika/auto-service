<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\PaymentRecord;
use App\Models\Subscription;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BillingController extends Controller
{
    public function index()
    {
        $billings = PaymentRecord::with('tenant')->latest()->get();
        $garages = Tenant::all(); // keeping var name garages to not break frontend
        
        $activeSubscriptions = Subscription::where('status', 'active')->count();
        $monthlyRevenue = PaymentRecord::where('status', 'approved')
            ->whereMonth('payment_date', now()->month)
            ->sum('amount');
        $pendingPayments = PaymentRecord::where('status', 'pending')->count();

        return Inertia::render('SuperAdmin/Billing', [
            'billings' => $billings,
            'garages' => $garages,
            'stats' => [
                'active_subscriptions' => $activeSubscriptions,
                'monthly_revenue' => $monthlyRevenue,
                'pending_payments' => $pendingPayments
            ]
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'garage_id' => 'required|exists:tenants,id', // keeping param name to not break frontend
            'amount' => 'required|numeric|min:0',
            'payment_date' => 'required|date',
            'status' => 'required|in:pending,approved,failed',
            'reference_number' => 'nullable|string'
        ]);

        PaymentRecord::create($request->all());

        return redirect()->back()->with('success', 'Payment registered successfully');
    }
}
