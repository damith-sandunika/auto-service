<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('warranties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('garage_id')->constrained()->cascadeOnDelete();
            $table->foreignId('job_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedBigInteger('vehicle_id');
            $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();
            $table->string('warranty_period'); // e.g., '6 Months', '10,000 km'
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->text('terms')->nullable();
            $table->string('status')->default('active'); // active, expired, voided
            $table->timestamps();
            
            $table->index(['garage_id', 'vehicle_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('warranties');
    }
};
