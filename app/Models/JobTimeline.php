<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobTimeline extends Model
{
    use HasFactory;

    protected $fillable = [
        'garage_id',
        'job_id',
        'user_id',
        'action',
        'description',
        'metadata'
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
