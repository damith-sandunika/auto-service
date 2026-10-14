<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = User::where('role', 'vehicle_owner')
            ->orWhereNull('role');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $customers = $query->withCount('vehicles')->orderBy('id', 'desc')->paginate(15)->withQueryString();

        return Inertia::render('GarageOwner/Customers/Index', [
            'customers' => $customers,
            'filters'   => $request->only('search'),
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
