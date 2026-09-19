<?php

use App\Models\User;
use App\Models\Vehicle;
use App\Models\Appointment;
use App\Models\Estimate;
use App\Models\EstimateItem;
use App\Models\BankAccount;
use App\Models\CashbookTransaction;
use App\Models\Warranty;
use App\Models\Inspection;
use App\Models\InspectionItem;
use App\Models\ServiceCatalog;
use App\Models\Inventory;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

$garageId = 1;

// 1. Get or create a Customer
$customer = User::where('garage_id', $garageId)->where('role', 'vehicle_owner')->first();
if (!$customer) {
    $customer = User::create([
        'name' => 'John Doe',
        'email' => 'john' . rand(100,999) . '@example.com',
        'password' => bcrypt('password'),
        'role' => 'vehicle_owner',
        'garage_id' => $garageId
    ]);
}

// 2. Get or create a Vehicle
$vehicle = Vehicle::where('owner_id', $customer->id)->first();
if (!$vehicle) {
    $vehicle = Vehicle::create([
        'owner_id' => $customer->id,
        'vehicle_number' => 'WP CA-' . rand(1000, 9999),
        'make' => 'Toyota',
        'model' => 'Corolla',
        'year' => 2018
    ]);
}

// 3. Appointments
Appointment::firstOrCreate(
    ['garage_id' => $garageId, 'customer_id' => $customer->id, 'appointment_date' => Carbon::tomorrow()->toDateString()],
    [
        'vehicle_id' => $vehicle->id,
        'appointment_time' => '10:00:00',
        'status' => 'scheduled',
        'notes' => 'Full Service and Oil Change'
    ]
);

// 4. Estimates
$estimate = Estimate::firstOrCreate(
    ['estimate_number' => 'EST-00001', 'garage_id' => $garageId],
    [
        'customer_id' => $customer->id,
        'vehicle_id' => $vehicle->id,
        'estimate_date' => Carbon::today()->toDateString(),
        'expiry_date' => Carbon::today()->addDays(14)->toDateString(),
        'subtotal' => 15000,
        'tax' => 1500,
        'discount' => 500,
        'total' => 16000,
        'status' => 'sent',
        'notes' => 'Customer requested synthetic oil.',
        'terms' => 'Valid for 14 days.'
    ]
);

if ($estimate->wasRecentlyCreated) {
    EstimateItem::create([
        'estimate_id' => $estimate->id,
        'type' => 'service',
        'description' => 'Full Service Package',
        'quantity' => 1,
        'unit_price' => 5000,
        'total' => 5000,
    ]);
    EstimateItem::create([
        'estimate_id' => $estimate->id,
        'type' => 'part',
        'description' => 'Synthetic Engine Oil 4L',
        'quantity' => 1,
        'unit_price' => 10000,
        'total' => 10000,
    ]);
}

// 5. Bank Accounts & Cashbook
$bank = BankAccount::firstOrCreate(
    ['garage_id' => $garageId, 'account_number' => '8899001122'],
    [
        'bank_name' => 'Commercial Bank',
        'account_name' => 'Main Operating Account',
        'branch' => 'Colombo 01',
        'initial_balance' => 500000,
        'current_balance' => 500000,
        'is_active' => true
    ]
);

if ($bank->wasRecentlyCreated) {
    CashbookTransaction::create([
        'garage_id' => $garageId,
        'bank_account_id' => $bank->id,
        'type' => 'in',
        'amount' => 500000,
        'reference_type' => 'manual',
        'description' => 'Initial Capital',
        'date' => Carbon::yesterday()->toDateString(),
    ]);
}

// Add a cash transaction (Cash in Hand)
CashbookTransaction::firstOrCreate(
    ['garage_id' => $garageId, 'description' => 'Daily Sales Collection (Cash)'],
    [
        'type' => 'in',
        'amount' => 25000,
        'reference_type' => 'manual',
        'date' => Carbon::today()->toDateString(),
    ]
);

// 6. Warranties
Warranty::firstOrCreate(
    ['garage_id' => $garageId, 'vehicle_id' => $vehicle->id],
    [
        'customer_id' => $customer->id,
        'warranty_period' => '6 Months',
        'start_date' => Carbon::today()->toDateString(),
        'end_date' => Carbon::today()->addMonths(6)->toDateString(),
        'terms' => 'Covers engine oil leak and transmission issues only.',
        'status' => 'active'
    ]
);

// 7. Inspections
$inspection = Inspection::firstOrCreate(
    ['garage_id' => $garageId, 'vehicle_id' => $vehicle->id, 'inspection_date' => Carbon::yesterday()->toDateString()],
    [
        'status' => 'completed',
        'notes' => 'Vehicle is in good condition, but brakes need attention.'
    ]
);

if ($inspection->wasRecentlyCreated) {
    InspectionItem::create([
        'inspection_id' => $inspection->id,
        'category' => 'Exterior',
        'item_name' => 'Body Panels',
        'condition' => 'good',
    ]);
    InspectionItem::create([
        'inspection_id' => $inspection->id,
        'category' => 'Tires & Brakes',
        'item_name' => 'Brake Pads',
        'condition' => 'replace',
        'remarks' => 'Worn out to 2mm, immediate replacement needed.'
    ]);
}

echo "Demo data added successfully!\n";
