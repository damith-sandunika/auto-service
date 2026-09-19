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
    ];

    public function garage()
    {
        return $this->belongsTo(Garage::class);
    }

    public function vehicles()
    {
        return $this->hasMany(Vehicle::class, 'owner_id');
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
