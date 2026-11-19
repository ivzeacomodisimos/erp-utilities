<?php

namespace App\Providers;

use App\Models\User;
use App\Support\Administration\SystemsAccess;
use App\Support\Auth\AccessRoles;
use App\Support\Menu\ManagedApplicationRoutes;
use App\Support\Menu\OptionAccess;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        if ($this->app->runningInConsole() && ! $this->app->runningUnitTests()
            && in_array($_SERVER['argv'][1] ?? '', ['route:list', 'route:cache'], true)) {
            $this->app->booted(fn () => app(ManagedApplicationRoutes::class)->load());
        }
        foreach (array_keys(SystemsAccess::SECTIONS) as $section) {
            Gate::define('systems.'.$section, fn (User $user): bool => app(SystemsAccess::class)->allows($user, $section));
        }
        Gate::define('option-permissions.manage', fn (User $user): bool => app(OptionAccess::class)->canManage($user));
        Gate::define('option.access', fn (User $user, string $module, string $file, int $option, string $operation = 'access'): bool => app(OptionAccess::class)->allows($user, $module, $file, $option, $operation));
        $permissions = [];
        foreach (config('access.roles') as $role) {
            $permissions = array_merge($permissions, $role['permissions']);
        }
        foreach (array_unique($permissions) as $permission) {
            Gate::define($permission, fn (User $user): bool => AccessRoles::allows($user, $permission));
        }
        foreach (['menu.manage' => ['menuaplic', 'mantmenu', 1], 'grants.manage' => ['menuaplic', 'mantaccesos', 2], 'users.manage' => ['aplicacion', 'usuarios', 3]] as $ability => $context) {
            Gate::define($ability, fn (User $user): bool => app(OptionAccess::class)->allows($user, ...$context));
        }
        RateLimiter::for('corporate-login', function (Request $request): array {
            $username = $request->input('username');
            $identity = is_string($username) ? strtolower(trim($username)) : 'invalid-input';

            return [
                Limit::perMinute(30)->by('ip:'.$request->ip()),
                Limit::perMinute(5)->by('identity:'.hash('sha256', $identity)),
            ];
        });
    }
}
