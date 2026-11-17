<?php

namespace App\Http\Controllers;

use App\Support\Kits\AccessDataSource;
use App\Support\Kits\AdminKitPermissions;
use App\Support\Menu\MigratedMenuRoutes;
use App\Support\Ui\ErpPage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Ivandzb\CrudKit\CrudKit;
use Ivandzb\CrudKit\Definition\Crud;
use Ivandzb\CrudKit\Definition\Field;
use Ivandzb\CrudKit\Ports\FileTranslator;
use Ivandzb\UiKit\Component\Alert;
use Ivandzb\UiKit\Component\Card;
use Ivandzb\UiKit\Html;

class AccessManagementController extends Controller
{
    public function index(Request $request, string $section, ErpPage $pages): Response|JsonResponse
    {
        $titles = ['menu' => 'Opciones del menú', 'permisos' => 'Permisos por usuario', 'usuarios' => 'Usuarios corporativos', 'opciones' => 'Permisos de opciones y botones'];
        $crud = Crud::make('access-'.$section)->title($titles[$section])->renderWith('quasar')
            ->requestParams(['_token' => csrf_token()])->dataSource(new AccessDataSource($section, $request->user()))
            ->fields(Field::number('id', 'Id')->key()->readOnly(), Field::hidden('revision')->key()->onlyOnEdit());
        $yesNo = [1 => 'Sí', 0 => 'No'];
        $menu = DB::table('menu_items')->orderBy('sort_order')->get()->mapWithKeys(fn (object $item): array => [$item->id => $item->id.' · '.$item->label])->all();
        if ($section === 'menu') {
            $migrated = array_map(fn (array $option): string => $option['label'], app(MigratedMenuRoutes::class)->options());
            $crud->disable(Crud::DELETE)->fields(
                Field::text('label', 'Nombre')->filterable(Field::FILTER_LIKE)->rules(['required' => true]),
                Field::select('parent_id', 'Opción padre', [0 => 'Raíz'] + $menu)->rules(['required' => true]),
                Field::text('sort_order', 'Orden'),
                Field::textarea('legacy_url', 'URL en IntranetLocal')->hideInList(),
                Field::select('active', 'Activa', $yesNo)->defaultValue(1)->filterable()->rules(['required' => true]),
                Field::select('migration_enabled', 'Habilitada en ERP', $yesNo)->defaultValue(0)->filterable(),
                Field::select('migration_key', 'Funcionalidad migrada', ['' => 'Pendiente de migración'] + $migrated)->emptyValue(''),
                Field::select('is_public', 'Pública para usuarios autenticados', $yesNo)->defaultValue(0)->filterable()->rules(['required' => true]),
                Field::textarea('description', 'Descripción')->hideInList()
            );
        } elseif ($section === 'permisos') {
            $users = DB::table('users')->whereNotNull('ldap_username')->orderBy('ldap_username')->pluck('ldap_username', 'id')->all();
            $crud->fields(
                Field::select('user_id', 'Usuario', $users)->filterable()->rules(['required' => true]),
                Field::select('menu_item_id', 'Opción del menú', $menu)->filterable()->rules(['required' => true]),
                Field::select('can_view', 'Consultar', $yesNo)->defaultValue(1)->rules(['required' => true]),
                Field::select('can_create', 'Crear', $yesNo)->defaultValue(0)->rules(['required' => true]),
                Field::select('can_update', 'Modificar', $yesNo)->defaultValue(0)->rules(['required' => true]),
                Field::select('can_delete', 'Eliminar', $yesNo)->defaultValue(0)->rules(['required' => true]),
                Field::select('can_approve', 'Aprobar', $yesNo)->defaultValue(0)->rules(['required' => true])
            );
        } elseif ($section === 'opciones') {
            $users = DB::table('users')->whereNotNull('ldap_username')->orderBy('ldap_username')->pluck('ldap_username', 'id')->all();
            $crud->fields(
                Field::select('user_id', 'Usuario', $users)->filterable()->rules(['required' => true]),
                Field::text('module', 'Módulo')->filterable(Field::FILTER_LIKE)->rules(['required' => true, 'maxLength' => 60, 'pattern' => '^\S+$']),
                Field::text('file', 'Archivo (vacío: todo el módulo)')->emptyValue('')->filterable(Field::FILTER_LIKE)->rules(['maxLength' => 60, 'pattern' => '^\S*$']),
                Field::number('option_id', 'Id de opción')->filterable()->rules(['required' => true, 'integer' => true, 'min' => 0]),
                Field::select('can_read', 'Lectura', $yesNo)->defaultValue(1)->rules(['required' => true]),
                Field::select('can_insert', 'Insertar', $yesNo)->defaultValue(0)->rules(['required' => true]),
                Field::select('can_write', 'Modificar', $yesNo)->defaultValue(0)->rules(['required' => true]),
                Field::select('can_delete', 'Eliminar', $yesNo)->defaultValue(0)->rules(['required' => true])
            );
        } else {
            $crud->disable(Crud::CREATE, Crud::DELETE)->fields(
                Field::text('ldap_username', 'Usuario LDAP')->readOnly()->filterable(Field::FILTER_LIKE),
                Field::text('name', 'Nombre')->readOnly()->filterable(Field::FILTER_LIKE),
                Field::number('legacy_user_id', 'Id en IntranetLocal')->readOnly(),
                Field::select('erp_active', 'Acceso activo', $yesNo)->filterable()->rules(['required' => true]),
                Field::select('is_admin', 'Administrador', $yesNo)->rules(['required' => true])
            );
        }
        $kit = new CrudKit(null, new AdminKitPermissions($request->user(), $section === 'opciones' ? 'option-permissions.manage' : 'menu.manage'), new FileTranslator('es'), '/desarrollo/assets/crud-kit', 'quasar');
        if ($request->has('crud')) {
            abort_unless($request->query('crud') === $crud->id(), 404);
            $allowed = [Crud::LIST, Crud::UPDATE];
            if ($section !== 'usuarios') {
                $allowed[] = Crud::CREATE;
            }
            if (in_array($section, ['permisos', 'opciones'], true)) {
                $allowed[] = Crud::DELETE;
            }
            $action = $request->query('action');
            abort_unless(in_array($action, $allowed, true), 405);
            abort_unless($request->isMethod('post'), 405);
            $request->validate([
                'jtStartIndex' => ['sometimes', 'integer', 'min:0', 'max:1000000'],
                'jtPageSize' => ['sometimes', 'integer', 'min:1', 'max:100'],
                'jtSorting' => ['sometimes', 'string', 'max:200'],
            ]);
            $payload = $kit->handle($crud, array_merge($request->all(), ['action' => $action]));

            return response()->json($payload, $payload['Result'] === 'OK' ? 200 : 422);
        }

        return $pages->render($titles[$section], Html::div(
            Alert::info('Estos cambios aplican únicamente a ERP Utilities. El sistema original conserva sus propios permisos. Cada petición vuelve a comprobar los accesos; no se escriben contraseñas LDAP.'),
            $section === 'menu' ? Alert::info('Para habilitar una opción en ERP, seleccione su funcionalidad migrada. Los grupos se muestran cuando contienen opciones habilitadas. La administración del menú permanece disponible para configurar los accesos.') : null,
            $section === 'opciones' ? Alert::info('El permiso específico del archivo prevalece sobre el general del módulo, incluso cuando deniega el acceso. Entrar a una opción requiere lectura o modificación; insertar y eliminar se verifican por separado.') : null,
            Card::make($titles[$section])->add(Html::raw($kit->render($crud, $section === 'opciones' ? route('access.options') : route('access.manage', $section))))
        ), $request->user());
    }
}
