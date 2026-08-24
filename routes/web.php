<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Unified Dashboard Dispatcher
    Route::get('/dashboard', function (\Illuminate\Http\Request $request) {
        $role = $request->user()->role;
        if ($role === 'super_admin') {
            return redirect()->route('admin.dashboard');
        } elseif ($role === 'garage_owner') {
            return app(\App\Http\Controllers\GarageOwner\DashboardController::class)->index();
        } elseif ($role === 'garage_staff') {
            return Inertia::render('Staff/Dashboard');
        } elseif ($role === 'vehicle_owner') {
            return app(\App\Http\Controllers\VehicleOwner\HistoryController::class)->index();
        }
        return Inertia::render('Dashboard');
    })->name('dashboard');

    // Super Admin Routes
    Route::middleware('role:super_admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('SuperAdmin/Dashboard');
        })->name('dashboard');
        Route::resource('garages', \App\Http\Controllers\SuperAdmin\GarageController::class);
        Route::resource('users', \App\Http\Controllers\SuperAdmin\UserController::class);
        Route::resource('billings', \App\Http\Controllers\SuperAdmin\BillingController::class);
    });

    // Garage Owner Routes (No URL prefix, but keeping name prefix to avoid breaking links)
    Route::middleware('role:garage_owner')->name('owner.')->group(function () {
        Route::get('/owner-dashboard', [\App\Http\Controllers\GarageOwner\DashboardController::class, 'index'])->name('dashboard'); // Internal name owner.dashboard maps here if explicitly called, but UI should use /dashboard
        Route::post('/dashboard/open-shift', [\App\Http\Controllers\GarageOwner\DashboardController::class, 'openShift'])->name('dashboard.open-shift');
        Route::post('/dashboard/close-shift', [\App\Http\Controllers\GarageOwner\DashboardController::class, 'closeShift'])->name('dashboard.close-shift');
        Route::post('/dashboard/staff/{userId}/in', [\App\Http\Controllers\GarageOwner\DashboardController::class, 'markStaffIn'])->name('dashboard.staff-in');
        Route::post('/dashboard/staff/{userId}/out', [\App\Http\Controllers\GarageOwner\DashboardController::class, 'markStaffOut'])->name('dashboard.staff-out');
        Route::get('pos', [\App\Http\Controllers\GarageOwner\PosController::class, 'index'])->name('pos.index');
        Route::post('pos', [\App\Http\Controllers\GarageOwner\PosController::class, 'store'])->name('pos.store');
        Route::post('pos/register-vehicle', [\App\Http\Controllers\GarageOwner\PosController::class, 'registerVehicle'])->name('pos.register-vehicle');
        Route::resource('staff', \App\Http\Controllers\GarageOwner\StaffController::class);
        Route::resource('inventory', \App\Http\Controllers\GarageOwner\InventoryController::class);
        Route::resource('orders', \App\Http\Controllers\GarageOwner\OrderController::class);
        Route::post('orders/{order}/payments', [\App\Http\Controllers\GarageOwner\OrderController::class, 'addPayment'])->name('orders.payments.store');
        Route::get('orders/{order}/print', [\App\Http\Controllers\GarageOwner\OrderController::class, 'print'])->name('orders.print');
        Route::resource('expenses', \App\Http\Controllers\GarageOwner\ExpenseController::class);
        Route::resource('reports', \App\Http\Controllers\GarageOwner\ReportController::class);
        Route::get('settings', [\App\Http\Controllers\GarageOwner\SettingController::class, 'index'])->name('settings.index');
        Route::post('settings', [\App\Http\Controllers\GarageOwner\SettingController::class, 'update'])->name('settings.update');

        // HR & Payroll
        Route::resource('hr', \App\Http\Controllers\GarageOwner\HRController::class);
        Route::post('hr/staff', [\App\Http\Controllers\GarageOwner\HRController::class, 'storeStaff'])->name('hr.staff.store');
        Route::post('hr/attendance', [\App\Http\Controllers\GarageOwner\HRController::class, 'storeAttendance'])->name('hr.attendance.store');
        Route::post('hr/{id}/advance', [\App\Http\Controllers\GarageOwner\HRController::class, 'storeAdvance'])->name('hr.advance.store');
        Route::get('payroll', [\App\Http\Controllers\GarageOwner\PayrollController::class, 'index'])->name('payroll.index');
        Route::post('payroll', [\App\Http\Controllers\GarageOwner\PayrollController::class, 'store'])->name('payroll.store');

        // Marketing & Reminders
        Route::resource('reminders', \App\Http\Controllers\GarageOwner\ServiceReminderController::class)->names('reminders');

        // Supplier and Purchase Management
        Route::resource('suppliers', \App\Http\Controllers\GarageOwner\SupplierController::class);
        Route::resource('purchases', \App\Http\Controllers\GarageOwner\PurchaseController::class);
        Route::post('suppliers/{supplier}/payments', [\App\Http\Controllers\GarageOwner\SupplierController::class, 'storePayment'])->name('suppliers.payments.store');
        Route::post('supplier-payments/{payment}/status', [\App\Http\Controllers\GarageOwner\SupplierController::class, 'updateChequeStatus'])->name('suppliers.payments.cheque-status');
    });

    // Garage Staff Routes
    Route::middleware('role:garage_staff')->prefix('staff')->name('staff.')->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('Staff/Dashboard');
        })->name('dashboard');
        Route::resource('jobs', \App\Http\Controllers\Staff\JobController::class);
    });

    // Vehicle Owner Routes
    Route::middleware('role:vehicle_owner')->prefix('customer')->name('customer.')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\VehicleOwner\HistoryController::class, 'index'])->name('dashboard');
    });
});

require __DIR__.'/auth.php';
