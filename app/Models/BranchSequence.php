<?php

namespace App\Models;

use App\Traits\BelongsToGarage;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BranchSequence extends Model
{
    use HasFactory, BelongsToGarage;

    protected $fillable = ['garage_id', 'type', 'last_number'];
}
