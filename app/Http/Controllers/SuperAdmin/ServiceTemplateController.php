<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\BranchCategory;
use App\Models\ServiceTemplate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServiceTemplateController extends Controller
{
    public function index()
    {
        $templates = ServiceTemplate::with('category')->get();
        $categories = BranchCategory::where('is_active', true)->get();

        return Inertia::render('SuperAdmin/ServiceTemplates/Index', [
            'templates' => $templates,
            'categories' => $categories
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'branch_category_id' => 'required|exists:branch_categories,id',
            'service_name' => 'required|string|max:255',
            'default_price' => 'nullable|numeric|min:0',
            'estimated_time_minutes' => 'nullable|integer|min:0',
            'is_active' => 'boolean'
        ]);

        ServiceTemplate::create($request->all());

        return redirect()->route('admin.templates.index')->with('success', 'Service template created successfully');
    }

    public function update(Request $request, ServiceTemplate $template)
    {
        $request->validate([
            'branch_category_id' => 'required|exists:branch_categories,id',
            'service_name' => 'required|string|max:255',
            'default_price' => 'nullable|numeric|min:0',
            'estimated_time_minutes' => 'nullable|integer|min:0',
            'is_active' => 'boolean'
        ]);

        $template->update($request->all());

        return redirect()->route('admin.templates.index')->with('success', 'Service template updated successfully');
    }

    public function destroy(ServiceTemplate $template)
    {
        $template->delete();
        return redirect()->route('admin.templates.index')->with('success', 'Service template deleted successfully');
    }
}
