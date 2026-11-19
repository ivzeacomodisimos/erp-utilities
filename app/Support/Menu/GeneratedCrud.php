<?php

namespace App\Support\Menu;

use App\Models\User;
use App\Support\Kits\GeneratedCrudDataSource;
use App\Support\Kits\GeneratedCrudPermissions;
use App\Support\Ui\CrudLabels;
use App\Support\Ui\ErpPage;
use Illuminate\Database\QueryException;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Ivandzb\CrudKit\CrudKit;
use Ivandzb\CrudKit\Data\ListQuery;
use Ivandzb\CrudKit\Data\ListResult;
use Ivandzb\CrudKit\Definition\Crud;
use Ivandzb\CrudKit\Definition\Field;
use Ivandzb\CrudKit\Definition\Lookup;
use Ivandzb\CrudKit\Ports\FileTranslator;
use Ivandzb\CrudKit\Server\ValidationException as KitValidationException;
use Ivandzb\UiKit\Component\Card;
use Ivandzb\UiKit\Html;
use Throwable;

class GeneratedCrud
{
    public const TYPES = ['string' => 'Texto corto', 'text' => 'Texto largo', 'integer' => 'Entero', 'decimal' => 'Decimal', 'date' => 'Fecha', 'datetime' => 'Fecha y hora', 'time' => 'Hora', 'uuid' => 'UUID', 'boolean' => 'Sí / No', 'relation' => 'Relación (autocomplete)'];

    public function reservedColumn(string $name): bool
    {
        return in_array(strtolower($name), self::RESERVED, true)
            || (bool) preg_match('/(?:^|_)(?:password|passwd|token|secret|api_key|private_key)(?:_|$)/i', $name);
    }

    public static function temporalRules(string $type): array
    {
        $format = $type === 'time' ? 'H:i:s' : 'Y-m-d H:i:s';
        $length = $type === 'time' ? 8 : 19;

        return ['string', 'max:'.($length + 8), function (string $attribute, mixed $value, \Closure $fail) use ($format, $length): void {
            if (! is_string($value) || ! preg_match('/^.{'.$length.'}(?:\.\d{1,7})?$/D', $value)
                || Validator::make(['value' => substr($value, 0, $length)], ['value' => ['date_format:'.$format]])->fails()) {
                $fail('Use el formato '.($length === 8 ? 'HH:MM:SS' : 'AAAA-MM-DD HH:MM:SS').', con fracciones de segundo opcionales.');
            }
        }];
    }

    private const RESERVED = ['id', 'revision', 'created_at', 'updated_at', 'deleted_at', 'created_by', 'updated_by', 'password', 'password_hash', 'token', 'access_token', 'remember_token', 'is_admin', 'erp_roles', 'token_version', 'roles', 'permissions', '_row_version', 'action', 'crud', 'constructor', 'prototype'];

    private const PROTECTED = ['users', 'employee_groups', 'employees', 'system_objects', 'system_object_values', 'document_types', 'user_document_defaults', 'systems_import_runs', 'legacy_import_runs', 'jobs', 'job_batches', 'failed_jobs', 'sessions', 'migrations', 'cache', 'cache_locks', 'password_reset_tokens', 'personal_access_tokens'];

    public function assertTable(string $table): void
    {
        $parts = explode('.', $table);
        $leaf = strtolower(end($parts));
        if (count($parts) > 3 || array_filter($parts, fn (string $part): bool => ! preg_match('/^[a-zA-Z][a-zA-Z0-9_]{0,62}$/D', $part))
            || in_array($leaf, self::PROTECTED, true)
            || preg_match('/^(erp_|generated_|menu_|option_|auth_|ldap_|sqlite_|password_)/', $leaf)) {
            throw ValidationException::withMessages(['table_name' => 'Seleccione una tabla de negocio. Las tablas internas y de seguridad no están disponibles para el generador.']);
        }
    }

