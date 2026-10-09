<?php
use App\Models\User;
use App\Models\Garage;
use Illuminate\Http\Request;

echo "--- Testing Access ---\n";

// Find company owner
$companyOwner = User::where('role', 'company_owner')->first();
echo "Found Company Owner: " . ($companyOwner ? $companyOwner->name : 'None') . "\n";

if ($companyOwner) {
    Auth::login($companyOwner);
    $garages = Garage::where('owner_id', $companyOwner->id)->get();
    echo "Garages Owned: " . $garages->count() . "\n";

    // Simulate Request
    $request = new Request();
    $request->merge(['branch_id' => $garages->last()->id]);

    $controller = app(\App\Http\Controllers\GarageOwner\PosController::class);
    // Since we don't have a real route, just test if it crashes
    echo "Testing PosController@index...\n";
    try {
        $response = $controller->index($request);
        echo "PosController@index OK!\n";
    } catch (\Exception $e) {
        echo "Error in PosController: " . $e->getMessage() . "\n";
    }

    echo "Testing DashboardController@index...\n";
    try {
        $dashController = app(\App\Http\Controllers\GarageOwner\DashboardController::class);
        $dashController->index($request);
        echo "DashboardController@index OK!\n";
    } catch (\Exception $e) {
        echo "Error in DashboardController: " . $e->getMessage() . "\n";
    }
}
