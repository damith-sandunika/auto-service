<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToGarage;

class StaffAttendance extends Model
{
    use BelongsToGarage;
    protected $fillable = [
        'user_id',
        'date',
        'status',
        'arrival_time',
        'departure_time',
        'ot_hours',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
