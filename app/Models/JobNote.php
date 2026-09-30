<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Traits\BelongsToGarage;

class JobNote extends Model
{
    use BelongsToGarage;

    protected $fillable = ['garage_id', 'job_id', 'user_id', 'title', 'content', 'color', 'is_important'];

    public function job()
    {
        return $this->belongsTo(Job::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
