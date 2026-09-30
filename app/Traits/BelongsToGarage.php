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

        static::creating(function ($model) {
            if (\Illuminate\Support\Facades\Auth::hasUser() && \Illuminate\Support\Facades\Auth::user()->garage_id) {
                $model->garage_id = \Illuminate\Support\Facades\Auth::user()->garage_id;
            }
        });
    }
}
