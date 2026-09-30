<?php

namespace App\Actions\Purchases;

use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Supplier;
use App\Models\Inventory;
use App\Models\SupplierPayment;
use App\Models\Expense;
use Illuminate\Support\Facades\DB;

class CreatePurchaseOrderAction
{
    public function execute(array $data, $garageId)
    {
        return DB::transaction(function () use ($data, $garageId) {
            $totalAmount = 0;

            // 1. Calculate Total Amount
            foreach ($data['items'] as $item) {
                $totalAmount += ($item['quantity'] * $item['unit_cost']);
            }

            $paidAmount = $data['paid_amount'];
            $balanceAmount = $totalAmount - $paidAmount;
            $status = $balanceAmount <= 0 ? 'paid' : ($paidAmount > 0 ? 'partial' : 'pending');

            // 2. Create Purchase Order
            $referenceNo = !empty($data['reference_no']) 
                ? $data['reference_no'] 
                : 'PO-' . \App\Services\SequenceGenerator::getNextNumber($garageId, 'purchase_order');

            $purchase = PurchaseOrder::create([
                'garage_id' => $garageId,
                'supplier_id' => $data['supplier_id'],
                'reference_no' => $referenceNo,
                'date' => $data['date'],
                'total_amount' => $totalAmount,
                'paid_amount' => $paidAmount,
                'balance_amount' => $balanceAmount,
                'status' => $status
            ]);

            // 3. Create Items & Update Inventory
            foreach ($data['items'] as $item) {
                PurchaseOrderItem::create([
                    'purchase_order_id' => $purchase->id,
                    'inventory_id' => $item['inventory_id'],
                    'quantity' => $item['quantity'],
                    'unit_cost' => $item['unit_cost'],
                    'total' => $item['quantity'] * $item['unit_cost']
                ]);

                // Increase Inventory Stock
                $inventory = Inventory::find($item['inventory_id']);
                $inventory->increment('quantity', $item['quantity']);
            }

            // 4. Update Supplier Balance Due
            $supplier = Supplier::find($data['supplier_id']);
            if ($balanceAmount > 0) {
                $supplier->increment('balance_due', $balanceAmount);
            }

            // 5. If there is an immediate paid amount, record Payment & Expense
            if ($paidAmount > 0) {
                SupplierPayment::create([
                    'garage_id' => $garageId,
                    'supplier_id' => $supplier->id,
                    'purchase_order_id' => $purchase->id,
                    'amount' => $paidAmount,
                    'payment_method' => 'cash',
                    'payment_date' => $data['date']
                ]);

                Expense::create([
                    'garage_id' => $garageId,
                    'category' => 'Supplier Payment',
                    'amount' => $paidAmount,
                    'expense_date' => $data['date'],
                    'description' => "Immediate cash payment for Purchase #{$purchase->id} from {$supplier->name}"
                ]);
            }

            return $purchase;
        });
    }
}
