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
        Schema::table('service_jobs', function (Blueprint $table) {
            $table->index(['garage_id', 'status'], 'idx_garage_status');
            $table->index(['garage_id', 'created_at'], 'idx_garage_created_at');
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->index(['garage_id', 'status'], 'idx_invoice_garage_status');
            $table->index(['garage_id', 'created_at'], 'idx_invoice_garage_created_at');
        });
        
        Schema::table('inventories', function (Blueprint $table) {
            $table->index(['garage_id', 'quantity'], 'idx_inventory_garage_qty');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('service_jobs', function (Blueprint $table) {
            $table->dropIndex('idx_garage_status');
            $table->dropIndex('idx_garage_created_at');
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->dropIndex('idx_invoice_garage_status');
            $table->dropIndex('idx_invoice_garage_created_at');
        });
        
        Schema::table('inventories', function (Blueprint $table) {
            $table->dropIndex('idx_inventory_garage_qty');
        });
    }
};
