<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

\App\Models\Tenant::first()->run(function() {
    $payments = \App\Models\Payment::whereNull('garage_id')->get();
    foreach ($payments as $payment) {
        if ($payment->invoice && $payment->invoice->garage_id) {
            $payment->update(['garage_id' => $payment->invoice->garage_id]);
        }
    }
    echo "Fixed " . $payments->count() . " payments.\n";
});
