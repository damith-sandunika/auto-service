<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StaffAttendance extends Model
{
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
