<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GarageInvoiceSetting extends Model
{
    protected $fillable = [
        'garage_id', 'business_name', 'address', 'phone', 'email', 'website', 
        'tax_number', 'logo_url', 'logo_path', 'logo_size', 'primary_color', 'secondary_color', 'text_color', 
        'heading_size', 'text_size', 'footer_text', 'terms_and_conditions',
        'paper_size'
    ];

    public function garage()
    {
        return $this->belongsTo(Garage::class);
    }
}