    public function tables(string $connection = '', string $scope = ''): array
    {
        $tables = [];
        $prefix = str_contains($scope, '.') ? substr($scope, 0, strrpos($scope, '.') + 1) : '';
        $storage = app(GeneratedCrudStorage::class)->resolve($prefix.'lookup_scope', $connection);
        foreach (app(GeneratedCrudStorage::class)->metadata(fn (): array => $storage['schema']->getTableListing($storage['schema_name'], false)) as $leaf) {
            $table = $prefix.$leaf;
            try {
                $this->assertTable($table);
                $table = app(GeneratedCrudStorage::class)->resolve($table, $connection)['canonical'];
                $tables[$table] = $table;
            } catch (ValidationException) {
                continue;
            }
        }

        return $tables;
    }

    public function fields(int $program): array
    {
        return DB::table('generated_program_fields')->where('program_id', $program)->orderBy('position')->orderBy('id')->get()->all();
    }

    public function automaticFields(int $id, User $actor): array
    {
        app(GeneratedPrograms::class)->authorize($actor);
        $program = DB::table('generated_programs')->where('id', $id)->where('program_type', 'crud')->first();
        if (! $program) {
            throw ValidationException::withMessages(['program_id' => 'Seleccione un programa CRUD para consultar su configuración.']);
        }

        return $this->managedColumns($program);
    }

    private function managedColumns(object $program): array
    {
        $planned = $program->table_mode === 'new' && ! $program->crud_ready;
        $columns = $planned ? [
            'id' => ['type' => 'bigint', 'auto_increment' => true, 'generation' => null],
            'created_at' => ['type' => 'datetime', 'auto_increment' => false, 'generation' => null],
            'updated_at' => ['type' => 'datetime', 'auto_increment' => false, 'generation' => null],
            'deleted_at' => ['type' => 'datetime', 'auto_increment' => false, 'generation' => null],
        ] : $this->columns($program->table_name, $program->table_connection ?? '');
        $audit = [
            'created_at' => ['Fecha de creación', 'El generador registra la fecha y hora al crear el registro.'],
            'updated_at' => ['Fecha de modificación', 'El generador actualiza la fecha y hora al guardar cambios.'],
            'deleted_at' => ['Fecha de retiro', 'El generador registra la fecha y hora al retirar el registro mediante eliminación lógica.'],
        ];
        $rows = [];
        foreach ($columns as $name => $column) {
            $manager = 'Generador';
            if ($name === 'id') {
                $label = 'Identificador';
                $description = $column['auto_increment'] ? 'Clave primaria autoincremental administrada por el generador y la base de datos.'
                    : 'Clave primaria reservada para el generador. La tabla debe definirla como autoincremental para preparar el CRUD.';
            } elseif ($column['generation']) {
                $label = ($column['generation']['expression'] ?? '') === 'rowversion' ? 'Versión de la base de datos' : 'Columna calculada';
                $description = 'La base de datos calcula y administra su valor automáticamente.';
                $manager = 'Base de datos';
            } elseif ($column['auto_increment']) {
                $label = 'Valor autoincremental';
                $description = 'La base de datos genera su valor automáticamente.';
                $manager = 'Base de datos';
            } elseif (isset($audit[$name])) {
                [$label, $description] = $audit[$name];
            } else {
                continue;
            }
            $rows[] = ['column_name' => $name, 'label' => $label,
                'data_type' => ($column['generation']['expression'] ?? '') === 'rowversion' ? 'rowversion' : $column['type'],
                'managed_by' => $manager, 'description' => $description, 'readonly' => true,
                'status' => $planned ? 'Solo lectura · Se crea al preparar el CRUD' : 'Solo lectura'];
        }
        $rows[] = ['column_name' => '_row_version', 'label' => 'Control de cambios', 'data_type' => 'Token virtual',
            'managed_by' => 'Generador', 'description' => 'El generador calcula este control para detectar cambios concurrentes. No es una columna de la tabla.',
            'readonly' => true, 'status' => 'Solo lectura · Virtual'];

        return $rows;
    }

    private function assertEditableMetadata(object $field): void
    {
        $program = DB::table('generated_programs')->where('id', $field->program_id)->first();
        if ($program && in_array($field->column_name, array_column($this->managedColumns($program), 'column_name'), true)) {
            throw ValidationException::withMessages(['column_name' => 'El campo «'.$field->column_name.'» es de solo lectura y lo administra el generador o la base de datos. No puede modificarse ni eliminarse desde la configuración.']);
        }
    }

