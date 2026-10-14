<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

foreach (config('tenancy.central_domains') as $domain) {
    Route::domain($domain)->group(function () {
        
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

            Route::get('/dashboard', function (\Illuminate\Http\Request $request) {
                if ($request->user()->role === 'saas_admin') {
                    return redirect()->route('saas.dashboard');
                }
                return Inertia::render('Dashboard');
            })->name('dashboard');

            // SaaS Admin Routes
            Route::middleware('role:saas_admin')->prefix('admin')->name('saas.')->group(function () {
                Route::get('/dashboard', [\App\Http\Controllers\SaasAdmin\DashboardController::class, 'index'])->name('dashboard');
                Route::get('/companies', [\App\Http\Controllers\SaasAdmin\CompanyController::class, 'index'])->name('companies.index');
                Route::post('/companies', [\App\Http\Controllers\SaasAdmin\CompanyController::class, 'store'])->name('companies.store');
                
                // Company Owners
                Route::get('/owners', [\App\Http\Controllers\SaasAdmin\OwnerController::class, 'index'])->name('owners.index');
                Route::post('/owners', [\App\Http\Controllers\SaasAdmin\OwnerController::class, 'store'])->name('owners.store');
                Route::put('/owners/{owner}', [\App\Http\Controllers\SaasAdmin\OwnerController::class, 'update'])->name('owners.update');
                Route::delete('/owners/{owner}', [\App\Http\Controllers\SaasAdmin\OwnerController::class, 'destroy'])->name('owners.destroy');
                
                // Subscriptions / Billing
                Route::get('/subscriptions', [\App\Http\Controllers\SuperAdmin\BillingController::class, 'index'])->name('subscriptions.index');
                Route::post('/subscriptions', [\App\Http\Controllers\SuperAdmin\BillingController::class, 'store'])->name('subscriptions.store');
                
                // Vehicle Master & Global Vehicles (Central Database)
                Route::get('vehicle-master', [\App\Http\Controllers\SuperAdmin\VehicleMasterController::class, 'index'])->name('vehicle-master.index');
                Route::get('vehicles', [\App\Http\Controllers\SuperAdmin\VehicleMasterController::class, 'index'])->name('vehicles.index');
                Route::post('vehicle-master/makes', [\App\Http\Controllers\SuperAdmin\VehicleMasterController::class, 'storeMake'])->name('vehicle-master.makes.store');
                Route::post('vehicle-master/models', [\App\Http\Controllers\SuperAdmin\VehicleMasterController::class, 'storeModel'])->name('vehicle-master.models.store');
                Route::post('vehicle-master/vehicles', [\App\Http\Controllers\SuperAdmin\VehicleMasterController::class, 'storeVehicle'])->name('vehicle-master.vehicles.store');
            });
        });

        require __DIR__.'/auth.php';
        
    });
}
