<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Job;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JobInspectionController extends Controller
{
    public function show(Job $job)
    {
        // For public access, we might want to ensure we only expose necessary data
        $job->load(['vehicle', 'owner', 'garage', 'media']);

        // Check if there are any media to show, otherwise we can still show the page but it will be empty
        // Or if the job is deleted or something

        return Inertia::render('Customer/InspectionView', [
            'job' => $job,
        ]);
    }
}
