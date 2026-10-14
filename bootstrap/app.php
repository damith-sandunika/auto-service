<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'role' => \App\Http\Middleware\RoleMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        $exceptions->render(function (\Illuminate\Http\Exceptions\PostTooLargeException $e, Request $request) {
            return back()->withErrors(['media' => 'The uploaded video is too large. Maximum size allowed by server is ' . ini_get('post_max_size') . 'B.']);
        });

        $exceptions->render(function (\Throwable $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                $incidentId = \Illuminate\Support\Str::uuid()->toString();
                \Illuminate\Support\Facades\Log::error("Unhandled Exception [{$incidentId}]: " . $e->getMessage(), [
                    'exception' => $e,
                    'url' => $request->fullUrl(),
                    'user_id' => \Illuminate\Support\Facades\Auth::id(),
                ]);

                $message = config('app.debug') 
                    ? $e->getMessage() 
                    : 'A server error occurred. Please contact support with incident reference: ' . $incidentId;

                return response()->json([
                    'error' => true,
                    'message' => $message,
                    'incident_id' => $incidentId,
                ], 500);
            }
        });
    })->create();
