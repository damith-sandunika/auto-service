<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeletedOrder extends Model
{
    protected $fillable = [
        'garage_id',
        'invoice_number',
        'customer_name',
        'vehicle_number',
        'total_amount',
        'deleted_by',
        'deleted_by_name',
    ];

    public function garage()
    {
        return $this->belongsTo(Garage::class);
    }
}
