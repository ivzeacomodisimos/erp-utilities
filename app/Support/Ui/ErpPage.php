<?php

namespace App\Support\Ui;

use App\Models\User;
use App\Support\Menu\MenuAccess;
use App\Support\Menu\MigratedMenuRoutes;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Ivandzb\UiKit\Component\Button;
use Ivandzb\UiKit\Component\Menu;
use Ivandzb\UiKit\Component\MenuItem;
use Ivandzb\UiKit\Html;
use Ivandzb\UiKit\Theme\CorporateTheme;
use Ivandzb\UiKit\UiKit;

class ErpPage
{
    public function render(string $title, mixed $content, ?User $user = null, int $status = 200, array $scripts = []): Response
    {
        $theme = CorporateTheme::make()->brand('ERP Utilities', route('dashboard'))->primaryColor('#17685d');
        if ($user) {
            $menu = Menu::make()->searchable('Buscar opción')->items(MenuItem::make('Inicio', route('dashboard'))->icon('home'));
            foreach (app(MenuAccess::class)->tree($user) as $item) {
                $menu->items($item);
            }
            $administration = [];
            if ($user->can('menu.manage')) {
                $administration[] = MenuItem::make('Menú', route('access.manage', 'menu'))->icon('menu');
                $administration[] = MenuItem::make('Rutas del menú', route('access.routes'))->icon('route');
                $administration[] = MenuItem::make('Registro de rutas', route('access.programs'))->icon('add_link');
                if (in_array('administrador', $user->erp_roles ?? [], true)) {
                    $administration[] = MenuItem::make('Crear programa', route('access.generator'))->icon('add_box');
                    $administration[] = MenuItem::make('Asistente de alta', route('access.generator.wizard'))->icon('playlist_add_check');
                }
            }
            $bindings = DB::table('menu_items')->whereNotNull('migration_key')->get()->keyBy('migration_key');
            $registry = app(MigratedMenuRoutes::class);
            $options = $registry->options();
            foreach (['access.permissions', 'access.users', 'systems.empleados', 'systems.tipos-documento', 'access.options', 'systems.objetos', 'systems.objetos-usuarios'] as $key) {
                $item = $bindings->get($key);
                if ($item && app(MenuAccess::class)->permissions($user, $item->id)['view']) {
                    $administration[] = MenuItem::make($options[$key]['label'], $registry->url($key));
                }
            }
            if ($administration !== []) {
                $menu->items(MenuItem::make('Administración')->icon('settings')->items(...$administration));
            }
            $theme->menu($menu)->user($user->name);
        }
        $toolbar = $user ? Html::form(route('logout'), 'post', Html::input('hidden', '_token', csrf_token()),
            Button::make('Cerrar sesión')->type('submit')->icon('logout')->outline()) : null;
        $page = $theme->content($toolbar, Html::h(1, $title), $content)->footer('ERP Utilities · Comodísimos')
            ->page(UiKit::make('/desarrollo/assets/ui-kit', 'quasar'), $title);
        $page->css('.erp-login{max-width:460px;margin:24px auto}.erp-field{display:flex;flex-direction:column;gap:7px;margin-bottom:20px}.erp-input{width:100%;box-sizing:border-box;border:1px solid #a4b5b1;border-radius:8px;padding:14px;font:inherit}.erp-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px}');
        foreach ($scripts as $script) {
            $page->script(asset($script));
        }

        return response($page->getHtml(), $status)->header('Cache-Control', 'no-store');
    }
}
