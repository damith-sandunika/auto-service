<?php

namespace App\Actions\Dashboard;

use App\Models\RegisterSession;
use App\Models\Payment;
use App\Models\Expense;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class ManageShiftAction
{
    public function openShift(array $validated, $garage)
    {
        $existing = RegisterSession::where('garage_id', $garage->id)
            ->where('status', 'open')
            ->first();

        if ($existing) {
            throw new \Exception('Branch is already open.');
        }

        $now = now();

        return DB::transaction(function () use ($garage, $validated, $now) {
            $session = RegisterSession::create([
                'garage_id'    => $garage->id,
                'user_id'      => Auth::id(),
                'opening_cash' => $validated['opening_cash'],
                'opened_at'    => $now,
                'status'       => 'open',
            ]);

            if (isset($validated['attendance'])) {
                foreach ($validated['attendance'] as $att) {
                    \App\Models\StaffAttendance::updateOrCreate(
                        [
                            'user_id' => $att['user_id'],
                            'date' => $now->toDateString(),
                        ],
                        [
                            'status' => $att['status'],
                            'arrival_time' => $att['status'] === 'present' || $att['status'] === 'half_day' ? $now->toTimeString() : null,
                            'ot_hours' => 0
                        ]
                    );
                }
            }

            return $session;
        });
    }

    public function closeShift($garage)
    {
        $session = RegisterSession::where('garage_id', $garage->id)
            ->where('status', 'open')
            ->first();

        if (!$session) {
            throw new \Exception('No active branch shift found.');
        }

        // Calculate closing balance
        $cashSales = Payment::whereHas('invoice', function($q) use ($garage) {
                $q->where('garage_id', $garage->id);
            })
            ->where('payment_method', 'cash')
            ->where('created_at', '>=', $session->opened_at)
            ->sum('amount');

        $expensesLogged = Expense::where('garage_id', $garage->id)
            ->where('created_at', '>=', $session->opened_at)
            ->sum('amount');

        $finalCash = $session->opening_cash + $cashSales - $expensesLogged;

        return DB::transaction(function () use ($session, $finalCash, $garage) {
            $session->update([
                'closing_cash' => $finalCash,
                'closed_at' => now(),
                'status' => 'closed',
                'closed_by' => Auth::id(),
            ]);

            // Mark all active staff as OFF
            \App\Models\StaffAttendance::whereDate('date', now()->toDateString())
                ->whereHas('user', function($q) use ($garage) {
                    $q->where('garage_id', $garage->id);
                })
                ->whereNotNull('arrival_time')
                ->whereNull('departure_time')
                ->update([
                    'departure_time' => now()->toTimeString()
                ]);

            return $session;
        });
    }
}
