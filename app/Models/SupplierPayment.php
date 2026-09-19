<?php

namespace App\Models;

use App\Traits\BelongsToGarage;

use Illuminate\Database\Eloquent\Model;

class SupplierPayment extends Model
{
    use BelongsToGarage;
    protected $fillable = [
        'garage_id', 'supplier_id', 'purchase_order_id', 'amount', 'payment_method', 'reference_no', 'payment_date', 'cheque_due_date', 'cheque_status'
    ];

    public function garage()
    {
        return $this->belongsTo(Garage::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class);
    }
}
