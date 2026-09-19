<?php

namespace App\Actions\Orders;

use App\Models\Invoice;
use Illuminate\Support\Facades\DB;

class ProcessPaymentAction
{
    public function execute(Invoice $invoice, array $paymentData)
    {
        return DB::transaction(function () use ($invoice, $paymentData) {
            $payment = $invoice->payments()->create($paymentData);

            \App\Models\CashbookTransaction::create([
                'garage_id' => $invoice->garage_id,
                'bank_account_id' => null,
                'type' => 'in',
                'amount' => $paymentData['amount'],
                'reference_type' => 'invoice',
                'reference_id' => $invoice->id,
                'description' => 'Payment for Invoice #' . $invoice->id . ' (' . ($paymentData['payment_method'] ?? 'cash') . ')',
                'date' => $paymentData['payment_date'] ?? now()->toDateString(),
            ]);

            $totalPaid = $invoice->payments()->sum('amount');
            if ($totalPaid >= $invoice->total_amount) {
                $invoice->update(['status' => 'paid']);
            }

            return $payment;
        });
    }
}
