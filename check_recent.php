<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

\App\Models\Tenant::first()->run(function() {
    $recent = \App\Models\Payment::orderBy('id', 'desc')->take(5)->get()->toArray();
    print_r($recent);
    
    $recentJobs = \App\Models\Job::where('status', 'done')->orderBy('id', 'desc')->take(5)->get()->toArray();
    echo "Jobs done:\n";
    foreach ($recentJobs as $job) {
        echo "Job {$job['id']} status {$job['status']}\n";
    }
});
