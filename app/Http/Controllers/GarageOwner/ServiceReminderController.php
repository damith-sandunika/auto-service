<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\ServiceReminder;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class ServiceReminderController extends Controller
{
    public function index()
    {
        $garageId = Auth::user()->garage_id;

        $reminders = ServiceReminder::where('garage_id', $garageId)
            ->with(['vehicle.owner']) // assuming vehicle belongsTo owner
            ->orderBy('due_date', 'asc')
            ->get();

        return Inertia::render('GarageOwner/Marketing/Reminders', [
            'reminders' => $reminders
        ]);
    }

    public function store(Request $request)
    {
        $garageId = Auth::user()->garage_id;
        
        $validated = $request->validate([
            'vehicle_id' => 'required|exists:vehicles,id',
            'service_type' => 'required|string',
            'due_date' => 'required|date',
            'notes' => 'nullable|string'
        ]);

        $validated['garage_id'] = $garageId;
        $validated['status'] = 'pending';

        ServiceReminder::create($validated);

        return redirect()->back()->with('success', 'Service reminder added.');
    }

    public function update(Request $request, $id)
    {
        $garageId = Auth::user()->garage_id;
        
        $reminder = ServiceReminder::where('garage_id', $garageId)->findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:pending,notified,completed,cancelled',
            'notes' => 'nullable|string'
        ]);

        $reminder->update($validated);

        return redirect()->back()->with('success', 'Service reminder updated.');
    }
}
