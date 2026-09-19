<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToGarage;

class Supplier extends Model
{
    use BelongsToGarage;

    protected $fillable = [
        'garage_id', 'name', 'contact_person', 'phone', 'email', 'address', 'balance_due'
    ];

    public function garage()
    {
        return $this->belongsTo(Garage::class);
    }

    public function purchaseOrders()
    {
        return $this->hasMany(PurchaseOrder::class);
    }

    public function payments()
    {
        return $this->hasMany(SupplierPayment::class);
    }
}
