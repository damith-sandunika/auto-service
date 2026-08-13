<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    public function index()
    {
        $garage_id = 1;
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

        Expense::create(array_merge($request->all(), ['garage_id' => 1]));
        return redirect()->back();
    }
}
