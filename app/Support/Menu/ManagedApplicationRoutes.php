<?php

namespace App\Support\Menu;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\Controller;
use App\Http\Controllers\GeneratedProgramWizardController;
use App\Http\Controllers\PortalController;
use Illuminate\Http\Request;
use Illuminate\Routing\RouteCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use ReflectionClass;
use ReflectionMethod;

class ManagedApplicationRoutes
{
    public const MARKER = '_erp_managed_route';

    public function programs(): array
    {
        $programs = [];
        $registered = [];
        foreach (Route::getRoutes() as $route) {
            if ($route->getAction(self::MARKER) !== null) {
                continue;
            }
            $action = $route->getActionName();
            $registered[$action] = true;
            $middleware = $route->gatherMiddleware();
            if (! $route->getName() || in_array($route->getName(), ['access.programs', 'access.routes', 'access.generator', 'access.generator.fields', 'access.generator.prepare'], true)
                || ! in_array('erp.menu', $middleware, true)
                || ! array_filter($middleware, fn (string $item): bool => $item === 'erp.jwt' || str_starts_with($item, 'erp.jwt:'))
                || ! $this->isAction($action)) {
                continue;
            }
            $programs['route:'.$route->getName()] = [
                'label' => $route->getName().' · '.$action, 'action' => $action,
                'methods' => $route->methods(), 'defaults' => $route->defaults,
                'wheres' => $route->wheres, 'middleware' => $middleware,
            ];
        }
        foreach (File::allFiles(app_path('Http/Controllers')) as $file) {
            if ($file->getExtension() !== 'php' || $file->getSize() === 0) {
                continue;
            }
            $class = 'App\\Http\\Controllers\\'.str_replace(['/', '.php'], ['\\', ''], $file->getRelativePathname());
            if (! class_exists($class) || ! is_subclass_of($class, Controller::class)) {
                continue;
            }
            foreach ((new ReflectionClass($class))->getMethods(ReflectionMethod::IS_PUBLIC) as $method) {
                $action = $class.'@'.$method->name;
                if (isset($registered[$action]) || ! $this->isAction($action)) {
                    continue;
                }
                $generated = defined($class.'::ERP_GENERATED_PROGRAM_ID') ? constant($class.'::ERP_GENERATED_PROGRAM_ID') : null;
                $definition = $generated ? DB::table('generated_programs')->where('id', $generated)->where('controller_name', class_basename($class))->where('active', true)->first() : null;
                if ($generated && ! $definition) {
                    continue;
                }
                $isCrud = $definition?->program_type === 'crud';
                $programs['controller:'.$action] = ['label' => $action, 'action' => $action,
                    'methods' => $generated ? ($isCrud ? ['GET', 'HEAD', 'POST'] : ['GET', 'HEAD']) : ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
                    'generated_crud_id' => $isCrud ? $generated : null,
                    'defaults' => [], 'wheres' => [], 'middleware' => []];
            }
        }

        return $programs;
    }

    private function isAction(string $action): bool
    {
        if (! str_contains($action, '@')) {
            return false;
        }
        [$class, $method] = explode('@', $action, 2);
        if (! class_exists($class) || ! is_subclass_of($class, Controller::class)
            || is_a($class, AuthController::class, true) || is_a($class, PortalController::class, true)
            || is_a($class, GeneratedProgramWizardController::class, true)
            || ! method_exists($class, $method)) {
            return false;
        }
        $reflection = new ReflectionMethod($class, $method);

        return $reflection->isPublic() && ! $reflection->isStatic() && ! str_starts_with($method, '__')
            && (new ReflectionClass($class))->isInstantiable()
            && $reflection->getDeclaringClass()->name === $class;
    }

