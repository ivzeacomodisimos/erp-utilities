<?php

namespace App\Support\Menu;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

class MigratedMenuRoutes
{
    /** @return array<string, array{label: string, route: string, parameters?: array<string, string>}> */
    public function options(): array
    {
        return array_filter(config('erp.migrated_menu_options', []), function (array $option): bool {
            $route = Route::getRoutes()->getByName($option['route']);

            return $route !== null && in_array('GET', $route->methods(), true)
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
            if ($request->route()?->getName() !== $option['route']) {
                continue;
            }
            foreach ($option['parameters'] ?? [] as $name => $value) {
                if ((string) $request->route($name) !== (string) $value) {
                    continue 2;
                }
            }

            return $key;
        }

        return null;
    }
}
