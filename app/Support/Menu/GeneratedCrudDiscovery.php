<?php

namespace App\Support\Menu;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class GeneratedCrudDiscovery
{
    public function inspect(object $program): array
    {
        $crud = app(GeneratedCrud::class);
        $storage = app(GeneratedCrudStorage::class)->forProgram($program);
        $columns = $crud->columns($program->table_name, $program->table_connection ?? '');
        $foreignKeys = app(GeneratedCrudStorage::class)->metadata(fn (): array => $storage['schema']->getForeignKeys($storage['table']));
        $fields = $ignored = $pending = [];
        $primary = array_values(array_filter(app(GeneratedCrudStorage::class)->metadata(fn (): array => $storage['schema']->getIndexes($storage['table'])), fn (array $index): bool => $index['primary']));
        if (count($primary) !== 1 || $primary[0]['columns'] !== ['id'] || ! ($columns['id']['auto_increment'] ?? false)) {
            $pending['id'] = 'La tabla requiere una clave primaria id numérica y autoincremental.';
        }
        foreach ($columns as $name => $column) {
            if ($crud->reservedColumn($name) || $column['auto_increment'] || $column['generation']) {
                $ignored[] = $name.' · reservado, generado o de auditoría';
                if ($crud->reservedColumn($name) && ! in_array($name, ['id', 'created_at', 'updated_at', 'deleted_at'], true)
                    && ! $column['auto_increment'] && ! $column['generation'] && ! $column['nullable'] && $column['default'] === null) {
                    $pending[$name] = 'La columna reservada '.$name.' es obligatoria y no debe exponerse automáticamente.';
                }

                continue;
            }
            $type = $this->type($column);
            if (! $type || ! preg_match('/^[a-z][a-z0-9_]{0,62}$/D', $name) || str_ends_with($name, '__text')) {
                $ignored[] = $name.' · '.$column['type'].' (sin editor compatible)';
                if (! $column['nullable'] && $column['default'] === null) {
                    $pending[$name] = 'La columna obligatoria '.$name.' requiere un tipo de campo compatible.';
                }

                continue;
            }
            $length = preg_match('/\((\d+)\)/', $column['type'], $matches) ? (int) $matches[1] : ($type === 'text' ? 10000 : 150);
            $fields[$name] = ['column_name' => $name, 'label' => mb_substr(Str::headline($name), 0, 100), 'field_type' => $type,
                'required' => ! $column['nullable'], 'max_length' => max(1, min($length, 10000)), 'position' => count($fields),
                'related_program_id' => null, 'related_menu_id' => null, 'related_label' => null, 'depends_on' => null, 'related_filter' => null];
        }
        if (count($fields) > 40) {
            throw ValidationException::withMessages(['table_name' => 'La tabla supera el límite de 40 campos editables del generador.']);
        }
        foreach ($foreignKeys as $foreign) {
            $name = implode(', ', $foreign['columns']);
            if (count($foreign['columns']) !== 1 || $foreign['foreign_columns'] !== ['id'] || ! isset($fields[$name])) {
                $pending[$name] = 'La relación '.$name.' requiere una clave simple hacia id y un campo compatible.';

                continue;
            }
            try {
                $related = $this->catalogue($storage, $foreign);
                if (! $related) {
                    $pending[$name] = 'Registre y habilite el catálogo '.$this->targetName($storage, $foreign).' y su menú; después vuelva a detectar los campos.';

                    continue;
                }
                $fields[$name] = array_merge($fields[$name], $related, ['field_type' => 'relation']);
            } catch (ValidationException $exception) {
                $pending[$name] = 'Revise el catálogo relacionado con '.$name.': '.$exception->getMessage();
            }
        }

        return ['fields' => $fields, 'ignored' => $ignored, 'pending' => $pending];
    }

    private function type(array $column): ?string
    {
        $type = strtolower($column['type_name']);

        return match (true) {
            in_array($type, ['bool', 'boolean', 'bit'], true) || preg_match('/^tinyint\(1\)(?: unsigned)?$/', $column['type']) => 'boolean',
            in_array($type, ['int', 'integer', 'bigint', 'smallint', 'mediumint', 'tinyint'], true) => 'integer',
            in_array($type, ['decimal', 'numeric', 'real', 'float', 'double'], true) => 'decimal',
            $type === 'date' => 'date',
            in_array($type, ['datetime', 'datetime2', 'timestamp'], true) => 'datetime',
            $type === 'time' => 'time',
            in_array($type, ['uniqueidentifier', 'uuid'], true) => 'uuid',
            in_array($type, ['text', 'ntext', 'longtext', 'mediumtext', 'tinytext'], true) => 'text',
            in_array($type, ['varchar', 'nvarchar', 'nchar', 'char', 'string'], true) => str_contains(strtolower($column['type']), '(max)') || (preg_match('/\((\d+)\)/', $column['type'], $size) && (int) $size[1] > 255) ? 'text' : 'string',
            default => null,
        };
    }

