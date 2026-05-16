<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class MobileApiKeyMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->isMethod('OPTIONS')) {
            return $next($request);
        }

        if (! $request->is('api/mobile*')) {
            return $next($request);
        }

        $expected = config('services.mobile.api_key');
        $provided = (string) $request->header('x-api-key', '');

        if (!is_string($expected) || trim($expected) === '' || trim($provided) === '' || !hash_equals(trim($expected), trim($provided))) {
            return response()->json([
                'message' => 'Invalid mobile API key.',
            ], 401);
        }

        return $next($request);
    }
}
