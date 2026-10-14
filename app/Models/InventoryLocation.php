<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToGarage;

class InventoryLocation extends Model
{
    use BelongsToGarage;

    protected $fillable = [
        'garage_id',
        'name',
        'description',
        'status',
    ];

    public function garage()
    {
        return $this->belongsTo(Garage::class);
    }

    public function inventories()
    {
        return $this->hasMany(Inventory::class);
    }
}
