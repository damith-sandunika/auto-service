<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class ExpenseController extends Controller
{
    public function index()
    {
        $garage_id = Auth::user()->garage_id;
        $expenses = Expense::where('garage_id', $garage_id)->orderBy('expense_date', 'desc')->get();

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

        $garageId = Auth::user()->garage_id;

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

        return redirect()->back();
    }
}
