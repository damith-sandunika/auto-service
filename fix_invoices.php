<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

\App\Models\Tenant::first()->run(function() {
    $jobs = \App\Models\Job::whereIn('status', ['completed', 'done'])->doesntHave('invoice')->get();
    foreach($jobs as $job) {
        $invoiceNumber = (string) \App\Services\SequenceGenerator::getNextNumber($job->garage_id, 'invoice');
        \App\Models\Invoice::create([
            'job_id' => $job->id,
            'garage_id' => $job->garage_id,
            'invoice_number' => $invoiceNumber,
            'total_amount' => $job->total_cost ?? 0,
            'discount' => $job->discount ?? 0,
            'status' => 'pending'
        ]);
    }
    echo "Invoices created: " . count($jobs) . "\n";
});
