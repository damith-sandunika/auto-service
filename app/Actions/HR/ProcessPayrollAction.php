<?php

namespace App\Actions\HR;

use App\Models\User;
use App\Models\Payroll;
use App\Models\Expense;
use Illuminate\Support\Facades\DB;

class ProcessPayrollAction
{
    public function execute(User $staffUser, array $validated, $garageId)
    {
        return DB::transaction(function () use ($validated, $garageId, $staffUser) {
            $payroll = Payroll::create([
                'user_id' => $staffUser->id,
                'month' => $validated['month'],
                'basic_pay' => $validated['basic_pay'],
                'ot_pay' => $validated['ot_pay'],
                'commission_pay' => $validated['commission_pay'],
                'deductions' => $validated['deductions'],
                'net_pay' => $validated['net_pay'],
                'status' => 'paid',
            ]);

            // Create an Expense record for the garage
            $expense = Expense::create([
                'garage_id' => $garageId,
                'category' => 'Salary/Wages',
                'amount' => $validated['net_pay'],
                'expense_date' => now(),
                'description' => "Payroll for {$staffUser->name} - {$validated['month']}"
            ]);

            \App\Models\CashbookTransaction::create([
                'garage_id' => $garageId,
                'bank_account_id' => null,
                'type' => 'out',
                'amount' => $validated['net_pay'],
                'reference_type' => 'expense',
                'reference_id' => $expense->id,
                'description' => $expense->description,
                'date' => now()->toDateString(),
            ]);

            // Mark all pending advances as settled
            $staffUser->salaryAdvances()->where('status', 'pending')->update([
                'status' => 'settled'
            ]);

            return $payroll;
        });
    }
}
