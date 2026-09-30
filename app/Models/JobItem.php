<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobItem extends Model
{
    protected $fillable = ['job_id', 'item_type', 'description', 'quantity', 'price', 'cost_price', 'payment_method', 'is_paid'];
    public function job()
    {
        return $this->belongsTo(Job::class, 'job_id');
    }
}
