<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GarageThermalSetting extends Model
{
    protected $fillable = [
        'garage_id', 'store_name', 'tagline', 'address', 'phone', 'email',
        'logo_path', 'logo_size', 'show_logo', 'paper_width', 'footer_message_1', 'footer_message_2'
    ];

    protected $casts = [
        'show_logo' => 'boolean',
    ];

    public function garage()
    {
        return $this->belongsTo(Garage::class);
    }
}
