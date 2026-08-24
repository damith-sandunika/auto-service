<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\Supplier;
use App\Models\SupplierPayment;
use App\Models\Expense;
use App\Models\Garage;

class SupplierController extends Controller
{
    private function getGarage()
    {
        return Garage::where('owner_id', Auth::id())->first() ?? Garage::first();
    }

    public function index()
    {
        $garage = $this->getGarage();
        $suppliers = Supplier::where('garage_id', $garage->id)
            ->withCount('purchaseOrders')
            ->orderBy('name')
            ->get();

        return Inertia::render('GarageOwner/Suppliers/Index', [
            'suppliers' => $suppliers
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
        ]);

        Supplier::create(array_merge($request->all(), ['garage_id' => $this->getGarage()->id]));

        return redirect()->back()->with('success', 'Supplier created successfully.');
    }

    public function update(Request $request, Supplier $supplier)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
        ]);

        $supplier->update($request->all());

        return redirect()->back()->with('success', 'Supplier updated successfully.');
    }

    public function destroy(Supplier $supplier)
    {
        $supplier->delete();
        return redirect()->back()->with('success', 'Supplier deleted successfully.');
    }

    public function show(Supplier $supplier)
    {
        $supplier->load(['purchaseOrders' => function ($q) {
            $q->orderBy('date', 'desc');
        }, 'payments' => function ($q) {
            $q->orderBy('payment_date', 'desc');
        }]);

        return Inertia::render('GarageOwner/Suppliers/Show', [
            'supplier' => $supplier
        ]);
    }

    public function storePayment(Request $request, Supplier $supplier)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|string|in:cash,cheque,bank_transfer',
            'reference_no' => 'nullable|string',
            'payment_date' => 'required|date',
            'cheque_due_date' => 'nullable|date|required_if:payment_method,cheque'
        ]);

        $garage = $this->getGarage();

        \Illuminate\Support\Facades\DB::transaction(function () use ($garage, $supplier, $request) {
            // 1. Create Payment Record
            $payment = SupplierPayment::create([
                'garage_id' => $garage->id,
                'supplier_id' => $supplier->id,
                'amount' => $request->amount,
                'payment_method' => $request->payment_method,
                'reference_no' => $request->reference_no,
                'payment_date' => $request->payment_date,
                'cheque_due_date' => $request->payment_method === 'cheque' ? $request->cheque_due_date : null,
                'cheque_status' => $request->payment_method === 'cheque' ? 'pending' : null,
            ]);

            // 2. Reduce balance only if NOT a pending cheque (or if we treat pending cheques as reducing balance?)
            // Usually, giving a cheque reduces payable balance. But if it bounces, we revert it.
            // Let's reduce balance upon issuing cheque.
            $supplier->decrement('balance_due', $request->amount);

            // 3. Record Expense
            Expense::create([
                'garage_id' => $garage->id,
                'category' => 'Supplier Payment',
                'amount' => $request->amount,
                'expense_date' => $request->payment_date,
                'description' => "Payment to {$supplier->name} via " . ucfirst($request->payment_method) . ($request->reference_no ? " (Ref: {$request->reference_no})" : "")
            ]);
        });

        return redirect()->back()->with('success', 'Payment recorded successfully.');
    }

    public function updateChequeStatus(Request $request, SupplierPayment $payment)
    {
        $request->validate([
            'cheque_status' => 'required|string|in:cleared,bounced'
        ]);

        if ($payment->payment_method !== 'cheque') {
            return redirect()->back()->with('error', 'Not a cheque payment.');
        }

        \Illuminate\Support\Facades\DB::transaction(function () use ($payment, $request, $oldStatus) {
            $payment->update(['cheque_status' => $request->cheque_status]);

            // If it bounced, we need to add the amount back to the supplier balance_due
            if ($oldStatus !== 'bounced' && $request->cheque_status === 'bounced') {
                $payment->supplier->increment('balance_due', $payment->amount);
            } elseif ($oldStatus === 'bounced' && $request->cheque_status === 'cleared') {
                $payment->supplier->decrement('balance_due', $payment->amount);
            }
        });

        return redirect()->back()->with('success', 'Cheque status updated successfully.');
    }
}