    public function listFields(ListQuery $query, User $actor): ListResult
    {
        app(GeneratedPrograms::class)->authorize($actor);
        $builder = DB::table('generated_program_fields');
        foreach ($query->filters() as $field => $value) {
            if (in_array($field, ['program_id', 'field_type', 'required'], true)) {
                $builder->where($field, $value);
            }
        }
        $total = (clone $builder)->count();
        $tables = DB::table('generated_programs')->pluck('table_name', 'id');
        $labels = DB::table('generated_program_fields')->get(['program_id', 'column_name', 'label'])
            ->mapWithKeys(fn (object $field): array => [$field->program_id.':'.$field->column_name => $field->label.' · '.$field->column_name]);
        $rows = $builder->orderBy('program_id')->orderBy('position')->orderBy('id')->offset($query->offset() ?? 0)->limit(min($query->limit() ?? 20, 100))->get()
            ->map(fn (object $row): array => array_merge((array) $row, ['required' => (int) $row->required,
                'related_table' => $tables->get($row->related_program_id, ''), 'related_key' => $row->field_type === 'relation' ? 'id' : '',
                'depends_on__text' => $labels->get($row->program_id.':'.$row->depends_on, ''), 'related_filter__text' => $labels->get($row->related_program_id.':'.$row->related_filter, '')]))->all();

        return new ListResult($total, $rows);
    }

    public function saveField(array $input, bool $updating, User $actor): array
    {
        app(GeneratedPrograms::class)->authorize($actor);

        return $this->kitValidation(function () use ($input, $updating): array {
            return DB::transaction(function () use ($input, $updating): array {
                $old = $updating ? DB::table('generated_program_fields')->where('id', $input['id'] ?? null)->lockForUpdate()->first() : null;
                if ($updating && (! $old || (int) ($input['revision'] ?? 0) !== (int) $old->revision)) {
                    throw ValidationException::withMessages(['revision' => 'El campo cambió. Actualice el listado.']);
                }
                if ($old) {
                    $this->assertEditableMetadata($old);
                }
                if ($old && $old->depends_on && array_key_exists('depends_on', $input) && ($input['depends_on'] === null || $input['depends_on'] === '')) {
                    $input['related_filter'] = null;
                }
                $data = Validator::make($input, [
                    'program_id' => ['required', 'integer', Rule::exists('generated_programs', 'id')->where('program_type', 'crud')],
                    'column_name' => ['bail', 'required', 'string', 'max:63',
                        function (string $attribute, mixed $value, \Closure $fail): void {
                            if ($value === 'id') {
                                $fail('El campo «id» lo administra automáticamente el generador. No debe registrarlo como campo editable.');
                            } elseif (in_array($value, ['created_at', 'updated_at', 'deleted_at', 'revision', '_row_version'], true)) {
                                $fail('El campo «'.$value.'» lo administra automáticamente el sistema para auditoría o control de cambios. No debe registrarlo manualmente.');
                            } elseif (in_array($value, self::RESERVED, true)) {
                                $fail('El nombre «'.$value.'» está reservado para seguridad o funcionamiento del sistema. Elija otro nombre de columna.');
                            }
                        }, 'regex:/^[a-z][a-z0-9_]*$/D', 'not_regex:/__text$/D', Rule::notIn(self::RESERVED),
                        Rule::unique('generated_program_fields')->where('program_id', $input['program_id'] ?? null)->ignore($old?->id)],
                    'label' => ['required', 'string', 'max:100'],
                    'field_type' => ['required', Rule::in(array_keys(self::TYPES))],
                    'required' => ['required', 'boolean'],
                    'max_length' => ['required', 'integer', 'min:1', 'max:10000'],
                    'position' => ['required', 'integer', 'min:0', 'max:10000'],
                    'related_program_id' => ['nullable', 'integer', Rule::exists('generated_programs', 'id')->where('program_type', 'crud')],
                    'related_menu_id' => ['nullable', 'integer', Rule::exists('menu_items', 'id')],
                    'related_label' => ['nullable', 'string', 'max:63', 'regex:/^[a-z][a-z0-9_]*$/D', Rule::notIn(self::RESERVED)],
                    'depends_on' => ['nullable', 'string', 'max:63', 'regex:/^[a-z][a-z0-9_]*$/D', Rule::notIn(self::RESERVED)],
                    'related_filter' => ['nullable', 'string', 'max:63', 'regex:/^[a-z][a-z0-9_]*$/D', Rule::notIn(self::RESERVED)],
                ])->validate();
                $program = DB::table('generated_programs')->where('id', $data['program_id'])->lockForUpdate()->first();
                if ($program->active || $program->crud_building || ($old && (int) $old->program_id !== (int) $program->id)) {
                    throw ValidationException::withMessages(['program_id' => 'Desactive el programa antes de configurar sus campos. La estructura de la tabla se conserva.']);
                }
                if (! $old && DB::table('generated_program_fields')->where('program_id', $program->id)->count() >= 40) {
                    throw ValidationException::withMessages(['column_name' => 'El formulario admite hasta 40 campos.']);
                }
                if ($data['field_type'] === 'string' && $data['max_length'] > 255) {
                    throw ValidationException::withMessages(['max_length' => 'El texto corto admite hasta 255 caracteres.']);
                }
                if ($data['field_type'] === 'relation') {
                    Validator::make($data, ['related_program_id' => ['required'], 'related_menu_id' => ['required'], 'related_label' => ['required']])->validate();
                    app(GeneratedCrudRelations::class)->resolve((object) $data);
                } else {
                    $data['related_program_id'] = null;
                    $data['related_menu_id'] = null;
                    $data['related_label'] = null;
                    $data['depends_on'] = null;
                    $data['related_filter'] = null;
                }
                if ($program->table_mode === 'existing' || $program->crud_ready) {
                    $columns = $this->columns($program->table_name, $program->table_connection ?? '');
                    $this->assertField((object) $data, $columns[$data['column_name']] ?? null);
                }
                $data['revision'] = $old ? $old->revision + 1 : 1;
                $data['updated_at'] = now();
                $id = $old?->id;
                if ($old) {
                    DB::table('generated_program_fields')->where('id', $id)->update($data);
                } else {
                    $id = DB::table('generated_program_fields')->insertGetId($data + ['created_at' => now()]);
                }
                if ($program->crud_ready) {
                    $definition = $this->definition($program);
                    app(GeneratedCrudRelations::class)->validateExisting($program, $definition);
                } else {
                    app(GeneratedCrudRelations::class)->definitions($this->fields($program->id), $program->table_name, $program->table_connection ?? '');
                }

                return (array) DB::table('generated_program_fields')->find($id);
            });
        });
    }

