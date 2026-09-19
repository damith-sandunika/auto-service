<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cashbook_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('garage_id')->constrained()->cascadeOnDelete();
            $table->foreignId('bank_account_id')->nullable()->constrained()->nullOnDelete(); // null means Cash in Hand
            $table->enum('type', ['in', 'out']);
            $table->decimal('amount', 12, 2);
            $table->string('reference_type'); // invoice, expense, supplier_payment, payroll, manual
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->string('description');
            $table->date('date');
            $table->timestamps();
            
            $table->index(['garage_id', 'date']);
            $table->index(['garage_id', 'reference_type', 'reference_id'], 'cb_trx_ref_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cashbook_transactions');
    }
};
