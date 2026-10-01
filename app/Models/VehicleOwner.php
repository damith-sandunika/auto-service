<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VehicleOwner extends Model
{
    protected $fillable = [
        'vehicle_id',
        'customer_id',
        'garage_id',
        'is_current',
        'start_date',
        'end_date'
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }
}
