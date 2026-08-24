<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StaffProfile extends Model
{
    protected $fillable = [
        'user_id', 'basic_salary', 'ot_rate_per_hour', 'commission_rate',
        'casual_leaves_allowed', 'medical_leaves_allowed', 'vacation_leaves_allowed'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
