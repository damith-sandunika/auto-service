<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Roles Table
        Schema::create('tenant_roles', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->json('permissions')->nullable(); // e.g., {"pos": ["view", "add"], "hr": ["view", "edit", "add", "delete"]}
            $table->boolean('is_system')->default(false); // Prevents deletion of default roles like 'staff'
            $table->timestamps();
        });

        // 2. User Roles Pivot
        Schema::create('tenant_user_roles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('role_id')->constrained('tenant_roles')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['user_id', 'role_id']);
        });

        // 3. User Garages (Branches) Pivot - Defines which branches a user has access to
        Schema::create('tenant_user_garages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('garage_id')->constrained('garages')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['user_id', 'garage_id']);
        });

        // Default 'staff' role setup
        DB::table('tenant_roles')->insert([
            ['name' => 'Staff', 'permissions' => json_encode([]), 'is_system' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Branch Admin', 'permissions' => json_encode([
                'pos' => ['view', 'add', 'edit'],
                'invoices' => ['view', 'add', 'edit'],
                'inventory' => ['view', 'add', 'edit'],
                'purchases' => ['view', 'add', 'edit'],
                'suppliers' => ['view', 'add', 'edit'],
                'expenses' => ['view', 'add', 'edit'],
                'reports' => ['view'],
                'vehicles' => ['view', 'add', 'edit'],
                'inspections' => ['view', 'add', 'edit'],
                'warranties' => ['view', 'add', 'edit'],
                'hr' => ['view'],
            ]), 'is_system' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenant_user_garages');
        Schema::dropIfExists('tenant_user_roles');
        Schema::dropIfExists('tenant_roles');
    }
};
