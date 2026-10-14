<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use App\Models\Inspection;
use App\Models\InspectionItem;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Traits\JobAccessTrait;

class InspectionController extends Controller
{
    use JobAccessTrait;
    public function index(Request $request)
    {
        $garageId = $this->getGarageId($request);

        $inspections = Inspection::where('garage_id', $garageId)
            ->with(['vehicle', 'inspector'])
            ->orderBy('inspection_date', 'desc')
            ->paginate(15);

        return Inertia::render('GarageOwner/Inspections/Index', [
            'inspections' => $inspections,
        ]);
    }

    public function create(Request $request)
    {
        $garageId = $this->getGarageId($request);
        $customerIds = \App\Models\User::where('garage_id', $garageId)->pluck('id');
        $vehicles = Vehicle::whereIn('owner_id', $customerIds)->get(['id', 'owner_id', 'vehicle_number', 'make', 'model']);

        return Inertia::render('GarageOwner/Inspections/Create', [
            'vehicles' => $vehicles,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'vehicle_id' => 'required|exists:mysql.vehicles,id',
            'inspection_date' => 'required|date',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.category' => 'required|string',
            'items.*.item_name' => 'required|string',
            'items.*.condition' => 'required|in:good,replace,repair,monitor',
            'items.*.remarks' => 'nullable|string',
        ]);

        DB::beginTransaction();

        try {
            $inspection = Inspection::create([
                'garage_id' => $this->getGarageId($request),
                'vehicle_id' => $request->vehicle_id,
                'inspector_id' => Auth::id(),
                'inspection_date' => $request->inspection_date,
                'status' => 'completed',
                'notes' => $request->notes,
            ]);

            foreach ($request->items as $item) {
                InspectionItem::create([
                    'inspection_id' => $inspection->id,
                    'category' => $item['category'],
                    'item_name' => $item['item_name'],
                    'condition' => $item['condition'],
                    'remarks' => $item['remarks'] ?? null,
                ]);
            }

            DB::commit();
            return redirect()->route('owner.inspections.index')->with('success', 'Inspection recorded successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to record inspection.']);
        }
    }

    public function show(Inspection $inspection)
    {
        $this->checkGarageAccess($inspection->garage_id);
        
        $inspection->load(['vehicle', 'inspector', 'items']);
        
        return Inertia::render('GarageOwner/Inspections/Show', [
            'inspection' => $inspection,
        ]);
    }

    public function destroy(Inspection $inspection)
    {
        $this->checkGarageAccess($inspection->garage_id);
        $inspection->delete();
        return back()->with('success', 'Inspection deleted.');
    }
}
