<?php

namespace App\Support\Kits;

use App\Models\User;
use App\Support\Administration\Hierarchy;
use App\Support\Auth\LdapAuthenticator;
use App\Support\Menu\GeneratedCrud;
use App\Support\Menu\GeneratedPrograms;
use App\Support\Menu\ManagedApplicationRoutes;
use App\Support\Menu\MigratedMenuRoutes;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Ivandzb\CrudKit\Data\DataSource;
use Ivandzb\CrudKit\Data\ListQuery;
use Ivandzb\CrudKit\Data\ListResult;
use Ivandzb\CrudKit\Server\ValidationException as KitValidationException;
use RuntimeException;

class AccessDataSource implements DataSource
{
    /** @var array<int, string>|null */
    private ?array $menuLabels = null;

    private ?array $employeeLabels = null;

    public function __construct(private string $section, private User $actor) {}

    private function ability(): string
    {
        return match ($this->section) {
            'menu', 'rutas', 'programas' => 'menu.manage', 'permisos' => 'grants.manage', 'usuarios' => 'users.manage', 'opciones' => 'option-permissions.manage'
        };
    }

    private function table(): string
    {
        return match ($this->section) {
            'menu' => 'menu_items', 'rutas' => 'menu_route_actions', 'programas' => 'managed_application_routes', 'permisos' => 'menu_grants', 'usuarios' => 'users', 'opciones' => 'option_grants'
        };
    }

    public function list(ListQuery $query): ListResult
    {
        if ($this->section === 'campos') {
            return app(GeneratedCrud::class)->listFields($query, $this->actor);
        }
        if ($this->section === 'generador') {
            return app(GeneratedPrograms::class)->list($query, $this->actor);
        }
        Gate::forUser($this->actor)->authorize($this->ability());
        $columns = match ($this->section) {
            'menu' => ['id', 'label', 'parent_id', 'legacy_url', 'sort_order', 'icon', 'append_legacy_id', 'active', 'migration_enabled', 'migration_key', 'route_name', 'route_parameters', 'is_public', 'description', 'revision'],
            'rutas' => ['id', 'menu_item_id', 'route_name', 'operation', 'revision'],
            'programas' => ['id', 'label', 'name', 'uri', 'http_method', 'program', 'program_parameters', 'active', 'revision'],
            'permisos' => ['id', 'user_id', 'menu_item_id', 'can_view', 'can_create', 'can_update', 'can_delete', 'can_approve', 'revision'],
            'usuarios' => ['id', 'name', 'ldap_username', 'legacy_user_id', 'erp_active', 'erp_roles', 'access_revision', 'employee_id', 'corporate_email', 'siesa_username'],
            'opciones' => ['id', 'user_id', 'module', 'file', 'option_id', 'can_read', 'can_insert', 'can_write', 'can_delete', 'revision'],
        };
        $builder = DB::table($this->table())->select($columns);
        if ($this->section === 'menu') {
            $builder->where('archived', false);
        }
        foreach ($query->filters() as $field => $value) {
            if (! in_array($field, $columns, true) || in_array($field, ['erp_roles', 'description'], true)) {
                continue;
            }
            if (in_array($field, ['label', 'name', 'ldap_username', 'legacy_url', 'module', 'file'], true)) {
                $builder->whereRaw($field." LIKE ? ESCAPE '!'", ['%'.str_replace(['!', '%', '_'], ['!!', '!%', '!_'], (string) $value).'%']);
            } else {
                $builder->where($field, $value);
            }
        }
        foreach ($query->sorting() as [$field, $direction]) {
            if (in_array($field, $columns, true)) {
                $builder->orderBy($field, $direction);
            }
        }
        $total = (clone $builder)->count();
        $records = $builder->orderBy('id')->offset($query->offset() ?? 0)->limit(min($query->limit() ?? 20, 100))->get()
            ->map(fn (object $row): array => $this->record((array) $row))->all();

        return new ListResult($total, $records);
    }

    public function create(array $values): array
    {
        return $this->save($values, false);
    }

