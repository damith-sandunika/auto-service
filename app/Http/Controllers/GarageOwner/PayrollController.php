<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PayrollController extends Controller
{
    public function index()
    {
        $mechanics = User::where('role', 'garage_staff')
            ->with(['jobs' => function($query) {
                // We only count commissions on paid or completed jobs ideally, but for now we take all
            }])
            ->get()
            ->map(function ($mechanic) {
                $totalCommission = $mechanic->jobs->sum('mechanic_commission_amount');
                return [
                    'id' => $mechanic->id,
                    'name' => $mechanic->name,
                    'email' => $mechanic->email,
                    'commission_percentage' => $mechanic->commission_percentage,
                    'total_commission_earned' => $totalCommission,
                    'jobs_completed' => $mechanic->jobs->count()
                ];
            });

        return Inertia::render('GarageOwner/Payroll', [
            'mechanics' => $mechanics
        ]);
    }
}
