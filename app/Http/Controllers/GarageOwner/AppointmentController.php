<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class AppointmentController extends Controller
{
    public function index()
    {
        $garageId = Auth::user()->garage_id;
        
        $appointments = Appointment::where('garage_id', $garageId)
            ->with(['customer', 'vehicle'])
            ->orderBy('appointment_date', 'asc')
            ->orderBy('appointment_time', 'asc')
            ->paginate(20);

        // Fetch customers for the dropdown
        $customers = User::where('garage_id', $garageId)
            ->where('role', 'vehicle_owner')
            ->get(['id', 'name', 'email']);

        return Inertia::render('GarageOwner/Appointments/Index', [
            'appointments' => $appointments,
        ]);
    }

    public function create()
    {
        $garageId = Auth::user()->garage_id;
        $customers = User::where('garage_id', $garageId)
            ->where('role', 'vehicle_owner')
            ->get(['id', 'name', 'email']);

        $customerIds = $customers->pluck('id');
        $vehicles = Vehicle::whereIn('owner_id', $customerIds)->get(['id', 'owner_id', 'vehicle_number', 'make', 'model']);

        return Inertia::render('GarageOwner/Appointments/Create', [
            'customers' => $customers,
            'vehicles' => $vehicles
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'customer_id' => 'required|exists:users,id',
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'appointment_date' => 'required|date',
            'appointment_time' => 'required',
            'status' => 'required|in:pending,confirmed,completed,cancelled',
            'notes' => 'nullable|string',
        ]);

        Appointment::create([
            'garage_id' => Auth::user()->garage_id,
            'customer_id' => $request->customer_id,
            'vehicle_id' => $request->vehicle_id,
            'appointment_date' => $request->appointment_date,
            'appointment_time' => $request->appointment_time,
            'status' => $request->status,
            'notes' => $request->notes,
        ]);

        return redirect()->route('owner.appointments.index')->with('success', 'Appointment scheduled successfully.');
    }

    public function update(Request $request, Appointment $appointment)
    {
        if ($appointment->garage_id !== Auth::user()->garage_id) {
            abort(403);
        }

        $request->validate([
            'appointment_date' => 'required|date',
            'appointment_time' => 'required',
            'status' => 'required|in:pending,confirmed,completed,cancelled',
            'notes' => 'nullable|string',
        ]);

        $appointment->update([
            'appointment_date' => $request->appointment_date,
            'appointment_time' => $request->appointment_time,
            'status' => $request->status,
            'notes' => $request->notes,
        ]);

        return redirect()->back()->with('success', 'Appointment updated successfully.');
    }

    public function destroy(Appointment $appointment)
    {
        if ($appointment->garage_id !== Auth::user()->garage_id) {
            abort(403);
        }

        $appointment->delete();

        return redirect()->back()->with('success', 'Appointment cancelled successfully.');
    }
}
