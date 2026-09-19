<?php

namespace App\Traits;

use App\Models\Scopes\GarageScope;

trait BelongsToGarage
{
    /**
     * The "booted" method of the model.
     *
     * @return void
     */
    protected static function booted()
    {
        static::addGlobalScope(new GarageScope);
    }
}
