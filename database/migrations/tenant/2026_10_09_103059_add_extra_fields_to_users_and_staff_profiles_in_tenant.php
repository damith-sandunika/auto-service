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
            if (!Schema::hasColumn('users', 'phone')) {
                $table->string('phone')->nullable()->after('email');
            }
        });

        Schema::table('staff_profiles', function (Blueprint $table) {
            $table->string('nic')->nullable()->after('user_id');
            $table->date('dob')->nullable()->after('nic');
            $table->text('address')->nullable()->after('dob');
            $table->string('emergency_contact')->nullable()->after('address');
            $table->decimal('standard_working_hours', 8, 2)->default(8.0)->after('emergency_contact');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'phone')) {
                $table->dropColumn('phone');
            }
        });

        Schema::table('staff_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'nic',
                'dob',
                'address',
                'emergency_contact',
                'standard_working_hours'
            ]);
        });
    }
};
