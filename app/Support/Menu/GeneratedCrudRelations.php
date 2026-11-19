<?php

namespace App\Support\Menu;

use App\Models\User;
use Illuminate\Database\Query\Builder;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\ColumnDefinition;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class GeneratedCrudRelations
{
    private function target(object $field): object
    {
        $program = DB::table('generated_programs')->where('id', $field->related_program_id ?? null)
            ->where('program_type', 'crud')->where('crud_ready', true)->first();
        if (! $program) {
            throw ValidationException::withMessages(['related_program_id' => 'Seleccione un catálogo CRUD preparado.']);
        }
        $bound = DB::table('menu_items as menu')->join('managed_application_routes as route', 'route.name', '=', 'menu.route_name')
            ->where('menu.id', $field->related_menu_id ?? null)->where('menu.archived', false)
            ->where('menu.active', true)->where('menu.migration_enabled', true)->where('route.active', true)
            ->where('route.program', 'controller:App\\Http\\Controllers\\'.$program->controller_name.'@index')->exists();
        if (! $bound) {
            throw ValidationException::withMessages(['related_menu_id' => 'El menú relacionado debe estar habilitado y ejecutar el catálogo seleccionado.']);
        }

        return $program;
    }

    public function resolve(object $field): array
    {
        $program = $this->target($field);
        $crud = app(GeneratedCrud::class);
        $storage = app(GeneratedCrudStorage::class)->forProgram($program);
        $columns = $crud->columns($program->table_name, $program->table_connection ?? '');
        if (! $program->active || ! hash_equals($program->crud_schema_hash ?? '', $crud->signature($program->table_name, $program->table_connection ?? ''))) {
            throw ValidationException::withMessages(['related_program_id' => 'El catálogo debe estar activo y conservar su estructura validada.']);
        }
        $label = DB::table('generated_program_fields')->where('program_id', $program->id)
            ->where('column_name', $field->related_label ?? null)->whereIn('field_type', ['string', 'text'])->exists();
        if (! $label || ! isset($columns[$field->related_label])) {
            throw ValidationException::withMessages(['related_label' => 'Seleccione una columna de texto configurada en el catálogo relacionado.']);
        }

        return ['program' => $program, 'table' => $storage['table'], 'storage' => $storage, 'key' => 'id', 'label' => $field->related_label,
            'menu' => (int) $field->related_menu_id, 'columns' => $columns];
    }

    public function definitions(array $fields, string $ownerTable, string $ownerConnection = ''): array
    {
        $definitions = [];
        $columnNames = array_column($fields, 'column_name');
        $formFields = array_column($fields, null, 'column_name');
        $fields = array_filter($fields, fn (object $field): bool => $field->field_type === 'relation');
        if ($fields === []) {
            return [];
        }
        $owner = app(GeneratedCrudStorage::class)->resolve($ownerTable, $ownerConnection);
        $foreignKeys = $owner['schema']->hasTable($owner['table']) ? $owner['schema']->getForeignKeys($owner['table']) : [];
        foreach ($fields as $field) {
            if ($field->field_type !== 'relation') {
                continue;
            }
            $definition = $this->resolve($field);
            if (! app(GeneratedCrudStorage::class)->sameDatabase($owner, $definition['storage'])) {
                throw ValidationException::withMessages(['related_program_id' => 'Los catálogos relacionados deben usar la misma conexión y base de datos que el formulario.']);
            }
            $dependsOn = ($field->depends_on ?? null) ?: null;
            $filter = ($field->related_filter ?? null) ?: null;
            if ($dependsOn !== null || $filter !== null) {
                $parent = $formFields[$dependsOn ?? ''] ?? null;
                $targetField = DB::table('generated_program_fields')->where('program_id', $field->related_program_id)->where('column_name', $filter)->first();
                if (! $parent || $parent->column_name === $field->column_name || ! $targetField
                    || $this->family($parent->field_type) === null || $this->family($parent->field_type) !== $this->family($targetField->field_type)
                    || ! isset($definition['columns'][$filter])) {
                    throw ValidationException::withMessages(['depends_on' => 'Seleccione un campo padre del mismo formulario y una columna compatible configurada en el catálogo relacionado.']);
                }
                if ($parent->field_type === 'relation' && $targetField->field_type === 'relation'
                    && (int) $parent->related_program_id !== (int) $targetField->related_program_id) {
                    throw ValidationException::withMessages(['related_filter' => 'El campo padre y la columna de filtro deben referirse al mismo catálogo.']);
                }
            }
            $definition['depends_on'] = $dependsOn;
            $definition['related_filter'] = $filter;
            if (in_array($field->column_name.'__text', $columnNames, true)) {
                throw ValidationException::withMessages(['column_name' => 'El nombre colisiona con una columna de texto reservada para el autocomplete.']);
            }
            foreach ($foreignKeys as $foreign) {
                $schema = $foreign['foreign_schema'] ?? null;
                $outsideSchema = $schema !== null && $schema !== $definition['storage']['schema_name'];
                if (in_array($field->column_name, $foreign['columns'], true)
                    && ($outsideSchema || $foreign['columns'] !== [$field->column_name] || $foreign['foreign_table'] !== $definition['storage']['name'] || $foreign['foreign_columns'] !== ['id'])) {
                    throw ValidationException::withMessages(['related_program_id' => 'La relación no coincide con la clave foránea existente en la tabla.']);
                }
            }
            $definitions[$field->column_name] = $definition;
        }

        foreach ($definitions as $name => &$definition) {
            $parents = [];
            $visited = [$name => true];
            $current = $name;
            while ($parent = $definitions[$current]['depends_on'] ?? null) {
                if (isset($visited[$parent]) || count($parents) >= 8) {
                    throw ValidationException::withMessages(['depends_on' => 'La dependencia no puede formar ciclos ni superar ocho campos padre.']);
                }
                $visited[$parent] = true;
                $parents[$parent] = $formFields[$parent];
                $current = $parent;
            }
            $definition['dependency_fields'] = $parents;
        }
        unset($definition);

        return $definitions;
    }

    private function family(string $type): ?string
    {
        return match ($type) {
            'relation', 'integer' => 'integer', 'string', 'decimal', 'boolean', 'date', 'datetime', 'time', 'uuid' => $type, default => null,
        };
    }

    private function hasValue(mixed $value): bool
    {
        return $value !== null && $value !== '';
    }

    private function matchingQuery(array $definition, array $values, string $name): Builder
    {
        $query = $this->query($definition);
        if ($parent = $definition['depends_on'] ?? null) {
            if (! $this->hasValue($values[$parent] ?? null)) {
                throw ValidationException::withMessages([$name => 'Seleccione primero el campo padre de esta relación.']);
            }
            $query->where($definition['related_filter'], $values[$parent]);
        }

        return $query;
    }

    public function context(array $definitions, string $name, mixed $input): ?array
    {
        if ($input === null || $input === '') {
            $input = '{}';
        }
        if (! is_string($input) || strlen($input) > 8000 || ! is_object(json_decode($input))) {
            throw ValidationException::withMessages(['lookup_context' => 'El contexto de búsqueda debe ser un objeto JSON válido.']);
        }
        $values = (array) json_decode($input);
        $fields = $definitions[$name]['dependency_fields'];
        if (array_diff(array_keys($values), array_keys($fields)) !== []) {
            throw ValidationException::withMessages(['lookup_context' => 'El contexto contiene campos que no pertenecen a la dependencia configurada.']);
        }
        $rules = [];
        foreach ($fields as $key => $field) {
            if (! $this->hasValue($values[$key] ?? null)) {
                return null;
            }
            $rules[$key] = array_merge(['required'], match ($field->field_type) {
                'relation' => ['integer', 'min:1'], 'integer' => ['integer'], 'string' => ['string', 'max:'.$field->max_length],
                'decimal' => ['numeric', 'regex:/^-?\d{1,65}(?:\.\d{1,30})?$/D'], 'boolean' => ['boolean'], 'date' => ['date_format:Y-m-d'],
                'datetime', 'time' => GeneratedCrud::temporalRules($field->field_type), 'uuid' => ['uuid'],
            });
        }
        $values = Validator::make($values, $rules)->validate();
        $this->validateValues($definitions, $values, false);

        return $values;
    }

    public function authorize(array $fields, User $user): void
    {
        foreach ($fields as $field) {
            if ($field->field_type !== 'relation') {
                continue;
            }
            $permissions = app(MenuAccess::class)->permissions($user, (int) $field->related_menu_id);
            abort_unless($permissions['view'], 403, 'No tiene permiso de consulta en el menú del catálogo relacionado.');
            $program = $this->target($field);
            abort_unless($program->active && ! $program->crud_building, 403, 'El catálogo relacionado no está disponible.');
        }
    }

    public function query(array $definition): Builder
    {
        $query = $definition['storage']['connection']->table($definition['table']);
        if (isset($definition['columns']['deleted_at'])) {
            $query->whereNull('deleted_at');
        }

        return $query;
    }

    public function autocomplete(array $definitions, Request $request): array
    {
        $data = $request->validate(['field' => ['required', 'string', Rule::in(array_keys($definitions))], 'term' => ['nullable', 'string', 'max:100'], 'lookup_context' => ['nullable', 'string', 'max:8000']]);
        $context = $this->context($definitions, $data['field'], $data['lookup_context'] ?? null);
        $term = trim($data['term'] ?? '');
        if ($term === '' || $context === null) {
            return [];
        }
        $definition = $definitions[$data['field']];
        $label = $definition['label'];
        $wrapped = $definition['storage']['connection']->getQueryGrammar()->wrap($label);
        $pattern = '%'.str_replace(['!', '%', '_'], ['!!', '!%', '!_'], $term).'%';
        $query = $this->matchingQuery($definition, $context, $data['field'])->where(function (Builder $query) use ($wrapped, $pattern, $term): void {
            $query->whereRaw($wrapped." LIKE ? ESCAPE '!'", [$pattern]);
            if (ctype_digit($term)) {
                $query->orWhere('id', $term);
            }
        });

        return $query->select(['id', $label])->orderBy($label)->orderBy('id')->limit(20)->get()
            ->map(fn (object $row): array => ['id' => (string) $row->id, 'label' => mb_substr((string) $row->$label, 0, 200),
                'caption' => $definition['program']->title.' · '.$row->id])->all();
    }

    public function labels(array $definitions, iterable $rows): array
    {
        $rows = is_array($rows) ? $rows : iterator_to_array($rows);
        $labels = [];
        foreach ($definitions as $name => $definition) {
            $ids = array_values(array_unique(array_filter(array_map(fn (object $row): mixed => $row->$name, $rows), fn (mixed $id): bool => $id !== null)));
            $label = $definition['label'];
            $labels[$name] = $ids === [] ? [] : $this->query($definition)->whereIn('id', $ids)->select(['id', $label])->get()
                ->mapWithKeys(fn (object $row): array => [(string) $row->id => mb_substr((string) $row->$label, 0, 200)])->all();
        }

        return $labels;
    }

    public function validateValues(array $definitions, array $values, bool $lock = true): void
    {
        foreach ($definitions as $name => $definition) {
            if (($values[$name] ?? null) === null) {
                continue;
            }
            $query = $this->matchingQuery($definition, $values, $name)->where('id', $values[$name]);
            if ($lock) {
                $query->lockForUpdate();
            }
            if (! $query->first(['id'])) {
                throw ValidationException::withMessages([$name => 'Seleccione un registro existente y disponible del catálogo relacionado.']);
            }
        }
    }

    public function validateExisting(object $program, array $definition): void
    {
        $storage = app(GeneratedCrudStorage::class)->forProgram($program);
        foreach ($definition['relations'] as $name => $related) {
            $query = $storage['connection']->table($storage['table'].' as generated_owner')->whereNotNull($name);
            if (isset($definition['columns']['deleted_at'])) {
                $query->whereNull('deleted_at');
            }
            $query->whereNotExists(function (Builder $query) use ($name, $related): void {
                $query->selectRaw('1')->from($related['table'].' as related_parent')->whereColumn('related_parent.id', 'generated_owner.'.$name);
                if ($related['depends_on'] ?? null) {
                    $query->whereColumn('related_parent.'.$related['related_filter'], 'generated_owner.'.$related['depends_on']);
                }
                if (isset($related['columns']['deleted_at'])) {
                    $query->whereNull('related_parent.deleted_at');
                }
            });
            if ($query->exists()) {
                throw ValidationException::withMessages(['related_program_id' => 'Existen registros con valores que no corresponden a un catálogo relacionado disponible. Corríjalos antes de configurar la relación.']);
            }
        }
    }

    public function column(Blueprint $table, object $field): ColumnDefinition
    {
        $definition = $this->resolve($field);
        $key = $definition['columns']['id'];
        $unsigned = str_contains($key['type'], 'unsigned');
        $column = match (strtolower($key['type_name'])) {
            'bigint' => $table->bigInteger($field->column_name, false, $unsigned),
            'smallint' => $table->smallInteger($field->column_name, false, $unsigned),
            'mediumint' => $table->mediumInteger($field->column_name, false, $unsigned),
            'tinyint' => $table->tinyInteger($field->column_name, false, $unsigned),
            default => $table->integer($field->column_name, false, $unsigned),
        };
        $constraint = 'gcr_'.substr(hash('sha256', $table->getTable().'.'.$field->column_name), 0, 32);
        $foreign = $table->foreign($field->column_name, $constraint)->references('id')->on($definition['table']);
        if ($definition['storage']['connection']->getDriverName() === 'sqlsrv') {
            $foreign->noActionOnDelete()->noActionOnUpdate();
        } else {
            $foreign->restrictOnDelete()->restrictOnUpdate();
        }

        return $column;
    }

    public function validateUpdate(object $program, object $old, array $values): void
    {
        $fields = DB::table('generated_program_fields as field')->join('generated_programs as program', 'program.id', '=', 'field.program_id')
            ->where('field.field_type', 'relation')->where('field.related_program_id', $program->id)->whereNotNull('field.depends_on')
            ->whereNotNull('field.related_filter')->where('program.crud_ready', true)
            ->select(['field.column_name', 'field.depends_on', 'field.related_filter', 'program.table_name', 'program.table_connection'])->get();
        foreach ($fields as $field) {
            $filter = $field->related_filter;
            if (! array_key_exists($filter, $values) || (string) ($old->$filter ?? '') === (string) ($values[$filter] ?? '')) {
                continue;
            }
            $columns = app(GeneratedCrud::class)->columns($field->table_name, $field->table_connection ?? '');
            if (! isset($columns[$field->column_name], $columns[$field->depends_on])) {
                throw ValidationException::withMessages([$filter => 'Revise la estructura de los formularios dependientes antes de modificar.']);
            }
            $query = app(GeneratedCrudStorage::class)->query($field)->where($field->column_name, $old->id);
            if (isset($columns['deleted_at'])) {
                $query->whereNull('deleted_at');
            }
            if ($this->hasValue($values[$filter])) {
                $query->where(function (Builder $query) use ($field, $values, $filter): void {
                    $query->whereNull($field->depends_on)->orWhere($field->depends_on, '<>', $values[$filter]);
                });
            }
            if ($query->exists()) {
                throw ValidationException::withMessages([$filter => 'El cambio dejaría combinaciones incompatibles en formularios dependientes.']);
            }
        }
    }

    public function preventDelete(object $program, int $id, bool $softDelete): void
    {
        $fields = DB::table('generated_program_fields as field')->join('generated_programs as program', 'program.id', '=', 'field.program_id')
            ->where('field.field_type', 'relation')->where('field.related_program_id', $program->id)->where('program.crud_ready', true)
            ->select(['field.column_name', 'program.table_name', 'program.table_connection'])->get();
        foreach ($fields as $field) {
            $columns = app(GeneratedCrud::class)->columns($field->table_name, $field->table_connection ?? '');
            if (! isset($columns[$field->column_name])) {
                throw ValidationException::withMessages(['id' => 'Revise la estructura de los formularios relacionados antes de eliminar.']);
            }
            $query = app(GeneratedCrudStorage::class)->query($field)->where($field->column_name, $id);
            if ($softDelete && isset($columns['deleted_at'])) {
                $query->whereNull('deleted_at');
            }
            if ($query->exists()) {
                throw ValidationException::withMessages(['id' => 'El registro tiene relaciones vigentes y no se puede eliminar.']);
            }
        }
    }

    public function defaults(int $programId): array
    {
        $program = DB::table('generated_programs')->where('id', $programId)->where('program_type', 'crud')->where('crud_ready', true)->where('active', true)->first();
        if (! $program) {
            throw ValidationException::withMessages(['related_program_id' => 'Seleccione un catálogo CRUD activo y preparado.']);
        }
        $menu = DB::table('menu_items as menu')->join('managed_application_routes as route', 'route.name', '=', 'menu.route_name')
            ->where('route.program', 'controller:App\\Http\\Controllers\\'.$program->controller_name.'@index')->where('menu.archived', false)
            ->where('menu.active', true)->where('menu.migration_enabled', true)->where('route.active', true)->orderBy('menu.id')->value('menu.id');
        $label = DB::table('generated_program_fields')->where('program_id', $programId)->whereIn('field_type', ['string', 'text'])->orderBy('position')->orderBy('id')->value('column_name');

        return ['related_menu_id' => $menu, 'related_label' => $label];
    }
}
