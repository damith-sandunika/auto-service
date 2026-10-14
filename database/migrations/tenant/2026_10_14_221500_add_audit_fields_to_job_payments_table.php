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
        Schema::table('job_payments', function (Blueprint $table) {
            $table->unsignedBigInteger('created_by')->nullable()->after('payment_method');
            $table->string('created_by_name')->nullable()->after('created_by');
            
            $table->unsignedBigInteger('edited_by')->nullable()->after('created_by_name');
            $table->string('edited_by_name')->nullable()->after('edited_by');
            $table->timestamp('edited_at')->nullable()->after('edited_by_name');
            
            $table->boolean('is_void')->default(false)->after('edited_at');
            $table->unsignedBigInteger('voided_by')->nullable()->after('is_void');
            $table->string('voided_by_name')->nullable()->after('voided_by');
            $table->timestamp('voided_at')->nullable()->after('voided_by_name');
            $table->string('void_reason')->nullable()->after('voided_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('job_payments', function (Blueprint $table) {
            $table->dropColumn([
                'created_by',
                'created_by_name',
                'edited_by',
                'edited_by_name',
                'edited_at',
                'is_void',
                'voided_by',
                'voided_by_name',
                'voided_at',
                'void_reason',
            ]);
        });
    }
};
