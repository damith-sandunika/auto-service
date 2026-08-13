<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceCatalog extends Model
{
    protected $fillable = ['garage_id', 'service_name', 'description', 'default_price'];

    public function garage()
    {
        return $this->belongsTo(Garage::class);
    }
}
