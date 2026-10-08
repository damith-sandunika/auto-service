<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class BackupDatabase extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:backup';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a full MySQL backup of the application database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $database = env('DB_DATABASE');
        $username = env('DB_USERNAME');
        $password = env('DB_PASSWORD');
        $host = env('DB_HOST', '127.0.0.1');

        $date = now()->format('Y-m-d_H-i-s');
        $filename = storage_path("app/backups/backup_{$date}.sql");

        if (!file_exists(storage_path('app/backups'))) {
            mkdir(storage_path('app/backups'), 0755, true);
        }

        $command = "mysqldump --user={$username} --password={$password} --host={$host} {$database} > {$filename}";

        $this->info("Creating backup...");
        
        exec($command, $output, $returnVar);

        if ($returnVar === 0) {
            $this->info("Backup created successfully: {$filename}");
            Log::info("Database backup created: {$filename}");
        } else {
            $this->error("Failed to create backup.");
            Log::error("Database backup failed.");
        }
    }
}
