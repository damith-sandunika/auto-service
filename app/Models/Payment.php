<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToGarage;

class Payment extends Model
{
    use BelongsToGarage;
    protected $fillable = ['garage_id', 'invoice_id', 'amount', 'payment_method', 'payment_date'];

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }
}