    public function deleteField(array $input, User $actor): void
    {
        app(GeneratedPrograms::class)->authorize($actor);
        $this->kitValidation(function () use ($input): void {
            DB::transaction(function () use ($input): void {
                $field = DB::table('generated_program_fields')->where('id', $input['id'] ?? null)->lockForUpdate()->first();
                if (! $field || (int) ($input['revision'] ?? 0) !== (int) $field->revision) {
                    throw ValidationException::withMessages(['revision' => 'El campo cambió. Actualice el listado.']);
                }
                $this->assertEditableMetadata($field);
                $program = DB::table('generated_programs')->where('id', $field->program_id)->lockForUpdate()->first();
                if ($program->active || $program->crud_building) {
                    throw ValidationException::withMessages(['program_id' => 'Desactive el programa antes de configurar sus campos.']);
                }
                DB::table('generated_program_fields')->where('id', $field->id)->delete();
                if ($program->crud_ready) {
                    $this->definition($program);
                } else {
                    app(GeneratedCrudRelations::class)->definitions($this->fields($program->id), $program->table_name, $program->table_connection ?? '');
                }
            });
        });
    }

    public function columns(string $table, string $connection = ''): array
    {
        $this->assertTable($table);
        $storage = app(GeneratedCrudStorage::class)->resolve($table, $connection);
        if (! in_array($storage['name'], app(GeneratedCrudStorage::class)->metadata(fn (): array => $storage['schema']->getTableListing($storage['schema_name'], false)), true)) {
            throw ValidationException::withMessages(['table_name' => 'La tabla de negocio no existe en la base de datos ERP.']);
        }

        $columns = app(GeneratedCrudStorage::class)->metadata(fn (): array => $storage['schema']->getColumns($storage['table']));
        if ($storage['connection']->getDriverName() === 'sqlsrv') {
            foreach ($columns as &$column) {
                // SQL Server reports Unicode string lengths in bytes.
                if (in_array($column['type_name'], ['nvarchar', 'nchar'], true) && preg_match('/\((\d+)\)/', $column['type'], $length)) {
                    $column['type'] = $column['type_name'].'('.intdiv((int) $length[1], 2).')';
                }
                if (in_array($column['type_name'], ['timestamp', 'rowversion'], true)) {
                    $column['generation'] = ['type' => 'server', 'expression' => 'rowversion'];
                }
            }
            unset($column);
        }

        return array_column($columns, null, 'name');
    }

