<?php

namespace App\Support\Kits;

use App\Models\User;
use App\Support\Menu\GeneratedCrud;
use App\Support\Menu\GeneratedCrudRelations;
use App\Support\Menu\GeneratedCrudStorage;
use App\Support\Menu\MenuAccess;
use Illuminate\Database\Query\Builder;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Ivandzb\CrudKit\Data\DataSource;
use Ivandzb\CrudKit\Data\ListQuery;
use Ivandzb\CrudKit\Data\ListResult;
use Ivandzb\CrudKit\Server\ValidationException as KitValidationException;

class GeneratedCrudDataSource implements DataSource
{
    public function __construct(private object $program, private User $user, private int $menu, private array $definition) {}

    private function authorize(string $operation): void
    {
        $permissions = app(MenuAccess::class)->permissions($this->user, $this->menu);
        abort_unless($permissions['view'] && ($permissions[$operation] ?? false)
            && DB::table('generated_programs')->where('id', $this->program->id)->where('active', true)->where('crud_ready', true)->exists(), 403);
        app(GeneratedCrudRelations::class)->authorize($this->definition['fields'], $this->user);
    }

    private function query(): Builder
    {
        $query = app(GeneratedCrudStorage::class)->query($this->program);
        if (isset($this->definition['columns']['deleted_at'])) {
            $query->whereNull('deleted_at');
        }

        return $query;
    }

    public function list(ListQuery $query): ListResult
    {
        $this->authorize('view');
        $this->validation(fn () => app(GeneratedCrudRelations::class)->validateValues($this->definition['relations'], $query->filters(), false));
        $builder = $this->query();
        $fields = array_column($this->definition['fields'], null, 'column_name');
        foreach ($query->filters() as $name => $value) {
            if ($name === 'id') {
                $builder->where('id', $value);
            } elseif (isset($fields[$name])) {
                if (in_array($fields[$name]->field_type, ['string', 'text'], true)) {
                    $builder->whereRaw($builder->getGrammar()->wrap($name)." LIKE ? ESCAPE '!'", ['%'.str_replace(['!', '%', '_'], ['!!', '!%', '!_'], (string) $value).'%']);
                } else {
                    $builder->where($name, $value);
                }
            }
        }
        $orderedColumns = [];
        foreach ($query->sorting() as [$name, $direction]) {
            if (($name === 'id' || isset($fields[$name])) && ! isset($orderedColumns[$name])) {
                $builder->orderBy($name, $direction);
                $orderedColumns[$name] = true;
            }
        }
        if (! isset($orderedColumns['id'])) {
            $builder->orderBy('id');
        }
        $total = (clone $builder)->count();
        $rows = $builder->offset($query->offset() ?? 0)->limit(min($query->limit() ?? 20, 100))->get();
        $labels = app(GeneratedCrudRelations::class)->labels($this->definition['relations'], $rows);
        $rows = $rows->map(fn (object $row): array => $this->record($row, $labels))->all();

        return new ListResult($total, $rows);
    }

    public function create(array $values): array
    {
        return $this->save($values, false);
    }

    public function update(array $values): array
    {
        return $this->save($values, true);
    }

    private function rules(): array
    {
        $rules = [];
        foreach ($this->definition['fields'] as $field) {
            $column = $this->definition['columns'][$field->column_name];
            [$minimum, $maximum] = match (strtolower($column['type_name'])) {
                'tinyint' => [-128, 127], 'smallint' => [-32768, 32767], 'bigint' => [PHP_INT_MIN, PHP_INT_MAX], default => [-2147483648, 2147483647],
            };
            if (str_contains($column['type'], 'unsigned')) {
                $maximum = $maximum === PHP_INT_MAX ? PHP_INT_MAX : $maximum * 2 + 1;
                $minimum = 0;
            }
            $typeRules = match ($field->field_type) {
                'string', 'text' => ['string', 'max:'.$field->max_length],
                'integer' => ['integer', 'between:'.$minimum.','.$maximum],
                'relation' => ['integer', 'min:1', 'max:'.$maximum],
                'decimal' => ['numeric'],
                'date' => ['date_format:Y-m-d'],
                'datetime', 'time' => GeneratedCrud::temporalRules($field->field_type),
                'uuid' => ['uuid'],
                'boolean' => ['boolean'],
            };
            if ($field->field_type === 'decimal' && in_array(strtolower($column['type_name']), ['real', 'float', 'double'], true)) {
                $typeRules[] = function (string $attribute, mixed $value, \Closure $fail): void {
                    if (! is_numeric($value) || ! is_finite((float) $value)) {
                        $fail('Ingrese un número finito válido.');
                    }
                };
            } elseif ($field->field_type === 'decimal') {
                $scale = preg_match('/\((\d+),\s*(\d+)\)/', $column['type'], $matches) ? (int) $matches[2] : 2;
                $precision = isset($matches[1]) ? (int) $matches[1] : 15;
                $typeRules[] = 'decimal:0,'.$scale;
                $typeRules[] = 'regex:/^-?\d{1,'.max(1, $precision - $scale).'}(?:\.\d{1,'.max(1, $scale).'})?$/D';
                if (str_contains($column['type'], 'unsigned')) {
                    $typeRules[] = 'min:0';
                }
            }
            $rules[$field->column_name] = array_merge([$field->required ? 'required' : 'nullable'], $typeRules);
        }

        return $rules;
    }

