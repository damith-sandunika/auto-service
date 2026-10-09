<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToGarage;

class StaffProfile extends Model
{
    use BelongsToGarage;
    protected $fillable = [
        'user_id', 'basic_salary', 'ot_rate_per_hour', 'commission_rate',
        'casual_leaves_allowed', 'medical_leaves_allowed', 'vacation_leaves_allowed',
        'nic', 'dob', 'address', 'emergency_contact', 'standard_working_hours'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
