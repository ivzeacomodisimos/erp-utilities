<?php

namespace App\Support\Kits;

use App\Models\User;
use App\Support\Administration\Hierarchy;
use App\Support\Administration\SystemObjects;
use App\Support\Administration\SystemsAccess;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Ivandzb\CrudKit\Data\DataSource;
use Ivandzb\CrudKit\Data\ListQuery;
use Ivandzb\CrudKit\Data\ListResult;
use Ivandzb\CrudKit\Server\ValidationException as KitValidationException;

class SystemsDataSource implements DataSource
{
    public const TABLES = ['empleados' => 'employees', 'tipos-documento' => 'user_document_defaults', 'objetos' => 'system_objects', 'objetos-usuarios' => 'system_object_values'];

    private array $labels = [];

    public function __construct(private string $section, private User $actor) {}

    private function authorize(string $operation): void
    {
        abort_unless(app(SystemsAccess::class)->allows($this->actor, $this->section, $operation), 403);
    }

    private function groups(): ?array
    {
        return app(SystemObjects::class)->employeeGroups($this->actor);
    }

    public function list(ListQuery $query): ListResult
    {
        $this->authorize('list');
        $builder = DB::table(self::TABLES[$this->section]);
        $columns = match ($this->section) {
            'empleados' => ['id', 'management_id', 'identity_number', 'first_name', 'last_name', 'email', 'status', 'internal_code', 'revision', 'updated_at'],
            'tipos-documento' => ['id', 'user_id', 'module', 'file', 'document_type', 'revision', 'updated_at'],
            'objetos' => ['id', 'parent_id', 'name', 'description', 'sort_order', 'default_value', 'revision', 'updated_at'],
            'objetos-usuarios' => ['id', 'user_id', 'object_id', 'value', 'revision', 'updated_at'],
        };
        if ($this->section === 'empleados' && $this->groups() !== null) {
            $builder->whereIn('management_id', $this->groups());
            $columns = array_values(array_diff($columns, ['internal_code']));
        }
        $builder->select($columns);
        foreach ($query->filters() as $field => $value) {
            if (! in_array($field, $columns, true)) {
                continue;
            } if (in_array($field, ['id', 'user_id', 'parent_id', 'management_id', 'object_id', 'status'], true)) {
                $builder->where($field, $value);
            } else {
                $builder->whereRaw($field." LIKE ? ESCAPE '!'", ['%'.str_replace(['!', '%', '_'], ['!!', '!%', '!_'], (string) $value).'%']);
            }
        }
        foreach ($query->sorting() as [$field,$direction]) {
            if (in_array($field, $columns, true)) {
                $builder->orderBy($field, $direction);
            }
        }
        $total = (clone $builder)->count();
        $rows = $builder->orderBy('id')->offset($query->offset() ?? 0)->limit(min($query->limit() ?? 20, 100))->get();

        return new ListResult($total, $rows->map(fn (object $row): array => $this->record((array) $row))->all());
    }

    public function create(array $values): array
    {
        return $this->save($values, false);
    }

    public function update(array $values): array
    {
        return $this->save($values, true);
    }

