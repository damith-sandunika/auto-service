<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Traits\JobAccessTrait;

class AppointmentController extends Controller
{
    use JobAccessTrait;
    public function index(Request $request)
    {
        $garageId = $this->getGarageId($request);
        
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

    public function create(Request $request)
    {
        $garageId = $this->getGarageId($request);
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
            'vehicle_id' => 'nullable|exists:mysql.vehicles,id',
            'appointment_date' => 'required|date',
            'appointment_time' => 'required',
            'status' => 'required|in:pending,confirmed,completed,cancelled',
            'notes' => 'nullable|string',
        ]);

        Appointment::create([
            'garage_id' => $this->getGarageId($request),
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
        $this->checkGarageAccess($appointment->garage_id);

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
        $this->checkGarageAccess($appointment->garage_id);

        $appointment->delete();

        return redirect()->back()->with('success', 'Appointment cancelled successfully.');
    }
}
