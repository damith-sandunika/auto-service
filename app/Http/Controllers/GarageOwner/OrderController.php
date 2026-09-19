<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Models\Invoice;
use App\Models\Job;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    public function index()
    {
        $garageId = Auth::user()->garage_id;
        
        $invoices = Invoice::with(['job.vehicle', 'payments'])->where('garage_id', $garageId)->latest()->paginate(20, ['*'], 'invoices_page');
        $jobs = Job::with('vehicle')->where('garage_id', $garageId)->latest()->paginate(20, ['*'], 'jobs_page');

        return Inertia::render('GarageOwner/Orders', [
            'invoices' => $invoices,
            'jobs' => $jobs
        ]);
    }

    public function store(Request $request, \App\Actions\Orders\CreateOrderAction $createOrderAction)
    {
        $validated = $request->validate([
            'job_id' => 'required|exists:service_jobs,id',
            'total_amount' => 'required|numeric|min:0',
            'status' => 'required|in:pending,paid',
        ]);

        $createOrderAction->execute($validated, Auth::user()->garage_id);
        
        return redirect()->back()->with('success', 'Invoice created successfully.');
    }

    public function show(string $id)
    {
        $invoice = Invoice::with(['job.vehicle', 'job.items', 'job.mechanic', 'payments', 'garage'])->where('garage_id', Auth::user()->garage_id)->findOrFail($id);
        
        return Inertia::render('GarageOwner/Orders/Show', [
            'invoice' => $invoice
        ]);
    }

    public function update(Request $request, string $id)
    {
        $invoice = Invoice::where('garage_id', Auth::user()->garage_id)->findOrFail($id);

        $validated = $request->validate([
            'job_id' => 'required|exists:service_jobs,id',
            'total_amount' => 'required|numeric|min:0',
            'status' => 'required|in:pending,paid',
        ]);

        $invoice->update($validated);
        return redirect()->back()->with('success', 'Invoice updated successfully.');
    }

    public function destroy(string $id)
    {
        $invoice = Invoice::where('garage_id', Auth::user()->garage_id)->findOrFail($id);
        $invoice->delete();
        
        return redirect()->back()->with('success', 'Invoice deleted successfully.');
    }

    public function addPayment(Request $request, string $id, \App\Actions\Orders\ProcessPaymentAction $processPaymentAction)
    {
        $invoice = Invoice::where('garage_id', Auth::user()->garage_id)->findOrFail($id);

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|in:cash,card,credit',
            'payment_date' => 'required|date',
        ]);

        $processPaymentAction->execute($invoice, $validated);

        return redirect()->back()->with('success', 'Payment added successfully.');
    }

    public function print(string $id)
    {
        $invoice = Invoice::with(['job.vehicle', 'job.items', 'payments', 'garage'])->findOrFail($id);
        
        return Inertia::render('GarageOwner/PrintInvoice', [
            'invoice' => $invoice
        ]);
    }
}
