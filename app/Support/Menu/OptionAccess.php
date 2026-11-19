<?php

namespace App\Support\Menu;

use App\Models\User;
use Illuminate\Support\Facades\DB;

class OptionAccess
{
    /** @return array{read: bool, insert: bool, write: bool, delete: bool} */
    public function permissions(User $user, string $module, string $file, int $option): array
    {
        $module = mb_strtolower(rtrim($module, ' '));
        $file = mb_strtolower(rtrim($file, ' '));
        $denied = array_fill_keys(['read', 'insert', 'write', 'delete'], false);
        if (! $user->hasErpAccess() || $option < 0 || $module === '' || preg_match('/\\s/u', $module.$file)) {
            return $denied;
        }
        if (in_array('administrador', $user->erp_roles ?? [], true)) {
            return array_fill_keys(array_keys($denied), true);
        }
        $query = DB::table('option_grants')->where('user_id', $user->id)
            ->where('module', $module)->where('option_id', $option);
        $grant = (clone $query)->where('file', $file)->first();
        if (! $grant && $file !== '') {
            $grant = (clone $query)->where('file', '')->first();
        }
        foreach ($denied as $operation => $value) {
            $denied[$operation] = (bool) ($grant?->{'can_'.$operation} ?? false);
        }

        return $denied;
    }

    public function allows(User $user, string $module, string $file, int $option, string $operation = 'access'): bool
    {
        $permissions = $this->permissions($user, $module, $file, $option);

        return $operation === 'access' ? $permissions['read'] || $permissions['write'] : ($permissions[$operation] ?? false);
    }

    public function canManage(User $user): bool
    {
        return $this->allows($user, 'menuaplic', 'mantpermisosopcion', 6)
            || $this->allows($user, 'menuaplic', 'mantpermisosopcion', 3);
    }
}
