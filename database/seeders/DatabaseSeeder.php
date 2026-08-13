<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $admin = User::create([
            'name' => 'Super Admin',
            'email' => 'admin@garage.com',
            'password' => bcrypt('password'),
            'role' => 'super_admin'
        ]);

        $owner = User::create([
            'name' => 'Garage Owner',
            'email' => 'owner@garage.com',
            'password' => bcrypt('password'),
            'role' => 'garage_owner'
        ]);

        $garage = \App\Models\Garage::create([
            'name' => 'AutoCare Colombo',
            'owner_id' => $owner->id,
            'address' => 'No 1, Colombo',
            'phone' => '0771234567'
        ]);

        $staff = User::create([
            'name' => 'Nimal Silva (Mechanic)',
            'email' => 'staff@garage.com',
            'password' => bcrypt('password'),
            'role' => 'garage_staff',
            'garage_id' => $garage->id
        ]);

        $customer = User::create([
            'name' => 'Kamal Perera',
            'email' => 'customer@garage.com',
            'password' => bcrypt('password'),
            'role' => 'vehicle_owner'
        ]);

        \App\Models\Vehicle::create([
            'vehicle_number' => 'WP CBF 9090',
            'make' => 'Suzuki',
            'model' => 'Swift',
            'year' => 2018,
            'owner_id' => $customer->id
        ]);
    }
}
