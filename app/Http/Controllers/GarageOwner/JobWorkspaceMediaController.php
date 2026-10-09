<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use App\Models\Job;
use App\Models\JobMedia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

use App\Traits\JobAccessTrait;

class JobWorkspaceMediaController extends Controller
{
    use JobAccessTrait;
    public function uploadMedia(Request $request, Job $job)
    {
        $this->checkGarageAccess($job->garage_id);

        $request->validate([
            'media' => 'required|file|mimes:mp4,mov,avi,jpeg,png,jpg|max:51200', // max 50MB
        ]);

        try {
            $file = $request->file('media');
            $extension = $file->getClientOriginalExtension();
            $fileType = in_array(strtolower($extension), ['mp4', 'mov', 'avi']) ? 'video' : 'image';
            
            // Generate a random path
            $path = $file->store('job_media/' . $job->id, 'public'); 

            $job->media()->create([
                'garage_id' => $job->garage_id,
                'file_path' => $path,
                'file_type' => $fileType,
            ]);

            return back()->with('success', 'Media uploaded successfully.');
        } catch (\Exception $e) {
            Log::error('Media Upload Error', ['error' => $e->getMessage()]);
            return back()->withErrors(['error' => 'Failed to upload media.']);
        }
    }

    public function deleteMedia(JobMedia $media)
    {
        $this->checkGarageAccess($media->garage_id);

        try {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($media->file_path);
            $media->delete();
            return back()->with('success', 'Media deleted.');
        } catch (\Exception $e) {
            Log::error('Media Delete Error', ['error' => $e->getMessage()]);
            return back()->withErrors(['error' => 'Failed to delete media.']);
        }
    }
}
