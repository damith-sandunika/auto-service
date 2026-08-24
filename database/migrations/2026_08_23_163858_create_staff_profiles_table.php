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
        Schema::create('staff_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->decimal('basic_salary', 12, 2)->default(0);
            $table->decimal('ot_rate_per_hour', 8, 2)->default(0);
            $table->decimal('commission_rate', 5, 2)->default(0); // e.g., 10.00 for 10%
            $table->integer('casual_leaves_allowed')->default(14);
            $table->integer('medical_leaves_allowed')->default(7);
            $table->integer('vacation_leaves_allowed')->default(14);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff_profiles');
    }
};
