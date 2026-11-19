<?php

namespace App\Http\Middleware;

use App\Support\Menu\ManagedApplicationRoutes;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LoadManagedApplicationRoutes
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->is('up', 'login', 'desarrollo/assets/*')) {
            app(ManagedApplicationRoutes::class)->load();
        }

        return $next($request);
    }
}
