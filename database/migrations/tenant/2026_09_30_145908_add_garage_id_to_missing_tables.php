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
        $tables = ['payments', 'staff_profiles', 'staff_attendances', 'salary_advances', 'payrolls'];

        foreach ($tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->foreignId('garage_id')->nullable()->constrained('garages')->cascadeOnDelete();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tables = ['payments', 'staff_profiles', 'staff_attendances', 'salary_advances', 'payrolls'];

        foreach ($tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->dropForeign(['garage_id']);
                $table->dropColumn('garage_id');
            });
        }
    }
};
