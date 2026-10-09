<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Change service_jobs.status to string
        Schema::table('service_jobs', function (Blueprint $table) {
            $table->string('status')->default('checking')->change();
        });

        // 2. Map old enum values to new ones
        DB::table('service_jobs')->where('status', 'pending')->update(['status' => 'checking']);
        DB::table('service_jobs')->where('status', 'in_progress')->update(['status' => 'working']);
        // 'completed' remains 'completed'

        // 3. Create job_timelines table
        Schema::create('job_timelines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('garage_id')->constrained()->onDelete('cascade');
            $table->foreignId('job_id')->constrained('service_jobs')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null'); // Who did it
            $table->string('action'); // e.g. 'state_changed', 'payment_added', 'item_added'
            $table->string('description'); // nicely formatted text
            $table->json('metadata')->nullable(); // extra info if needed
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_timelines');
    }
};
