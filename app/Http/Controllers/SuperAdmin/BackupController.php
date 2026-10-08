<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;

class BackupController extends Controller
{
    public function index()
    {
        $backupPath = storage_path('app/backups');
        $backups = [];

        if (File::exists($backupPath)) {
            $files = File::files($backupPath);
            foreach ($files as $file) {
                $backups[] = [
                    'name' => $file->getFilename(),
                    'size' => number_format($file->getSize() / 1048576, 2) . ' MB',
                    'created_at' => date("Y-m-d H:i:s", $file->getCTime())
                ];
            }
        }

        // sort by newest first
        usort($backups, function($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });
        
        $garages = \App\Models\Garage::all();

        return Inertia::render('SuperAdmin/Backups/Index', [
            'backups' => $backups,
            'garages' => $garages
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:full,branch',
            'garage_id' => 'required_if:type,branch'
        ]);

        if ($request->type === 'branch') {
            Artisan::call('app:backup-branch', ['garage_id' => $request->garage_id]);
            return redirect()->back()->with('success', 'Branch backup created successfully!');
        } else {
            Artisan::call('app:backup');
            return redirect()->back()->with('success', 'Full database backup created successfully!');
        }
    }

    public function download($filename)
    {
        $filePath = storage_path('app/backups/' . $filename);
        if (File::exists($filePath)) {
            return response()->download($filePath);
        }
        return abort(404, "Backup file not found.");
    }
}
