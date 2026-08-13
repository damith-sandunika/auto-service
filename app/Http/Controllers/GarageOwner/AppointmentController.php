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
        // Assuming the Garage Owner has a garage relation or is determined somehow.
        // For simplicity, we just fetch appointments for the first garage or all, depending on implementation
        // Normally: $garage_id = Auth::user()->garage_id;
        $garage_id = 1; // Default fallback for now since we don't have the exact user->garage link visible in snippet

        $appointments = Appointment::with(['customer', 'vehicle'])
            ->where('garage_id', $garage_id)
            ->orderBy('appointment_date')
            ->orderBy('appointment_time')
            ->get();

        $customers = User::all();
        $vehicles = Vehicle::all();

        return Inertia::render('GarageOwner/Appointments', [
            'appointments' => $appointments,
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
            'status' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        $garage_id = 1; // Default fallback

        Appointment::create(array_merge($request->all(), ['garage_id' => $garage_id]));

        return redirect()->back();
    }

    public function update(Request $request, Appointment $appointment)
    {
        $request->validate([
            'customer_id' => 'required|exists:users,id',
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'appointment_date' => 'required|date',
            'appointment_time' => 'required',
            'status' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        $appointment->update($request->all());

        return redirect()->back();
    }

    public function destroy(Appointment $appointment)
    {
        $appointment->delete();
        return redirect()->back();
    }
}