    private function targetName(array $storage, array $foreign): string
    {
        $schema = $foreign['foreign_schema'] ?? $storage['schema_name'];

        return ($storage['connection']->getDriverName() === 'sqlite' ? '' : $storage['database'].'.').$schema.'.'.$foreign['foreign_table'];
    }

    private function catalogue(array $storage, array $foreign): ?array
    {
        $matches = [];
        foreach (DB::table('generated_programs')->where('program_type', 'crud')->where('crud_ready', true)->where('active', true)->get() as $candidate) {
            try {
                $target = app(GeneratedCrudStorage::class)->forProgram($candidate);
                if (! app(GeneratedCrudStorage::class)->sameDatabase($storage, $target) || $target['name'] !== $foreign['foreign_table']
                    || $target['schema_name'] !== ($foreign['foreign_schema'] ?? $storage['schema_name'])) {
                    continue;
                }
                $defaults = app(GeneratedCrudRelations::class)->defaults($candidate->id);
                if (! $defaults['related_menu_id'] || ! $defaults['related_label']) {
                    continue;
                }
                $field = ['related_program_id' => $candidate->id, 'related_menu_id' => $defaults['related_menu_id'], 'related_label' => $defaults['related_label']];
                app(GeneratedCrudRelations::class)->resolve((object) $field);
                $matches[] = $field;
            } catch (ValidationException) {
                continue;
            }
        }

        return count($matches) === 1 ? $matches[0] : null;
    }

    public function import(int $id, User $actor): array
    {
        app(GeneratedPrograms::class)->authorize($actor);

        return DB::transaction(function () use ($id, $actor): array {
            $program = DB::table('generated_programs')->where('id', $id)->lockForUpdate()->first();
            if (! $program || $program->program_type !== 'crud' || $program->table_mode !== 'existing' || $program->active || $program->crud_ready || $program->crud_building) {
                throw ValidationException::withMessages(['program_id' => 'Seleccione un CRUD de tabla existente, inactivo y sin preparar.']);
            }
            $report = $this->inspect($program);
            $existing = DB::table('generated_program_fields')->where('program_id', $id)->get()->keyBy('column_name');
            foreach ($report['fields'] as $name => $field) {
                if (isset($existing[$name])) {
                    if ($field['field_type'] === 'relation' && $existing[$name]->field_type !== 'relation') {
                        DB::table('generated_program_fields')->where('id', $existing[$name]->id)->update(array_intersect_key($field, array_flip(['field_type', 'related_program_id', 'related_menu_id', 'related_label'])) + ['revision' => $existing[$name]->revision + 1, 'updated_at' => now()]);
                    }

                    continue;
                }
                if (DB::table('generated_program_fields')->where('program_id', $id)->count() >= 40) {
                    throw ValidationException::withMessages(['program_id' => 'El formulario admite hasta 40 campos. Revise sus campos actuales antes de detectar nuevamente.']);
                }
                DB::table('generated_program_fields')->insert($field + ['program_id' => $id, 'revision' => 1, 'created_at' => now(), 'updated_at' => now()]);
            }
            unset($report['fields']);
            $report['detected_fields'] = DB::table('generated_program_fields')->where('program_id', $id)->count();
            DB::table('generated_programs')->where('id', $id)->update(['discovery_report' => json_encode($report, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE), 'updated_at' => now()]);
            app(GeneratedCrud::class)->audit($actor, 'generated_crud_fields_detected', $id);

            return $report;
        });
    }

    public function assertRelations(object $program, array $fields): void
    {
        if (empty($program->discovery_report)) {
            return;
        }
        $storage = app(GeneratedCrudStorage::class)->forProgram($program);
        $foreignKeys = app(GeneratedCrudStorage::class)->metadata(fn (): array => $storage['schema']->getForeignKeys($storage['table']));
        $fields = array_column($fields, null, 'column_name');
        foreach ($foreignKeys as $foreign) {
            $name = implode(', ', $foreign['columns']);
            if (count($foreign['columns']) !== 1 || $foreign['foreign_columns'] !== ['id'] || ($fields[$name]->field_type ?? '') !== 'relation') {
                throw ValidationException::withMessages(['program_id' => 'La relación '.$name.' está pendiente. Habilite su catálogo y menú, detecte los campos nuevamente y revise la configuración.']);
            }
        }
    }
}
