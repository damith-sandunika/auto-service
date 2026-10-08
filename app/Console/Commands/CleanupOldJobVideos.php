<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Tenant;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class CleanupOldJobVideos extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:cleanup-old-job-videos';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Deletes job videos that are older than 3 days after job completion across all tenants.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting cleanup of old job videos...');
        $deletedCount = 0;

        Tenant::all()->runForEach(function ($tenant) use (&$deletedCount) {
            // Find completed jobs updated more than 3 days ago (assuming status update to completed changes updated_at)
            $cutoffDate = Carbon::now()->subDays(3);

            $oldJobsIds = \App\Models\Job::where('status', 'completed')
                ->where('updated_at', '<=', $cutoffDate)
                ->pluck('id');

            if ($oldJobsIds->isEmpty()) {
                return;
            }

            // Find all videos associated with these jobs
            $medias = \App\Models\JobMedia::whereIn('job_id', $oldJobsIds)
                ->where('file_type', 'video')
                ->get();

            foreach ($medias as $media) {
                try {
                    // Delete file from storage
                    if (Storage::disk('public')->exists($media->file_path)) {
                        Storage::disk('public')->delete($media->file_path);
                    }
                    
                    // Delete DB record
                    $media->delete();
                    $deletedCount++;
                    
                    $this->line("Deleted video: {$media->file_path} from Tenant: {$tenant->id}");
                } catch (\Exception $e) {
                    Log::error("Failed to delete video {$media->file_path}", ['error' => $e->getMessage()]);
                }
            }
        });

        $this->info("Cleanup finished. Total videos deleted: {$deletedCount}");
    }
}
