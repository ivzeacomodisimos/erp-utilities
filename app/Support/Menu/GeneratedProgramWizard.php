<?php

namespace App\Support\Menu;

use App\Models\User;
use App\Support\Administration\Hierarchy;
use App\Support\Kits\AccessDataSource;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Ivandzb\CrudKit\Server\ValidationException as KitValidationException;

class GeneratedProgramWizard
{
    public function authorize(User $actor): void
    {
        app(GeneratedPrograms::class)->authorize($actor);
        abort_unless($actor->can('grants.manage'), 403);
    }

    private function program(int $id): object
    {
        $program = DB::table('generated_programs')->where('id', $id)->where('program_type', 'crud')->first();
        if (! $program) {
            throw ValidationException::withMessages(['program_id' => 'Seleccione un programa de tipo Formulario CRUD.']);
        }

        return $program;
    }

    private function action(object $program): string
    {
        return 'controller:App\\Http\\Controllers\\'.$program->controller_name.'@index';
    }

    private function bindings(object $program): array
    {
        $routes = DB::table('managed_application_routes')->where('program', $this->action($program))->orderBy('id')->get()->all();
        $menus = DB::table('menu_items')->whereIn('route_name', array_column($routes, 'name'))->where('archived', false)->orderBy('id')->get()->all();
        $grants = DB::table('menu_grants')->whereIn('menu_item_id', array_column($menus, 'id'))->orderBy('id')->get()->all();

        return compact('routes', 'menus', 'grants');
    }

    private function snapshot(object $program): string
    {
        $data = [$program, $this->bindings($program), app(GeneratedCrud::class)->fields($program->id)];

        return hash_hmac('sha256', serialize($data), (string) config('app.key'));
    }

    public function options(User $actor): array
    {
        $this->authorize($actor);
        $parents = [];
        $hierarchy = app(Hierarchy::class);
        foreach (DB::table('menu_items')->where('archived', false)->where('active', true)->where('id', '<>', 0)->orderBy('sort_order')->get() as $item) {
            $parents[] = ['id' => $item->id, 'label' => $item->id.' · '.$hierarchy->path('menu_items', $item->id)];
        }

        return ['programs' => DB::table('generated_programs')->where('program_type', 'crud')->orderBy('title')->get(['id', 'title'])->all(),
            'users' => DB::table('users')->where('erp_active', true)->whereNotNull('ldap_username')->orderBy('name')->get(['id', 'name', 'ldap_username'])->all(),
            'parents' => $parents];
    }

    public function state(int $id, User $actor): array
    {
        $this->authorize($actor);
        $program = $this->program($id);
        $bindings = $this->bindings($program);
        $users = DB::table('users')->whereIn('id', array_column($bindings['grants'], 'user_id'))->get(['id', 'name', 'ldap_username', 'erp_active'])->keyBy('id');
        foreach ($bindings['grants'] as $grant) {
            $user = $users->get($grant->user_id);
            $grant->user_label = $user ? $user->name.' · '.$user->ldap_username : 'Usuario no disponible';
            $grant->user_active = (bool) ($user?->erp_active ?? false);
        }
        $slug = rtrim(substr(Str::slug($program->title), 0, 170), '-') ?: 'programa-'.$id;
        if (! preg_match('/^[a-z]/', $slug)) {
            $slug = 'programa-'.$slug;
        }
        $fields = app(GeneratedCrud::class)->fields($id);
        $relatedIds = array_unique(array_column(array_filter($fields, fn (object $field): bool => $field->field_type === 'relation'), 'related_menu_id'));

        return ['program' => ['id' => $id, 'title' => $program->title, 'table_name' => $program->table_name,
            'table_connection' => $program->table_connection ?: 'ERP', 'table_mode' => $program->table_mode, 'active' => (bool) $program->active, 'ready' => (bool) $program->crud_ready],
            'snapshot' => $this->snapshot($program), 'bindings' => $bindings,
            'related_menus' => DB::table('menu_items')->whereIn('id', $relatedIds)->get(['id', 'label'])->all(),
            'fields' => array_map(fn (object $field): array => ['name' => $field->column_name, 'label' => $field->label, 'type' => GeneratedCrud::TYPES[$field->field_type]], app(GeneratedCrud::class)->fields($id)),
            'automatic_fields' => app(GeneratedCrud::class)->automaticFields($id, $actor),
            'report' => $program->discovery_report ? json_decode($program->discovery_report, true, flags: JSON_THROW_ON_ERROR) : null,
            'defaults' => ['route_name' => $slug.'.index', 'route_uri' => '/aplicaciones/'.$slug, 'menu_label' => $program->title],
            'fields_url' => route('access.generator.fields', ['program_id' => $id])];
    }

    private function fresh(int $id, string $snapshot): object
    {
        $program = $this->program($id);
        if (! hash_equals($this->snapshot($program), $snapshot)) {
            throw ValidationException::withMessages(['snapshot' => 'La configuración cambió mientras el asistente estaba abierto. Recargue el programa y revise los datos antes de continuar.']);
        }

        return $program;
    }

