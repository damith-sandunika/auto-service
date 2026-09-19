<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;

class GarageScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model)
    {
        if (Auth::hasUser() && Auth::user()->role !== 'super_admin' && Auth::user()->garage_id) {
            $builder->where($model->getTable() . '.garage_id', Auth::user()->garage_id);
        }
    }
}
