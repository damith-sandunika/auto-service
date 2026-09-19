<?php

namespace App\Models;

use App\Traits\BelongsToGarage;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RegisterSession extends Model
{
    use HasFactory, BelongsToGarage;

    protected $fillable = [
        'garage_id',
        'user_id',
        'opening_cash',
        'closing_cash',
        'opened_at',
        'closed_at',
        'status',
        'closed_by',
    ];

    protected $casts = [
        'opened_at' => 'datetime',
        'closed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function closedBy()
    {
        return $this->belongsTo(User::class, 'closed_by');
    }

    public function garage()
    {
        return $this->belongsTo(Garage::class);
    }
}
