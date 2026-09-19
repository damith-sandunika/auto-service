<?php

namespace App\Services;

use App\Models\BranchSequence;
use Illuminate\Support\Facades\DB;

class SequenceGenerator
{
    /**
     * Get the next sequence number for a given branch and type, with DB row locking to prevent race conditions.
     */
    public static function getNextNumber($garageId, $type)
    {
        return DB::transaction(function () use ($garageId, $type) {
            // Ensure the record exists first
            BranchSequence::firstOrCreate(
                ['garage_id' => $garageId, 'type' => $type],
                ['last_number' => 0]
            );

            // Lock the row for update so concurrent requests wait here
            $sequence = BranchSequence::where('garage_id', $garageId)
                ->where('type', $type)
                ->lockForUpdate()
                ->first();

            // Increment
            $sequence->last_number += 1;
            $sequence->save();

            return $sequence->last_number;
        });
    }

    /**
     * Peek at the next sequence number without incrementing or locking (for UI display only).
     */
    public static function peekNextNumber($garageId, $type)
    {
        $sequence = BranchSequence::where('garage_id', $garageId)
            ->where('type', $type)
            ->first();

        return $sequence ? $sequence->last_number + 1 : 1;
    }
}
