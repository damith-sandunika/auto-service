<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('estimates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('garage_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedBigInteger('vehicle_id')->nullable();
            $table->string('estimate_number')->unique();
            $table->date('estimate_date');
            $table->date('expiry_date')->nullable();
            $table->decimal('subtotal', 10, 2)->default(0);
            $table->decimal('tax', 10, 2)->default(0);
            $table->decimal('discount', 10, 2)->default(0);
            $table->decimal('total', 10, 2)->default(0);
            $table->string('status')->default('draft'); // draft, sent, accepted, rejected, expired
            $table->text('notes')->nullable();
            $table->text('terms')->nullable();
            $table->timestamps();
            
            $table->index(['garage_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('estimates');
    }
};
