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
        Schema::table('job_items', function (Blueprint $table) {
            // Modify item_type to string to allow 'outsource' or others safely without enum issues
            $table->string('item_type')->change();
            
            // For Outsource items
            $table->decimal('cost_price', 10, 2)->nullable()->after('price');
            $table->string('payment_method')->nullable()->after('cost_price'); // 'cash' or 'credit'
            $table->boolean('is_paid')->default(false)->after('payment_method'); // To track credit payments
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('job_items', function (Blueprint $table) {
            $table->dropColumn(['cost_price', 'payment_method', 'is_paid']);
        });
    }
};
