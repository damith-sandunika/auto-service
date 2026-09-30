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
        Schema::create('garage_invoice_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('garage_id')->constrained()->onDelete('cascade');
            $table->string('business_name')->nullable();
            $table->string('address')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();
            $table->string('tax_number')->nullable();
            $table->string('logo_url')->nullable();
            $table->string('primary_color')->default('#2563eb');
            $table->string('secondary_color')->default('#f8fafc');
            $table->string('text_color')->default('#334155');
            $table->string('heading_size')->default('text-2xl');
            $table->string('text_size')->default('text-sm');
            $table->text('footer_text')->nullable();
            $table->text('terms_and_conditions')->nullable();
            $table->string('paper_size')->default('A4');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('garage_invoice_settings');
    }
};
