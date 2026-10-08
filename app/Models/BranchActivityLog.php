<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BranchActivityLog extends Model
{
    use HasFactory;

    protected $fillable = ['garage_id', 'user_id', 'action', 'description', 'ip_address'];

    public function garage()
    {
        return $this->belongsTo(Garage::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