    private function save(array $input, bool $updating): array
    {
        $this->authorize($updating ? 'update' : 'create');

        return $this->validation(function () use ($input, $updating): array {
            return app(GeneratedCrudStorage::class)->connection($this->program)->transaction(function () use ($input, $updating): array {
                $old = $updating ? $this->lockedRecord($input) : null;
                foreach ($this->definition['fields'] as $field) {
                    if (array_key_exists($field->column_name, $input) && $input[$field->column_name] === '') {
                        $input[$field->column_name] = null;
                    }
                }
                $attributes = array_column($this->definition['fields'], 'label', 'column_name');
                $values = Validator::make($input, $this->rules(), [], $attributes)->validate();
                foreach ($this->definition['fields'] as $field) {
                    if (! array_key_exists($field->column_name, $values)) {
                        $values[$field->column_name] = $updating ? $old->{$field->column_name} : null;
                    }
                }
                app(GeneratedCrudRelations::class)->validateValues($this->definition['relations'], $values);
                if ($updating) {
                    app(GeneratedCrudRelations::class)->validateUpdate($this->program, $old, $values);
                }
                if (isset($this->definition['columns']['updated_at'])) {
                    $values['updated_at'] = now();
                }
                if ($updating) {
                    app(GeneratedCrudStorage::class)->query($this->program)->where('id', $old->id)->update($values);
                    $id = $old->id;
                } else {
                    if (isset($this->definition['columns']['created_at'])) {
                        $values['created_at'] = now();
                    }
                    $id = app(GeneratedCrudStorage::class)->query($this->program)->insertGetId($values);
                }
                app(GeneratedCrud::class)->audit($this->user, $updating ? 'generated_crud_record_updated' : 'generated_crud_record_created', $this->program->id, $this->menu, $id);

                return $this->record(app(GeneratedCrudStorage::class)->query($this->program)->where('id', $id)->first());
            });
        });
    }

    private function lockedRecord(array $input): object
    {
        Validator::make($input, ['id' => ['required', 'integer', 'min:1'], '_row_version' => ['required', 'string', 'size:64']])->validate();
        $row = $this->query()->where('id', $input['id'])->lockForUpdate()->first();
        if (! $row || ! hash_equals($this->fingerprint($row), $input['_row_version'])) {
            throw ValidationException::withMessages(['_row_version' => 'El registro cambió o ya no existe. Actualice el listado antes de guardar.']);
        }

        return $row;
    }

    public function delete(array $keys): void
    {
        $this->authorize('delete');
        $this->validation(function () use ($keys): void {
            app(GeneratedCrudStorage::class)->connection($this->program)->transaction(function () use ($keys): void {
                $row = $this->lockedRecord($keys);
                app(GeneratedCrudRelations::class)->preventDelete($this->program, $row->id, isset($this->definition['columns']['deleted_at']));
                $query = app(GeneratedCrudStorage::class)->query($this->program)->where('id', $row->id);
                if (isset($this->definition['columns']['deleted_at'])) {
                    $values = ['deleted_at' => now()];
                    if (isset($this->definition['columns']['updated_at'])) {
                        $values['updated_at'] = now();
                    }
                    $query->update($values);
                } else {
                    $query->delete();
                }
                app(GeneratedCrud::class)->audit($this->user, 'generated_crud_record_deleted', $this->program->id, $this->menu, $row->id);
            });
        });
    }

    private function fingerprint(object $row): string
    {
        return hash_hmac('sha256', $this->program->id.'|'.serialize((array) $row), (string) config('app.key'));
    }

    private function record(object $row, ?array $labels = null): array
    {
        $labels ??= app(GeneratedCrudRelations::class)->labels($this->definition['relations'], [$row]);
        $record = ['id' => $row->id, '_row_version' => $this->fingerprint($row)];
        foreach ($this->definition['fields'] as $field) {
            $value = $row->{$field->column_name};
            $record[$field->column_name] = $field->field_type === 'boolean' && $value !== null ? (int) $value : $value;
            if ($field->field_type === 'relation') {
                $record[$field->column_name] = $value === null ? null : (string) $value;
                $record[$field->column_name.'__text'] = $value === null ? '' : ($labels[$field->column_name][(string) $value] ?? 'No disponible');
            }
        }

        return $record;
    }

    private function validation(callable $callback): mixed
    {
        try {
            return $callback();
        } catch (ValidationException $exception) {
            throw new KitValidationException(array_map(fn (array $messages): string => $messages[0], $exception->errors()));
        } catch (QueryException $exception) {
            if (in_array((string) $exception->getCode(), ['23000', '23503', '23505', '22001', '22003'], true)) {
                throw new KitValidationException(['id' => 'La operación no cumple las restricciones de la tabla (valor duplicado, relación o longitud).']);
            }
            throw $exception;
        }
    }
}
