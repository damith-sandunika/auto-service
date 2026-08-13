<?php

namespace App\Http\Controllers\VehicleOwner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Vehicle;

class HistoryController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('VehicleOwner/Dashboard', [
            'vehicles' => Vehicle::where('owner_id', $request->user()->id)->get()
        ]);
    }
}
