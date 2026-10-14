<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Traits\BelongsToGarage;

class JobPayment extends Model
{
    use BelongsToGarage;
    
    protected $fillable = [
        'garage_id',
        'job_id',
        'amount',
        'payment_method',
        'created_by',
        'created_by_name',
        'edited_by',
        'edited_by_name',
        'edited_at',
        'is_void',
        'voided_by',
        'voided_by_name',
        'voided_at',
        'void_reason',
    ];

    protected $casts = [
        'is_void' => 'boolean',
        'edited_at' => 'datetime',
        'voided_at' => 'datetime',
        'amount' => 'decimal:2',
    ];

    public function job()
    {
        return $this->belongsTo(Job::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function editor()
    {
        return $this->belongsTo(User::class, 'edited_by');
    }

    public function voider()
    {
        return $this->belongsTo(User::class, 'voided_by');
    }
}
