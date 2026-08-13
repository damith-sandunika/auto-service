<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Garage extends Model
{
    //
    protected $fillable = ['name', 'owner_id', 'address', 'phone', 'logo_path', 'subscription_status', 'tagline', 'logo_size'];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function jobs()
    {
        return $this->hasMany(Job::class);
    }
}