    private function assertField(object $field, ?array $column): void
    {
        $types = match ($field->field_type) {
            'string' => ['varchar', 'char', 'nvarchar', 'nchar', 'string'],
            'text' => ['text', 'ntext', 'longtext', 'mediumtext', 'tinytext', 'nvarchar', 'varchar', 'nchar', 'char'],
            'integer' => ['integer', 'int', 'bigint', 'smallint', 'mediumint', 'tinyint'],
            'relation' => ['integer', 'int', 'bigint', 'smallint', 'mediumint', 'tinyint'],
            'decimal' => ['decimal', 'numeric', 'real', 'float', 'double'],
            'date' => ['date'],
            'datetime' => ['datetime', 'datetime2', 'timestamp'],
            'time' => ['time'],
            'uuid' => ['uniqueidentifier', 'uuid'],
            'boolean' => ['bool', 'boolean', 'bit', 'tinyint', 'integer', 'int', 'smallint'],
        };
        if (! $column || ! in_array(strtolower($column['type_name']), $types, true) || $column['auto_increment'] || $column['generation']) {
            throw ValidationException::withMessages(['column_name' => 'La columna no existe, es calculada o su tipo no coincide con el campo.']);
        }
        if (! $column['nullable'] && ! $field->required) {
            throw ValidationException::withMessages(['required' => 'La columna no admite nulos: marque el campo como obligatorio.']);
        }
        if (in_array($field->field_type, ['string', 'text'], true) && preg_match('/\((\d+)\)/', $column['type'], $matches) && $field->max_length > (int) $matches[1]) {
            throw ValidationException::withMessages(['max_length' => 'La longitud supera la capacidad de la columna.']);
        }
    }

    public function definition(object $program): array
    {
        $storage = app(GeneratedCrudStorage::class)->forProgram($program);
        $columns = $this->columns($program->table_name, $program->table_connection ?? '');
        $primary = array_values(array_filter($storage['schema']->getIndexes($storage['table']), fn (array $index): bool => $index['primary']));
        if (count($primary) !== 1 || $primary[0]['columns'] !== ['id'] || ! ($columns['id']['auto_increment'] ?? false)) {
            throw ValidationException::withMessages(['table_name' => 'El generador requiere una clave primaria id numérica y autoincremental.']);
        }
        $fields = $this->fields($program->id);
        app(GeneratedCrudDiscovery::class)->assertRelations($program, $fields);
        if ($fields === []) {
            throw ValidationException::withMessages(['program_id' => 'Defina al menos un campo antes de preparar el formulario.']);
        }
        $names = array_column($fields, 'column_name');
        foreach ($fields as $field) {
            $this->assertField($field, $columns[$field->column_name] ?? null);
        }
        foreach ($columns as $name => $column) {
            if (in_array($name, ['created_at', 'updated_at', 'deleted_at'], true)) {
                $dateTypes = $storage['connection']->getDriverName() === 'sqlsrv' ? ['datetime', 'datetime2', 'datetimeoffset'] : ['datetime', 'timestamp', 'timestamptz'];
                if (! in_array($column['type_name'], $dateTypes, true)) {
                    throw ValidationException::withMessages(['table_name' => 'Las columnas de fechas de auditoría deben ser datetime o timestamp.']);
                }

                continue;
            }
            if (! $column['nullable'] && $column['default'] === null && ! $column['auto_increment'] && ! $column['generation'] && ! in_array($name, $names, true)) {
                throw ValidationException::withMessages(['column_name' => 'Falta configurar la columna obligatoria '.$name.'.']);
            }
        }

        return ['fields' => $fields, 'columns' => $columns, 'relations' => app(GeneratedCrudRelations::class)->definitions($fields, $program->table_name, $program->table_connection ?? '')];
    }

