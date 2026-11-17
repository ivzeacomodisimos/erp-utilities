<?php

namespace App\Http\Middleware;

use App\Support\Menu\MenuAccess;
use App\Support\Menu\MigratedMenuRoutes;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class EnsureMenuEnabled
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $key = app(MigratedMenuRoutes::class)->matchingKey($request);
        if ($key !== null) {
            $item = DB::table('menu_items')->where('migration_key', $key)->first();
            abort_unless($item && $request->user()
                && app(MenuAccess::class)->permissions($request->user(), $item->id)['view'], 403,
                'Esta opción no está habilitada en ERP o no tiene acceso.');
        }

        return $next($request);
    }
}
