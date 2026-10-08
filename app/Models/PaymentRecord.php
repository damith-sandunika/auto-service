<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentRecord extends Model
{
    protected $connection = 'mysql';
    use HasFactory;

    protected $fillable = ['garage_id', 'amount', 'payment_date', 'receipt_url', 'status', 'notes'];

    protected $casts = [
        'payment_date' => 'date',
    ];

    public function garage()
    {
        return $this->belongsTo(Garage::class);
    }
}
