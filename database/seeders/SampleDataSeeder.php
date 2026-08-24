<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Garage;
use App\Models\Supplier;
use App\Models\Inventory;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\SupplierPayment;
use App\Models\Expense;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class SampleDataSeeder extends Seeder
{
    public function run()
    {
        $garage = Garage::first();
        if (!$garage) return;

        DB::transaction(function () use ($garage) {

            // 1. Create Suppliers
            $s1 = Supplier::create([
                'garage_id' => $garage->id,
                'name' => 'AutoParts Distributors Ltd.',
                'contact_person' => 'Saman Kumara',
                'phone' => '077 123 4455',
                'address' => 'Colombo 10',
                'balance_due' => 0
            ]);

            $s2 = Supplier::create([
                'garage_id' => $garage->id,
                'name' => 'Lanka Lubricants',
                'contact_person' => 'Nimal Silva',
                'phone' => '011 234 5678',
                'address' => 'Kelaniya',
                'balance_due' => 0
            ]);

            // 2. Create Inventory Items
            $inv1 = Inventory::create([
                'garage_id' => $garage->id,
                'item_name' => 'Engine Oil (Mobil 1) 4L',
                'sku' => 'ENG-MB1-4L',
                'quantity' => 10,
                'price' => 15000
            ]);

            $inv2 = Inventory::create([
                'garage_id' => $garage->id,
                'item_name' => 'Toyota Brake Pads (Front)',
                'sku' => 'BRK-TY-F',
                'quantity' => 5,
                'price' => 8500
            ]);

            $inv3 = Inventory::create([
                'garage_id' => $garage->id,
                'item_name' => 'Wiper Blade 18"',
                'sku' => 'WIP-18',
                'quantity' => 20,
                'price' => 2000
            ]);

            // 3. Add a Purchase Order (GRN) to simulate stock intake
            $po1 = PurchaseOrder::create([
                'garage_id' => $garage->id,
                'supplier_id' => $s1->id,
                'reference_no' => 'INV-90210',
                'total_amount' => 50000,
                'paid_amount' => 20000,
                'balance_amount' => 30000,
                'status' => 'partial',
                'date' => Carbon::now()->subDays(2)
            ]);
            $s1->increment('balance_due', 30000);

            PurchaseOrderItem::create(['purchase_order_id' => $po1->id, 'inventory_id' => $inv2->id, 'quantity' => 10, 'unit_cost' => 5000, 'total' => 50000]);
            $inv2->increment('quantity', 10);

            SupplierPayment::create([
                'garage_id' => $garage->id,
                'supplier_id' => $s1->id,
                'purchase_order_id' => $po1->id,
                'amount' => 20000,
                'payment_method' => 'cash',
                'reference_no' => 'CASH-001',
                'payment_date' => Carbon::now()->subDays(2)
            ]);
            Expense::create(['garage_id' => $garage->id, 'category' => 'Supplier Payment', 'amount' => 20000, 'expense_date' => Carbon::now()->subDays(2), 'description' => 'Supplier: AutoParts Distributors Ltd.']);


            // 4. Create some past Jobs/Invoices for Dashboard Charts
            for ($i = 6; $i >= 0; $i--) {
                $date = Carbon::now()->subDays($i);
                
                // Add 1-3 jobs per day
                $jobsPerDay = rand(1, 3);
                for ($j = 0; $j < $jobsPerDay; $j++) {
                    // Assuming we have a vehicle, but we can just create a dummy one or grab the first
                    $vehicle = \App\Models\Vehicle::first();
                    
                    if ($vehicle) {
                        $job = \App\Models\Job::create([
                            'garage_id' => $garage->id,
                            'vehicle_id' => $vehicle->id,
                            'status' => 'completed',
                            'description' => 'General Service & Maintenance',
                            'total_cost' => rand(2000, 15000),
                            'created_at' => $date,
                            'updated_at' => $date
                        ]);

                        $invoice = \App\Models\Invoice::create([
                            'garage_id' => $garage->id,
                            'job_id' => $job->id,
                            'total_amount' => $job->total_cost,
                            'status' => 'paid',
                            'created_at' => $date,
                            'updated_at' => $date
                        ]);

                        Payment::create([
                            'invoice_id' => $invoice->id,
                            'amount' => $invoice->total_amount,
                            'payment_method' => 'cash',
                            'payment_date' => $date,
                            'created_at' => $date,
                            'updated_at' => $date
                        ]);
                    }
                }
            }

            // 5. Create some general expenses
            Expense::create(['garage_id' => $garage->id, 'category' => 'Utility Bills', 'amount' => 5000, 'expense_date' => Carbon::now()->subDays(1), 'description' => 'Electricity Bill']);
            Expense::create(['garage_id' => $garage->id, 'category' => 'Staff Meals', 'amount' => 1500, 'expense_date' => Carbon::today(), 'description' => 'Lunch for mechanics']);

        });
    }
}
