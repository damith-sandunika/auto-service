<?php

namespace App\Models;

use App\Traits\BelongsToGarage;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BankAccount extends Model
{
    use HasFactory, BelongsToGarage;

    protected $fillable = [
        'garage_id',
        'bank_name',
        'account_name',
        'account_number',
        'branch',
        'initial_balance',
        'current_balance',
        'is_active',
    ];

    public function garage()
    {
        return $this->belongsTo(Garage::class);
    }

    public function transactions()
    {
        return $this->hasMany(CashbookTransaction::class);
    }
}
