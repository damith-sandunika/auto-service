<?php

namespace App\Models;

use App\Traits\BelongsToGarage;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CashbookTransaction extends Model
{
    use HasFactory, BelongsToGarage;

    protected $fillable = [
        'garage_id',
        'bank_account_id',
        'type',
        'amount',
        'reference_type',
        'reference_id',
        'description',
        'date',
    ];

    public function garage()
    {
        return $this->belongsTo(Garage::class);
    }

    public function bankAccount()
    {
        return $this->belongsTo(BankAccount::class);
    }
}
