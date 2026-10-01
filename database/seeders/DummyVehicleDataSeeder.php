<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Vehicle;
use App\Models\User;
use App\Models\Job;
use App\Models\JobItem;
use App\Models\VehicleOwner;
use Carbon\Carbon;

class DummyVehicleDataSeeder extends Seeder
{
    public function run()
    {
        // 1. Create a dummy vehicle
        $vehicle = Vehicle::firstOrCreate(
            ['vehicle_number' => 'WP ABC-1234'],
            ['make' => 'Toyota', 'model' => 'Prius', 'year' => 2018, 'garage_id' => 1]
        );

        // 2. Create dummy customers (Owners)
        $owner1 = User::firstOrCreate(['email' => 'owner1@test.com'], ['name' => 'John Doe', 'password' => bcrypt('password'), 'role' => 'vehicle_owner', 'garage_id' => 1]);
        $owner2 = User::firstOrCreate(['email' => 'owner2@test.com'], ['name' => 'Jane Smith', 'password' => bcrypt('password'), 'role' => 'vehicle_owner', 'garage_id' => 1]);
        $owner3 = User::firstOrCreate(['email' => 'owner3@test.com'], ['name' => 'Kamal Perera', 'password' => bcrypt('password'), 'role' => 'vehicle_owner', 'garage_id' => 1]);

        // 3. Ownership History
        VehicleOwner::where('vehicle_id', $vehicle->id)->delete();
        
        VehicleOwner::create([
            'vehicle_id' => $vehicle->id,
            'customer_id' => $owner1->id,
            'garage_id' => 1,
            'is_current' => false,
            'start_date' => Carbon::now()->subYears(4),
            'end_date' => Carbon::now()->subYears(2)
        ]);

        VehicleOwner::create([
            'vehicle_id' => $vehicle->id,
            'customer_id' => $owner2->id,
            'garage_id' => 1,
            'is_current' => false,
            'start_date' => Carbon::now()->subYears(2),
            'end_date' => Carbon::now()->subMonths(6)
        ]);

        VehicleOwner::create([
            'vehicle_id' => $vehicle->id,
            'customer_id' => $owner3->id,
            'garage_id' => 1,
            'is_current' => true,
            'start_date' => Carbon::now()->subMonths(6)
        ]);

        $vehicle->update(['owner_id' => $owner3->id]);

        // 4. Create 100 Jobs
        $services = ['Oil Change', 'Brake Pad Replacement', 'Wheel Alignment', 'Full Wash', 'Engine Tune-up', 'A/C Repair', 'Battery Replacement'];
        $parts = ['Engine Oil 4L', 'Brake Pads Set', 'Spark Plugs', 'Air Filter', 'Cabin Filter', 'Wiper Blades'];

        for ($i = 0; $i < 100; $i++) {
            $date = Carbon::now()->subDays(rand(1, 1400));
            $job = Job::create([
                'garage_id' => rand(1, 2), // Simulate different garages
                'vehicle_id' => $vehicle->id,
                'status' => 'completed',
                'description' => 'Regular maintenance visit',
                'total_cost' => rand(5000, 25000),
                'created_at' => $date,
                'updated_at' => $date
            ]);

            // Add 1-3 items per job
            $numItems = rand(1, 3);
            for ($j = 0; $j < $numItems; $j++) {
                $isService = rand(0, 1);
                JobItem::create([
                    'job_id' => $job->id,
                    'item_type' => $isService ? 'service' : 'part',
                    'description' => $isService ? $services[array_rand($services)] : $parts[array_rand($parts)],
                    'quantity' => rand(1, 2),
                    'price' => rand(1000, 5000),
                    'created_at' => $date,
                    'updated_at' => $date
                ]);
            }
        }
    }
}
