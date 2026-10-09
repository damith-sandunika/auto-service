<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TenantRole extends Model
{
    protected $fillable = [
        'name',
        'permissions',
        'is_system',
    ];

    protected $casts = [
        'permissions' => 'array',
        'is_system' => 'boolean',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'tenant_user_roles', 'role_id', 'user_id')->withTimestamps();
    }
}
