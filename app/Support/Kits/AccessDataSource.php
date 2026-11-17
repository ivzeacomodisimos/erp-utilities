<?php

namespace App\Support\Kits;

use App\Models\User;
use App\Support\Menu\MigratedMenuRoutes;
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
    public function __construct(private string $section, private User $actor) {}

    private function table(): string
    {
        return match ($this->section) {
            'menu' => 'menu_items', 'permisos' => 'menu_grants', 'usuarios' => 'users', 'opciones' => 'option_grants'
        };
    }

    public function list(ListQuery $query): ListResult
    {
        Gate::forUser($this->actor)->authorize($this->section === 'opciones' ? 'option-permissions.manage' : 'menu.manage');
        $columns = match ($this->section) {
            'menu' => ['id', 'label', 'parent_id', 'legacy_url', 'sort_order', 'active', 'migration_enabled', 'migration_key', 'is_public', 'description', 'revision'],
            'permisos' => ['id', 'user_id', 'menu_item_id', 'can_view', 'can_create', 'can_update', 'can_delete', 'can_approve', 'revision'],
            'usuarios' => ['id', 'name', 'ldap_username', 'legacy_user_id', 'erp_active', 'erp_roles', 'access_revision'],
            'opciones' => ['id', 'user_id', 'module', 'file', 'option_id', 'can_read', 'can_insert', 'can_write', 'can_delete', 'revision'],
        };
        $builder = DB::table($this->table())->select($columns);
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
        Gate::forUser($this->actor)->authorize($this->section === 'opciones' ? 'option-permissions.manage' : 'menu.manage');
        if (! in_array($this->section, ['permisos', 'opciones'], true)) {
            throw new RuntimeException('Deshabilite el registro para conservar el historial.');
        }
        $this->validateKit(function () use ($keys): void {
            $data = Validator::make($keys, ['id' => ['required', 'integer']])->validate();
            DB::transaction(function () use ($data, $keys): void {
                $row = DB::table($this->table())->where('id', $data['id'])->lockForUpdate()->first();
                if (! $row) {
                    throw ValidationException::withMessages(['id' => 'El permiso ya no existe.']);
                }
                if ($this->section === 'opciones') {
                    Validator::make($keys, ['revision' => ['required', 'integer', Rule::in([$row->revision])]])->validate();
                }
                DB::table($this->table())->where('id', $row->id)->delete();
                $this->audit($this->section === 'opciones' ? 'option_permission_revoked' : 'permission_revoked',
                    $this->section === 'opciones' ? ['user_id' => $row->user_id, 'module' => $row->module, 'file' => $row->file, 'option_id' => $row->option_id]
                        : ['user_id' => $row->user_id, 'menu_item_id' => $row->menu_item_id]);
            });
        });
    }

    private function save(array $input, bool $updating): array
    {
        Gate::forUser($this->actor)->authorize($this->section === 'opciones' ? 'option-permissions.manage' : 'menu.manage');

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
                    if (! $old) {
                        throw ValidationException::withMessages(['id' => 'Importe o habilite usuarios corporativos mediante el comando erp:access.']);
                    }
                    $data = Validator::make($input, ['erp_active' => ['required', 'boolean'], 'is_admin' => ['required', 'boolean']])->validate();
                    $wasAdmin = in_array('administrador', json_decode($old->erp_roles ?? '[]', true), true);
                    if ($wasAdmin && $old->erp_active && (! $data['erp_active'] || ! $data['is_admin'])
                        && ! User::where('id', '<>', $old->id)->where('erp_active', true)->whereJsonContains('erp_roles', 'administrador')->exists()) {
                        throw ValidationException::withMessages(['is_admin' => 'Debe conservar al menos un administrador activo.']);
                    }
                    $data = ['erp_active' => $data['erp_active'], 'erp_roles' => json_encode([$data['is_admin'] ? 'administrador' : 'usuario']),
                        'access_revision' => $old->access_revision + 1, 'token_version' => $old->token_version + 1];
                    DB::table('erp_auth_tokens')->where('user_id', $old->id)->update(['revoked_at' => now()]);
                } elseif ($this->section === 'menu') {
                    if (isset($input['migration_key']) && is_string($input['migration_key']) && trim($input['migration_key']) === '') {
                        $input['migration_key'] = null;
                    }
                    $data = Validator::make($input, [
                        'label' => ['required', 'string', 'max:200'],
                        'parent_id' => ['required', 'integer', 'min:0'],
                        'legacy_url' => ['nullable', 'string', 'max:2000'],
                        'sort_order' => ['nullable', 'string', 'max:200'],
                        'active' => ['required', 'boolean'], 'is_public' => ['required', 'boolean'],
                        'migration_enabled' => ['sometimes', 'boolean'],
                        'migration_key' => ['nullable', 'string', 'max:100',
                            Rule::in(array_keys(app(MigratedMenuRoutes::class)->options())),
                            Rule::unique('menu_items')->ignore($old?->id)],
                        'description' => ['nullable', 'string', 'max:5000'],
                    ])->validate();
                    $data['migration_enabled'] ??= (bool) ($old?->migration_enabled ?? false);
                    $data['migration_key'] = array_key_exists('migration_key', $input)
                        ? ($data['migration_key'] ?? null) : $old?->migration_key;
                    if ($data['migration_enabled'] && ! app(MigratedMenuRoutes::class)->url($data['migration_key'])) {
                        throw ValidationException::withMessages(['migration_key' => 'Seleccione una funcionalidad migrada antes de habilitar la opción en ERP.']);
                    }
                    $parent = (int) $data['parent_id'];
                    $seen = $old ? [$old->id] : [];
                    if ($old && in_array($old->id, [50, 74], true) && ($parent !== 0 || ! $data['active'])) {
                        throw ValidationException::withMessages(['parent_id' => 'Las raíces del menú deben permanecer activas y sin padre.']);
                    }
                    if ((! $old || ! in_array($old->id, [50, 74], true)) && $parent === 0) {
                        throw ValidationException::withMessages(['parent_id' => 'Seleccione un padre dentro de las raíces 50 o 74.']);
                    }
                    while ($parent !== 0) {
                        if (in_array($parent, $seen, true)) {
                            throw ValidationException::withMessages(['parent_id' => 'El padre generaría un ciclo.']);
                        }
                        $seen[] = $parent;
                        $node = DB::table('menu_items')->find($parent);
                        if (! $node) {
                            throw ValidationException::withMessages(['parent_id' => 'El padre no existe.']);
                        }
                        $parent = $node->parent_id;
                    }
                    $data['legacy_url'] ??= '';
                    $data['sort_order'] ??= '';
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
                $this->audit('access_'.$this->section.'_'.($old ? 'updated' : 'created'), ['id' => $id, 'values' => $data]);

                return $this->record((array) DB::table($this->table())->find($id));
            });
        });
    }

    private function record(array $row): array
    {
        if ($this->section === 'usuarios') {
            return ['id' => $row['id'], 'name' => $row['name'], 'ldap_username' => $row['ldap_username'],
                'legacy_user_id' => $row['legacy_user_id'], 'erp_active' => (int) $row['erp_active'],
                'is_admin' => in_array('administrador', json_decode($row['erp_roles'] ?? '[]', true), true) ? 1 : 0,
                'revision' => $row['access_revision']];
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
