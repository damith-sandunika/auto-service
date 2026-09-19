<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToGarage;

class PurchaseOrder extends Model
{
    use BelongsToGarage;

    protected $fillable = [
        'garage_id', 'supplier_id', 'reference_no', 'total_amount', 'paid_amount', 'balance_amount', 'status', 'date'
    ];

    public function garage()
    {
        return $this->belongsTo(Garage::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function items()
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }

    public function payments()
    {
        return $this->hasMany(SupplierPayment::class);
    }
}
