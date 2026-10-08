<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use App\Models\Job;
use App\Models\JobItem;
use App\Models\Inventory;
use App\Models\CashbookTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class JobWorkspaceItemController extends Controller
{
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
}
