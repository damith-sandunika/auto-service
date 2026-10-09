<?php

namespace App\Models;

use App\Traits\BelongsToGarage;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'garage_id',
        'phone',
    ];

    public function garage()
    {
        return $this->belongsTo(Garage::class);
    }

    public function vehicleOwners()
    {
        return $this->hasMany(VehicleOwner::class, 'customer_id');
    }

    public function jobs()
    {
        return $this->hasMany(Job::class, 'assigned_mechanic_id');
    }

    public function staffProfile()
    {
        return $this->hasOne(StaffProfile::class);
    }

    public function attendances()
    {
        return $this->hasMany(StaffAttendance::class);
    }

    public function payrolls()
    {
        return $this->hasMany(Payroll::class);
    }

    public function salaryAdvances()
    {
        return $this->hasMany(SalaryAdvance::class);
    }

    public function tenantRoles()
    {
        return $this->belongsToMany(TenantRole::class, 'tenant_user_roles', 'user_id', 'role_id')->withTimestamps();
    }

    public function tenantGarages()
    {
        return $this->belongsToMany(Garage::class, 'tenant_user_garages', 'user_id', 'garage_id')->withTimestamps();
    }

    public function hasPermissionTo(string $module, string $action): bool
    {
        if ($this->role === 'company_owner' || $this->role === 'saas_admin') {
            return true; // Super users
        }

        foreach ($this->tenantRoles as $role) {
            $permissions = $role->permissions ?? [];
            if (isset($permissions[$module]) && in_array($action, $permissions[$module])) {
                return true;
            }
        }
        return false;
    }

    public function hasGarageAccess($garageId): bool
    {
        if ($this->role === 'company_owner' || $this->role === 'saas_admin') {
            return true;
        }

        // Is it their primary garage?
        if ($this->garage_id == $garageId) {
            return true;
        }

        // Or are they explicitly assigned to it?
        return $this->tenantGarages()->where('garage_id', $garageId)->exists();
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
