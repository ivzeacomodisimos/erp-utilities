<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Support\Administration\Hierarchy;
use App\Support\Kits\AccessDataSource;
use App\Support\Kits\AdminKitPermissions;
use App\Support\Menu\GeneratedCrud;
use App\Support\Menu\GeneratedCrudDiscovery;
use App\Support\Menu\GeneratedCrudRelations;
use App\Support\Menu\GeneratedCrudStorage;
use App\Support\Menu\ManagedApplicationRoutes;
use App\Support\Menu\MigratedMenuRoutes;
use App\Support\Ui\CrudLabels;
use App\Support\Ui\ErpPage;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Ivandzb\CrudKit\CrudKit;
use Ivandzb\CrudKit\Definition\Crud;
use Ivandzb\CrudKit\Definition\Field;
use Ivandzb\CrudKit\Definition\Lookup;
use Ivandzb\CrudKit\Ports\FileTranslator;
use Ivandzb\UiKit\Component\Alert;
use Ivandzb\UiKit\Component\Button;
use Ivandzb\UiKit\Component\Card;
use Ivandzb\UiKit\Html;

class AccessManagementController extends Controller
{
    public function index(Request $request, string $section, ErpPage $pages): Response|JsonResponse
    {
        $ability = match ($section) {
            'menu', 'rutas', 'programas', 'generador', 'campos' => 'menu.manage', 'permisos' => 'grants.manage', 'usuarios' => 'users.manage', 'opciones' => 'option-permissions.manage'
        };
        abort_unless($request->user()->can($ability), 403);
        $isAdministrator = in_array('administrador', $request->user()->erp_roles ?? [], true);
        abort_if(in_array($section, ['generador', 'campos'], true) && ! $isAdministrator, 403);
        if ($section === 'usuarios' && ! $isAdministrator && $request->boolean('is_admin')) {
            abort(403);
        }
        $titles = ['menu' => 'Opciones del menú', 'campos' => 'Campos de programas CRUD', 'generador' => 'Programas y controladores', 'programas' => 'Registro de rutas', 'rutas' => 'Rutas y acciones del menú', 'permisos' => 'Permisos por usuario', 'usuarios' => 'Usuarios corporativos', 'opciones' => 'Permisos de opciones y botones'];
        $crud = Crud::make('access-'.$section)->title($titles[$section])->renderWith('quasar')
            ->defaultSorting($section === 'menu' ? 'sort_order' : 'id')
            ->requestParams(['_token' => csrf_token()])->dataSource(new AccessDataSource($section, $request->user()))
            ->fields(Field::number('id', 'Id')->key()->readOnly(), Field::hidden('revision')->key()->onlyOnEdit());
        [$singular, $plural, $feminine] = match ($section) {
            'menu' => ['opción del menú', 'opciones del menú', true],
            'rutas' => ['asociación de ruta al menú', 'asociaciones de rutas al menú', true],
            'programas' => ['ruta de aplicación', 'rutas de aplicación', true],
            'generador' => ['programa y controlador', 'programas y controladores', false],
            'campos' => ['campo de programa CRUD', 'campos de programas CRUD', false],
            'permisos' => ['permiso de menú por usuario', 'permisos de menú por usuario', false],
            'usuarios' => ['usuario corporativo', 'usuarios corporativos', false],
            'opciones' => ['permiso de opción o botón', 'permisos de opciones y botones', false],
        };
        CrudLabels::apply($crud, $singular, $plural, $feminine);
        $yesNo = [1 => 'Sí', 0 => 'No'];
        $menuRecords = DB::table('menu_items')->where('archived', false)->orderBy('sort_order')->get();
        $menu = $menuRecords->mapWithKeys(fn (object $item): array => [$item->id => $item->id.' · '.$item->label])->all();
        if ($section === 'menu') {
            $crud->messages(['deleteConfirmation' => 'La opción se retirará del menú conservando su historial. ¿Continuar?']);
            $crud->fields(
                Field::text('label', 'Nombre')->filterable(Field::FILTER_LIKE)->suggestions()->rules(['required' => true]),
                Field::autocomplete('parent_id', 'Opción padre', Lookup::table('menu_items', 'id', 'label'))->rules(['required' => true]),
                Field::text('sort_order', 'Orden')->readOnly(),
                Field::text('icon', 'Icono o ruta heredada')->hideInList()->rules(['maxLength' => 60]),
                Field::select('append_legacy_id', 'Concatena ID al destino heredado', $yesNo)->defaultValue(1)->hideInList(),
                Field::textarea('legacy_url', 'URL en IntranetLocal')->hideInList(),
                Field::select('active', 'Activa', $yesNo)->defaultValue(1)->filterable()->rules(['required' => true]),
                Field::select('migration_enabled', 'Habilitada en ERP', $yesNo)->defaultValue(0)->filterable(),
                Field::select('route_name', 'Ruta Laravel', ['' => 'Pendiente de asociar'] + app(MigratedMenuRoutes::class)->catalog())->emptyValue(''),
                Field::hidden('migration_key'),
                Field::textarea('route_parameters', 'Parámetros de la ruta (JSON)')->hideInList()->defaultValue('{}'),
                Field::select('is_public', 'Pública para usuarios autenticados', $yesNo)->defaultValue(0)->filterable()->rules(['required' => true]),
                Field::textarea('description', 'Descripción')->hideInList()
            );
        } elseif ($section === 'generador') {
            $crud->messages(['deleteConfirmation' => 'El programa quedará inactivo y conservará su controlador y rutas. ¿Continuar?']);
            $crud->fields(
                Field::text('controller_name', 'Nombre del controlador')->onlyOnCreate()->filterable(Field::FILTER_LIKE)->rules(['required' => true]),
                Field::select('program_type', 'Tipo de programa', ['page' => 'Página informativa', 'crud' => 'Formulario CRUD'])->onlyOnCreate()->defaultValue('page'),
                Field::hidden('auto_detect_fields')->onlyOnCreate()->defaultValue(1),
                Field::text('title', 'Título del programa')->filterable(Field::FILTER_LIKE)->rules(['required' => true]),
                Field::textarea('content', 'Contenido inicial')->hideInList(),
                Field::select('table_mode', 'Origen de la tabla', ['new' => 'Crear tabla nueva', 'existing' => 'Vincular tabla existente'])->defaultValue('new'),
                Field::select('table_connection', 'Conexión de base de datos', app(GeneratedCrudStorage::class)->connections())->defaultValue('')->emptyValue(''),
                Field::text('table_name', 'Tabla de negocio (base.esquema.tabla)')->suggestions()->rules(['maxLength' => 191]),
                Field::select('crud_ready', 'CRUD preparado', $yesNo)->readOnly(),
                Field::text('discovery_summary', 'Detección de estructura')->readOnly(),
                Field::text('action', 'Programa a ejecutar')->readOnly(),
                Field::select('active', 'Activo', $yesNo)->defaultValue(0)->filterable()
            );
        } elseif ($section === 'campos') {
            $programs = DB::table('generated_programs')->where('program_type', 'crud')->orderBy('title')->pluck('title', 'id')->all();
            $relatedPrograms = DB::table('generated_programs')->where('program_type', 'crud')->where('crud_ready', true)->orderBy('title')->get()
                ->mapWithKeys(fn (object $program): array => [$program->id => $program->title.' · '.$program->table_name])->all();
            $relatedLabels = DB::table('generated_program_fields')->whereIn('field_type', ['string', 'text'])->orderBy('column_name')->pluck('column_name', 'column_name')->all();
            $crud->fields(
                Field::select('program_id', 'Programa CRUD', $programs)->filterable()->defaultValue($request->integer('program_id') ?: null)->rules(['required' => true]),
                Field::text('column_name', 'Nombre de columna')->rules(['required' => true]),
                Field::text('label', 'Etiqueta')->rules(['required' => true]),
                Field::select('field_type', 'Tipo de campo', GeneratedCrud::TYPES)->defaultValue('string')->rules(['required' => true]),
                Field::select('required', 'Obligatorio', $yesNo)->defaultValue(0),
                Field::number('max_length', 'Longitud máxima de texto')->defaultValue(150),
                Field::number('position', 'Orden')->defaultValue(0),
                Field::select('related_program_id', 'Catálogo CRUD relacionado', ['' => 'Sin relación'] + $relatedPrograms)->emptyValue('')->fillFrom('relationDefaults'),
                Field::select('related_menu_id', 'Menú de consulta relacionado', ['' => 'Seleccione un menú'] + $menu)->emptyValue(''),
                Field::select('related_label', 'Columna a mostrar', ['' => 'Seleccione una columna de texto'] + $relatedLabels)->emptyValue(''),
                Field::autocomplete('depends_on', 'Depende del campo', Lookup::table('generated_program_fields', 'column_name', 'label'))->dependsOn('program_id'),
                Field::autocomplete('related_filter', 'Columna de filtro del catálogo', Lookup::table('generated_program_fields', 'column_name', 'label'))->dependsOn('related_program_id'),
                Field::text('related_table', 'Tabla relacionada')->readOnly(),
                Field::text('related_key', 'Clave relacionada')->readOnly()
            );
        } elseif ($section === 'programas') {
            $crud->messages(['deleteConfirmation' => 'La ruta quedará inactiva y conservará sus asociaciones. ¿Continuar?']);
            $programs = array_map(fn (array $program): string => $program['label'], app(ManagedApplicationRoutes::class)->programs());
            $crud->fields(
                Field::text('label', 'Descripción')->filterable(Field::FILTER_LIKE)->rules(['required' => true]),
                Field::text('name', 'Nombre de ruta')->onlyOnCreate()->filterable()->rules(['required' => true]),
                Field::text('uri', 'Dirección URL')->filterable()->rules(['required' => true]),
                Field::select('http_method', 'Método HTTP', ['GET' => 'GET', 'GET|POST' => 'GET y POST (formulario CRUD)', 'POST' => 'POST', 'PUT' => 'PUT', 'PATCH' => 'PATCH', 'DELETE' => 'DELETE'])->defaultValue('GET')->rules(['required' => true]),
                Field::select('program', 'Programa a ejecutar', $programs)->fillFrom('programDefaults')->rules(['required' => true]),
                Field::textarea('program_parameters', 'Parámetros del programa (JSON)')->hideInList()->defaultValue('{}'),
                Field::select('active', 'Activa', $yesNo)->defaultValue(0)->filterable()
            );
        } elseif ($section === 'rutas') {
            $crud->fields(
                Field::select('menu_item_id', 'Opción del menú', $menu)->filterable()->rules(['required' => true]),
                Field::select('route_name', 'Ruta Laravel', app(MigratedMenuRoutes::class)->catalog(false))->filterable()->rules(['required' => true]),
                Field::select('operation', 'Permiso requerido', ['view' => 'Consultar', 'create' => 'Crear', 'update' => 'Modificar', 'delete' => 'Eliminar', 'approve' => 'Aprobar'])->defaultValue('view')->rules(['required' => true])
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
            $crud->disable(Crud::DELETE)->fields(
                Field::text('ldap_username', 'Usuario LDAP')->key()->onlyOnCreate()->filterable(Field::FILTER_LIKE),
                Field::text('name', 'Nombre')->filterable(Field::FILTER_LIKE)->rules(['maxLength' => 180]),
                Field::autocomplete('employee_id', 'Empleado', Lookup::table('employees', 'id', 'first_name')),
                Field::text('corporate_email', 'Correo corporativo')->rules(['maxLength' => 100]),
                Field::text('siesa_username', 'Usuario UNO')->rules(['maxLength' => 8]),
                Field::number('legacy_user_id', 'Id en IntranetLocal')->readOnly(),
                Field::select('erp_active', 'Acceso activo', $yesNo)->defaultValue(1)->filterable()->rules(['required' => true])
            );
            if ($isAdministrator) {
                $crud->fields(Field::select('is_admin', 'Administrador', $yesNo)->defaultValue(0)->rules(['required' => true]));
            }
        }
        $kit = new CrudKit(null, new AdminKitPermissions($request->user(), $ability), new FileTranslator('es'), '/desarrollo/assets/crud-kit', 'quasar');
        if ($request->has('crud')) {
            abort_unless($request->query('crud') === $crud->id(), 404);
            $allowed = [Crud::LIST, Crud::UPDATE];
            if ($section === 'menu') {
                $allowed[] = 'suggest';
                $allowed[] = 'autocomplete';
            }
            if ($section === 'generador') {
                $allowed[] = 'suggest';
            }
            if ($section === 'programas') {
                $allowed[] = 'programDefaults';
            }
            if ($section === 'campos') {
                $allowed[] = 'relationDefaults';
                $allowed[] = 'autocomplete';
            }
            if ($section === 'usuarios') {
                $allowed[] = 'autocomplete';
            }
            $allowed[] = Crud::CREATE;
            if (in_array($section, ['menu', 'rutas', 'programas', 'generador', 'campos', 'permisos', 'opciones'], true)) {
                $allowed[] = Crud::DELETE;
            }
            $action = $request->query('action');
            abort_unless(in_array($action, $allowed, true), 405);
            abort_unless($request->isMethod('post'), 405);
            if ($section === 'campos' && $action === 'autocomplete') {
                $data = $request->validate(['field' => ['required', 'in:depends_on,related_filter'], 'term' => ['nullable', 'string', 'max:100'], 'lookup_context' => ['required', 'string', 'max:8000']]);
                $key = $data['field'] === 'depends_on' ? 'program_id' : 'related_program_id';
                $context = json_decode($data['lookup_context']);
                if (! is_object($context) || array_diff(array_keys((array) $context), [$key]) !== []) {
                    throw ValidationException::withMessages(['lookup_context' => 'El contexto del diseñador no es válido.']);
                }
                $context = validator((array) $context, [$key => ['required', 'integer', Rule::exists('generated_programs', 'id')->where('program_type', 'crud')]])->validate();
                $term = trim($data['term'] ?? '');
                if ($term === '') {
                    return response()->json([]);
                }
                $pattern = '%'.str_replace(['!', '%', '_'], ['!!', '!%', '!_'], $term).'%';
                $rows = DB::table('generated_program_fields')->where('program_id', $context[$key])->whereIn('field_type', array_diff(array_keys(GeneratedCrud::TYPES), ['text']))
                    ->where(fn (Builder $query) => $query->whereRaw("column_name LIKE ? ESCAPE '!'", [$pattern])->orWhereRaw("label LIKE ? ESCAPE '!'", [$pattern]))
                    ->orderBy('position')->orderBy('id')->limit(20)->get();

                return response()->json($rows->map(fn (object $field): array => ['id' => $field->column_name, 'label' => $field->label.' · '.$field->column_name, 'caption' => GeneratedCrud::TYPES[$field->field_type]])->all());
            }
            if ($section === 'campos' && $action === 'relationDefaults') {
                $data = $request->validate(['related_program_id' => ['required', 'integer']]);

                return response()->json(['Result' => 'OK', 'Record' => app(GeneratedCrudRelations::class)->defaults($data['related_program_id'])]);
            }
            if ($section === 'programas' && $action === 'programDefaults') {
                $options = app(ManagedApplicationRoutes::class)->programs();
                $data = $request->validate(['program' => ['required', 'string', Rule::in(array_keys($options))]]);
                $program = $options[$data['program']];

                return response()->json(['Result' => 'OK', 'Record' => [
                    'http_method' => ! empty($program['generated_crud_id']) ? 'GET|POST' : (in_array('GET', $program['methods'], true) ? 'GET' : $program['methods'][0]),
                    'program_parameters' => '{}',
                ]]);
            }
            if ($section === 'generador' && $action === 'suggest') {
                $lookup = $request->validate(['field' => ['required', 'in:table_name'], 'term' => ['nullable', 'string', 'max:191'], 'table_connection' => ['nullable', 'string', 'max:100']]);
                $term = strtolower($lookup['term'] ?? '');

                return response()->json(array_values(array_map(fn (string $name): array => ['value' => $name, 'label' => $name], array_slice(array_values(array_filter(app(GeneratedCrud::class)->tables($lookup['table_connection'] ?? '', $term), fn (string $name): bool => str_contains(strtolower($name), $term))), 0, 20))));
            }
            if ($section === 'usuarios' && $action === 'autocomplete') {
                $lookup = $request->validate(['field' => ['required', 'in:employee_id'], 'term' => ['nullable', 'string', 'max:200']]);
                $term = trim($lookup['term'] ?? '');
                if ($term === '') {
                    return response()->json([]);
                }
                $query = DB::table('employees')->where('status', 'A')->where(function (Builder $query) use ($term): void {
                    $pattern = '%'.str_replace(['!', '%', '_'], ['!!', '!%', '!_'], $term).'%';
                    $query->whereRaw("first_name LIKE ? ESCAPE '!'", [$pattern])->orWhereRaw("last_name LIKE ? ESCAPE '!'", [$pattern]);
                    if (ctype_digit($term)) {
                        $query->orWhere('id', $term);
                    }
                });

                return response()->json($query->select(['id', 'first_name', 'last_name'])->orderBy('first_name')->limit(20)->get()
                    ->map(fn (object $employee): array => ['id' => $employee->id, 'label' => $employee->id.' · '.trim($employee->first_name.' '.$employee->last_name)])->all());
            }
            if (in_array($action, ['suggest', 'autocomplete'], true)) {
                $isParent = $action === 'autocomplete';
                $data = $request->validate(['field' => ['required', 'in:'.($isParent ? 'parent_id' : 'label')], 'term' => ['nullable', 'string', 'max:200']]);
                $term = trim($data['term'] ?? '');
                if ($term === '') {
                    return response()->json([]);
                }
                $query = DB::table('menu_items')->where('archived', false)->select(['id', 'parent_id', 'label']);
                if ($isParent) {
                    $query->where('id', '<>', 0);
                }
                foreach (preg_split('/\s+/u', $term, -1, PREG_SPLIT_NO_EMPTY) as $word) {
                    $query->where(function (Builder $query) use ($word, $isParent): void {
                        $query->whereRaw("label LIKE ? ESCAPE '!'", ['%'.str_replace(['!', '%', '_'], ['!!', '!%', '!_'], $word).'%']);
                        if ($isParent && ctype_digit($word)) {
                            $query->orWhere('id', $word);
                        }
                    });
                }
                $tree = $menuRecords->keyBy('id');
                $suggestions = $query->orderBy('label')->orderBy('id')->limit(20)->get()->map(function (object $item) use ($tree, $isParent): array {
                    $ancestors = [];
                    $seen = [$item->id];
                    $parent = (int) $item->parent_id === 0 ? null : $tree->get($item->parent_id);
                    while ($parent && ! in_array($parent->id, $seen, true)) {
                        $seen[] = $parent->id;
                        $ancestors[] = $parent->label;
                        $parent = (int) $parent->parent_id === 0 ? null : $tree->get($parent->parent_id);
                    }

                    return [($isParent ? 'id' : 'value') => $isParent ? $item->id : $item->label,
                        'label' => $isParent ? $item->id.' · '.$item->label : $item->label,
                        'caption' => $ancestors === [] ? 'Raíz' : implode(' › ', array_reverse($ancestors))];
                })->all();
                if ($isParent && in_array(mb_strtolower($term), ['0', 'raíz', 'raiz'], true)) {
                    array_unshift($suggestions, ['id' => 0, 'label' => 'Raíz', 'caption' => 'Sin opción padre']);
                    $suggestions = array_slice($suggestions, 0, 20);
                }

                return response()->json($suggestions);
            }
            $request->validate([
                'jtStartIndex' => ['sometimes', 'integer', 'min:0', 'max:1000000'],
                'jtPageSize' => ['sometimes', 'integer', 'min:1', 'max:100'],
                'jtSorting' => ['sometimes', 'string', 'max:200'],
            ]);
            $payload = $kit->handle($crud, array_merge($request->all(), ['action' => $action]));

            return response()->json($payload, $payload['Result'] === 'OK' ? 200 : 422);
        }

        return $pages->render($titles[$section], Html::div(
            $request->session()->has('status') ? Alert::success($request->session()->get('status')) : null,
            $request->session()->get('errors') ? Alert::error($request->session()->get('errors')->first()) : null,
            $section === 'menu' ? Html::form(route('access.order'), 'post', Html::input('hidden', '_token', csrf_token()), Button::make('Ordenar menú')->type('submit')->icon('sort')) : null,
            $section === 'menu' ? Html::a(route('access.routes'), 'Configurar rutas y acciones del menú') : null,
            in_array($section, ['menu', 'rutas'], true) ? Button::make('Crear nueva ruta')->href(route('access.programs'))->icon('add_link') : null,
            $section === 'programas' ? Button::make('Asociar rutas al menú')->href(route('access.manage', 'menu'))->icon('menu') : null,
            $isAdministrator && in_array($section, ['menu', 'rutas', 'programas'], true) ? Button::make('Crear programa')->href(route('access.generator'))->icon('add_box') : null,
            $section === 'generador' ? Button::make('Registrar ruta del programa')->href(route('access.programs'))->icon('add_link') : null,
            $section === 'generador' ? Button::make('Definir campos CRUD')->href(route('access.generator.fields'))->icon('view_list') : null,
            in_array($section, ['generador', 'campos'], true) ? Button::make('Asistente de alta')->href(route('access.generator.wizard', $request->integer('program_id') ? ['program_id' => $request->integer('program_id')] : []))->icon('playlist_add_check') : null,
            $section === 'campos' ? Html::form(route('access.generator.fields'), 'get', Html::select('program_id', $programs, $request->integer('program_id')), Button::make('Ver configuración del CRUD')->type('submit')) : null,
            $section === 'campos' && $request->integer('program_id') ? $this->automaticFieldInfo($request->integer('program_id'), $request->user()) : null,
            $section === 'campos' && $request->integer('program_id') ? $this->columnInfo($request->integer('program_id')) : null,
            $section === 'campos' ? Html::form(route('access.generator.prepare'), 'post', Html::input('hidden', '_token', csrf_token()), Html::select('program_id', $programs, $request->integer('program_id')), Button::make('Preparar CRUD')->type('submit')->icon('build')) : null,
            $section === 'campos' ? Html::form(route('access.generator.discover'), 'post', Html::input('hidden', '_token', csrf_token()), Html::select('program_id', $programs, $request->integer('program_id')), Button::make('Detectar campos y relaciones')->type('submit')->icon('search')) : null,
            $section === 'campos' ? Button::make('Activar programa')->href(route('access.generator'))->icon('check') : null,
            Alert::info('Estos cambios aplican únicamente a ERP Utilities. El sistema original conserva sus propios permisos. Cada petición vuelve a comprobar los accesos; no se escriben contraseñas LDAP.'),
            $section === 'menu' ? Alert::info('Seleccione una ruta Laravel y habilite la opción en ERP. Los parámetros se indican como JSON, por ejemplo {"section":"usuarios"}; use {} si la ruta no tiene parámetros. Configure las rutas adicionales y sus permisos en Rutas del menú. Los grupos se muestran cuando contienen opciones habilitadas.') : null,
            $section === 'rutas' ? Alert::info('Asocie cada ruta adicional con su menú y el permiso requerido. El servidor comprueba el usuario autenticado, la habilitación del menú y el permiso en cada petición. Las rutas de detalle pueden conservar parámetros variables como {pedido}.') : null,
            $section === 'programas' ? Alert::info('Digite el nombre (ventas.pedidos), la dirección (/ventas/pedidos) y seleccione el programa a ejecutar. Las rutas se crean en la base de datos, sin editar archivos. Después active la ruta y asóciela al menú. El programa debe estar desarrollado; sus controladores disponibles se detectan automáticamente. Use {} si no necesita parámetros.') : null,
            $section === 'generador' ? Alert::info('Para un CRUD seleccione la conexión y digite la tabla. En Intranet SQL Server puede usar base.esquema.tabla, por ejemplo comodisimos.test.prueba; la base y el esquema deben existir y la conexión debe tener permisos. Puede crear una tabla nueva o vincular una existente con clave id autoincremental. Solo los nombres simples de tablas nuevas en ERP reciben el prefijo app_data_. Al vincular una tabla existente se detectan sus campos y claves foráneas automáticamente. Revise los campos y las relaciones pendientes, prepare el CRUD y actívelo. Después registre su ruta con GET y POST y asóciela al menú. Los permisos por usuario y menú se validan en cada petición.') : null,
            $section === 'campos' ? Alert::info('Con el programa inactivo, configure la Relación (autocomplete), su catálogo y menú de consulta. Para filtrar por otro campo, seleccione Depende del campo y la columna equivalente en el catálogo: por ejemplo departamento_id → ciudades.departamento_id. Primero defina el campo padre. Se admiten dependencias encadenadas; cambiar un padre limpia sus selecciones dependientes. Las búsquedas y guardados validan la dependencia y los permisos de todos los menús relacionados. La estructura de las tablas existentes se conserva.') : null,
            $section === 'opciones' ? Alert::info('El permiso específico del archivo prevalece sobre el general del módulo, incluso cuando deniega el acceso. Entrar a una opción requiere lectura o modificación; insertar y eliminar se verifican por separado.') : null,
            Card::make($titles[$section])->add(Html::raw($kit->render($crud, match ($section) {
                'opciones' => route('access.options'), 'rutas' => route('access.routes'), 'programas' => route('access.programs'), 'generador' => route('access.generator'), 'campos' => route('access.generator.fields'), default => route('access.manage', $section)
            })))
        ), $request->user());
    }

    private function columnInfo(int $id): mixed
    {
        $program = DB::table('generated_programs')->where('id', $id)->where('program_type', 'crud')->first();
        if (! $program || $program->table_mode !== 'existing') {
            return null;
        }
        try {
            $columns = app(GeneratedCrud::class)->columns($program->table_name, $program->table_connection ?? '');
            $report = app(GeneratedCrudDiscovery::class)->inspect($program);

            return Html::div(
                Alert::info('Columnas detectadas: '.implode(', ', array_map(fn (array $column): string => $column['name'].' ('.$column['type'].')', $columns))),
                $report['pending'] ? Alert::error('Pendientes: '.implode(' ', $report['pending'])) : null,
                $report['ignored'] ? Alert::info('No editables: '.implode('; ', $report['ignored'])) : null
            );
        } catch (ValidationException $exception) {
            return Alert::error($exception->getMessage());
        }
    }

    private function automaticFieldInfo(int $id, User $actor): mixed
    {
        try {
            $fields = app(GeneratedCrud::class)->automaticFields($id, $actor);
            $rows = array_map(fn (array $field): array => [$field['column_name'], $field['label'], $field['data_type'],
                $field['status'], $field['managed_by'], $field['description']], $fields);

            return Card::make('Campos automáticos (solo lectura)')->subtitle('Programa: '.DB::table('generated_programs')->where('id', $id)->value('title'))->add(
                Html::p('Estos campos los administra el generador o la base de datos. Se muestran como referencia dentro de la configuración del CRUD.'),
                Html::div(Html::table($rows, ['Campo', 'Etiqueta', 'Tipo de dato', 'Estado', 'Administrado por', 'Función'])->addClass('q-table'))
                    ->addClass('q-markup-table')->attr('id', 'crud-automatic-fields')->attr('style', 'overflow-x: auto')
            );
        } catch (ValidationException $exception) {
            return Alert::error($exception->getMessage());
        }
    }

    public function prepareCrud(Request $request): RedirectResponse|JsonResponse
    {
        $data = $request->validate(['program_id' => ['required', 'integer']]);
        app(GeneratedCrud::class)->prepare($data['program_id'], $request->user());

        return $request->expectsJson() ? response()->json(['Result' => 'OK'])
            : redirect()->route('access.generator')->with('status', 'CRUD preparado. Active el programa, registre su ruta con GET y POST y asócielo al menú.');
    }

    public function discoverCrud(Request $request): RedirectResponse|JsonResponse
    {
        $data = $request->validate(['program_id' => ['required', 'integer']]);
        $report = app(GeneratedCrudDiscovery::class)->import($data['program_id'], $request->user());

        return $request->expectsJson() ? response()->json(['Result' => 'OK', 'Report' => $report])
            : redirect()->route('access.generator.fields', ['program_id' => $data['program_id']])->with('status', 'Campos detectados. Revise las relaciones pendientes antes de preparar el CRUD.');
    }

    public function order(Request $request): RedirectResponse|JsonResponse
    {
        abort_unless($request->user()->can('menu.manage'), 403);
        $total = app(Hierarchy::class)->reorder('menu_items', 3);
        DB::table('erp_access_events')->insert(['user_id' => $request->user()->id, 'actor' => $request->user()->ldap_username,
            'event' => 'menu_ordered', 'details' => json_encode(['total' => $total]), 'created_at' => now()]);

        return $request->expectsJson() ? response()->json(['Result' => 'OK', 'Total' => $total])
            : redirect()->route('access.manage', 'menu')->with('status', "Se ordenaron $total opciones.");
    }
}
