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
        Schema::table('users', function (Blueprint $table) {
            $table->decimal('commission_percentage', 5, 2)->nullable()->after('role');
        });

        Schema::table('service_jobs', function (Blueprint $table) {
            $table->decimal('mechanic_commission_amount', 10, 2)->default(0)->after('total_cost');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('commission_percentage');
        });

        Schema::table('service_jobs', function (Blueprint $table) {
            $table->dropColumn('mechanic_commission_amount');
        });
    }
};
