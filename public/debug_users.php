<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$owners = [];
foreach (\App\Models\Tenant::all() as $tenant) {
    try {
        tenancy()->initialize($tenant);
        $tenantOwners = \App\Models\User::all();
        foreach ($tenantOwners as $owner) {
            $owner->setAttribute('garage', [
                'id' => $tenant->id,
                'name' => $tenant->company_name ?? $tenant->id
            ]);
            $owner->setAttribute('garage_id', $tenant->id);
            $owners[] = $owner->toArray();
        }
        tenancy()->end();
    } catch (\Exception $e) {
        // ...
    }
}
echo json_encode($owners, JSON_PRETTY_PRINT);
