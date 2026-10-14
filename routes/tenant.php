<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomain;
use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;
use Inertia\Inertia;
use Illuminate\Http\Request;

Route::middleware([
    'web',
    InitializeTenancyByDomain::class,
    PreventAccessFromCentralDomains::class,
])->group(function () {
    Route::get('/', function () {
        return Inertia::render('Welcome', [
            'canLogin' => Route::has('tenant.login'),
            'canRegister' => false,
            'laravelVersion' => \Illuminate\Foundation\Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ]);
    });

    // Serve Tenant Storage Files safely
    Route::get('/tenant-media/{path}', function ($path) {
        $baseDir = realpath(storage_path('app/public'));
        if (!$baseDir) {
            abort(404);
        }

        $cleanRelativePath = str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $path);
        $fullPath = realpath($baseDir . DIRECTORY_SEPARATOR . $cleanRelativePath);

        // Disallow path traversal outside app/public
        if (!$fullPath || !str_starts_with($fullPath, $baseDir) || !is_file($fullPath)) {
            abort(404);
        }

        return response()->file($fullPath);
    })->where('path', '[a-zA-Z0-9_\-\./]+');

    // Tenant Auth Routes (Prefix: tenant.)
    Route::name('tenant.')->group(function () {
        Route::get('login', [\App\Http\Controllers\Auth\AuthenticatedSessionController::class, 'create'])->name('login');
        Route::post('login', [\App\Http\Controllers\Auth\AuthenticatedSessionController::class, 'store'])->middleware('throttle:6,1');
        Route::post('logout', [\App\Http\Controllers\Auth\AuthenticatedSessionController::class, 'destroy'])->name('logout');
    });

    Route::middleware(['auth', 'throttle:180,1'])->group(function () {
        Route::get('/dashboard', function (Request $request) {
            $role = $request->user()->role;
            if ($role === 'company_owner') {
                return app()->call(\App\Http\Controllers\GarageOwner\DashboardController::class . '@index');
            } elseif (in_array($role, ['branch_admin', 'staff', 'accountant', 'hr_manager'])) {
                return Inertia::render('Staff/Dashboard');
            } elseif ($role === 'vehicle_owner') {
                return app()->call(\App\Http\Controllers\VehicleOwner\HistoryController::class . '@index');
            }
            return Inertia::render('Dashboard');
        })->name('tenant.dashboard');

        // Copy GarageOwner (CompanyOwner/BranchAdmin) routes here
        Route::middleware('role:company_owner,branch_admin')->name('owner.')->group(function () {
            Route::get('/owner-dashboard', [\App\Http\Controllers\GarageOwner\DashboardController::class, 'index'])->name('dashboard');
            Route::post('/owner-dashboard/open-shift', [\App\Http\Controllers\GarageOwner\DashboardController::class, 'openShift'])->name('dashboard.open-shift');
            Route::post('/owner-dashboard/close-shift', [\App\Http\Controllers\GarageOwner\DashboardController::class, 'closeShift'])->name('dashboard.close-shift');
            Route::post('/owner-dashboard/staff/{userId}/mark-in', [\App\Http\Controllers\GarageOwner\DashboardController::class, 'markStaffIn'])->name('dashboard.staff.mark-in');
            Route::post('/owner-dashboard/staff/{userId}/mark-out', [\App\Http\Controllers\GarageOwner\DashboardController::class, 'markStaffOut'])->name('dashboard.staff.mark-out');
            
            Route::resource('branches', \App\Http\Controllers\GarageOwner\BranchController::class);
            Route::post('branches/switch', function (Request $request) {
                $request->validate(['branch_id' => 'required|exists:garages,id']);
                if ($request->user()->role === 'company_owner') {
                    $branch = \App\Models\Garage::where('id', $request->branch_id)->where('owner_id', $request->user()->id)->firstOrFail();
                    session(['active_branch_id' => $branch->id]);
                    return back()->with('success', "Active branch switched to {$branch->name}.");
                }
                return back();
            })->name('branches.switch');
            Route::resource('staff', \App\Http\Controllers\GarageOwner\StaffController::class);
            Route::resource('inventory-locations', \App\Http\Controllers\GarageOwner\InventoryLocationController::class);
            Route::resource('inventory', \App\Http\Controllers\GarageOwner\InventoryController::class);
            Route::get('jobs/{job}/print', [\App\Http\Controllers\GarageOwner\JobWorkspaceController::class, 'print'])->name('jobs.print');
            Route::resource('jobs', \App\Http\Controllers\GarageOwner\JobWorkspaceController::class);
            
            // Workspace APIs
            Route::post('jobs/{job}/complete', [\App\Http\Controllers\GarageOwner\JobWorkspacePaymentController::class, 'complete'])->name('jobs.complete');
            Route::post('jobs/{job}/payment', [\App\Http\Controllers\GarageOwner\JobWorkspacePaymentController::class, 'addPayment'])->name('jobs.payment.store');
            Route::patch('jobs/{job}/discount', [\App\Http\Controllers\GarageOwner\JobWorkspacePaymentController::class, 'updateDiscount'])->name('jobs.discount.update');
            Route::post('jobs/{job}/items', [\App\Http\Controllers\GarageOwner\JobWorkspaceItemController::class, 'addItem'])->name('jobs.items.store');
            Route::delete('jobs/items/{item}', [\App\Http\Controllers\GarageOwner\JobWorkspaceItemController::class, 'removeItem'])->name('jobs.items.destroy');
            Route::patch('jobs/items/{item}/quantity', [\App\Http\Controllers\GarageOwner\JobWorkspaceItemController::class, 'updateQuantity'])->name('jobs.items.quantity');
            Route::post('jobs/{job}/notes', [\App\Http\Controllers\GarageOwner\JobWorkspaceNoteController::class, 'storeNote'])->name('jobs.notes.store');
            Route::patch('jobs/notes/{note}', [\App\Http\Controllers\GarageOwner\JobWorkspaceNoteController::class, 'updateNote'])->name('jobs.notes.update');
            Route::delete('jobs/notes/{note}', [\App\Http\Controllers\GarageOwner\JobWorkspaceNoteController::class, 'destroyNote'])->name('jobs.notes.destroy');
            Route::post('jobs/{job}/media', [\App\Http\Controllers\GarageOwner\JobWorkspaceMediaController::class, 'uploadMedia'])->name('jobs.media.store');
            Route::delete('jobs/media/{media}', [\App\Http\Controllers\GarageOwner\JobWorkspaceMediaController::class, 'deleteMedia'])->name('jobs.media.destroy');
            Route::get('orders/{order}/print', [\App\Http\Controllers\GarageOwner\OrderController::class, 'print'])->name('orders.print');
            Route::resource('orders', \App\Http\Controllers\GarageOwner\OrderController::class);
            Route::post('orders/{order}/payments', [\App\Http\Controllers\GarageOwner\OrderController::class, 'addPayment'])->name('orders.payments.store');
            Route::patch('orders/{order}/payments/{payment}', [\App\Http\Controllers\GarageOwner\OrderController::class, 'updatePayment'])->name('orders.payments.update');
            Route::patch('orders/{order}/items/{item}', [\App\Http\Controllers\GarageOwner\OrderController::class, 'updateItem'])->name('orders.items.update');
            Route::delete('orders/{order}/items/{item}', [\App\Http\Controllers\GarageOwner\OrderController::class, 'deleteItem'])->name('orders.items.destroy');
            Route::resource('expenses', \App\Http\Controllers\GarageOwner\ExpenseController::class);
            Route::get('reports/export', [\App\Http\Controllers\GarageOwner\ReportController::class, 'exportCsv'])->name('reports.export');
            Route::resource('reports', \App\Http\Controllers\GarageOwner\ReportController::class);
            Route::get('hr-dashboard', [\App\Http\Controllers\GarageOwner\HRDashboardController::class, 'index'])->name('hr.dashboard');
            Route::resource('hr', \App\Http\Controllers\GarageOwner\HRController::class);
            Route::get('payroll', [\App\Http\Controllers\GarageOwner\PayrollController::class, 'index'])->name('payroll.index');
            Route::post('payroll', [\App\Http\Controllers\GarageOwner\PayrollController::class, 'store'])->name('payroll.store');
            Route::resource('appointments', \App\Http\Controllers\GarageOwner\AppointmentController::class);
            Route::resource('reminders', \App\Http\Controllers\GarageOwner\ServiceReminderController::class);
            Route::resource('estimates', \App\Http\Controllers\GarageOwner\EstimateController::class);
            Route::resource('suppliers', \App\Http\Controllers\GarageOwner\SupplierController::class);
            Route::resource('purchases', \App\Http\Controllers\GarageOwner\PurchaseController::class);
            Route::resource('inspections', \App\Http\Controllers\GarageOwner\InspectionController::class);
            Route::resource('warranties', \App\Http\Controllers\GarageOwner\WarrantyController::class);
            
            // Finance / Cashbook
            Route::get('finance', [\App\Http\Controllers\GarageOwner\FinanceController::class, 'index'])->name('finance.index');
            Route::post('finance/bank-accounts', [\App\Http\Controllers\GarageOwner\FinanceController::class, 'storeBankAccount'])->name('finance.bank-accounts.store');
            Route::post('finance/transactions', [\App\Http\Controllers\GarageOwner\FinanceController::class, 'storeTransaction'])->name('finance.transactions.store');
            
            // POS
            Route::get('pos', [\App\Http\Controllers\GarageOwner\PosController::class, 'index'])->name('pos.index');
            Route::post('pos/store-job', [\App\Http\Controllers\GarageOwner\PosController::class, 'storeJob'])->name('pos.storeJob');
            Route::patch('pos/jobs/{id}/state', [\App\Http\Controllers\GarageOwner\PosController::class, 'updateState'])->name('pos.updateState');
            Route::post('pos/jobs/{id}/done', [\App\Http\Controllers\GarageOwner\PosController::class, 'markDone'])->name('pos.markDone');
            
            // Settings
            Route::get('settings', [\App\Http\Controllers\GarageOwner\SettingController::class, 'index'])->name('settings.index');
            Route::post('settings', [\App\Http\Controllers\GarageOwner\SettingController::class, 'update'])->name('settings.update');
            Route::delete('settings/wipe', [\App\Http\Controllers\GarageOwner\SettingController::class, 'wipeBranch'])->name('settings.wipe');
            Route::get('settings/danger-zone', [\App\Http\Controllers\GarageOwner\SettingController::class, 'dangerZone'])->name('settings.danger-zone');
            Route::get('settings/invoice', [\App\Http\Controllers\GarageOwner\InvoiceSettingController::class, 'edit'])->name('settings.invoice');
            Route::post('settings/invoice', [\App\Http\Controllers\GarageOwner\InvoiceSettingController::class, 'update'])->name('settings.invoice.update');
            Route::get('settings/thermal', [\App\Http\Controllers\GarageOwner\ThermalSettingController::class, 'edit'])->name('settings.thermal');
            Route::post('settings/thermal', [\App\Http\Controllers\GarageOwner\ThermalSettingController::class, 'update'])->name('settings.thermal.update');
            
            // Roles & Permissions
            Route::get('roles', [\App\Http\Controllers\GarageOwner\RoleController::class, 'index'])->name('roles.index');
            Route::get('roles/create', [\App\Http\Controllers\GarageOwner\RoleController::class, 'create'])->name('roles.create');
            Route::post('roles', [\App\Http\Controllers\GarageOwner\RoleController::class, 'store'])->name('roles.store');
            Route::get('roles/{role}/edit', [\App\Http\Controllers\GarageOwner\RoleController::class, 'edit'])->name('roles.edit');
            Route::put('roles/{role}', [\App\Http\Controllers\GarageOwner\RoleController::class, 'update'])->name('roles.update');
            Route::delete('roles/{role}', [\App\Http\Controllers\GarageOwner\RoleController::class, 'destroy'])->name('roles.destroy');
            
            // Vehicles (Central DB accessed via Tenant Context)
            Route::get('vehicles', [\App\Http\Controllers\GarageOwner\VehicleDirectoryController::class, 'index'])->name('vehicles.index');
            Route::get('vehicles/search', [\App\Http\Controllers\GarageOwner\GlobalVehicleController::class, 'search'])->name('vehicles.search');
        });
        
        // Garage Staff Routes
        Route::prefix('staff')->middleware('role:garage_staff')->name('staff.')->group(function () {
            Route::get('/dashboard', function() { return inertia('Staff/Dashboard'); })->name('dashboard');
            Route::resource('jobs', \App\Http\Controllers\GarageOwner\JobWorkspaceController::class); // Fallback mapping
        });

        // Vehicle Owner Routes
        Route::middleware('role:vehicle_owner')->name('customer.')->group(function () {
            Route::get('/customer-dashboard', [\App\Http\Controllers\VehicleOwner\HistoryController::class, 'index'])->name('dashboard');
        });
    });
});
