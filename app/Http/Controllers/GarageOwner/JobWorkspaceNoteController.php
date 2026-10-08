<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use App\Models\Job;
use App\Models\JobNote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class JobWorkspaceNoteController extends Controller
{
    public function storeNote(Request $request, Job $job)
    {
        if ($job->garage_id !== Auth::user()->garage_id) {
            abort(403);
        }
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
        if ($note->garage_id !== Auth::user()->garage_id) {
            abort(403);
        }
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
        if ($note->garage_id !== Auth::user()->garage_id) {
            abort(403);
        }
        $note->delete();
        return back()->with('success', 'Note deleted.');
    }
}
