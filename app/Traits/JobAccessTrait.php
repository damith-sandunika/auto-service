<?php

namespace App\Traits;

use Illuminate\Support\Facades\Auth;

trait JobAccessTrait
{
    /**
     * Check if the currently authenticated user has access to a specific garage.
     * Throws a 403 Forbidden exception if they do not.
     *
     * @param int $garageId The ID of the garage to check access against
     */
    protected function checkGarageAccess($garageId)
    {
        $user = Auth::user();
        if ($user->role === 'company_owner') {
            $ownsGarage = \App\Models\Garage::where('id', $garageId)->where('owner_id', $user->id)->exists();
            if (!$ownsGarage) abort(403);
        } else {
            if ($garageId !== $user->garage_id) abort(403);
        }
    }

    /**
     * Get the resolved garage ID for the current user/request.
     */
    protected function getGarageId(\Illuminate\Http\Request $request)
    {
        $user = Auth::user();
        $garageId = $user->garage_id;

        if ($user->role === 'company_owner') {
            if ($request->has('branch_id')) {
                $garageId = $request->query('branch_id');
            } else if ($request->has('garage_id')) {
                $garageId = $request->input('garage_id');
            } else {
                $garageId = \App\Models\Garage::where('owner_id', $user->id)->value('id');
            }
        }

        return $garageId;
    }
}
