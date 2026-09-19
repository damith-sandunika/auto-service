<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bank_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('garage_id')->constrained()->cascadeOnDelete();
            $table->string('bank_name');
            $table->string('account_name');
            $table->string('account_number');
            $table->string('branch')->nullable();
            $table->decimal('initial_balance', 12, 2)->default(0);
            $table->decimal('current_balance', 12, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->unique(['garage_id', 'account_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bank_accounts');
    }
};
