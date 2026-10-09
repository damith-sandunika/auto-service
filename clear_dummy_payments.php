<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

\App\Models\Tenant::first()->run(function() {
    \App\Models\Payment::truncate();
    \App\Models\JobPayment::truncate();
    \App\Models\CashbookTransaction::where('reference_type', 'JobPayment')->delete();
    
    // reset invoice status to pending
    \App\Models\Invoice::query()->update(['status' => 'pending']);
    
    echo "Cleared all seeded payments!\n";
});
