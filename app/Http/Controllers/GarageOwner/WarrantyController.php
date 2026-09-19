<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use App\Models\Warranty;
use App\Models\Vehicle;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class WarrantyController extends Controller
{
    public function index()
    {
        $garageId = Auth::user()->garage_id;

        $warranties = Warranty::where('garage_id', $garageId)
            ->with(['vehicle', 'customer'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);
            
        $customers = User::where('garage_id', $garageId)
            ->where('role', 'vehicle_owner')
            ->get(['id', 'name']);
            
        $customerIds = $customers->pluck('id');
        $vehicles = Vehicle::whereIn('owner_id', $customerIds)->get(['id', 'owner_id', 'vehicle_number', 'make', 'model']);

        return Inertia::render('GarageOwner/Warranties/Index', [
            'warranties' => $warranties,
            'customers' => $customers,
            'vehicles' => $vehicles
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'vehicle_id' => 'required|exists:vehicles,id',
            'customer_id' => 'required|exists:users,id',
            'warranty_period' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date',
            'terms' => 'nullable|string',
        ]);

        Warranty::create([
            'garage_id' => Auth::user()->garage_id,
            'vehicle_id' => $request->vehicle_id,
            'customer_id' => $request->customer_id,
            'warranty_period' => $request->warranty_period,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'terms' => $request->terms,
            'status' => 'active',
        ]);

        return back()->with('success', 'Warranty added successfully.');
    }

    public function updateStatus(Request $request, Warranty $warranty)
    {
        if ($warranty->garage_id !== Auth::user()->garage_id) abort(403);

        $request->validate([
            'status' => 'required|in:active,expired,voided',
        ]);

        $warranty->update(['status' => $request->status]);

        return back()->with('success', 'Warranty status updated.');
    }

    public function destroy(Warranty $warranty)
    {
        if ($warranty->garage_id !== Auth::user()->garage_id) abort(403);
        $warranty->delete();
        return back()->with('success', 'Warranty deleted.');
    }
}
