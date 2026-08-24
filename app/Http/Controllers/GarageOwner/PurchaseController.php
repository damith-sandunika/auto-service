<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Supplier;
use App\Models\Inventory;
use App\Models\Garage;
use App\Models\SupplierPayment;
use App\Models\Expense;

class PurchaseController extends Controller
{
    private function getGarage()
    {
        return Garage::where('owner_id', Auth::id())->first() ?? Garage::first();
    }

    public function index()
    {
        $garage = $this->getGarage();
        $purchases = PurchaseOrder::where('garage_id', $garage->id)
            ->with(['supplier', 'items.inventory'])
            ->orderBy('date', 'desc')
            ->get();
            
        $suppliers = Supplier::where('garage_id', $garage->id)->withCount('purchaseOrders')->orderBy('name')->get();
        $inventories = Inventory::where('garage_id', $garage->id)->orderBy('item_name')->get();

        return Inertia::render('GarageOwner/Purchases/Index', [
            'purchases' => $purchases,
            'suppliers' => $suppliers,
            'inventories' => $inventories
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'reference_no' => 'nullable|string',
            'date' => 'required|date',
            'paid_amount' => 'required|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.inventory_id' => 'required|exists:inventories,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_cost' => 'required|numeric|min:0',
        ]);

        $garage = $this->getGarage();

        DB::transaction(function () use ($request, $garage) {
            $totalAmount = 0;

            // 1. Calculate Total Amount
            foreach ($request->items as $item) {
                $totalAmount += ($item['quantity'] * $item['unit_cost']);
            }

            $paidAmount = $request->paid_amount;
            $balanceAmount = $totalAmount - $paidAmount;
            $status = $balanceAmount <= 0 ? 'paid' : ($paidAmount > 0 ? 'partial' : 'pending');

            // 2. Create Purchase Order
            $purchase = PurchaseOrder::create([
                'garage_id' => $garage->id,
                'supplier_id' => $request->supplier_id,
                'reference_no' => $request->reference_no,
                'date' => $request->date,
                'total_amount' => $totalAmount,
                'paid_amount' => $paidAmount,
                'balance_amount' => $balanceAmount,
                'status' => $status
            ]);

            // 3. Create Items & Update Inventory
            foreach ($request->items as $item) {
                PurchaseOrderItem::create([
                    'purchase_order_id' => $purchase->id,
                    'inventory_id' => $item['inventory_id'],
                    'quantity' => $item['quantity'],
                    'unit_cost' => $item['unit_cost'],
                    'total' => $item['quantity'] * $item['unit_cost']
                ]);

                // Increase Inventory Stock
                $inventory = Inventory::find($item['inventory_id']);
                // Update average cost formula: ((old_qty * old_cost) + (new_qty * new_cost)) / (old_qty + new_qty)
                $oldTotalValue = $inventory->quantity * $inventory->unit_price; // assuming unit_price is selling price, we don't have cost_price in DB? Let's just update stock.
                $inventory->increment('quantity', $item['quantity']);
            }

            // 4. Update Supplier Balance Due
            $supplier = Supplier::find($request->supplier_id);
            if ($balanceAmount > 0) {
                $supplier->increment('balance_due', $balanceAmount);
            }

            // 5. If there is an immediate paid amount, record Payment & Expense
            if ($paidAmount > 0) {
                SupplierPayment::create([
                    'garage_id' => $garage->id,
                    'supplier_id' => $supplier->id,
                    'purchase_order_id' => $purchase->id,
                    'amount' => $paidAmount,
                    'payment_method' => 'cash',
                    'payment_date' => $request->date
                ]);

                Expense::create([
                    'garage_id' => $garage->id,
                    'category' => 'Supplier Payment',
                    'amount' => $paidAmount,
                    'expense_date' => $request->date,
                    'description' => "Immediate cash payment for Purchase #{$purchase->id} from {$supplier->name}"
                ]);
            }
        });

        return redirect()->back()->with('success', 'Purchase Order saved and inventory updated.');
    }
}