    public function update(array $values): array
    {
        return $this->save($values, true);
    }

    public function delete(array $keys): void
    {
        if ($this->section === 'campos') {
            app(GeneratedCrud::class)->deleteField($keys, $this->actor);

            return;
        }
        if ($this->section === 'generador') {
            app(GeneratedPrograms::class)->disable($keys, $this->actor);

            return;
        }
        Gate::forUser($this->actor)->authorize($this->ability());
        if (! in_array($this->section, ['menu', 'rutas', 'programas', 'permisos', 'opciones'], true)) {
            throw new RuntimeException('Deshabilite el registro para conservar el historial.');
        }
        $this->validateKit(function () use ($keys): void {
            $data = Validator::make($keys, ['id' => ['required', 'integer']])->validate();
            DB::transaction(function () use ($data, $keys): void {
                $row = DB::table($this->table())->where('id', $data['id'])->lockForUpdate()->first();
                if (! $row) {
                    throw ValidationException::withMessages(['id' => 'El permiso ya no existe.']);
                }
                if (in_array($this->section, ['menu', 'rutas', 'programas', 'opciones'], true)) {
                    Validator::make($keys, ['revision' => ['required', 'integer', Rule::in([$row->revision])]])->validate();
                }
                if ($this->section === 'menu') {
                    if (in_array((int) $row->id, [0, 50, 74], true) || DB::table('menu_items')->where('parent_id', $row->id)->where('archived', false)->exists()) {
                        throw ValidationException::withMessages(['id' => 'No se puede retirar una raíz ni una opción con hijos.']);
                    }
                    DB::table('menu_items')->where('id', $row->id)->update(['archived' => true, 'active' => false, 'migration_enabled' => false, 'revision' => $row->revision + 1, 'updated_at' => now()]);
                    app(Hierarchy::class)->reorder('menu_items', 3);
                    $this->audit('menu_archived', ['id' => $row->id]);

                    return;
                }
                if ($this->section === 'programas') {
                    DB::table($this->table())->where('id', $row->id)->update(['active' => false, 'revision' => $row->revision + 1, 'updated_at' => now()]);
                    $this->audit('application_route_disabled', ['id' => $row->id, 'name' => $row->name]);

                    return;
                }
                DB::table($this->table())->where('id', $row->id)->delete();
                if ($this->section === 'rutas') {
                    $this->audit('menu_route_revoked', ['id' => $row->id, 'menu_item_id' => $row->menu_item_id, 'route_name' => $row->route_name]);

                    return;
                }
                $this->audit($this->section === 'opciones' ? 'option_permission_revoked' : 'permission_revoked',
                    $this->section === 'opciones' ? ['user_id' => $row->user_id, 'module' => $row->module, 'file' => $row->file, 'option_id' => $row->option_id]
                        : ['user_id' => $row->user_id, 'menu_item_id' => $row->menu_item_id]);
            });
        });
    }

