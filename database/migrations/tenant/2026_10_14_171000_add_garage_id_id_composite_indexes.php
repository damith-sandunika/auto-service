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
            $table->index(['garage_id', 'id'], 'idx_jobs_garage_id_composite');
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->index(['garage_id', 'id'], 'idx_invoices_garage_id_composite');
        });

        if (Schema::hasTable('deleted_orders')) {
            Schema::table('deleted_orders', function (Blueprint $table) {
                $table->index(['garage_id', 'id'], 'idx_deleted_orders_garage_id_composite');
            });
        }

        if (Schema::hasTable('cashbook_transactions')) {
            Schema::table('cashbook_transactions', function (Blueprint $table) {
                $table->index(['garage_id', 'id'], 'idx_cashbook_garage_id_composite');
                $table->index(['garage_id', 'date'], 'idx_cashbook_garage_date_composite');
            });
        }

        if (Schema::hasTable('inventories')) {
            Schema::table('inventories', function (Blueprint $table) {
                $table->index(['garage_id', 'id'], 'idx_inventories_garage_id_composite');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('service_jobs', function (Blueprint $table) {
            $table->dropIndex('idx_jobs_garage_id_composite');
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->dropIndex('idx_invoices_garage_id_composite');
        });

        if (Schema::hasTable('deleted_orders')) {
            Schema::table('deleted_orders', function (Blueprint $table) {
                $table->dropIndex('idx_deleted_orders_garage_id_composite');
            });
        }

        if (Schema::hasTable('cashbook_transactions')) {
            Schema::table('cashbook_transactions', function (Blueprint $table) {
                $table->dropIndex('idx_cashbook_garage_id_composite');
                $table->dropIndex('idx_cashbook_garage_date_composite');
            });
        }

        if (Schema::hasTable('inventories')) {
            Schema::table('inventories', function (Blueprint $table) {
                $table->dropIndex('idx_inventories_garage_id_composite');
            });
        }
    }
};
