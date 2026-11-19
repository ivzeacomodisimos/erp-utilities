<?php

namespace App\Support\Menu;

use App\Models\User;
use App\Support\Ui\ErpPage;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Ivandzb\CrudKit\Data\ListQuery;
use Ivandzb\CrudKit\Data\ListResult;
use Ivandzb\CrudKit\Server\ValidationException as KitValidationException;
use Ivandzb\UiKit\Html;
use Throwable;

class GeneratedPrograms
{
    public function authorize(User $actor): void
    {
        Gate::forUser($actor)->authorize('menu.manage');
        abort_unless(in_array('administrador', $actor->erp_roles ?? [], true), 403);
    }

    public function list(ListQuery $query, User $actor): ListResult
    {
        $this->authorize($actor);
        $builder = DB::table('generated_programs');
        foreach ($query->filters() as $field => $value) {
            if (in_array($field, ['controller_name', 'title'], true)) {
                $builder->whereRaw($field." LIKE ? ESCAPE '!'", ['%'.str_replace(['!', '%', '_'], ['!!', '!%', '!_'], (string) $value).'%']);
            } elseif ($field === 'active') {
                $builder->where('active', $value);
            }
        }
        $total = (clone $builder)->count();
        foreach ($query->sorting() as [$field, $direction]) {
            if (in_array($field, ['id', 'controller_name', 'title', 'active'], true)) {
                $builder->orderBy($field, $direction);
            }
        }
        $records = $builder->orderBy('id')->offset($query->offset() ?? 0)->limit(min($query->limit() ?? 20, 100))->get()
            ->map(fn (object $row): array => $this->record($row))->all();

        return new ListResult($total, $records);
    }

