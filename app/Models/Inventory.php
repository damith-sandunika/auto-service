<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToGarage;

class Inventory extends Model
{
    use BelongsToGarage;

    protected $fillable = ['garage_id', 'inventory_location_id', 'item_name', 'sku', 'quantity', 'price', 'min_stock_level'];

    public function garage()
    {
        return $this->belongsTo(Garage::class);
    }

    public function location()
    {
        return $this->belongsTo(InventoryLocation::class, 'inventory_location_id');
    }
}
