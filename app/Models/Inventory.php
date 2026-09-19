<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToGarage;

class Inventory extends Model
{
    use BelongsToGarage;

    protected $fillable = ['garage_id', 'item_name', 'sku', 'quantity', 'price', 'min_stock_level'];

    public function garage()
    {
        return $this->belongsTo(Garage::class);
    }
}
