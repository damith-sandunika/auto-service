<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use App\Models\CashbookTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Traits\JobAccessTrait;

class FinanceController extends Controller
{
    use JobAccessTrait;
    public function index(Request $request)
    {
        $garageId = $this->getGarageId($request);

        $bankAccounts = BankAccount::where('garage_id', $garageId)->get();
        
        $query = CashbookTransaction::where('garage_id', $garageId)
            ->with(['bankAccount']);

        // Filter by date range if provided
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        }

        // Filter by bank account or cash
        if ($request->has('account_id')) {
            if ($request->account_id === 'cash') {
                $query->whereNull('bank_account_id');
            } else {
                $query->where('bank_account_id', $request->account_id);
            }
        }

        $transactions = $query->orderBy('date', 'desc')
            ->orderBy('id', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Calculate Totals
        $totalIn = CashbookTransaction::where('garage_id', $garageId)->where('type', 'in')->sum('amount');
        $totalOut = CashbookTransaction::where('garage_id', $garageId)->where('type', 'out')->sum('amount');
        $cashInHand = $totalIn - $totalOut; // This is a simplified calculation

        return Inertia::render('GarageOwner/Finance/Index', [
            'bankAccounts' => $bankAccounts,
            'transactions' => $transactions,
            'filters' => $request->only(['start_date', 'end_date', 'account_id']),
            'summary' => [
                'total_in' => $totalIn,
                'total_out' => $totalOut,
                'balance' => $cashInHand
            ]
        ]);
    }

    public function storeBankAccount(Request $request)
    {
        $request->validate([
            'bank_name' => 'required|string|max:255',
            'account_name' => 'required|string|max:255',
            'account_number' => 'required|string|max:255',
            'branch' => 'nullable|string|max:255',
            'initial_balance' => 'required|numeric|min:0',
        ]);

        $garageId = $this->getGarageId($request);

        DB::beginTransaction();

        try {
            $bankAccount = BankAccount::create([
                'garage_id' => $garageId,
                'bank_name' => $request->bank_name,
                'account_name' => $request->account_name,
                'account_number' => $request->account_number,
                'branch' => $request->branch,
                'initial_balance' => $request->initial_balance,
                'current_balance' => $request->initial_balance,
                'is_active' => true,
            ]);

            // Create initial transaction if balance > 0
            if ($request->initial_balance > 0) {
                CashbookTransaction::create([
                    'garage_id' => $garageId,
                    'bank_account_id' => $bankAccount->id,
                    'type' => 'in',
                    'amount' => $request->initial_balance,
                    'reference_type' => 'manual',
                    'description' => 'Initial Account Balance',
                    'date' => now()->toDateString(),
                ]);
            }

            DB::commit();
            return back()->with('success', 'Bank Account added successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to add bank account: ' . $e->getMessage()]);
        }
    }

    public function storeTransaction(Request $request)
    {
        $request->validate([
            'bank_account_id' => 'nullable|exists:bank_accounts,id',
            'type' => 'required|in:in,out',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'required|string',
            'date' => 'required|date',
        ]);

        $garageId = $this->getGarageId($request);

        DB::beginTransaction();

        try {
            CashbookTransaction::create([
                'garage_id' => $garageId,
                'bank_account_id' => $request->bank_account_id,
                'type' => $request->type,
                'amount' => $request->amount,
                'reference_type' => 'manual',
                'description' => $request->description,
                'date' => $request->date,
            ]);

            // Update Bank Balance if a bank account is selected
            if ($request->bank_account_id) {
                $bank = BankAccount::findOrFail($request->bank_account_id);
                $this->checkGarageAccess($bank->garage_id);
                if ($request->type === 'in') {
                    $bank->current_balance += $request->amount;
                } else {
                    $bank->current_balance -= $request->amount;
                }
                $bank->save();
            }

            DB::commit();
            return back()->with('success', 'Transaction recorded successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to record transaction: ' . $e->getMessage()]);
        }
    }
}
