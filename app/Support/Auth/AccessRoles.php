<?php

namespace App\Support\Auth;

use App\Models\User;

class AccessRoles
{
    /** @return list<string> */
    public static function roles(User $user): array
    {
        return array_values(array_intersect(array_keys(config('access.roles')), $user->erp_roles ?? []));
    }

    /** @return list<string> */
    public static function permissions(User $user): array
    {
        if (! $user->erp_active) {
            return [];
        }

        $permissions = [];
        foreach (self::roles($user) as $role) {
            $permissions = array_merge($permissions, config('access.roles.'.$role.'.permissions', []));
        }

        return array_values(array_unique($permissions));
    }

    public static function allows(User $user, string $permission): bool
    {
        return in_array($permission, self::permissions($user), true);
    }

    /** @return array<string, mixed> */
    public static function profile(User $user): array
    {
        return [
            'id' => $user->getKey(),
            'name' => $user->name,
            'username' => $user->ldap_username,
            'roles' => self::roles($user),
            'permissions' => self::permissions($user),
        ];
    }
}
