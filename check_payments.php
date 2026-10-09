<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

\App\Models\Tenant::first()->run(function() {
    $payments = \App\Models\Payment::all();
    echo "Payments count: " . $payments->count() . "\n";
    foreach($payments as $p) {
        echo "Payment ID: {$p->id}, Invoice ID: {$p->invoice_id}, Amount: {$p->amount}\n";
    }
    
    $invoices = \App\Models\Invoice::with('payments')->get();
    foreach($invoices as $inv) {
        echo "Invoice ID: {$inv->id}, Total Amount: {$inv->total_amount}, Payments count: " . $inv->payments->count() . "\n";
    }
});
