<?php

namespace App\Models;

use App\Traits\BelongsToGarage;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inspection extends Model
{
    use HasFactory, BelongsToGarage;

    protected $fillable = [
        'garage_id',
        'vehicle_id',
        'inspector_id',
        'inspection_date',
        'status',
        'notes',
    ];

    public function garage()
    {
        return $this->belongsTo(Garage::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function inspector()
    {
        return $this->belongsTo(User::class, 'inspector_id');
    }

    public function items()
    {
        return $this->hasMany(InspectionItem::class);
    }
}