    private function checkSchema(object $program): array
    {
        if (! $program->crud_ready || $program->crud_building) {
            throw ValidationException::withMessages(['program_id' => 'Prepare el CRUD en el primer paso antes de darlo de alta.']);
        }
        $definition = app(GeneratedCrud::class)->definition($program);
        if (! hash_equals($program->crud_schema_hash ?? '', app(GeneratedCrud::class)->signature($program->table_name, $program->table_connection))) {
            throw ValidationException::withMessages(['program_id' => 'La estructura de la tabla cambió. Revise la configuración del CRUD antes de habilitarlo.']);
        }

        return $definition;
    }

    public function prepare(int $id, string $snapshot, User $actor, bool $discover = false): array
    {
        $this->authorize($actor);

        return Cache::lock('generated-program-wizard-'.$id, 60)->block(5, function () use ($id, $snapshot, $actor, $discover): array {
            $program = $this->fresh($id, $snapshot);
            if ($discover) {
                app(GeneratedCrudDiscovery::class)->import($id, $actor);
            } elseif (! $program->crud_ready) {
                app(GeneratedCrud::class)->prepare($id, $actor);
            } else {
                $this->checkSchema($program);
            }

            return $this->state($id, $actor);
        });
    }

    public function publish(array $input, User $actor): array
    {
        $this->authorize($actor);
        $data = Validator::make($input, [
            'program_id' => ['required', 'integer', 'min:1'], 'snapshot' => ['required', 'string', 'size:64'],
            'route_id' => ['nullable', 'integer'], 'menu_id' => ['nullable', 'integer'],
            'route_name' => ['required', 'string', 'max:200', 'regex:/^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/D'], 'route_uri' => ['required', 'string', 'max:200', 'regex:/^\/[a-zA-Z0-9\/._-]+$/D'],
            'menu_label' => ['required', 'string', 'max:200'], 'parent_id' => ['required', 'integer', 'min:1'], 'is_public' => ['required', 'boolean'],
            'grants' => ['present', 'array', 'max:500'], 'grants.*.user_id' => ['required', 'integer', 'distinct'],
            'grants.*.can_view' => ['required', 'boolean'], 'grants.*.can_create' => ['required', 'boolean'],
            'grants.*.can_update' => ['required', 'boolean'], 'grants.*.can_delete' => ['required', 'boolean'],
            'revoked_user_ids' => ['present', 'array', 'max:500'], 'revoked_user_ids.*' => ['required', 'integer', 'distinct'],
            'grant_related_view' => ['sometimes', 'boolean'],
        ])->validate();
        $data += ['route_id' => null, 'menu_id' => null, 'grant_related_view' => false];
        $data['grants'] = array_map(fn (array $grant): array => array_intersect_key($grant, array_flip(['user_id', 'can_view', 'can_create', 'can_update', 'can_delete'])), $data['grants']);
        try {
            return Cache::lock('generated-program-wizard-'.$data['program_id'], 60)->block(5, function () use ($data, $actor): array {
                DB::transaction(function () use ($data, $actor): void {
                    DB::table('generated_programs')->where('id', $data['program_id'])->lockForUpdate()->first();
                    $program = $this->fresh($data['program_id'], $data['snapshot']);
                    $definition = $this->checkSchema($program);
                    $bindings = $this->bindings($program);
                    $route = $data['route_id'] ? collect($bindings['routes'])->firstWhere('id', $data['route_id']) : null;
                    if ($data['route_id'] && ! $route) {
                        throw ValidationException::withMessages(['route_id' => 'La ruta seleccionada no pertenece a este programa.']);
                    }
                    $menu = $data['menu_id'] ? collect($bindings['menus'])->firstWhere('id', $data['menu_id']) : null;
                    if ($data['menu_id'] && (! $menu || ! $route || $menu->route_name !== $route->name)) {
                        throw ValidationException::withMessages(['menu_id' => 'La opción del menú no corresponde a la ruta y al programa seleccionados.']);
                    }
                    $seen = [];
                    $parent = $data['parent_id'];
                    while ($parent !== 0) {
                        $node = DB::table('menu_items')->where('id', $parent)->lockForUpdate()->first();
                        if (! $node || ! $node->active || $node->archived || in_array($parent, $seen, true)) {
                            throw ValidationException::withMessages(['parent_id' => 'Seleccione un grupo del menú con toda su jerarquía activa.']);
                        }
                        $seen[] = $parent;
                        $parent = (int) $node->parent_id;
                    }
                    if (array_intersect(array_column($data['grants'], 'user_id'), $data['revoked_user_ids'])) {
                        throw ValidationException::withMessages(['grants' => 'Un usuario no puede tener permisos asignados y retirados a la vez.']);
                    }
                    foreach ($data['grants'] as $grant) {
                        $user = DB::table('users')->where('id', $grant['user_id'])->lockForUpdate()->first();
                        if (! $user || ! $user->erp_active || ! $user->ldap_username) {
                            throw ValidationException::withMessages(['grants' => 'Solo puede asignar permisos a usuarios corporativos activos.']);
                        }
                        if (! $grant['can_view'] && ($grant['can_create'] || $grant['can_update'] || $grant['can_delete'])) {
                            throw ValidationException::withMessages(['grants' => 'Habilite Consultar para los usuarios que podrán crear, modificar o eliminar.']);
                        }
                    }
                    app(GeneratedPrograms::class)->save(['id' => $program->id, 'revision' => $program->revision, 'title' => $program->title, 'active' => 1], true, $actor);
                    $routes = new AccessDataSource('programas', $actor);
                    $routeValues = ['label' => $route?->label ?? $data['menu_label'], 'name' => $data['route_name'], 'uri' => $data['route_uri'],
                        'http_method' => 'GET|POST', 'program' => $this->action($program), 'program_parameters' => '{}', 'active' => 1];
                    $routeRecord = $route ? $routes->update($routeValues + ['id' => $route->id, 'revision' => $route->revision]) : $routes->create($routeValues);
                    app(ManagedApplicationRoutes::class)->load();
                    $menus = new AccessDataSource('menu', $actor);
                    $menuValues = ['label' => $data['menu_label'], 'parent_id' => $data['parent_id'], 'active' => 1, 'migration_enabled' => 1,
                        'is_public' => $data['is_public'], 'route_name' => $routeRecord['name'], 'route_parameters' => '{}', 'legacy_url' => $menu?->legacy_url ?? ''];
                    $menuRecord = $menu ? $menus->update($menuValues + ['id' => $menu->id, 'revision' => $menu->revision]) : $menus->create($menuValues);
                    $permissions = new AccessDataSource('permisos', $actor);
                    foreach ($data['grants'] as $grant) {
                        $old = DB::table('menu_grants')->where('menu_item_id', $menuRecord['id'])->where('user_id', $grant['user_id'])->first();
                        $values = $grant + ['menu_item_id' => $menuRecord['id'], 'can_approve' => (bool) ($old?->can_approve ?? false)];
                        $old ? $permissions->update($values + ['id' => $old->id, 'revision' => $old->revision]) : $permissions->create($values);
                        if ($grant['can_view']) {
                            foreach (array_unique(array_column($definition['relations'], 'menu')) as $relatedMenu) {
                                $user = User::findOrFail($grant['user_id']);
                                if (app(MenuAccess::class)->permissions($user, $relatedMenu)['view']) {
                                    continue;
                                }
                                if (! $data['grant_related_view']) {
                                    throw ValidationException::withMessages(['grants' => 'El usuario '.$user->name.' necesita consultar los catálogos relacionados. Marque la opción para conceder consulta a esos catálogos y revise el resumen.']);
                                }
                                $oldRelated = DB::table('menu_grants')->where('menu_item_id', $relatedMenu)->where('user_id', $user->id)->lockForUpdate()->first();
                                $relatedValues = ['user_id' => $user->id, 'menu_item_id' => $relatedMenu, 'can_view' => true];
                                foreach (['can_create', 'can_update', 'can_delete', 'can_approve'] as $flag) {
                                    $relatedValues[$flag] = (bool) ($oldRelated?->$flag ?? false);
                                }
                                $oldRelated ? $permissions->update($relatedValues + ['id' => $oldRelated->id, 'revision' => $oldRelated->revision]) : $permissions->create($relatedValues);
                                if (! app(MenuAccess::class)->permissions($user, $relatedMenu)['view']) {
                                    throw ValidationException::withMessages(['grants' => 'El menú de un catálogo relacionado tiene restricciones o una jerarquía inactiva. Habilítelo antes de continuar.']);
                                }
                            }
                        }
                    }
                    foreach ($data['revoked_user_ids'] as $userId) {
                        $old = DB::table('menu_grants')->where('menu_item_id', $menuRecord['id'])->where('user_id', $userId)->first();
                        if (! $old) {
                            throw ValidationException::withMessages(['revoked_user_ids' => 'El permiso que desea retirar ya no existe. Recargue el asistente.']);
                        }
                        $permissions->delete(['id' => $old->id]);
                    }
                    app(GeneratedCrud::class)->audit($actor, 'generated_program_onboarded', $program->id, $menuRecord['id']);
                }, 3);

                return $this->state($data['program_id'], $actor);
            });
        } catch (KitValidationException $exception) {
            throw ValidationException::withMessages($exception->errors());
        } catch (QueryException $exception) {
            if (in_array((string) $exception->getCode(), ['23000', '23505'], true)) {
                throw ValidationException::withMessages(['route_name' => 'Ya existe una ruta, menú o permiso con los datos indicados. Recargue el programa y revise sus asociaciones.']);
            }
            throw $exception;
        } finally {
            app(ManagedApplicationRoutes::class)->load();
        }
    }
}
