<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\ServiceReminder;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use App\Traits\JobAccessTrait;

class ServiceReminderController extends Controller
{
    use JobAccessTrait;
    public function index(Request $request)
    {
        $garageId = $this->getGarageId($request);

        $query = ServiceReminder::where('garage_id', $garageId)
            ->with(['vehicle', 'owner']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $reminders = $query->orderBy('due_date', 'asc')->paginate(15)->withQueryString();

        return Inertia::render('GarageOwner/Marketing/Reminders', [
            'reminders' => $reminders,
            'filters'   => $request->only('status'),
        ]);
    }

    public function store(Request $request)
    {
        $garageId = $this->getGarageId($request);
        
        $validated = $request->validate([
            'vehicle_id' => 'required|exists:mysql.vehicles,id',
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
        $garageId = $this->getGarageId($request);
        
        $reminder = ServiceReminder::findOrFail($id);
        $this->checkGarageAccess($reminder->garage_id);

        $validated = $request->validate([
            'status' => 'required|in:pending,notified,completed,cancelled',
            'notes' => 'nullable|string'
        ]);

        $reminder->update($validated);

        return redirect()->back()->with('success', 'Service reminder updated.');
    }
}
