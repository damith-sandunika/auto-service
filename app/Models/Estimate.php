<?php

namespace App\Models;

use App\Traits\BelongsToGarage;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Estimate extends Model
{
    use HasFactory, BelongsToGarage;

    protected $fillable = [
        'garage_id',
        'customer_id',
        'vehicle_id',
        'estimate_number',
        'estimate_date',
        'expiry_date',
        'subtotal',
        'tax',
        'discount',
        'total',
        'status',
        'notes',
        'terms',
    ];

    public function garage()
    {
        return $this->belongsTo(Garage::class);
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function items()
    {
        return $this->hasMany(EstimateItem::class);
    }
}
