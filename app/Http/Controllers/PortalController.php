<?php

namespace App\Http\Controllers;

use App\Support\Menu\MenuAccess;
use App\Support\Menu\MigratedMenuRoutes;
use App\Support\Ui\ErpPage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Ivandzb\UiKit\Component\Card;
use Ivandzb\UiKit\Html;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class PortalController extends Controller
{
    public function home(Request $request, ErpPage $pages): Response
    {
        return $pages->render('Inicio', Card::make('ERP Utilities')->add(
            Html::p('Base de aplicaciones corporativas. Seleccione una opción del menú.'),
            Html::p('Solo se muestran las opciones migradas y habilitadas para su usuario.')
        ), $request->user());
    }

    public function option(Request $request, int $item, MenuAccess $access): RedirectResponse
    {
        $permissions = $access->permissions($request->user(), $item);
        abort_unless($permissions['view'], 403);
        $record = DB::table('menu_items')->find($item);

        return redirect(app(MigratedMenuRoutes::class)->url($record->migration_key));
    }

    public function open(Request $request, int $item, MenuAccess $access): RedirectResponse
    {
        abort_unless($access->permissions($request->user(), $item)['view'], 403);
        $record = DB::table('menu_items')->find($item);
        $target = app(MigratedMenuRoutes::class)->url($record->migration_key);
        abort_unless($target, 422);

        return redirect($target);
    }

    public function permissions(Request $request, int $item, MenuAccess $access): JsonResponse
    {
        $permissions = $access->permissions($request->user(), $item);
        abort_unless(in_array(true, $permissions, true), 403);

        return response()->json(['item' => $item, 'permissions' => $permissions]);
    }

    public function asset(string $package, string $asset): BinaryFileResponse
    {
        abort_unless(in_array($package, ['crud-kit', 'ui-kit'], true), 404);
        abort_unless(preg_match('/^[a-z0-9-]+\\.(js|css|woff2)(\\.map)?$/', $asset) === 1, 404);
        abort_if(str_ends_with($asset, '.map') && ! app()->environment('local'), 404);
        $path = base_path('packages/'.$package.'/assets/quasar/'.$asset);
        abort_unless(is_file($path), 404);
        $type = match (pathinfo($path, PATHINFO_EXTENSION)) {
            'js' => 'application/javascript', 'css' => 'text/css', 'woff2' => 'font/woff2', default => 'application/json',
        };

        return response()->file($path, ['Content-Type' => $type, 'Cache-Control' => 'no-cache']);
    }
}
