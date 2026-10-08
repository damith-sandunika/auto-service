<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VehicleModel extends Model
{
    protected $connection = 'mysql';
    use HasFactory;

    protected $fillable = ['make_id', 'name', 'type'];

    public function make()
    {
        return $this->belongsTo(VehicleMake::class, 'make_id');
    }
}
