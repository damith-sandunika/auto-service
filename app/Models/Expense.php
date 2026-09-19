<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToGarage;

class Expense extends Model
{
    use BelongsToGarage;

    protected $fillable = [
        'garage_id',
        'category',
        'amount',
        'expense_date',
        'description'
    ];

    public function garage()
    {
        return $this->belongsTo(Garage::class);
    }
}
