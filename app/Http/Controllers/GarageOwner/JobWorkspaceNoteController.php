<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use App\Models\Job;
use App\Models\JobNote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use App\Traits\JobAccessTrait;

class JobWorkspaceNoteController extends Controller
{
    use JobAccessTrait;
    public function storeNote(Request $request, Job $job)
    {
        $this->checkGarageAccess($job->garage_id);
        $request->validate([
            'title' => 'nullable|string', 
            'content' => 'required|string',
            'color' => 'nullable|string|in:amber,yellow,rose,blue,emerald',
            'is_important' => 'nullable|boolean'
        ]);
        $job->notes()->create([
            'garage_id' => $job->garage_id,
            'user_id' => Auth::id(),
            'title' => $request->title,
            'content' => $request->content,
            'color' => $request->color ?? 'amber',
            'is_important' => $request->is_important ?? false,
        ]);
        return back()->with('success', 'Note added.');
    }

    public function updateNote(Request $request, JobNote $note)
    {
        $this->checkGarageAccess($note->garage_id);
        $request->validate([
            'title' => 'nullable|string', 
            'content' => 'required|string',
            'color' => 'nullable|string|in:amber,yellow,rose,blue,emerald',
            'is_important' => 'nullable|boolean'
        ]);
        $note->update([
            'title' => $request->title,
            'content' => $request->content,
            'color' => $request->color ?? 'amber',
            'is_important' => $request->is_important ?? false,
        ]);
        return back()->with('success', 'Note updated.');
    }

    public function destroyNote(JobNote $note)
    {
        $this->checkGarageAccess($note->garage_id);
        $note->delete();
        return back()->with('success', 'Note deleted.');
    }
}