    public function signature(string $table, string $connection = ''): string
    {
        $storage = app(GeneratedCrudStorage::class)->resolve($table, $connection);

        return app(GeneratedCrudStorage::class)->metadata(fn (): string => hash('sha256', json_encode([$storage['schema']->getColumns($storage['table']), $storage['schema']->getIndexes($storage['table'])], JSON_THROW_ON_ERROR)));
    }

    public function prepare(int $id, User $actor): void
    {
        app(GeneratedPrograms::class)->authorize($actor);
        Cache::lock('generated-crud-prepare-'.$id, 60)->block(5, function () use ($id, $actor): void {
            $program = DB::transaction(function () use ($id): object {
                $program = DB::table('generated_programs')->where('id', $id)->lockForUpdate()->first();
                if (! $program || $program->program_type !== 'crud' || $program->active || $program->crud_building) {
                    throw ValidationException::withMessages(['program_id' => 'Seleccione un programa CRUD inactivo que no esté en preparación.']);
                }
                if ($program->crud_ready) {
                    throw ValidationException::withMessages(['program_id' => 'El programa ya está preparado.']);
                }
                $this->assertTable($program->table_name);
                DB::table('generated_programs')->where('id', $id)->update(['crud_building' => true]);

                return $program;
            });
            $created = false;
            $storage = null;
            try {
                $storage = app(GeneratedCrudStorage::class)->forProgram($program);
                app(GeneratedCrudStorage::class)->assertSchema($storage);
                $fields = $this->fields($id);
                if ($fields === []) {
                    throw ValidationException::withMessages(['program_id' => 'Defina al menos un campo.']);
                }
                if ($program->table_mode === 'new') {
                    if ($storage['schema']->hasTable($storage['table'])) {
                        throw ValidationException::withMessages(['table_name' => 'La tabla nueva ya existe. Seleccione Vincular tabla existente si desea utilizarla.']);
                    }
                    app(GeneratedCrudStorage::class)->create($storage, function (Blueprint $table) use ($fields): void {
                        $table->id();
                        foreach ($fields as $field) {
                            $column = match ($field->field_type) {
                                'string' => $table->string($field->column_name, $field->max_length),
                                'text' => $table->text($field->column_name),
                                'integer' => $table->integer($field->column_name),
                                'decimal' => $table->decimal($field->column_name, 15, 2),
                                'date' => $table->date($field->column_name),
                                'datetime' => $table->dateTime($field->column_name),
                                'time' => $table->time($field->column_name),
                                'uuid' => $table->uuid($field->column_name),
                                'boolean' => $table->boolean($field->column_name),
                                'relation' => app(GeneratedCrudRelations::class)->column($table, $field),
                            };
                            $column->nullable(! $field->required);
                        }
                        $table->timestamps();
                        $table->softDeletes();
                    });
                    $created = true;
                }
                $definition = $this->definition($program);
                app(GeneratedCrudRelations::class)->validateExisting($program, $definition);
                $signature = $this->signature($program->table_name, $program->table_connection ?? '');
                DB::transaction(function () use ($id, $actor, $signature): void {
                    DB::table('generated_programs')->where('id', $id)->update(['crud_ready' => true, 'crud_building' => false, 'crud_schema_hash' => $signature, 'revision' => DB::raw('revision + 1'), 'updated_at' => now()]);
                    $this->audit($actor, 'generated_crud_prepared', $id);
                });
            } catch (Throwable $exception) {
                if ($created && $storage['schema']->hasTable($storage['table']) && $storage['connection']->table($storage['table'])->count() === 0) {
                    $storage['schema']->drop($storage['table']);
                }
                DB::table('generated_programs')->where('id', $id)->update(['crud_building' => false]);
                if ($exception instanceof QueryException || $exception instanceof \PDOException) {
                    throw ValidationException::withMessages(['table_name' => 'No se pudo preparar la tabla en la base y el esquema indicados. Verifique los permisos de consulta y creación de la conexión.']);
                }
                throw $exception;
            }
        });
    }

