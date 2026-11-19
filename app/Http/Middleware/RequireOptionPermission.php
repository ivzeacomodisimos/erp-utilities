<?php

namespace App\Http\Middleware;

use App\Support\Menu\MenuAccess;
use App\Support\Menu\OptionAccess;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class RequireOptionPermission
{
    public function handle(Request $request, Closure $next, string $menuKey, string $module, string $file, string $option, string $operation = 'access'): Response
    {
        $user = $request->user();
        $item = DB::table('menu_items')->where('migration_key', $menuKey)->first();
        $menuOperation = ['access' => 'view', 'read' => 'view', 'insert' => 'create', 'write' => 'update', 'delete' => 'delete'][$operation] ?? null;
        $menuPermissions = $user && $item ? app(MenuAccess::class)->permissions($user, $item->id) : [];
        abort_unless(ctype_digit($option) && $user && $item
            && ($menuPermissions['view'] ?? false) && ($menuPermissions[$menuOperation ?? ''] ?? false)
            && app(OptionAccess::class)->allows($user, $module, $file, (int) $option, $operation), 403,
            'No tiene permiso para esta opción u operación.');

        return $next($request);
    }
}
