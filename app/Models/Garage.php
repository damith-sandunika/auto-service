<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Garage extends Model
{
    use SoftDeletes;
    //
    protected $fillable = ['branch_category_id', 'name', 'owner_id', 'address', 'phone', 'logo_path', 'subscription_status', 'tagline', 'logo_size'];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function jobs()
    {
        return $this->hasMany(Job::class);
    }

    public function category()
    {
        return $this->belongsTo(BranchCategory::class, 'branch_category_id');
    }
}
