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
        Schema::table('supplier_payments', function (Blueprint $table) {
            $table->date('cheque_due_date')->nullable()->after('payment_date');
            $table->string('cheque_status')->nullable()->after('cheque_due_date');
        });

        Schema::table('inventories', function (Blueprint $table) {
            $table->integer('min_stock_level')->default(5)->after('quantity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('supplier_payments', function (Blueprint $table) {
            $table->dropColumn(['cheque_due_date', 'cheque_status']);
        });

        Schema::table('inventories', function (Blueprint $table) {
            $table->dropColumn('min_stock_level');
        });
    }
};