    public function parameters(array $program, mixed $input): array
    {
        if ($input === null || $input === '') {
            $input = '{}';
        }
        if (! is_string($input) || strlen($input) > 2000 || ! is_object(json_decode($input))) {
            throw ValidationException::withMessages(['program_parameters' => 'Indique un objeto JSON, por ejemplo {} o {"section":"usuarios"}.']);
        }
        $parameters = (array) json_decode($input);
        $rules = [];
        foreach ((new ReflectionMethod(...explode('@', $program['action'], 2)))->getParameters() as $parameter) {
            $type = $parameter->getType();
            if ($type instanceof \ReflectionNamedType && ! $type->isBuiltin()) {
                continue;
            }
            $rule = match ($type instanceof \ReflectionNamedType ? $type->getName() : null) {
                'int' => 'integer', 'float' => 'numeric', 'bool' => 'boolean', default => 'string',
            };
            $required = ! $parameter->isOptional() && ! array_key_exists($parameter->name, $program['defaults']);
            $rules[$parameter->name] = [$required ? 'required' : 'sometimes', $rule];
        }
        if (array_diff(array_keys($parameters), array_keys($rules)) !== []) {
            throw ValidationException::withMessages(['program_parameters' => 'Los parámetros disponibles son: '.implode(', ', array_keys($rules)).'.']);
        }
        $values = array_merge($program['defaults'], $parameters);
        $validator = Validator::make($values, $rules);
        if ($validator->fails()) {
            throw ValidationException::withMessages(['program_parameters' => implode(' ', $validator->errors()->all())]);
        }
        foreach ($parameters as $name => $value) {
            if (isset($program['wheres'][$name]) && preg_match('~^(?:'.str_replace('~', '\\~', $program['wheres'][$name]).')$~u', (string) $value) !== 1) {
                throw ValidationException::withMessages(['program_parameters' => 'El valor de '.$name.' no es válido para el programa.']);
            }
        }

        return $parameters;
    }

    public function validateAddress(string $name, string $uri, string $method, ?int $id): void
    {
        if (! preg_match('~^/[a-z0-9]+(?:[a-z0-9/_-]*[a-z0-9])?$~D', $uri) || str_contains($uri, '//')
            || preg_match('~^/(administracion|api|auth|login|logout|menu|desarrollo|up|storage|build)(/|$)~', $uri)) {
            throw ValidationException::withMessages(['uri' => 'Escriba una dirección local, por ejemplo /ventas/pedidos, sin parámetros, consultas ni rutas reservadas.']);
        }
        foreach (Route::getRoutes() as $route) {
            if ($route->getAction(self::MARKER) !== null) {
                continue;
            }
            if ($route->getName() === $name || array_filter(explode('|', $method), fn (string $verb): bool => $route->matches(Request::create($uri, $verb)))) {
                throw ValidationException::withMessages(['uri' => 'La dirección o el nombre coinciden con una ruta del sistema.']);
            }
        }
        $conflicts = DB::table('managed_application_routes')->where('uri', $uri)->when($id, fn ($query) => $query->where('id', '<>', $id))->get();
        if ($conflicts->contains(fn (object $record): bool => array_intersect(explode('|', $method), explode('|', $record->http_method)) !== [])) {
            throw ValidationException::withMessages(['uri' => 'Ya existe una ruta para esta dirección y método.']);
        }
    }

    public function load(): void
    {
        if (! Schema::hasTable('managed_application_routes')) {
            return;
        }
        $collection = new RouteCollection;
        foreach (Route::getRoutes() as $route) {
            if ($route->getAction(self::MARKER) === null) {
                $collection->add($route);
            }
        }
        app('router')->setRoutes($collection);
        $records = DB::table('managed_application_routes')->orderBy('id')->get();
        $programs = $records->isEmpty() ? [] : $this->programs();
        foreach ($records as $record) {
            $program = $programs[$record->program] ?? null;
            if (! $program || array_diff(explode('|', $record->http_method), $program['methods']) !== []) {
                continue;
            }
            $parameters = json_decode($record->program_parameters ?? '{}', true) ?? [];
            $route = Route::match(explode('|', $record->http_method), $record->uri, $program['action'])
                ->name($record->name)->middleware(array_values(array_unique(array_merge(['web', 'erp.jwt', 'erp.menu'], $program['middleware']))));
            $route->setAction(array_merge($route->getAction(), [self::MARKER => $record->id, '_erp_generated_crud' => $program['generated_crud_id'] ?? null]));
            foreach (array_merge($program['defaults'], $parameters) as $key => $value) {
                $route->defaults($key, $value);
            }
        }
        $collection->refreshNameLookups();
        $collection->refreshActionLookups();
        app('url')->setRoutes($collection);
    }
}
