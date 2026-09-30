<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Traits\BelongsToGarage;

class JobPayment extends Model
{
    use BelongsToGarage;
    
    protected $fillable = ['garage_id', 'job_id', 'amount', 'payment_method'];

    public function job()
    {
        return $this->belongsTo(Job::class);
    }
}