    private function save(array $input, bool $update): array
    {
        $this->authorize($update ? 'update' : 'create');

        return $this->validate(function () use ($input, $update): array {
            return DB::transaction(function () use ($input, $update): array {
                $table = self::TABLES[$this->section];
                $old = null;
                if ($update) {
                    Validator::make($input, ['id' => ['required', 'integer'], 'revision' => ['required', 'integer']])->validate();
                    $old = DB::table($table)->where('id', $input['id'])->lockForUpdate()->first();
                    if (! $old || (int) $old->revision !== (int) $input['revision']) {
                        throw ValidationException::withMessages(['revision' => 'El registro cambió. Actualice antes de guardar.']);
                    }
                }
                if ($this->section === 'empleados') {
                    foreach (['identity_number', 'internal_code'] as $key) {
                        if ($old && is_string($old->$key) && isset($input[$key]) && is_string($input[$key]) && trim($input[$key]) === trim($old->$key)) {
                            $input[$key] = $old->$key;
                        }
                        if (isset($input[$key]) && trim((string) $input[$key]) === '') {
                            $input[$key] = null;
                        }
                    }
                    $rules = ['management_id' => ['required', 'integer', Rule::exists('employee_groups', 'id')], 'identity_number' => ['nullable', 'string', 'max:25', Rule::unique($table)->ignore($old?->id)], 'first_name' => ['required', 'string', 'max:50'], 'last_name' => ['nullable', 'string', 'max:50'], 'email' => ['nullable', 'string', 'max:100'], 'status' => ['required', Rule::in(['A', 'R'])], 'internal_code' => ['nullable', 'string', 'max:4', Rule::unique($table)->ignore($old?->id)]];
                    $groups = $this->groups();
                    if ($groups !== null) {
                        $rules['management_id'][] = Rule::in($groups);
                        $rules['internal_code'] = ['prohibited'];
                        if ($old && ! in_array((int) $old->management_id, $groups, true)) {
                            abort(403);
                        }
                    }
                } elseif ($this->section === 'objetos') {
                    $rules = ['parent_id' => ['required', 'integer', 'min:0'], 'name' => ['required', 'string', 'max:60', 'regex:/^[A-Za-zÀ-ÿ_][A-Za-zÀ-ÿ0-9_]* *$/u'], 'description' => ['nullable', 'string', 'max:5000'], 'default_value' => ['present', 'nullable', 'string', 'max:100000']];
                } elseif ($this->section === 'objetos-usuarios') {
                    $input['value'] ??= '';
                    $rules = ['user_id' => ['required', 'integer', Rule::exists('users', 'id')], 'object_id' => ['required', 'integer', Rule::exists('system_objects', 'id'), Rule::unique($table)->where('user_id', $input['user_id'] ?? null)->ignore($old?->id)], 'value' => ['present', 'string', 'max:100000']];
                } else {
                    foreach (['module', 'file'] as $key) {
                        if (isset($input[$key]) && is_string($input[$key])) {
                            $input[$key] = mb_strtolower($input[$key]);
                        }
                    }
                    $rules = ['user_id' => ['required', 'integer', Rule::exists('users', 'id')], 'module' => ['required', 'string', 'max:60', 'regex:/^\\S+$/u'], 'file' => ['required', 'string', 'max:60', 'regex:/^\\S+$/u', Rule::unique($table)->where('user_id', $input['user_id'] ?? null)->where('module', $input['module'] ?? '')->ignore($old?->id)], 'document_type' => ['required', 'string', 'max:4', Rule::exists('document_types', 'code')]];
                }
                $data = Validator::make($input, $rules)->validate();
                if ($this->section === 'empleados') {
                    foreach (['identity_number', 'internal_code'] as $field) {
                        if (($data[$field] ?? null) !== null) {
                            $duplicate = DB::table('employees')->whereRaw('LOWER('.$field.') = ?', [mb_strtolower($data[$field])]);
                            if ($old) {
                                $duplicate->where('id', '<>', $old->id);
                            }
                            if ($duplicate->exists()) {
                                throw ValidationException::withMessages([$field => 'Ese identificador ya está asignado a otro empleado.']);
                            }
                        }
                    }
                }
                if ($this->section === 'objetos') {
                    app(Hierarchy::class)->validateParent($table, $old?->id, (int) $data['parent_id']);
                    $data['default_value'] ??= '';
                }
                if ($this->section === 'tipos-documento' && $old && ((int) $old->user_id !== (int) $data['user_id'] || $old->module !== $data['module'] || $old->file !== $data['file'])) {
                    throw ValidationException::withMessages(['module' => 'Usuario, módulo y archivo no cambian al editar.']);
                }
                if ($this->section === 'empleados') {
                    $data['last_name'] ??= '';
                    $data['email'] ??= '';
                }
                $data += ['imported' => false, 'revision' => $old ? $old->revision + 1 : 1, 'updated_at' => now()];
                if ($old) {
                    DB::table($table)->where('id', $old->id)->update($data);
                    $id = $old->id;
                } else {
                    $id = DB::table($table)->insertGetId($data + ['created_at' => now()]);
                }
                if ($this->section === 'objetos') {
                    app(Hierarchy::class)->reorder($table, 2, $id);
                }
                $this->audit($update ? 'updated' : 'created', ['id' => $id]);

                return $this->record((array) DB::table($table)->find($id));
            }, 3);
        });
    }

    public function delete(array $keys): void
    {
        $this->authorize('delete');
        $this->validate(function () use ($keys): void {
            DB::transaction(function () use ($keys): void {
                $data = Validator::make($keys, ['id' => ['required', 'integer'], 'revision' => ['required', 'integer']])->validate();
                $table = self::TABLES[$this->section];
                $row = DB::table($table)->where('id', $data['id'])->lockForUpdate()->first();
                if (! $row || (int) $row->revision !== (int) $data['revision']) {
                    throw ValidationException::withMessages(['revision' => 'El registro cambió. Actualice antes de eliminar.']);
                }
                if ($this->section === 'empleados') {
                    DB::table($table)->where('id', $row->id)->update(['status' => 'R', 'imported' => false, 'revision' => $row->revision + 1, 'updated_at' => now()]);
                } else {
                    DB::table($table)->where('id', $row->id)->delete();
                }
                $this->audit('removed', ['id' => $row->id]);
            });
        });
    }

    private function label(string $table, string $column, int|string $id): string
    {
        $this->labels[$table] ??= DB::table($table)->pluck($column, $table === 'document_types' ? 'code' : 'id')->all();

        return (string) ($this->labels[$table][$id] ?? $id);
    }

    private function record(array $row): array
    {
        unset($row['imported'],$row['created_at']);
        foreach (['user_id' => ['users', 'name'], 'management_id' => ['employee_groups', 'name'], 'parent_id' => ['system_objects', 'name'], 'object_id' => ['system_objects', 'name'], 'document_type' => ['document_types', 'description']] as $key => [$table,$column]) {
            if (array_key_exists($key, $row)) {
                $row[$key.'__text'] = $key === 'parent_id' && (int) $row[$key] === 0 ? 'Raíz' : $this->label($table, $column, $row[$key] ?? '');
            }
        }
        if ($this->section === 'empleados' && $this->groups() !== null) {
            unset($row['internal_code']);
        }

        return $row;
    }

    private function audit(string $event, array $details): void
    {
        DB::table('erp_access_events')->insert(['user_id' => $this->actor->id, 'actor' => $this->actor->ldap_username, 'event' => 'systems_'.$this->section.'_'.$event, 'details' => json_encode($details, JSON_THROW_ON_ERROR), 'created_at' => now()]);
    }

    private function validate(callable $action): mixed
    {
        try {
            return $action();
        } catch (ValidationException $e) {
            throw new KitValidationException(array_map(fn (array $messages): string => $messages[0], $e->errors()));
        }
    }
}
