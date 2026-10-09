<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

\App\Models\Tenant::first()->run(function() {
    $invoice = \App\Models\Invoice::with('job.items')->find(55);
    if ($invoice && $invoice->job) {
        print_r($invoice->job->items->toArray());
    } else {
        echo "Invoice or Job not found\n";
    }
});
