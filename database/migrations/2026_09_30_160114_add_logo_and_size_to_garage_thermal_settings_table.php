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
        Schema::table('garage_thermal_settings', function (Blueprint $table) {
            $table->string('logo_path')->nullable()->after('email');
            $table->string('logo_size')->default('medium')->after('logo_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('garage_thermal_settings', function (Blueprint $table) {
            $table->dropColumn(['logo_path', 'logo_size']);
        });
    }
};
