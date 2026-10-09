<?php

use App\Models\Tenant;
use App\Models\User;
use App\Models\Garage;
use App\Models\Job;
use App\Models\JobItem;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Expense;
use App\Models\VehicleOwner;
use App\Models\Vehicle;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;

$tenant = Tenant::find('nuwan');
if (!$tenant) {
    echo "Tenant 'nuwan' not found!\n";
    exit;
}

tenancy()->initialize($tenant);

$garage = Garage::first();
if (!$garage) {
    echo "No garage found in tenant 'nuwan'!\n";
    exit;
}

$owner = User::find($garage->owner_id);

echo "Seeding data for garage: {$garage->name}...\n";

// 1. Add Staff
$staffRoles = ['mechanic', 'branch_admin'];
$staffMembers = [];
for ($i = 1; $i <= 5; $i++) {
    $role = $i == 1 ? 'branch_admin' : 'staff';
    $user = User::create([
        'name' => "Staff $i (" . ucfirst($role) . ")",
        'email' => "staff_" . uniqid() . "@nuwan.com",
        'password' => Hash::make('password'),
        'role' => $role,
        'phone' => "077" . rand(1000000, 9999999),
        'garage_id' => $garage->id,
    ]);
    
    if ($role === 'staff') {
        $staffMembers[] = $user;
    }
}

// 2. Add Customers & Vehicles
$customers = [];
$vehicles = [];
for ($i = 1; $i <= 10; $i++) {
    $user = User::create([
        'name' => "Customer $i",
        'email' => "customer_" . uniqid() . "@example.com",
        'password' => Hash::make('password'),
        'role' => 'vehicle_owner',
        'phone' => "071" . rand(1000000, 9999999),
    ]);
    
    $v = Vehicle::create([
        'vehicle_number' => "WP-CA" . rand(1000, 9999),
        'make' => ['Toyota', 'Honda', 'Nissan', 'Mazda'][array_rand(['Toyota', 'Honda', 'Nissan', 'Mazda'])],
        'model' => 'Model X',
        'year' => rand(2010, 2023)
    ]);
    
    $vo = VehicleOwner::create([
        'customer_id' => $user->id,
        'vehicle_id' => $v->id,
        'type' => 'individual',
        'name' => "Customer $i",
        'phone' => "071" . rand(1000000, 9999999)
    ]);
    
    $customers[] = $user;
    $vehicles[] = $v;
}

// 3. Add Jobs, Job Items, Invoices, Payments
$serviceNames = ['Full Service', 'Oil Change', 'Brake Pad Replacement', 'Wheel Alignment', 'Engine Wash'];
$paymentMethods = ['cash', 'card', 'bank', 'credit'];
$statuses = ['completed', 'pending', 'in_progress'];

for ($i = 1; $i <= 50; $i++) {
    $daysAgo = rand(0, 5);
    $date = Carbon::now()->subDays($daysAgo)->subHours(rand(1, 10));
    
    $vehicle = $vehicles[array_rand($vehicles)];
    $customer = VehicleOwner::where('vehicle_id', $vehicle->id)->first()->customer_id;
    $mechanic = $staffMembers[array_rand($staffMembers)];
    
    $status = $i > 45 ? 'pending' : 'completed';
    
    $job = Job::create([
        'garage_id' => $garage->id,
        'vehicle_id' => $vehicle->id,
        'assigned_mechanic_id' => $mechanic->id,
        'status' => $status,
        'odometer_reading' => rand(10000, 150000),
        'notes' => "Dummy job $i",
        'created_at' => $date,
        'updated_at' => $date,
    ]);
    
    $totalAmount = 0;
    $itemsCount = rand(1, 3);
    for ($j = 0; $j < $itemsCount; $j++) {
        $svc = $serviceNames[array_rand($serviceNames)];
        $price = rand(2000, 15000);
        JobItem::create([
            'job_id' => $job->id,
            'description' => $svc,
            'quantity' => 1,
            'price' => $price,
            'item_type' => 'service',
            'created_at' => $date,
            'updated_at' => $date
        ]);
        $totalAmount += $price;
    }
    
    $job->update(['total_cost' => $totalAmount]);
    
    if ($status === 'completed') {
        $invoice = Invoice::create([
            'job_id' => $job->id,
            'garage_id' => $garage->id,
            'total_amount' => $totalAmount,
            'tax_amount' => 0,
            'discount_amount' => 0,
            'status' => 'paid',
            'created_at' => $date,
            'updated_at' => $date
        ]);
        
        $pm = $paymentMethods[array_rand($paymentMethods)];
        
        // For credit, maybe partial payment or no payment
        if ($pm === 'credit') {
            $invoice->update(['status' => 'unpaid']);
            // Partial payment?
            if (rand(0, 1)) {
                Payment::create([
                    'invoice_id' => $invoice->id,
                    'amount' => $totalAmount / 2,
                    'payment_method' => 'cash',
                    'payment_date' => $date
                ]);
            }
        } else {
            Payment::create([
                'invoice_id' => $invoice->id,
                'amount' => $totalAmount,
                'payment_method' => $pm,
                'payment_date' => $date
            ]);
        }
    }
}

// 4. Add Expenses
$expenseCats = ['Electricity', 'Water', 'Rent', 'Salaries', 'Tools'];
for ($i = 1; $i <= 10; $i++) {
    $daysAgo = rand(0, 5);
    $date = Carbon::now()->subDays($daysAgo)->subHours(rand(1, 10));
    Expense::create([
        'garage_id' => $garage->id,
        'category' => $expenseCats[array_rand($expenseCats)],
        'amount' => rand(1500, 20000),
        'description' => "Dummy expense $i",
        'expense_date' => $date->format('Y-m-d'),
        'created_at' => $date,
        'updated_at' => $date
    ]);
}

echo "Seeding completed successfully!\n";

