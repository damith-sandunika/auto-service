<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Job extends Model
{
    //
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
}
