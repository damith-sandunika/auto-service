<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    protected $connection = 'mysql';
    use HasFactory;

    protected $fillable = ['garage_id', 'plan', 'amount', 'status', 'expires_at'];

    protected $casts = [
        'expires_at' => 'date',
    ];

    public function garage()
    {
        return $this->belongsTo(Garage::class);
    }
}
