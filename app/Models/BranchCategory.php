<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BranchCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'is_active',
    ];

    public function garages()
    {
        return $this->hasMany(Garage::class);
    }

    public function serviceTemplates()
    {
        return $this->hasMany(ServiceTemplate::class);
    }
}
