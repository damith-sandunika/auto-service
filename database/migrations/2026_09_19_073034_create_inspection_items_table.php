<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inspection_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inspection_id')->constrained()->cascadeOnDelete();
            $table->string('category'); // e.g., 'Exterior', 'Under Hood', 'Brakes'
            $table->string('item_name'); // e.g., 'Headlights', 'Engine Oil'
            $table->string('condition')->default('good'); // good, replace, repair, monitor
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inspection_items');
    }
};
