<?php

namespace App\Support\Menu;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\ValidationException;

class MigratedMenuRoutes
{
    private const INFRASTRUCTURE = ['dashboard', 'logout', 'auth.refresh', 'api.me', 'api.refresh', 'api.logout', 'menu.option', 'menu.open', 'menu.permissions', 'access.routes', 'access.programs', 'access.generator', 'access.generator.fields', 'access.generator.prepare', 'access.generator.discover', 'access.generator.wizard', 'access.generator.wizard.run'];

    public function catalog(bool $entryOnly = true): array
    {
        $options = [];
        foreach (Route::getRoutes() as $route) {
            $name = $route->getName();
            $middleware = $route->gatherMiddleware();
            if (! $name || in_array($name, self::INFRASTRUCTURE, true) || ! in_array('erp.menu', $middleware, true)
                || ! array_filter($middleware, fn (string $item): bool => $item === 'erp.jwt' || str_starts_with($item, 'erp.jwt:'))
                || ($entryOnly && ! in_array('GET', $route->methods(), true))) {
                continue;
            }
            $options[$name] = $name.' · '.implode('|', array_diff($route->methods(), ['HEAD'])).' /'.$route->uri();
        }
        asort($options);

        return $options;
    }

    public function parameters(string $name, mixed $input): array
    {
        if (! array_key_exists($name, $this->catalog())) {
            throw ValidationException::withMessages(['route_name' => 'Seleccione una ruta GET existente protegida por la sesión y el menú ERP.']);
        }
        if ($input === null || $input === '') {
            $input = '{}';
        }
        if (! is_string($input) || strlen($input) > 2000) {
            throw ValidationException::withMessages(['route_parameters' => 'Los parámetros deben ser un objeto JSON de hasta 2000 caracteres.']);
        }
        $object = json_decode($input);
        if (! is_object($object)) {
            throw ValidationException::withMessages(['route_parameters' => 'Escriba un objeto JSON, por ejemplo {"section":"usuarios"}.']);
        }
        $parameters = (array) $object;
        $route = Route::getRoutes()->getByName($name);
        if (array_diff($route->parameterNames(), array_keys($parameters)) !== [] || array_diff(array_keys($parameters), $route->parameterNames()) !== []) {
            throw ValidationException::withMessages(['route_parameters' => 'Indique únicamente todos los parámetros de la ruta: '.implode(', ', $route->parameterNames()).'.']);
        }
        foreach ($parameters as $key => $value) {
            if ((! is_string($value) && ! is_int($value)) || (string) $value === '' || preg_match('/[\x00-\x20\x7f\/\\\\?#]/', (string) $value)
                || (isset($route->wheres[$key]) && preg_match('~^(?:'.str_replace('~', '\\~', $route->wheres[$key]).')$~u', (string) $value) !== 1)) {
                throw ValidationException::withMessages(['route_parameters' => 'El parámetro '.$key.' no es válido para esta ruta.']);
            }
        }

        return $parameters;
    }

    public function keyForRoute(string $route, array $parameters): ?string
    {
        foreach (config('erp.migrated_menu_options', []) as $key => $option) {
            if ($option['route'] === $route && ($option['parameters'] ?? []) == $parameters) {
                return $key;
            }
        }

        return null;
    }

    public function isInfrastructure(Request $request): bool
    {
        if (in_array($request->route()?->getName(), self::INFRASTRUCTURE, true)) {
            return true;
        }
        foreach (config('erp.migrated_menu_options', []) as $option) {
            if (($option['bootstrap'] ?? false) && $this->matches($request, $option)) {
                return true;
            }
        }

        return false;
    }

    private function matches(Request $request, array $option): bool
    {
        if ($request->route()?->getName() !== $option['route']) {
            return false;
        }
        foreach ($option['parameters'] ?? [] as $name => $value) {
            if ((string) $request->route()->originalParameter($name, $request->route($name)) !== (string) $value) {
                return false;
            }
        }

        return true;
    }

    /** @return array<string, array{label: string, route: string, parameters?: array<string, string>, ability?: string}> */
    public function options(): array
    {
        $options = config('erp.migrated_menu_options', []);
        foreach (DB::table('menu_items')->whereNotNull('route_name')->whereNotNull('migration_key')->get() as $item) {
            $options[$item->migration_key] = array_merge($options[$item->migration_key] ?? [], [
                'label' => $options[$item->migration_key]['label'] ?? $item->label, 'route' => $item->route_name,
                'parameters' => json_decode($item->route_parameters ?? '{}', true) ?? [],
            ]);
        }

        return array_filter($options, function (array $option): bool {
            $route = Route::getRoutes()->getByName($option['route']);
            $managed = $route?->getAction(ManagedApplicationRoutes::MARKER);

            return $route !== null && in_array('GET', $route->methods(), true)
                && (! $managed || DB::table('managed_application_routes')->where('id', $managed)->where('active', true)->exists())
                && in_array('erp.menu', $route->gatherMiddleware(), true)
                && count(array_filter($route->gatherMiddleware(), fn (string $middleware): bool => $middleware === 'erp.jwt' || str_starts_with($middleware, 'erp.jwt:'))) > 0
                && array_diff($route->parameterNames(), array_keys($option['parameters'] ?? [])) === [];
        });
    }

    public function url(?string $key): ?string
    {
        $option = $this->options()[$key ?? ''] ?? null;

        return $option ? route($option['route'], $option['parameters'] ?? [], false) : null;
    }

    public function matchingKey(Request $request): ?string
    {
        foreach ($this->options() as $key => $option) {
            if ($option['bootstrap'] ?? false) {
                continue;
            }
            if (! $this->matches($request, $option)) {
                continue;
            }

            return $key;
        }

        return null;
    }
}
