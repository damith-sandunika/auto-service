<?php
use App\Models\Invoice;
use App\Models\Estimate;
use App\Models\BranchSequence;

$garages = \App\Models\Garage::all();

foreach ($garages as $garage) {
    // Backfill Invoices
    $invoices = Invoice::where('garage_id', $garage->id)->orderBy('id', 'asc')->get();
    $invoiceCount = 0;
    foreach ($invoices as $invoice) {
        $invoiceCount++;
        $invoice->invoice_number = 'INV-' . $invoiceCount;
        $invoice->save();
    }
    
    // Set sequence for Invoices
    if ($invoiceCount > 0) {
        BranchSequence::updateOrCreate(
            ['garage_id' => $garage->id, 'type' => 'invoice'],
            ['last_number' => $invoiceCount]
        );
    }
    
    // Backfill Estimates
    $estimates = Estimate::where('garage_id', $garage->id)->orderBy('id', 'asc')->get();
    $estimateCount = 0;
    foreach ($estimates as $estimate) {
        $estimateCount++;
        $estimate->estimate_number = 'EST-' . $estimateCount;
        $estimate->save();
    }
    
    // Set sequence for Estimates
    if ($estimateCount > 0) {
        BranchSequence::updateOrCreate(
            ['garage_id' => $garage->id, 'type' => 'estimate'],
            ['last_number' => $estimateCount]
        );
    }
}
echo "Backfill complete.\n";
