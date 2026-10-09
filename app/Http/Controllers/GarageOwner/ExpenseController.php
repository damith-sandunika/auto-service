<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Traits\JobAccessTrait;

class ExpenseController extends Controller
{
    use JobAccessTrait;
    public function index(Request $request)
    {
        $garage_id = $this->getGarageId($request);
        $expenses = Expense::where('garage_id', $garage_id)->orderBy('expense_date', 'desc')->paginate(15);

        return Inertia::render('GarageOwner/Expenses', [
            'expenses' => $expenses
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'category' => 'required|string',
            'amount' => 'required|numeric',
            'expense_date' => 'required|date',
            'description' => 'nullable|string',
        ]);

        $garageId = $this->getGarageId($request);

        \Illuminate\Support\Facades\DB::transaction(function () use ($request, $garageId) {
            $expense = Expense::create(array_merge($request->all(), ['garage_id' => $garageId]));
            
            \App\Models\CashbookTransaction::create([
                'garage_id' => $garageId,
                'bank_account_id' => null,
                'type' => 'out',
                'amount' => $expense->amount,
                'reference_type' => 'expense',
                'reference_id' => $expense->id,
                'description' => 'Expense: ' . $expense->category . ($expense->description ? ' - ' . $expense->description : ''),
                'date' => $expense->expense_date,
            ]);
        });

        return redirect()->back();
    }
}
