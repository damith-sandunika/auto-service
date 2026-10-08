<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the central application's database.
     */
    public function run(): void
    {
        // Central DB only has SaaS Admins
        User::updateOrCreate(
            ['email' => 'admin@saas.com'],
            [
                'name' => 'Super Admin',
                'password' => bcrypt('password'),
                'role' => 'saas_admin'
            ]
        );
    }
}
