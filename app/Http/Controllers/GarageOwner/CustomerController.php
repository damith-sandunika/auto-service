<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index()
    {
        $customers = User::where('role', 'customer')
            ->orWhereNull('role')
            ->withCount('vehicles')
            ->get();

        return Inertia::render('GarageOwner/Customers/Index', [
            'customers' => $customers
        ]);
    }

    public function show($id)
    {
        $customer = User::with(['vehicles.jobs.mechanic', 'vehicles.jobs.items'])->findOrFail($id);
        
        return Inertia::render('GarageOwner/Customers/Show', [
            'customer' => $customer
        ]);
    }
}
