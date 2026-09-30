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
        Schema::create('job_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('garage_id')->constrained()->onDelete('cascade');
            $table->foreignId('job_id')->constrained('service_jobs')->onDelete('cascade');
            $table->decimal('amount', 12, 2);
            $table->string('payment_method');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_payments');
    }
};
