<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToGarage;

class Payroll extends Model
{
    use BelongsToGarage;
    protected $fillable = [
        'user_id', 'month', 'basic_pay', 'ot_pay', 'commission_pay',
        'deductions', 'net_pay', 'status'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
