<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    protected $fillable = ['vehicle_number', 'make', 'model', 'year', 'owner_id', 'garage_id'];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function owners()
    {
        return $this->hasMany(VehicleOwner::class);
    }

    public function jobs()
    {
        return $this->hasMany(Job::class);
    }
}
