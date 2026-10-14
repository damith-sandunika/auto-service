<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VehicleController extends Controller
{
    public function index()
    {
        // Fetch all vehicles across all branches globally
        $vehicles = Vehicle::latest()->paginate(15);
        
        return Inertia::render('SuperAdmin/Vehicles/Index', [
            'vehicles' => $vehicles
        ]);
    }
}