    private function save(array $input, bool $updating): array
    {
        if ($this->section === 'campos') {
            return app(GeneratedCrud::class)->saveField($input, $updating, $this->actor);
        }
        if ($this->section === 'generador') {
            return app(GeneratedPrograms::class)->save($input, $updating, $this->actor);
        }
        Gate::forUser($this->actor)->authorize($this->ability());

        return $this->validateKit(function () use ($input, $updating): array {
            return DB::transaction(function () use ($input, $updating): array {
                $old = null;
                if ($updating) {
                    Validator::make($input, ['id' => ['required', 'integer'], 'revision' => ['required', 'integer']])->validate();
                    $old = DB::table($this->table())->where('id', $input['id'])->lockForUpdate()->first();
                    $revision = $this->section === 'usuarios' ? 'access_revision' : 'revision';
                    if (! $old || (int) $old->$revision !== (int) $input['revision']) {
                        throw ValidationException::withMessages(['revision' => 'El registro cambió. Actualice el listado antes de guardar.']);
                    }
                }
                if ($this->section === 'usuarios') {
                    if (! in_array('administrador', $this->actor->erp_roles ?? [], true)) {
                        if (! empty($input['is_admin']) || ($old && in_array('administrador', json_decode($old->erp_roles ?? '[]', true), true))) {
                            abort(403);
                        }
                        $input['is_admin'] = false;
                    }
                    $input['name'] ??= $old?->name;
                    $data = Validator::make($input, ['erp_active' => ['required', 'boolean'], 'is_admin' => ['required', 'boolean'],
                        'name' => ['required', 'string', 'max:180'], 'employee_id' => ['sometimes', 'nullable', 'integer', Rule::exists('employees', 'id')],
                        'corporate_email' => ['sometimes', 'nullable', 'string', 'max:100'], 'siesa_username' => ['sometimes', 'nullable', 'string', 'max:8']])->validate();
                    $wasAdmin = $old && in_array('administrador', json_decode($old->erp_roles ?? '[]', true), true);
                    if ($wasAdmin && $old->erp_active && (! $data['erp_active'] || ! $data['is_admin'])
                        && ! User::where('id', '<>', $old->id)->where('erp_active', true)->whereJsonContains('erp_roles', 'administrador')->exists()) {
                        throw ValidationException::withMessages(['is_admin' => 'Debe conservar al menos un administrador activo.']);
                    }
                    $data['erp_roles'] = json_encode([$data['is_admin'] ? 'administrador' : 'usuario']);
                    unset($data['is_admin']);
                    foreach (['corporate_email', 'siesa_username'] as $field) {
                        if (array_key_exists($field, $data)) {
                            $data[$field] ??= '';
                        }
                    }
                    $data['access_revision'] = $old ? $old->access_revision + 1 : 1;
                    $data['token_version'] = $old ? $old->token_version + 1 : 1;
                    $data['profile_imported'] = false;
                    if ($old) {
                        DB::table('erp_auth_tokens')->where('user_id', $old->id)->update(['revoked_at' => now()]);
                    } else {
                        Validator::make($input, ['ldap_username' => ['required', 'string', 'max:100']])->validate();
                        try {
                            $data['ldap_username'] = app(LdapAuthenticator::class)->normalizeUsername($input['ldap_username']);
                        } catch (AuthenticationException) {
                            throw ValidationException::withMessages(['ldap_username' => 'Escriba un usuario válido del directorio corporativo.']);
                        }
                        Validator::make($data, ['ldap_username' => [Rule::unique('users')]])->validate();
                        $data['email'] = 'ldap-'.hash('sha256', $data['ldap_username']).'@erp.invalid';
                        $data['password'] = null;
                    }
                } elseif ($this->section === 'menu') {
                    $registry = app(MigratedMenuRoutes::class);
                    $routeInput = array_key_exists('route_name', $input);
                    $parameters = [];
                    if ($routeInput) {
                        $input['route_name'] = $input['route_name'] === '' ? null : $input['route_name'];
                        if ($input['route_name'] !== null) {
                            Validator::make($input, ['route_name' => ['required', 'string', 'max:200']])->validate();
                            $parameters = $registry->parameters($input['route_name'], $input['route_parameters'] ?? $old?->route_parameters);
                            $input['migration_key'] = $registry->keyForRoute($input['route_name'], $parameters) ?? ($old ? 'menu.'.$old->id : null);
                            $bindings = DB::table('menu_items')->where('route_name', $input['route_name'])->when($old, fn ($query) => $query->where('id', '<>', $old->id))->lockForUpdate()->get();
                            foreach ($bindings as $binding) {
                                if ((json_decode($binding->route_parameters ?? '{}', true) ?? []) == $parameters) {
                                    throw ValidationException::withMessages(['route_name' => 'Esta ruta y sus parámetros ya están asociados al menú '.$binding->id.'.']);
                                }
                            }
                            if (DB::table('menu_route_actions')->where('route_name', $input['route_name'])->exists()) {
                                throw ValidationException::withMessages(['route_name' => 'La ruta ya está registrada como una acción del menú.']);
                            }
                        } else {
                            $input['migration_key'] = null;
                        }
                    }
                    if (isset($input['migration_key']) && is_string($input['migration_key']) && trim($input['migration_key']) === '') {
                        $input['migration_key'] = null;
                    }
                    $data = Validator::make($input, [
                        'label' => ['required', 'string', 'max:200'],
                        'parent_id' => ['required', 'integer', 'min:0'],
                        'legacy_url' => ['nullable', 'string', 'max:2000'],
                        'sort_order' => ['nullable', 'string', 'max:200'],
                        'icon' => ['sometimes', 'nullable', 'string', 'max:60'],
                        'append_legacy_id' => ['sometimes', 'boolean'],
                        'active' => ['required', 'boolean'], 'is_public' => ['required', 'boolean'],
                        'migration_enabled' => ['sometimes', 'boolean'],
                        'migration_key' => ['nullable', 'string', 'max:100',
                            Rule::in(array_merge(array_keys($registry->options()), $routeInput && $old ? ['menu.'.$old->id] : [])),
                            Rule::unique('menu_items')->ignore($old?->id)],
                        'description' => ['nullable', 'string', 'max:5000'],
                    ])->validate();
                    $data['migration_enabled'] ??= (bool) ($old?->migration_enabled ?? false);
                    $data['migration_key'] = array_key_exists('migration_key', $input)
                        ? ($data['migration_key'] ?? null) : $old?->migration_key;
                    if ($data['migration_enabled'] && ($routeInput ? ! $input['route_name'] : ! $registry->url($data['migration_key']))) {
                        throw ValidationException::withMessages(['route_name' => 'Seleccione una ruta Laravel antes de habilitar la opción en ERP.']);
                    }
                    if ($routeInput) {
                        $data['route_name'] = $input['route_name'];
                        $data['route_parameters'] = json_encode($parameters === [] ? (object) [] : $parameters);
                        $canonical = array_map(strval(...), $parameters);
                        ksort($canonical);
                        $data['route_signature'] = $input['route_name'] ? hash('sha256', $input['route_name'].'|'.json_encode($canonical)) : null;
                        Validator::make($data, ['route_signature' => ['nullable', Rule::unique('menu_items')->ignore($old?->id)]])->validate();
                    }
                    $parent = (int) $data['parent_id'];
                    $seen = $old ? [$old->id] : [];
                    if ($old && in_array($old->id, [0, 50, 74], true) && ($parent !== 0 || ! $data['active'])) {
                        throw ValidationException::withMessages(['parent_id' => 'Las raíces del menú deben permanecer activas y sin padre.']);
                    }
                    if ((! $old || ! in_array($old->id, [0, 50, 74], true)) && $parent === 0) {
                        throw ValidationException::withMessages(['parent_id' => 'Seleccione un padre dentro de las raíces 50 o 74.']);
                    }
                    while ($parent !== 0) {
                        if (in_array($parent, $seen, true)) {
                            throw ValidationException::withMessages(['parent_id' => 'El padre generaría un ciclo.']);
                        }
                        $seen[] = $parent;
                        $node = DB::table('menu_items')->find($parent);
                        if (! $node || $node->archived) {
                            throw ValidationException::withMessages(['parent_id' => 'El padre no existe.']);
                        }
                        $parent = $node->parent_id;
                    }
                    $data['legacy_url'] ??= '';
                    $data['sort_order'] ??= '';
                    unset($data['sort_order']);
                    $data['icon'] = $data['icon'] ?? ($old?->icon ?? '');
                    $data['revision'] = $old ? $old->revision + 1 : 1;
                } elseif ($this->section === 'programas') {
                    $registry = app(ManagedApplicationRoutes::class);
                    $programs = $registry->programs();
                    $input['name'] ??= $old?->name;
                    $data = Validator::make($input, [
                        'label' => ['required', 'string', 'max:200'],
                        'name' => ['required', 'string', 'max:200', 'regex:/^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/D', Rule::unique('managed_application_routes')->ignore($old?->id)],
                        'uri' => ['required', 'string', 'max:200'],
                        'http_method' => ['required', Rule::in(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'GET|POST'])],
                        'program' => ['required', 'string', Rule::in(array_keys($programs))],
                        'active' => ['sometimes', 'boolean'],
                    ])->validate();
                    if ($old && $data['name'] !== $old->name) {
                        throw ValidationException::withMessages(['name' => 'El nombre de la ruta no se modifica para conservar sus asociaciones al menú.']);
                    }
                    $program = $programs[$data['program']];
                    if (! empty($program['generated_crud_id']) && $data['http_method'] !== 'GET|POST') {
                        throw ValidationException::withMessages(['http_method' => 'Los formularios CRUD requieren GET y POST para mostrar la página y procesar sus operaciones.']);
                    }
                    if (array_diff(explode('|', $data['http_method']), $program['methods']) !== []) {
                        throw ValidationException::withMessages(['http_method' => 'El programa no admite este método HTTP.']);
                    }
                    $registry->validateAddress($data['name'], $data['uri'], $data['http_method'], $old?->id);
                    $parameters = $registry->parameters($program, $input['program_parameters'] ?? '{}');
                    $data['program_parameters'] = json_encode($parameters ?: (object) []);
                    $data['active'] ??= (bool) ($old?->active ?? false);
                    $data['revision'] = $old ? $old->revision + 1 : 1;
                } elseif ($this->section === 'rutas') {
                    $registry = app(MigratedMenuRoutes::class);
                    $data = Validator::make($input, [
                        'menu_item_id' => ['required', 'integer', Rule::exists('menu_items', 'id')->where('archived', false)],
                        'route_name' => ['required', 'string', 'max:200', Rule::in(array_keys($registry->catalog(false))), Rule::unique('menu_route_actions')->ignore($old?->id)],
                        'operation' => ['required', Rule::in(['view', 'create', 'update', 'delete', 'approve'])],
                    ])->validate();
                    $item = DB::table('menu_items')->where('id', $data['menu_item_id'])->lockForUpdate()->first();
                    if (! $registry->url($item->migration_key)) {
                        throw ValidationException::withMessages(['menu_item_id' => 'Seleccione un menú con una ruta de entrada asociada.']);
                    }
                    foreach ($registry->options() as $option) {
                        if ($option['route'] === $data['route_name']) {
                            throw ValidationException::withMessages(['route_name' => 'La ruta ya es una entrada del menú. Seleccione una ruta de acción diferente.']);
                        }
                    }
                    $data['revision'] = $old ? $old->revision + 1 : 1;
                } elseif ($this->section === 'opciones') {
                    foreach (['module', 'file'] as $field) {
                        if (isset($input[$field]) && is_string($input[$field])) {
                            $input[$field] = mb_strtolower($input[$field]);
                        }
                    }
                    $input['file'] ??= '';
                    $data = Validator::make($input, [
                        'user_id' => ['required', 'integer', Rule::exists('users', 'id')],
                        'module' => ['required', 'string', 'max:60', 'regex:/^\S+$/u'],
                        'file' => ['present', 'string', 'max:60', 'regex:/^\S*$/u'],
                        'option_id' => ['required', 'integer', 'min:0', 'max:4294967295',
                            Rule::unique('option_grants')->where('user_id', $input['user_id'] ?? null)
                                ->where('module', $input['module'] ?? '')->where('file', $input['file'])->ignore($old?->id)],
                        'can_read' => ['required', 'boolean'], 'can_insert' => ['required', 'boolean'],
                        'can_write' => ['required', 'boolean'], 'can_delete' => ['required', 'boolean'],
                    ])->validate();
                    $data['revision'] = $old ? $old->revision + 1 : 1;
                    $data['imported'] = false;
                } else {
                    $data = Validator::make($input, [
                        'user_id' => ['required', 'integer', Rule::exists('users', 'id')],
                        'menu_item_id' => ['required', 'integer', Rule::exists('menu_items', 'id'),
                            Rule::unique('menu_grants')->where('user_id', $input['user_id'] ?? null)->ignore($old?->id)],
                        'can_view' => ['required', 'boolean'], 'can_create' => ['required', 'boolean'],
                        'can_update' => ['required', 'boolean'], 'can_delete' => ['required', 'boolean'], 'can_approve' => ['required', 'boolean'],
                    ])->validate();
                    $data['revision'] = $old ? $old->revision + 1 : 1;
                    $data['imported'] = false;
                }
                $data['updated_at'] = now();
                if ($old) {
                    DB::table($this->table())->where('id', $old->id)->update($data);
                    $id = $old->id;
                } else {
                    $id = DB::table($this->table())->insertGetId($data + ['created_at' => now()]);
                }
                if ($this->section === 'menu') {
                    if ($routeInput && $data['route_name'] && ! $data['migration_key']) {
                        DB::table('menu_items')->where('id', $id)->update(['migration_key' => 'menu.'.$id]);
                    }
                    app(Hierarchy::class)->reorder('menu_items', 3, $id);
                }
                $this->audit('access_'.$this->section.'_'.($old ? 'updated' : 'created'), ['id' => $id, 'values' => $data]);

                return $this->record((array) DB::table($this->table())->find($id));
            });
        });
    }

    private function record(array $row): array
    {
        if ($this->section === 'menu') {
            if (! ($row['route_name'] ?? null) && ($row['migration_key'] ?? null)) {
                $option = app(MigratedMenuRoutes::class)->options()[$row['migration_key']] ?? null;
                $row['route_name'] = $option['route'] ?? null;
                $row['route_parameters'] = json_encode(($option['parameters'] ?? []) ?: (object) []);
            }
            $this->menuLabels ??= DB::table('menu_items')->pluck('label', 'id')->all();
            $parent = (int) $row['parent_id'];
            $row['parent_id__text'] = $parent === 0 ? 'Raíz' : $parent.' · '.($this->menuLabels[$parent] ?? 'Opción no disponible');
        }
        if ($this->section === 'usuarios') {
            $this->employeeLabels ??= DB::table('employees')->get()->mapWithKeys(fn (object $employee): array => [$employee->id => trim($employee->first_name.' '.$employee->last_name)])->all();

            return ['id' => $row['id'], 'name' => $row['name'], 'ldap_username' => $row['ldap_username'],
                'legacy_user_id' => $row['legacy_user_id'], 'erp_active' => (int) $row['erp_active'],
                'is_admin' => in_array('administrador', json_decode($row['erp_roles'] ?? '[]', true), true) ? 1 : 0,
                'revision' => $row['access_revision'], 'employee_id' => $row['employee_id'],
                'employee_id__text' => $row['employee_id'] === null ? '' : ($this->employeeLabels[$row['employee_id']] ?? (string) $row['employee_id']),
                'corporate_email' => $row['corporate_email'], 'siesa_username' => $row['siesa_username']];
        }
        unset($row['created_at'], $row['updated_at'], $row['imported'], $row['legacy_id']);
        foreach (['active', 'migration_enabled', 'is_public', 'can_view', 'can_create', 'can_update', 'can_delete', 'can_approve', 'can_read', 'can_insert', 'can_write'] as $key) {
            if (array_key_exists($key, $row)) {
                $row[$key] = (int) $row[$key];
            }
        }

        return $row;
    }

    private function audit(string $event, array $details): void
    {
        DB::table('erp_access_events')->insert(['user_id' => $this->actor->id, 'event' => $event,
            'actor' => 'web', 'details' => json_encode($details, JSON_THROW_ON_ERROR), 'created_at' => now()]);
    }

    private function validateKit(callable $callback): mixed
    {
        try {
            return $callback();
        } catch (ValidationException $exception) {
            throw new KitValidationException(array_map(fn (array $messages): string => $messages[0], $exception->errors()));
        }
    }
}