    public function render(object $program, Request $request, ErpPage $pages, int $menu): Response
    {
        abort_unless($program->crud_ready && ! $program->crud_building, 403, 'El formulario todavía no está preparado.');
        app(GeneratedCrudRelations::class)->authorize($this->fields($program->id), $request->user());
        $definition = $this->definition($program);
        abort_unless(hash_equals($program->crud_schema_hash ?? '', $this->signature($program->table_name, $program->table_connection ?? '')), 409, 'La estructura de la tabla cambió. Revise la definición del programa.');
        $permissions = new GeneratedCrudPermissions($request->user(), $menu);
        $crud = Crud::make('generated-program-'.$program->id)->title($program->title)->renderWith('quasar')->defaultSorting('id')
            ->requestParams(['_token' => csrf_token()])->dataSource(new GeneratedCrudDataSource($program, $request->user(), $menu, $definition))
            ->fields(Field::number('id', 'Id')->key()->readOnly(), Field::hidden('_row_version')->key()->onlyOnEdit());
        CrudLabels::apply($crud, 'registro de «'.$program->title.'»', 'registros de «'.$program->title.'»');
        foreach ($definition['fields'] as $item) {
            $field = match ($item->field_type) {
                'string' => Field::text($item->column_name, $item->label)->rules(['maxLength' => $item->max_length]),
                'text' => Field::textarea($item->column_name, $item->label)->rules(['maxLength' => $item->max_length]),
                'integer' => Field::text($item->column_name, $item->label)->rules(['integer' => true]),
                'decimal' => Field::text($item->column_name, $item->label),
                'date' => Field::date($item->column_name, $item->label),
                'datetime', 'time', 'uuid' => Field::text($item->column_name, $item->label),
                'boolean' => Field::select($item->column_name, $item->label, [1 => 'Sí', 0 => 'No']),
                'relation' => Field::autocomplete($item->column_name, $item->label, Lookup::table($definition['relations'][$item->column_name]['table'], 'id', $item->related_label)),
            };
            $field->filterable()->rules(['required' => (bool) $item->required]);
            if ($item->field_type === 'relation' && $item->depends_on) {
                $field->dependsOn($item->depends_on);
            }
            if ($item->field_type === 'boolean' && $item->required) {
                $field->defaultValue(0);
            }
            $crud->fields($field);
        }
        $kit = new CrudKit(null, $permissions, new FileTranslator('es'), '/desarrollo/assets/crud-kit', 'quasar');
        if ($request->has('crud') || ! $request->isMethodSafe()) {
            abort_unless($request->query('crud') === $crud->id(), 404);
            $action = $request->query('action');
            abort_unless($request->isMethod('POST') && in_array($action, [Crud::LIST, Crud::CREATE, Crud::UPDATE, Crud::DELETE, 'autocomplete'], true), 405);
            abort_unless($permissions->allows($crud, $action, null), 403);
            if ($action === 'autocomplete') {
                $payload = app(GeneratedCrudRelations::class)->autocomplete($definition['relations'], $request);

                return response(json_encode($payload, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE), 200, ['Content-Type' => 'application/json']);
            }
            $request->validate(['jtStartIndex' => ['sometimes', 'integer', 'min:0', 'max:1000000'], 'jtPageSize' => ['sometimes', 'integer', 'min:1', 'max:100'], 'jtSorting' => ['sometimes', 'string', 'max:200']]);
            $payload = $kit->handle($crud, array_merge($request->all(), ['action' => $action]));

            return response(json_encode($payload, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE), $payload['Result'] === 'OK' ? 200 : 422, ['Content-Type' => 'application/json']);
        }

        return $pages->render($program->title, Card::make($program->title)->add(Html::raw($kit->render($crud, route($request->route()->getName())))), $request->user());
    }

    public function audit(User $actor, string $event, int $program, ?int $menu = null, ?int $record = null): void
    {
        DB::table('erp_access_events')->insert(['user_id' => $actor->id, 'actor' => $actor->ldap_username, 'event' => $event,
            'details' => json_encode(['program_id' => $program, 'menu_id' => $menu, 'record_id' => $record]), 'created_at' => now()]);
    }

    private function kitValidation(callable $callback): mixed
    {
        try {
            return $callback();
        } catch (ValidationException $exception) {
            throw new KitValidationException(array_map(fn (array $messages): string => $messages[0], $exception->errors()));
        }
    }
}
