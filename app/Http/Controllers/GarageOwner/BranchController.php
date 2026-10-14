<?php

namespace App\Http\Controllers\GarageOwner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Garage;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class BranchController extends Controller
{
    public function index(Request $request)
    {
        $query = Garage::where('owner_id', Auth::id());

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $branches = $query->orderBy('id', 'desc')->paginate(15)->withQueryString();

        return Inertia::render('GarageOwner/Branches/Index', [
            'branches' => $branches,
            'filters'  => $request->only('search'),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string',
            'phone' => 'required|string|max:20',
            'tagline' => 'nullable|string',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        DB::beginTransaction();
        try {
            $path = null;
            if ($request->hasFile('logo')) {
                $path = $request->file('logo')->store('logos', 'public');
            }

            Garage::create([
                'owner_id' => Auth::id(),
                'name' => $request->name,
                'address' => $request->address,
                'phone' => $request->phone,
                'tagline' => $request->tagline,
                'logo_path' => $path,
            ]);

            DB::commit();
            return back()->with('success', 'Branch created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to create branch.']);
        }
    }

    public function update(Request $request, Garage $branch)
    {
        if ($branch->owner_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string',
            'phone' => 'required|string|max:20',
            'tagline' => 'nullable|string',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        DB::beginTransaction();
        try {
            $data = $request->only('name', 'address', 'phone', 'tagline');
            if ($request->hasFile('logo')) {
                if ($branch->logo_path) {
                    Storage::disk('public')->delete($branch->logo_path);
                }
                $data['logo_path'] = $request->file('logo')->store('logos', 'public');
            }

            $branch->update($data);
            DB::commit();
            return back()->with('success', 'Branch updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to update branch.']);
        }
    }

    public function destroy(Garage $branch)
    {
        if ($branch->owner_id !== Auth::id()) {
            abort(403);
        }

        DB::beginTransaction();
        try {
            // Re-using the wipe logic from setting controller or similar
            $branch->users()->where('id', '!=', Auth::id())->delete();
            $branch->inventory()->delete();
            $branch->expenses()->delete();
            $branch->appointments()->delete();
            $branch->suppliers()->delete();
            $branch->supplierPayments()->delete();
            $branch->staffAdvances()->delete();
            $branch->payroll()->delete();
            $branch->jobs()->delete();
            $branch->invoices()->delete();
            $branch->payments()->delete();
            $branch->cashbookTransactions()->delete();
            $branch->registerSessions()->delete();

            if ($branch->logo_path) {
                Storage::disk('public')->delete($branch->logo_path);
            }
            $branch->delete();

            DB::commit();
            return back()->with('success', 'Branch deleted successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to delete branch.']);
        }
    }
}
