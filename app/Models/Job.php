<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToGarage;

class Job extends Model
{
    use BelongsToGarage;

    protected $table = 'service_jobs';

    protected $fillable = ['garage_id', 'vehicle_id', 'assigned_mechanic_id', 'status', 'description', 'total_cost'];

    public function garage()
    {
        return $this->belongsTo(Garage::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function mechanic()
    {
        return $this->belongsTo(User::class, 'assigned_mechanic_id');
    }

    public function items()
    {
        return $this->hasMany(JobItem::class);
    }

    public function invoice()
    {
        return $this->hasOne(Invoice::class);
    }
}
