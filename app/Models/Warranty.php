<?php

namespace App\Models;

use App\Traits\BelongsToGarage;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Warranty extends Model
{
    use HasFactory, BelongsToGarage;

    protected $fillable = [
        'garage_id',
        'job_id',
        'vehicle_id',
        'customer_id',
        'warranty_period',
        'start_date',
        'end_date',
        'terms',
        'status',
    ];

    public function garage()
    {
        return $this->belongsTo(Garage::class);
    }

    public function job()
    {
        return $this->belongsTo(Job::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }
}
