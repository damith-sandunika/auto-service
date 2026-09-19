<?php

namespace App\Models;

use App\Traits\BelongsToGarage;

use Illuminate\Database\Eloquent\Model;

class ServiceCatalog extends Model
{
    use BelongsToGarage;
    protected $fillable = ['garage_id', 'service_name', 'description', 'default_price'];

    public function garage()
    {
        return $this->belongsTo(Garage::class);
    }
}
