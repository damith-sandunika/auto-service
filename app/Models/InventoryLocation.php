<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class InventoryLocation extends Model
{
    use BelongsToTenant;

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
