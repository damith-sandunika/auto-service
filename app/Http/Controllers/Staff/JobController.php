<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Job;

class JobController extends Controller
{
    public function index()
    {
        return Inertia::render('Staff/Dashboard', [
            'jobs' => Job::all()
        ]);
    }
}
