<?php

$dir = __DIR__ . '/../../app/Http/Controllers/GarageOwner';
$files = glob($dir . '/*.php');

foreach ($files as $file) {
    $content = file_get_contents($file);
    $originalContent = $content;

    // 1. Add JobAccessTrait if not present
    if (strpos($content, 'use App\Traits\JobAccessTrait;') === false) {
        $content = preg_replace('/use Illuminate\\\\Http\\\\Request;/', "use Illuminate\\Http\\Request;\nuse App\\Traits\\JobAccessTrait;", $content);
    }
    if (strpos($content, 'use JobAccessTrait;') === false) {
        $content = preg_replace('/class\s+[a-zA-Z0-9_]+\s+extends\s+Controller\s*\{/', "$0\n    use JobAccessTrait;", $content);
    }

    // 2. Replace where('garage_id', Auth::user()->garage_id)->findOrFail($id)
    $content = preg_replace(
        '/\\$([a-zA-Z0-9_]+)\s*=\s*([a-zA-Z0-9_]+)::with\(\[([^\]]+)\]\)->where\(\'garage_id\',\s*Auth::user\(\)->garage_id\)->findOrFail\(\\$([a-zA-Z0-9_]+)\);/',
        "\$$1 = $2::with([$3])->findOrFail(\$$4);\n        \$this->checkGarageAccess(\$$1->garage_id);",
        $content
    );
    
    $content = preg_replace(
        '/\\$([a-zA-Z0-9_]+)\s*=\s*([a-zA-Z0-9_]+)::where\(\'garage_id\',\s*Auth::user\(\)->garage_id\)->findOrFail\(\\$([a-zA-Z0-9_]+)\);/',
        "\$$1 = $2::findOrFail(\$$3);\n        \$this->checkGarageAccess(\$$1->garage_id);",
        $content
    );

    $content = preg_replace(
        '/\\$([a-zA-Z0-9_]+)\s*=\s*([a-zA-Z0-9_]+)::where\(\'garage_id\',\s*\\$garageId\)->findOrFail\(\\$([a-zA-Z0-9_]+)\);/',
        "\$$1 = $2::findOrFail(\$$3);\n        \$this->checkGarageAccess(\$$1->garage_id);",
        $content
    );

    // 3. Replace where('garage_id', Auth::user()->garage_id)->firstOrFail()
    $content = preg_replace(
        '/\\$([a-zA-Z0-9_]+)\s*=\s*([a-zA-Z0-9_]+)::where\(\'garage_id\',\s*Auth::user\(\)->garage_id\)->firstOrFail\(\);/',
        "\$$1 = $2::where('garage_id', \$this->getGarageId(request()))->firstOrFail();",
        $content
    );

    // 4. Replace other occurrences of Auth::user()->garage_id
    $content = str_replace('Auth::user()->garage_id', '$this->getGarageId(request())', $content);

    if ($content !== $originalContent) {
        file_put_contents($file, $content);
        echo "Updated: " . basename($file) . "\n";
    }
}
echo "Done.\n";
