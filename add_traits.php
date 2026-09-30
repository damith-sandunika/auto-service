<?php
$models = ['Vehicle', 'StaffProfile', 'StaffAttendance', 'SalaryAdvance', 'RegisterSession', 'Payroll', 'Payment', 'Invoice', 'Inspection', 'Estimate', 'CashbookTransaction', 'BankAccount'];
foreach($models as $m) { 
    $p = 'e:\Projects\Done Projects\GarageSaaS\app\Models\\'.$m.'.php'; 
    $c = file_get_contents($p); 
    if (strpos($c, 'BelongsToGarage') === false) { 
        $c = str_replace("use Illuminate\Database\Eloquent\Model;", "use Illuminate\Database\Eloquent\Model;\nuse App\Traits\BelongsToGarage;", $c); 
        $c = preg_replace('/class '.$m.' extends Model\s*\{/', "class $m extends Model\n{\n    use BelongsToGarage;", $c); 
        file_put_contents($p, $c); 
        echo "Updated $m\n"; 
    } 
}
