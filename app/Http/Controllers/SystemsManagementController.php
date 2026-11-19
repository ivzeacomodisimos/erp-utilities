<?php

namespace App\Http\Controllers;

use App\Support\Administration\Hierarchy;
use App\Support\Administration\SystemObjects;
use App\Support\Administration\SystemsAccess;
use App\Support\Kits\SystemsDataSource;
use App\Support\Kits\SystemsKitPermissions;
use App\Support\Ui\CrudLabels;
use App\Support\Ui\ErpPage;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Ivandzb\CrudKit\CrudKit;
use Ivandzb\CrudKit\Definition\Crud;
use Ivandzb\CrudKit\Definition\Field;
use Ivandzb\CrudKit\Definition\Lookup;
use Ivandzb\CrudKit\Ports\FileTranslator;
use Ivandzb\UiKit\Component\Alert;
use Ivandzb\UiKit\Component\Button;
use Ivandzb\UiKit\Component\Card;
use Ivandzb\UiKit\Html;
use Throwable;

class SystemsManagementController extends Controller
{
    public const TITLES = ['empleados' => 'Empleados', 'tipos-documento' => 'Tipos de documento por defecto', 'objetos' => 'Objetos del sistema', 'objetos-usuarios' => 'Objetos por usuario'];

    private function lookup(string $field, string $title, string $table, string $text = 'name', string $id = 'id'): Field
    {
        return Field::autocomplete($field, $title, Lookup::table($table, $id, $text))->filterable()->rules(['required' => true]);
    }

    public function index(Request $request, string $section, ErpPage $pages): Response|JsonResponse
    {
        abort_unless(isset(self::TITLES[$section]) && app(SystemsAccess::class)->allows($request->user(), $section), 403);
        $crud = Crud::make('systems-'.$section)->title(self::TITLES[$section])->renderWith('quasar')
            ->requestParams(['_token' => csrf_token()])->dataSource(new SystemsDataSource($section, $request->user()))
            ->fields(Field::number('id', 'Id')->key()->readOnly(), Field::hidden('revision')->key()->onlyOnEdit());
        [$singular, $plural] = match ($section) {
            'empleados' => ['empleado', 'empleados'],
            'tipos-documento' => ['tipo de documento por defecto', 'tipos de documento por defecto'],
            'objetos' => ['objeto del sistema', 'objetos del sistema'],
            'objetos-usuarios' => ['objeto por usuario', 'objetos por usuario'],
        };
        CrudLabels::apply($crud, $singular, $plural);
        if ($section === 'empleados') {
            $crud->messages(['deleteConfirmation' => 'El empleado quedará retirado y conservará su historial. ¿Continuar?']);
            $crud->fields(Field::text('identity_number', 'Cédula')->filterable()->fillFrom('datosDeCedula')->rules(['maxLength' => 25]),
                Field::text('first_name', 'Nombre')->filterable(Field::FILTER_LIKE)->rules(['required' => true, 'maxLength' => 50]),
                Field::text('last_name', 'Apellidos')->filterable(Field::FILTER_LIKE)->rules(['maxLength' => 50]),
                $this->lookup('management_id', 'Gestión', 'employee_groups'),
                Field::text('email', 'Correo')->rules(['maxLength' => 100]),
                Field::select('status', 'Estado', ['A' => 'Activo', 'R' => 'Retirado'])->defaultValue('A')->filterable()->rules(['required' => true]));
            if (app(SystemObjects::class)->employeeGroups($request->user()) === null) {
                $crud->fields(Field::text('internal_code', 'Código interno')->filterable()->rules(['maxLength' => 4]));
            }
        } elseif ($section === 'objetos') {
            $crud->disable(Crud::DELETE)->fields(
                Field::text('sort_order', 'Orden')->readOnly(),
                $this->lookup('parent_id', 'Objeto padre', 'system_objects'),
                Field::text('name', 'Nombre constante')->filterable(Field::FILTER_LIKE)->rules(['required' => true, 'maxLength' => 60]),
                Field::textarea('description', 'Descripción')->hideInList(),
                Field::textarea('default_value', 'Valores por defecto (separados por coma)')->filterable(Field::FILTER_LIKE)->defaultValue('')->emptyValue('')->rules(['maxLength' => 100000]));
        } elseif ($section === 'objetos-usuarios') {
            $crud->disable(Crud::DELETE)->fields($this->lookup('user_id', 'Usuario', 'users'),
                $this->lookup('object_id', 'Objeto', 'system_objects'),
                Field::textarea('value', 'Valores del usuario (separados por coma)')->filterable(Field::FILTER_LIKE)->emptyValue('')->rules(['maxLength' => 100000]));
        } else {
            $crud->fields($this->lookup('user_id', 'Usuario', 'users')->key()->onlyOnCreate(),
                Field::text('module', 'Módulo')->key()->onlyOnCreate()->filterable(Field::FILTER_LIKE)->rules(['required' => true, 'maxLength' => 60]),
                Field::text('file', 'Archivo')->key()->onlyOnCreate()->filterable(Field::FILTER_LIKE)->rules(['required' => true, 'maxLength' => 60]),
                $this->lookup('document_type', 'Tipo de documento', 'document_types', 'description', 'code'));
        }
        $crud->fields(Field::text('updated_at', 'Modificado')->readOnly())->defaultSorting($section === 'objetos' ? 'sort_order' : 'id');
        $kit = new CrudKit(null, new SystemsKitPermissions($request->user(), $section), new FileTranslator('es'), '/desarrollo/assets/crud-kit', 'quasar');
        if ($request->has('crud')) {
            abort_unless($request->query('crud') === $crud->id(), 404);
            abort_unless($request->isMethod('post'), 405);
            $action = $request->query('action');
            if ($section === 'empleados' && app(SystemObjects::class)->employeeGroups($request->user()) !== null) {
                $request->validate(['internal_code' => ['prohibited']]);
            }
            abort_unless(in_array($action, ['list', 'create', 'update', 'delete', 'autocomplete', 'datosDeCedula'], true), 405);
            if ($action === 'autocomplete') {
                return $this->autocomplete($request, $section);
            }
            if ($action === 'datosDeCedula') {
                abort_unless($section === 'empleados', 404);
                $data = $request->validate(['identity_number' => ['nullable', 'string', 'max:25']]);
                try {
                    return response()->json(['Result' => 'OK', 'Record' => app(SystemObjects::class)->identityFromSiesa($data['identity_number'] ?? '')]);
                } catch (Throwable $e) {
                    report($e);

                    return response()->json(['Result' => 'ERROR', 'Message' => 'No se pudo consultar Siesa. Puede completar los datos manualmente.'], 503);
                }
            }
            $request->validate(['jtStartIndex' => ['sometimes', 'integer', 'min:0', 'max:1000000'], 'jtPageSize' => ['sometimes', 'integer', 'min:1', 'max:100'], 'jtSorting' => ['sometimes', 'string', 'max:200']]);
            $payload = $kit->handle($crud, array_merge($request->all(), ['action' => $action]));

            return response()->json($payload, $payload['Result'] === 'OK' ? 200 : 422);
        }
        $order = $section === 'objetos' ? Html::form(route('systems.order'), 'post', Html::input('hidden', '_token', csrf_token()), Button::make('Ordenar objetos')->type('submit')->icon('sort')) : null;

        return $pages->render(self::TITLES[$section], Html::div(
            $request->session()->has('status') ? Alert::success($request->session()->get('status')) : null,
            $order, Card::make(self::TITLES[$section])->add(Html::raw($kit->render($crud, route('systems.'.$section))))), $request->user());
    }

