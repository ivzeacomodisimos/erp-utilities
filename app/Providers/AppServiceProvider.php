<?php

namespace App\Providers;

use App\Models\User;
use App\Support\Auth\AccessRoles;
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
        Gate::define('option-permissions.manage', fn (User $user): bool => app(OptionAccess::class)->canManage($user));
        Gate::define('option.access', fn (User $user, string $module, string $file, int $option, string $operation = 'access'): bool => app(OptionAccess::class)->allows($user, $module, $file, $option, $operation));
        $permissions = [];
        foreach (config('access.roles') as $role) {
            $permissions = array_merge($permissions, $role['permissions']);
        }
        foreach (array_unique($permissions) as $permission) {
            Gate::define($permission, fn (User $user): bool => AccessRoles::allows($user, $permission));
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
