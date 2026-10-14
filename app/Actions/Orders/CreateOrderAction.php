<?php

namespace App\Actions\Orders;

use App\Models\Invoice;
use Illuminate\Support\Facades\DB;

class CreateOrderAction
{
    public function execute(array $data, $garageId)
    {
        $data['garage_id'] = $garageId;
        
        return DB::transaction(function () use ($data, $garageId) {
            if (empty($data['invoice_number'])) {
                $data['invoice_number'] = (string) \App\Services\SequenceGenerator::getNextNumber($garageId, 'invoice');
            }
            $invoice = Invoice::create($data);
            
            \Illuminate\Support\Facades\Log::channel('audit')->info('Invoice Created', [
                'invoice_id' => $invoice->id,
                'garage_id' => $data['garage_id'],
                'user_id' => \Illuminate\Support\Facades\Auth::id(),
                'amount' => $invoice->total_amount
            ]);

            return $invoice;
        });
    }
}