    private function autocomplete(Request $request, string $section): JsonResponse
    {
        $allowed = match ($section) {
            'empleados' => ['management_id' => ['employee_groups', 'name', 'id']],
            'objetos' => ['parent_id' => ['system_objects', 'name', 'id']],
            'objetos-usuarios' => ['user_id' => ['users', 'name', 'id'], 'object_id' => ['system_objects', 'name', 'id']],
            'tipos-documento' => ['user_id' => ['users', 'name', 'id'], 'document_type' => ['document_types', 'description', 'code']]
        };
        $data = $request->validate(['field' => ['required', 'string', Rule::in(array_keys($allowed))], 'term' => ['nullable', 'string', 'max:200']]);
        $term = trim($data['term'] ?? '');
        if ($term === '') {
            return response()->json([]);
        }
        [$table,$text,$id] = $allowed[$data['field']];
        $query = DB::table($table);
        if ($table === 'document_types') {
            $query->whereRaw('LENGTH(code) <= 4');
        }
        if ($table === 'employee_groups') {
            $groups = app(SystemObjects::class)->employeeGroups($request->user());
            if ($groups !== null) {
                $query->whereIn('id', $groups);
            }
        }
        $escaped = '%'.str_replace(['!', '%', '_'], ['!!', '!%', '!_'], $term).'%';
        $query->where(function (Builder $q) use ($text, $id, $term, $escaped): void {
            $q->whereRaw($text." LIKE ? ESCAPE '!'", [$escaped]);
            if (ctype_digit($term) || $id === 'code') {
                $q->orWhere($id, $term);
            }
        });
        $fields = [$id, $text];
        if ($table === 'users') {
            $fields[] = 'ldap_username';
        }
        $hierarchy = app(Hierarchy::class);
        $items = $query->select($fields)->orderBy($text)->limit(20)->get()->map(function (object $row) use ($table, $text, $id, $hierarchy): array {
            return ['id' => $row->$id, 'label' => $row->$id.' · '.$row->$text, 'caption' => $table === 'system_objects' ? $hierarchy->path($table, (int) $row->$id) : ($row->ldap_username ?? '')];
        })->all();
        if ($data['field'] === 'parent_id' && in_array(mb_strtolower($term), ['0', 'raíz', 'raiz'], true)) {
            array_unshift($items, ['id' => 0, 'label' => 'Raíz', 'caption' => 'Sin objeto padre']);
            $items = array_slice($items, 0, 20);
        }

        return response()->json($items);
    }

    public function order(Request $request): RedirectResponse|JsonResponse
    {
        abort_unless(app(SystemsAccess::class)->allows($request->user(), 'objetos', 'ordenar'), 403);
        $total = app(Hierarchy::class)->reorder('system_objects', 2);
        DB::table('erp_access_events')->insert(['user_id' => $request->user()->id, 'actor' => $request->user()->ldap_username, 'event' => 'systems_objetos_ordered', 'details' => json_encode(['total' => $total]), 'created_at' => now()]);

        return $request->expectsJson() ? response()->json(['Result' => 'OK', 'Total' => $total]) : redirect()->route('systems.objetos')->with('status', "Se ordenaron $total objetos.");
    }
}
