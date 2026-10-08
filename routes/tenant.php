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

    // Tenant Auth Routes (Prefix: tenant.)
    Route::name('tenant.')->group(function () {
        Route::get('login', [\App\Http\Controllers\Auth\AuthenticatedSessionController::class, 'create'])->name('login');
        Route::post('login', [\App\Http\Controllers\Auth\AuthenticatedSessionController::class, 'store']);
        Route::post('logout', [\App\Http\Controllers\Auth\AuthenticatedSessionController::class, 'destroy'])->name('logout');
    });

    Route::middleware('auth')->group(function () {
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
            
            // Re-using the same controllers for now, they work perfectly fine in the tenant DB context
            Route::resource('staff', \App\Http\Controllers\GarageOwner\StaffController::class);
            Route::resource('inventory', \App\Http\Controllers\GarageOwner\InventoryController::class);
            Route::resource('orders', \App\Http\Controllers\GarageOwner\OrderController::class);
            Route::resource('expenses', \App\Http\Controllers\GarageOwner\ExpenseController::class);
            Route::resource('reports', \App\Http\Controllers\GarageOwner\ReportController::class);
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
            Route::post('pos/checkout', [\App\Http\Controllers\GarageOwner\PosController::class, 'checkout'])->name('pos.checkout');
            
            // Settings
            Route::get('settings', [\App\Http\Controllers\GarageOwner\SettingController::class, 'index'])->name('settings.index');
            Route::post('settings', [\App\Http\Controllers\GarageOwner\SettingController::class, 'update'])->name('settings.update');
            Route::get('settings/invoice', [\App\Http\Controllers\GarageOwner\InvoiceSettingController::class, 'index'])->name('settings.invoice');
            Route::post('settings/invoice', [\App\Http\Controllers\GarageOwner\InvoiceSettingController::class, 'update'])->name('settings.invoice.update');
            Route::get('settings/thermal', [\App\Http\Controllers\GarageOwner\ThermalSettingController::class, 'index'])->name('settings.thermal');
            Route::post('settings/thermal', [\App\Http\Controllers\GarageOwner\ThermalSettingController::class, 'update'])->name('settings.thermal.update');
            
            // Vehicles (Central DB accessed via Tenant Context)
            Route::get('vehicles', [\App\Http\Controllers\GarageOwner\VehicleDirectoryController::class, 'index'])->name('vehicles.index');
            Route::get('vehicles/search', [\App\Http\Controllers\GarageOwner\GlobalVehicleController::class, 'search'])->name('vehicles.search');
        });
        
        // Garage Staff Routes
        Route::middleware('role:garage_staff')->name('staff.')->group(function () {
            Route::get('/staff-dashboard', function() { return inertia('Staff/Dashboard'); })->name('dashboard');
            Route::resource('jobs', \App\Http\Controllers\GarageOwner\JobWorkspaceController::class); // Fallback mapping
        });

        // Vehicle Owner Routes
        Route::middleware('role:vehicle_owner')->name('customer.')->group(function () {
            Route::get('/customer-dashboard', [\App\Http\Controllers\VehicleOwner\HistoryController::class, 'index'])->name('dashboard');
        });
    });
});
