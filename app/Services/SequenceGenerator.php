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
            // For invoice, unify sequence across all branches within the tenant company
            if ($type === 'invoice') {
                $mainGarageId = \App\Models\Garage::orderBy('id', 'asc')->value('id') ?: $garageId;

                BranchSequence::firstOrCreate(
                    ['garage_id' => $mainGarageId, 'type' => 'company_invoice'],
                    ['last_number' => 0]
                );

                $sequence = BranchSequence::where('garage_id', $mainGarageId)
                    ->where('type', 'company_invoice')
                    ->lockForUpdate()
                    ->first();

                $maxInvoice = (int) DB::table('invoices')
                    ->whereRaw("invoice_number REGEXP '^[0-9]+$'")
                    ->max(DB::raw('CAST(invoice_number AS UNSIGNED)'));

                if ($sequence->last_number < $maxInvoice) {
                    $sequence->last_number = $maxInvoice;
                }

                $sequence->last_number += 1;
                $sequence->save();

                return $sequence->last_number;
            }

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
        if ($type === 'invoice') {
            $mainGarageId = \App\Models\Garage::orderBy('id', 'asc')->value('id') ?: $garageId;
            $sequence = BranchSequence::where('garage_id', $mainGarageId)
                ->where('type', 'company_invoice')
                ->first();

            $maxInvoice = (int) DB::table('invoices')
                ->whereRaw("invoice_number REGEXP '^[0-9]+$'")
                ->max(DB::raw('CAST(invoice_number AS UNSIGNED)'));

            $currentLast = max($sequence ? $sequence->last_number : 0, $maxInvoice);
            return $currentLast + 1;
        }

        $sequence = BranchSequence::where('garage_id', $garageId)
            ->where('type', $type)
            ->first();

        return $sequence ? $sequence->last_number + 1 : 1;
    }
}
