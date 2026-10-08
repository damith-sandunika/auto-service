<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inspections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('garage_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('vehicle_id');
            $table->foreignId('inspector_id')->nullable()->constrained('users')->nullOnDelete();
            $table->date('inspection_date');
            $table->string('status')->default('pending'); // pending, completed
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index(['garage_id', 'vehicle_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inspections');
    }
};
