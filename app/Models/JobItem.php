<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobItem extends Model
{
    protected $fillable = ['job_id', 'item_type', 'inventory_id', 'inventory_location_id', 'description', 'quantity', 'price', 'cost_price', 'payment_method', 'is_paid'];
    public function job()
    {
        return $this->belongsTo(Job::class, 'job_id');
    }

    public function inventory()
    {
        return $this->belongsTo(Inventory::class, 'inventory_id');
    }

    public function location()
    {
        return $this->belongsTo(InventoryLocation::class, 'inventory_location_id');
    }
}
