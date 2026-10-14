<?php

namespace App\Models;

use App\Models\Garage;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class JobMedia extends Model
{
    use HasFactory;

    protected $fillable = [
        'garage_id',
        'job_id',
        'file_path',
        'file_type',
    ];

    public function garage(): BelongsTo
    {
        return $this->belongsTo(Garage::class);
    }

    public function job(): BelongsTo
    {
        return $this->belongsTo(Job::class);
    }
    
    public function getFileUrlAttribute()
    {
        if (empty($this->file_path)) {
            return null;
        }
        $clean = preg_replace('#^/?storage/#', '', $this->file_path);
        $clean = preg_replace('#^public/#', '', $clean);
        $clean = preg_replace('#^/?tenant-media/#', '', $clean);
        return '/tenant-media/' . ltrim($clean, '/');
    }
}
