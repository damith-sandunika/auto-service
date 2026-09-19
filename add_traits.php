<?php
$models = glob('app/Models/*.php');
foreach ($models as $file) {
    $content = file_get_contents($file);
    if (strpos($content, "'garage_id'") !== false || strpos($content, '"garage_id"') !== false) {
        if (strpos($content, 'BelongsToGarage') === false) {
            // Needs trait!
            // insert `use App\Traits\BelongsToGarage;` after `namespace App\Models;`
            $content = preg_replace('/namespace App\\\\Models;/', "namespace App\\Models;\n\nuse App\\Traits\\BelongsToGarage;", $content);
            // insert `use BelongsToGarage;` inside class
            if (strpos($content, 'use HasFactory;') !== false) {
                 $content = preg_replace('/use HasFactory;/', "use HasFactory, BelongsToGarage;", $content);
            } else {
                 $content = preg_replace('/class [a-zA-Z0-9_]+ extends Model\s*\{/', "$0\n    use BelongsToGarage;", $content);
            }
            file_put_contents($file, $content);
            echo "Added trait to $file\n";
        }
    }
}
