<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\BranchCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BranchCategoryController extends Controller
{
    public function index()
    {
        $categories = BranchCategory::withCount('garages')->get();
        return Inertia::render('SuperAdmin/Categories/Index', [
            'categories' => $categories
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:branch_categories,name',
            'description' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        BranchCategory::create($request->all());

        return redirect()->route('admin.categories.index')->with('success', 'Category created successfully');
    }

    public function update(Request $request, BranchCategory $category)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:branch_categories,name,' . $category->id,
            'description' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        $category->update($request->all());

        return redirect()->route('admin.categories.index')->with('success', 'Category updated successfully');
    }

    public function destroy(BranchCategory $category)
    {
        if ($category->garages()->count() > 0) {
            return redirect()->route('admin.categories.index')->with('error', 'Cannot delete category because it is assigned to garages.');
        }

        $category->delete();

        return redirect()->route('admin.categories.index')->with('success', 'Category deleted successfully');
    }
}