    public function save(array $input, bool $updating, User $actor): array
    {
        $this->authorize($actor);
        $createdPath = null;
        $sourceHash = null;
        try {
            return DB::transaction(function () use ($input, $updating, $actor, &$createdPath, &$sourceHash): array {
                $old = null;
                if ($updating) {
                    Validator::make($input, ['id' => ['required', 'integer'], 'revision' => ['required', 'integer']])->validate();
                    $old = DB::table('generated_programs')->where('id', $input['id'])->lockForUpdate()->first();
                    if (! $old || (int) $old->revision !== (int) $input['revision']) {
                        throw ValidationException::withMessages(['revision' => 'El programa cambió. Actualice el listado antes de guardar.']);
                    }
                    $input['controller_name'] ??= $old->controller_name;
                }
                $input['program_type'] ??= $old?->program_type ?? 'page';
                $input['table_mode'] ??= $old?->table_mode;
                $input['table_name'] ??= $old?->table_name;
                $input['table_connection'] = array_key_exists('table_connection', $input) ? ($input['table_connection'] ?? '') : ($old?->table_connection ?? '');
                $data = Validator::make($input, [
                    'controller_name' => ['required', 'string', 'max:100', 'regex:/^[A-Z][A-Za-z0-9]*Controller$/D', Rule::unique('generated_programs')->ignore($old?->id)],
                    'title' => ['required', 'string', 'max:200'],
                    'content' => ['nullable', 'string', 'max:20000'],
                    'active' => ['sometimes', 'boolean'],
                    'program_type' => ['required', Rule::in(['page', 'crud'])],
                    'table_mode' => ['nullable', Rule::in(['new', 'existing'])],
                    'table_name' => ['nullable', 'string', 'max:191'],
                    'table_connection' => ['nullable', 'string', 'max:100'],
                    'auto_detect_fields' => ['sometimes', 'boolean'],
                ])->validate();
                $detectFields = (bool) ($data['auto_detect_fields'] ?? true);
                unset($data['auto_detect_fields']);
                $data['content'] ??= '';
                if ($old && $data['program_type'] !== $old->program_type) {
                    throw ValidationException::withMessages(['program_type' => 'El tipo del programa se conserva después de crearlo.']);
                }
                if ($data['program_type'] === 'crud') {
                    Validator::make($data, ['table_mode' => ['required'], 'table_name' => ['required']])->validate();
                    $data['table_connection'] = $data['table_connection'] ?? '';
                    if (! $old && $data['table_mode'] === 'new' && $data['table_connection'] === '' && ! str_contains($data['table_name'], '.') && ! str_starts_with($data['table_name'], 'app_data_')) {
                        $data['table_name'] = 'app_data_'.$data['table_name'];
                    }
                    $storage = app(GeneratedCrudStorage::class)->resolve($data['table_name'], $data['table_connection']);
                    $data['table_name'] = $storage['canonical'];
                    app(GeneratedCrud::class)->assertTable($data['table_name']);
                    Validator::make($data, ['table_name' => ['max:191', Rule::unique('generated_programs')->ignore($old?->id)]])->validate();
                    if ($old && ($old->crud_ready || $old->crud_building) && ($old->table_name !== $data['table_name'] || $old->table_mode !== $data['table_mode'] || ($old->table_connection ?? '') !== $data['table_connection'])) {
                        throw ValidationException::withMessages(['table_name' => 'La tabla y su origen se conservan después de preparar el CRUD.']);
                    }
                    if ($old && ($old->table_name !== $data['table_name'] || ($old->table_connection ?? '') !== $data['table_connection'])
                        && DB::table('generated_program_fields')->where('program_id', $old->id)->exists()) {
                        throw ValidationException::withMessages(['table_name' => 'El programa ya tiene campos definidos. Cree otro programa para vincular una tabla o conexión diferente.']);
                    }
                    if (($old?->crud_building ?? false) || (! ($old?->crud_ready ?? false) && ($data['active'] ?? $old?->active ?? false))) {
                        throw ValidationException::withMessages(['active' => 'Defina los campos y prepare el CRUD antes de activarlo.']);
                    }
                } else {
                    $data['table_name'] = null;
                    $data['table_mode'] = null;
                    $data['table_connection'] = '';
                }
                if ($old && $old->controller_name !== $data['controller_name']) {
                    throw ValidationException::withMessages(['controller_name' => 'El nombre del controlador se conserva para mantener las rutas asociadas.']);
                }
                $data['controller_key'] = strtolower($data['controller_name']);
                Validator::make($data, ['controller_key' => [Rule::unique('generated_programs')->ignore($old?->id)]])->validate();
                $data['active'] ??= (bool) ($old?->active ?? false);
                $data['revision'] = $old ? $old->revision + 1 : 1;
                $data['updated_at'] = now();
                if ($old) {
                    DB::table('generated_programs')->where('id', $old->id)->update($data);
                    $id = $old->id;
                } else {
                    $directory = realpath(app_path('Http/Controllers'));
                    if (! $directory || is_link(app_path('Http/Controllers'))) {
                        throw ValidationException::withMessages(['controller_name' => 'No está disponible el directorio de controladores.']);
                    }
                    foreach (scandir($directory) as $entry) {
                        if (strcasecmp($entry, $data['controller_name'].'.php') === 0) {
                            throw ValidationException::withMessages(['controller_name' => 'Ya existe un controlador con este nombre.']);
                        }
                    }
                    foreach (get_declared_classes() as $class) {
                        if (strcasecmp($class, 'App\\Http\\Controllers\\'.$data['controller_name']) === 0) {
                            throw ValidationException::withMessages(['controller_name' => 'Este nombre de controlador ya está en uso.']);
                        }
                    }
                    $id = DB::table('generated_programs')->insertGetId($data + ['created_by' => $actor->id, 'created_at' => now()]);
                    $path = $directory.DIRECTORY_SEPARATOR.$data['controller_name'].'.php';
                    $source = $this->source($data['controller_name'], $id);
                    $temporary = @tempnam($directory, '.erp-program-');
                    if ($temporary === false || realpath(dirname($temporary)) !== $directory) {
                        if ($temporary !== false) {
                            unlink($temporary);
                        }
                        throw ValidationException::withMessages(['controller_name' => 'No se puede escribir en el directorio de controladores.']);
                    }
                    try {
                        if (file_put_contents($temporary, $source, LOCK_EX) !== strlen($source)) {
                            throw ValidationException::withMessages(['controller_name' => 'No se pudo completar la creación del controlador.']);
                        }
                        chmod($temporary, 0644);
                        $reservation = @fopen($path, 'xb');
                        if ($reservation === false) {
                            throw ValidationException::withMessages(['controller_name' => 'El archivo del controlador ya existe o no se puede crear.']);
                        }
                        fclose($reservation);
                        $createdPath = $path;
                        $sourceHash = hash('sha256', '');
                        if (! rename($temporary, $path)) {
                            throw ValidationException::withMessages(['controller_name' => 'No se pudo publicar el controlador.']);
                        }
                        $sourceHash = hash('sha256', $source);
                    } finally {
                        if (is_file($temporary)) {
                            unlink($temporary);
                        }
                    }
                    clearstatcache(true, $path);
                    if (function_exists('opcache_invalidate')) {
                        opcache_invalidate($path, true);
                    }
                }
                if (! $old && $data['program_type'] === 'crud' && $data['table_mode'] === 'existing' && $detectFields) {
                    app(GeneratedCrudDiscovery::class)->import($id, $actor);
                }
                $this->audit($actor, $old ? 'generated_program_updated' : 'generated_program_created', $id);

                return $this->record(DB::table('generated_programs')->find($id));
            });
        } catch (Throwable $exception) {
            if ($createdPath && is_file($createdPath) && hash_file('sha256', $createdPath) === $sourceHash) {
                unlink($createdPath);
            }
            if ($exception instanceof ValidationException) {
                throw new KitValidationException(array_map(fn (array $messages): string => $messages[0], $exception->errors()));
            }
            throw $exception;
        }
    }

