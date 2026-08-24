<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    protected $fillable = ['garage_id', 'item_name', 'sku', 'quantity', 'price', 'min_stock_level'];

    public function garage()
    {
        return $this->belongsTo(Garage::class);
    }
}
