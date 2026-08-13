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

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Super Admin Routes
    Route::middleware('role:super_admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('SuperAdmin/Dashboard');
        })->name('dashboard');
        Route::resource('garages', \App\Http\Controllers\SuperAdmin\GarageController::class);
        Route::resource('users', \App\Http\Controllers\SuperAdmin\UserController::class);
        Route::resource('billings', \App\Http\Controllers\SuperAdmin\BillingController::class);
    });

    // Garage Owner Routes
    Route::middleware('role:garage_owner')->prefix('owner')->name('owner.')->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('GarageOwner/Dashboard');
        })->name('dashboard');
        Route::get('pos', [\App\Http\Controllers\GarageOwner\PosController::class, 'index'])->name('pos.index');
        Route::post('pos', [\App\Http\Controllers\GarageOwner\PosController::class, 'store'])->name('pos.store');
        Route::post('pos/register-vehicle', [\App\Http\Controllers\GarageOwner\PosController::class, 'registerVehicle'])->name('pos.register-vehicle');
        Route::resource('staff', \App\Http\Controllers\GarageOwner\StaffController::class);
        Route::resource('inventory', \App\Http\Controllers\GarageOwner\InventoryController::class);
        Route::resource('orders', \App\Http\Controllers\GarageOwner\OrderController::class);
        Route::post('orders/{order}/payments', [\App\Http\Controllers\GarageOwner\OrderController::class, 'addPayment'])->name('orders.payments.store');
        Route::get('orders/{order}/print', [\App\Http\Controllers\GarageOwner\OrderController::class, 'print'])->name('orders.print');
        Route::resource('appointments', \App\Http\Controllers\GarageOwner\AppointmentController::class);
        Route::resource('expenses', \App\Http\Controllers\GarageOwner\ExpenseController::class);
        Route::get('reports', [\App\Http\Controllers\GarageOwner\ReportController::class, 'index'])->name('reports.index');
        Route::get('settings', [\App\Http\Controllers\GarageOwner\SettingController::class, 'index'])->name('settings.index');
        Route::post('settings', [\App\Http\Controllers\GarageOwner\SettingController::class, 'update'])->name('settings.update');
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
