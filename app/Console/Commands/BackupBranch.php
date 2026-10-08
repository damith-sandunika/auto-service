<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Garage;
use Illuminate\Support\Facades\File;

class BackupBranch extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:backup-branch {garage_id}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Export all data for a specific branch as JSON';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $garageId = $this->argument('garage_id');
        $garage = Garage::with([
            'owner', 
            'jobs.items', 
            'jobs.payments', 
            'jobs.notes'
        ])->find($garageId);

        if (!$garage) {
            $this->error("Garage with ID {$garageId} not found.");
            return;
        }

        $data = [
            'garage' => $garage,
            'users' => \App\Models\User::where('garage_id', $garageId)->get(),
            'inventory' => \App\Models\Inventory::where('garage_id', $garageId)->get(),
            'expenses' => \App\Models\Expense::where('garage_id', $garageId)->get(),
            'invoices' => \App\Models\Invoice::where('garage_id', $garageId)->get(),
        ];

        $date = now()->format('Y-m-d_H-i-s');
        $filename = storage_path("app/backups/branch_{$garageId}_{$date}.json");

        if (!file_exists(storage_path('app/backups'))) {
            mkdir(storage_path('app/backups'), 0755, true);
        }

        File::put($filename, json_encode($data, JSON_PRETTY_PRINT));

        $this->info("Branch backup created successfully: {$filename}");
    }
}
