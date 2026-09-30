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

class JobWorkspaceController extends Controller
{
    public function show(Job $job)
    {
        if ($job->garage_id !== Auth::user()->garage_id) {
            abort(403);
        }

        $job->load(['vehicle.owner', 'mechanic', 'items', 'payments', 'notes.user']);
        
        $inventory = Inventory::where('garage_id', Auth::user()->garage_id)->get(['id', 'item_name', 'price', 'quantity']);
        $services = ServiceCatalog::where('garage_id', Auth::user()->garage_id)->get(['id', 'service_name', 'default_price as price']);
        $suppliers = \App\Models\Supplier::where('garage_id', Auth::user()->garage_id)->get(['id', 'name', 'phone']);

        return Inertia::render('GarageOwner/Jobs/Workspace', [
            'job' => $job,
            'inventory' => $inventory,
            'services' => $services,
            'suppliers' => $suppliers,
        ]);
    }

    public function print(Request $request, Job $job)
    {
        if ($job->garage_id !== Auth::user()->garage_id) {
            abort(403);
        }

        $job->load(['vehicle.owner', 'items', 'mechanic']);
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
            'invoice_number' => 'EST-' . str_pad($job->id, 5, '0', STR_PAD_LEFT),
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

    public function addItem(Request $request, Job $job)
    {
        if ($job->garage_id !== Auth::user()->garage_id) {
            abort(403);
        }

        $request->validate([
            'item_type' => 'required|string|in:part,service,outsource',
            'description' => 'required|string',
            'quantity' => 'required|numeric|min:1',
            'price' => 'required|numeric|min:0', // This is selling price (Customer Price)
            // For Outsource
            'cost_price' => 'nullable|numeric|min:0',
            'payment_method' => 'nullable|string|in:cash,credit',
            'supplier_id' => 'required_if:item_type,outsource|nullable|exists:suppliers,id',
            'item_id' => 'nullable|integer'
        ]);

        DB::beginTransaction();
        try {
            $isPaid = false;
            $purchaseOrderId = null;
            
            if ($request->item_type === 'outsource') {
                $totalCost = $request->cost_price * $request->quantity;
                $isPaid = ($request->payment_method === 'cash');
                
                // Create Purchase Order
                $poNumber = 'PO-' . \App\Services\SequenceGenerator::getNextNumber($job->garage_id, 'purchase_order');
                $po = \App\Models\PurchaseOrder::create([
                    'garage_id' => $job->garage_id,
                    'supplier_id' => $request->supplier_id,
                    'reference_no' => $poNumber,
                    'total_amount' => $totalCost,
                    'paid_amount' => $isPaid ? $totalCost : 0,
                    'balance_amount' => $isPaid ? 0 : $totalCost,
                    'status' => $isPaid ? 'paid' : 'pending',
                    'date' => Carbon::now()->toDateString(),
                ]);
                
                $purchaseOrderId = $po->id;

                if ($isPaid) {
                    CashbookTransaction::create([
                        'garage_id' => $job->garage_id,
                        'type' => 'expense',
                        'amount' => $totalCost,
                        'category' => 'Outsource Payment',
                        'description' => 'Paid for outsource work: ' . $request->description,
                        'date' => Carbon::now()->toDateString(),
                        'reference_type' => 'Job',
                        'reference_id' => $job->id,
                    ]);
                } else {
                    // Update Supplier Balance
                    $supplier = \App\Models\Supplier::find($request->supplier_id);
                    $supplier->increment('balance_due', $totalCost);
                }
            }

            // If it's a part, decrement inventory
            if ($request->item_type === 'part' && $request->item_id) {
                $inv = Inventory::find($request->item_id);
                if ($inv && $inv->quantity >= $request->quantity) {
                    $inv->decrement('quantity', $request->quantity);
                } else {
                    throw new \Exception("Not enough inventory for this part.");
                }
            }

            JobItem::create([
                'job_id' => $job->id,
                'item_type' => $request->item_type,
                'description' => $request->description,
                'quantity' => $request->quantity,
                'price' => $request->price,
                'cost_price' => $request->cost_price,
                'payment_method' => $request->payment_method,
                'is_paid' => $isPaid,
                'supplier_id' => $request->supplier_id ?? null,
                'purchase_order_id' => $purchaseOrderId,
            ]);

            // Update Job total
            $job->total_cost = $job->items()->sum(DB::raw('price * quantity'));
            $job->save();

            DB::commit();
            Log::info('Job Workspace item added successfully', ['job_id' => $job->id, 'user_id' => Auth::id()]);
            return back()->with('success', 'Item added to job cart successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Job Workspace error', ['error' => $e->getMessage(), 'user_id' => Auth::id()]);
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function removeItem(JobItem $item)
    {
        $job = $item->job;
        if ($job->garage_id !== Auth::user()->garage_id) {
            abort(403);
        }

        DB::beginTransaction();
        try {
            // Restore inventory if part
            if ($item->item_type === 'part') {
                $inv = Inventory::where('garage_id', $job->garage_id)
                    ->where('item_name', $item->description)
                    ->first();
                if ($inv) {
                    $inv->increment('quantity', $item->quantity);
                }
            }
            
            // Delete associated Purchase Order and reverse balances if outsource
            if ($item->item_type === 'outsource' && $item->purchase_order_id) {
                $po = \App\Models\PurchaseOrder::find($item->purchase_order_id);
                if ($po) {
                    $totalCost = $po->total_amount;
                    if ($po->status === 'paid') {
                        // Reverse Cashbook
                        CashbookTransaction::where('reference_type', 'Job')
                            ->where('reference_id', $job->id)
                            ->where('amount', $totalCost)
                            ->delete();
                    } else {
                        // Reverse Supplier Balance
                        $supplier = \App\Models\Supplier::find($po->supplier_id);
                        if ($supplier) {
                            $supplier->decrement('balance_due', $totalCost);
                        }
                    }
                    $po->delete();
                }
            }

            $item->delete();
            
            $job->total_cost = $job->items()->sum(DB::raw('price * quantity'));
            $job->save();

            DB::commit();
            Log::info('Job Workspace item removed successfully', ['job_id' => $job->id, 'user_id' => Auth::id()]);
            return back()->with('success', 'Item removed.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Job Workspace error', ['error' => $e->getMessage(), 'user_id' => Auth::id()]);
            return back()->withErrors(['error' => 'Failed to remove item.']);
        }
    }

    public function updateQuantity(Request $request, JobItem $item)
    {
        $job = $item->job;
        if ($job->garage_id !== Auth::user()->garage_id) {
            abort(403);
        }

        $request->validate(['action' => 'required|in:increment,decrement']);

        DB::beginTransaction();
        try {
            if ($request->action === 'increment') {
                if ($item->item_type === 'part') {
                    $inv = Inventory::where('garage_id', $job->garage_id)->where('item_name', $item->description)->first();
                    if (!$inv || $inv->quantity < 1) {
                        throw new \Exception("Not enough inventory.");
                    }
                    $inv->decrement('quantity', 1);
                }
                $item->increment('quantity');
            } else {
                if ($item->quantity <= 1) {
                    throw new \Exception("Cannot decrement below 1. Use remove instead.");
                }
                if ($item->item_type === 'part') {
                    $inv = Inventory::where('garage_id', $job->garage_id)->where('item_name', $item->description)->first();
                    if ($inv) {
                        $inv->increment('quantity', 1);
                    }
                }
                $item->decrement('quantity');
            }
            
            $job->total_cost = $job->items()->sum(DB::raw('price * quantity'));
            $job->save();
            DB::commit();
            return back()->with('success', 'Quantity updated.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function addPayment(Request $request, Job $job)
    {
        if ($job->garage_id !== Auth::user()->garage_id) {
            abort(403);
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|string|in:cash,card,bank_transfer',
        ]);

        DB::beginTransaction();
        try {
            $payment = \App\Models\JobPayment::create([
                'garage_id' => $job->garage_id,
                'job_id' => $job->id,
                'amount' => $validated['amount'],
                'payment_method' => $validated['payment_method'],
            ]);

            CashbookTransaction::create([
                'garage_id' => $job->garage_id,
                'type' => 'income',
                'amount' => $validated['amount'],
                'category' => 'Advance Payment',
                'description' => "Advance payment for Job #" . $job->id . " (" . ucfirst(str_replace('_', ' ', $validated['payment_method'])) . ")",
                'date' => \Carbon\Carbon::now()->toDateString(),
                'reference_type' => 'JobPayment',
                'reference_id' => $payment->id,
            ]);

            DB::commit();
            return back()->with('success', 'Advance payment added successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Job Advance Payment Error', ['error' => $e->getMessage()]);
            return back()->withErrors(['error' => 'Failed to process payment.']);
        }
    }

    public function storeNote(Request $request, Job $job)
    {
        if ($job->garage_id !== Auth::user()->garage_id) {
            abort(403);
        }
        $request->validate([
            'title' => 'nullable|string', 
            'content' => 'required|string',
            'color' => 'nullable|string|in:amber,yellow,rose,blue,emerald',
            'is_important' => 'nullable|boolean'
        ]);
        $job->notes()->create([
            'garage_id' => $job->garage_id,
            'user_id' => Auth::id(),
            'title' => $request->title,
            'content' => $request->content,
            'color' => $request->color ?? 'amber',
            'is_important' => $request->is_important ?? false,
        ]);
        return back()->with('success', 'Note added.');
    }

    public function updateNote(Request $request, \App\Models\JobNote $note)
    {
        if ($note->garage_id !== Auth::user()->garage_id) {
            abort(403);
        }
        $request->validate([
            'title' => 'nullable|string', 
            'content' => 'required|string',
            'color' => 'nullable|string|in:amber,yellow,rose,blue,emerald',
            'is_important' => 'nullable|boolean'
        ]);
        $note->update([
            'title' => $request->title,
            'content' => $request->content,
            'color' => $request->color ?? 'amber',
            'is_important' => $request->is_important ?? false,
        ]);
        return back()->with('success', 'Note updated.');
    }

    public function destroyNote(\App\Models\JobNote $note)
    {
        if ($note->garage_id !== Auth::user()->garage_id) {
            abort(403);
        }
        $note->delete();
        return back()->with('success', 'Note deleted.');
    }

    public function updateDiscount(Request $request, Job $job)
    {
        if ($job->garage_id !== Auth::user()->garage_id) {
            abort(403);
        }
        $request->validate(['discount' => 'required|numeric|min:0']);
        $job->update(['discount' => $request->discount]);
        return back()->with('success', 'Discount updated.');
    }

    public function complete(Job $job)
    {
        if ($job->garage_id !== Auth::user()->garage_id) {
            abort(403);
        }
        
        DB::beginTransaction();
        try {
            $job->status = 'completed';
            $job->save();

            $invoiceNumber = 'INV-' . \App\Services\SequenceGenerator::getNextNumber($job->garage_id, 'invoice');

            $invoice = \App\Models\Invoice::firstOrCreate(
                ['job_id' => $job->id, 'garage_id' => $job->garage_id],
                [
                    'invoice_number' => $invoiceNumber,
                    'total_amount' => $job->total_cost,
                    'discount' => $job->discount,
                    'status' => 'pending'
                ]
            );

            if (!$invoice->wasRecentlyCreated) {
                $invoice->update([
                    'total_amount' => $job->total_cost,
                    'discount' => $job->discount
                ]);
            }

            // Transfer advance payments to invoice payments
            foreach ($job->payments as $jp) {
                \App\Models\Payment::firstOrCreate(
                    [
                        'invoice_id' => $invoice->id,
                        'amount' => $jp->amount,
                        'payment_method' => $jp->payment_method === 'bank_transfer' ? 'bank' : $jp->payment_method, // map bank_transfer to bank or just keep it
                        'payment_date' => $jp->created_at->toDateString(),
                    ],
                    [
                        'garage_id' => $job->garage_id,
                    ]
                );
            }

            DB::commit();
            return redirect()->route('owner.orders.index')->with('success', 'Job completed and invoice generated. Please collect remaining payment.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Job Completion error', ['error' => $e->getMessage()]);
            return back()->withErrors(['error' => 'Failed to complete job.']);
        }
    }
}

