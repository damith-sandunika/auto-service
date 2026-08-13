<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    protected $fillable = ['garage_id', 'job_id', 'total_amount', 'status'];

    public function job()
    {
        return $this->belongsTo(Job::class, 'job_id');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function garage()
    {
        return $this->belongsTo(Garage::class);
    }
}
