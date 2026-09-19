<?php

namespace App\Models;

use App\Traits\BelongsToGarage;

use Illuminate\Database\Eloquent\Model;

class ServiceReminder extends Model
{
    use BelongsToGarage;
    protected $fillable = [
        'garage_id', 'vehicle_id', 'service_type', 'due_date', 'status', 'notes'
    ];

    public function garage()
    {
        return $this->belongsTo(Garage::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
