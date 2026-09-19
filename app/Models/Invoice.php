<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\BelongsToGarage;

class Invoice extends Model
{
    use HasFactory, BelongsToGarage;

    protected $fillable = ['garage_id', 'job_id', 'invoice_number', 'total_amount', 'status'];

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
