<?php

namespace App\Http\Middleware;

use App\Support\Menu\ManagedApplicationRoutes;
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
        $registry = app(MigratedMenuRoutes::class);
        $managed = $request->route()->getAction(ManagedApplicationRoutes::MARKER);
        if ($managed) {
            abort_unless(DB::table('managed_application_routes')->where('id', $managed)->where('active', true)->exists(), 403, 'Esta ruta está inactiva.');
        }
        $action = DB::table('menu_route_actions')->where('route_name', $request->route()?->getName())->first();
        if ($action) {
            $permissions = $request->user() ? app(MenuAccess::class)->permissions($request->user(), $action->menu_item_id) : [];
            abort_unless(($permissions['view'] ?? false) && ($permissions[$action->operation] ?? false), 403, 'No tiene permiso para esta acción del menú.');
            $request->attributes->set('erp.menu_id', $action->menu_item_id);

            return $next($request);
        }
        $key = $registry->matchingKey($request);
        if ($key !== null) {
            $item = DB::table('menu_items')->where('migration_key', $key)->first();
            abort_unless($item && $request->user()
                && app(MenuAccess::class)->permissions($request->user(), $item->id)['view'], 403,
                'Esta opción no está habilitada en ERP o no tiene acceso.');
            $request->attributes->set('erp.menu_id', $item->id);
            if (str_starts_with($key, 'menu.') && ! $request->isMethodSafe()) {
                $crudProgram = $request->route()->getAction('_erp_generated_crud');
                if ($crudProgram) {
                    abort_unless($request->isMethod('POST') && $request->query('crud') === 'generated-program-'.$crudProgram, 405);
                    $operation = match ($request->query('action')) {
                        'list', 'autocomplete' => 'view', 'create' => 'create', 'update' => 'update', 'delete' => 'delete', default => null,
                    };
                } else {
                    $operation = match ($request->method()) {
                        'POST' => 'create', 'PUT', 'PATCH' => 'update', 'DELETE' => 'delete', default => null,
                    };
                }
                abort_unless($operation && app(MenuAccess::class)->permissions($request->user(), $item->id)[$operation], 403);
            }
        } elseif (! $registry->isInfrastructure($request)) {
            $explicit = array_filter($request->route()->gatherMiddleware(), fn (string $middleware): bool => str_starts_with($middleware, 'erp.option:') || str_starts_with($middleware, 'erp.permission:'));
            abort_unless($explicit !== [], 403, 'Esta ruta todavía no tiene un menú y permisos asociados.');
        }

        return $next($request);
    }
}