    public function disable(array $input, User $actor): void
    {
        $this->authorize($actor);
        try {
            DB::transaction(function () use ($input, $actor): void {
                Validator::make($input, ['id' => ['required', 'integer'], 'revision' => ['required', 'integer']])->validate();
                $record = DB::table('generated_programs')->where('id', $input['id'])->lockForUpdate()->first();
                if (! $record || (int) $record->revision !== (int) $input['revision']) {
                    throw ValidationException::withMessages(['revision' => 'El programa cambió. Actualice el listado.']);
                }
                DB::table('generated_programs')->where('id', $record->id)->update(['active' => false, 'revision' => $record->revision + 1, 'updated_at' => now()]);
                $this->audit($actor, 'generated_program_disabled', $record->id);
            });
        } catch (ValidationException $exception) {
            throw new KitValidationException(array_map(fn (array $messages): string => $messages[0], $exception->errors()));
        }
    }

    public function render(int $id, Request $request, ErpPage $pages): Response
    {
        $user = $request->user();
        $menuId = (int) $request->attributes->get('erp.menu_id', 0);
        abort_unless($user && $menuId && app(MenuAccess::class)->permissions($user, $menuId)['view'], 403);
        $program = DB::table('generated_programs')->where('id', $id)->where('active', true)->first();
        abort_unless($program, 403, 'El programa está inactivo.');
        if ($program->program_type === 'crud') {
            return app(GeneratedCrud::class)->render($program, $request, $pages, $menuId);
        }
        abort_unless($request->isMethod('GET') || $request->isMethod('HEAD'), 405);

        return $pages->render($program->title, Html::div($program->content)->attr('style', 'white-space: pre-wrap'), $user);
    }

    private function record(object $row): array
    {
        return ['id' => $row->id, 'controller_name' => $row->controller_name, 'title' => $row->title,
            'content' => $row->content, 'active' => (int) $row->active, 'revision' => $row->revision,
            'program_type' => $row->program_type, 'table_mode' => $row->table_mode, 'table_name' => $row->table_name, 'table_connection' => $row->table_connection,
            'crud_ready' => (int) $row->crud_ready,
            'discovery_summary' => $row->discovery_report ? $this->discoverySummary($row->discovery_report) : 'Sin detección automática',
            'action' => 'App\\Http\\Controllers\\'.$row->controller_name.'@index'];
    }

    private function discoverySummary(string $json): string
    {
        $report = json_decode($json, true, flags: JSON_THROW_ON_ERROR);

        return ($report['detected_fields'] ?? 0).' campos · '.count($report['pending'] ?? []).' pendientes';
    }

    private function audit(User $actor, string $event, int $id): void
    {
        DB::table('erp_access_events')->insert(['user_id' => $actor->id, 'actor' => $actor->ldap_username, 'event' => $event,
            'details' => json_encode(['program_id' => $id]), 'created_at' => now()]);
    }

    private function source(string $class, int $id): string
    {
        return str_replace(['{{class}}', '{{id}}'], [$class, (string) $id], <<<'PHP'
<?php

namespace App\Http\Controllers;

use App\Support\Menu\GeneratedPrograms;
use App\Support\Ui\ErpPage;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class {{class}} extends Controller
{
    public const ERP_GENERATED_PROGRAM_ID = {{id}};

    public function index(Request $request, ErpPage $pages): Response
    {
        return app(GeneratedPrograms::class)->render(self::ERP_GENERATED_PROGRAM_ID, $request, $pages);
    }
}

PHP);
    }
}
