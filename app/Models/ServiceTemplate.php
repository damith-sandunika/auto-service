<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'branch_category_id',
        'service_name',
        'default_price',
        'estimated_time_minutes',
        'is_active',
    ];

    public function category()
    {
        return $this->belongsTo(BranchCategory::class, 'branch_category_id');
    }
}
