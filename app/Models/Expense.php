<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
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
