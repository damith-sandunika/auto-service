<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    protected $connection = 'mysql'; // Explicitly central

    protected $fillable = ['vehicle_number', 'make', 'model', 'year'];

    public function owners()
    {
        return $this->hasMany(VehicleOwner::class);
    }


    public function jobs()
    {
        return $this->hasMany(Job::class);
    }
}
