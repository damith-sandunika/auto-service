<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use App\Models\VehicleOwner;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class GlobalVehicleController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->get('q');
        if (!$query) return response()->json([]);

        $vehicles = Vehicle::where('vehicle_number', 'LIKE', "%{$query}%")
            ->with('owner')
            ->limit(10)
            ->get();
            
        return response()->json($vehicles);
    }

    public function show(Request $request, Vehicle $vehicle)
    {
        $vehicle->load('owner');

        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $query = $vehicle->jobs()->where('status', 'completed');
        
        if ($startDate) {
            $query->whereDate('created_at', '>=', $startDate);
        }
        if ($endDate) {
            $query->whereDate('created_at', '<=', $endDate);
        }

        $paginatedJobs = $query->with(['items' => function($q) {
                $q->select('id', 'job_id', 'item_type', 'description', 'quantity'); 
            }])
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        $jobs = $paginatedJobs->through(function ($job) {
            return [
                'id' => $job->id,
                'date' => $job->created_at->format('Y-m-d'),
                'time' => $job->created_at->format('H:i A'),
                'description' => $job->description,
                'mileage' => $job->mileage ?? 'N/A',
                'items' => $job->items->map(function($item) {
                    return [
                        'type' => $item->item_type,
                        'description' => $item->description,
                        'quantity' => $item->quantity
                    ];
                })
            ];
        });

        $ownersHistory = $vehicle->owners()->with('customer')->orderBy('created_at', 'desc')->get();
        $myCustomers = User::where('garage_id', Auth::user()->garage_id)->where('role', 'vehicle_owner')->get();

        return Inertia::render('GarageOwner/Vehicles/GlobalProfile', [
            'vehicle' => $vehicle,
            'history' => $jobs,
            'ownersHistory' => $ownersHistory,
            'myCustomers' => $myCustomers,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]
        ]);
    }

    public function printReport(Request $request, Vehicle $vehicle)
    {
        $vehicle->load('owner');

        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $query = $vehicle->jobs()->where('status', 'completed');
        
        if ($startDate) {
            $query->whereDate('created_at', '>=', $startDate);
        }
        if ($endDate) {
            $query->whereDate('created_at', '<=', $endDate);
        }

        $jobs = $query->with(['items' => function($q) {
                $q->select('id', 'job_id', 'item_type', 'description', 'quantity'); 
            }])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($job) {
                return [
                    'id' => $job->id,
                    'date' => $job->created_at->format('Y-m-d'),
                    'time' => $job->created_at->format('H:i A'),
                    'description' => $job->description,
                    'mileage' => $job->mileage ?? 'N/A',
                    'items' => $job->items->map(function($item) {
                        return [
                            'type' => $item->item_type,
                            'description' => $item->description,
                            'quantity' => $item->quantity
                        ];
                    })
                ];
            });

        return Inertia::render('GarageOwner/Vehicles/PrintReport', [
            'vehicle' => $vehicle,
            'history' => $jobs,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'garage' => Auth::user()->garage // Assuming garage relation exists for report header
        ]);
    }

    public function updateOwner(Request $request, Vehicle $vehicle)
    {
        $request->validate([
            'customer_id' => 'required|exists:users,id'
        ]);

        DB::beginTransaction();
        try {
            // Mark old owner as not current
            VehicleOwner::where('vehicle_id', $vehicle->id)->where('is_current', true)->update([
                'is_current' => false,
                'end_date' => now()
            ]);

            // Add new owner history
            VehicleOwner::create([
                'vehicle_id' => $vehicle->id,
                'customer_id' => $request->customer_id,
                'garage_id' => Auth::user()->garage_id,
                'is_current' => true,
                'start_date' => now()
            ]);

            // Update main vehicle table
            $vehicle->update(['owner_id' => $request->customer_id]);

            DB::commit();
            return back()->with('success', 'Vehicle owner updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to update owner.']);
        }
    }
}
