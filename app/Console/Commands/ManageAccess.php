<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Support\Auth\LdapAuthenticator;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ManageAccess extends Command
{
    protected $signature = 'erp:access {action : grant, revoke o list} {username?} {roles?*}';

    protected $description = 'Administra roles locales explícitos; no crea ni modifica cuentas LDAP.';

    public function handle(LdapAuthenticator $directory): int
    {
        if ($this->argument('action') === 'list') {
            $this->table(['Usuario', 'Roles', 'Activo', 'Identidad LDAP vinculada'],
                User::whereNotNull('ldap_username')->get()->map(fn (User $user): array => [
                    $user->ldap_username, implode(', ', $user->erp_roles ?? []),
                    $user->erp_active ? 'Sí' : 'No', $user->ldap_guid ? 'Sí' : 'Pendiente de primer acceso',
                ])->all());

            return self::SUCCESS;
        }

        $action = $this->argument('action');
        $roles = array_values(array_unique($this->argument('roles') ?? []));
        if (! in_array($action, ['grant', 'revoke'], true) || ! $this->argument('username')
            || ($action === 'grant' && ($roles === [] || array_diff($roles, array_keys(config('access.roles'))) !== []))) {
            $this->error('Use grant con roles válidos, revoke con usuario o list. Roles: usuario, administrador.');

            return self::FAILURE;
        }

        try {
            $username = $directory->normalizeUsername((string) $this->argument('username'));
        } catch (AuthenticationException) {
            $this->error('El nombre de usuario corporativo no es válido.');

            return self::FAILURE;
        }

        return DB::transaction(function () use ($username, $action, $roles): int {
            $user = User::where('ldap_username', $username)->lockForUpdate()->first();
            if (! $user && $action === 'revoke') {
                $this->error('No existe un acceso local con ese usuario.');

                return self::FAILURE;
            }

            if (! $user) {
                $user = new User;
                $user->forceFill(['ldap_username' => $username, 'name' => $username,
                    'email' => $username.'@erp.invalid', 'password' => null]);
            }

            $user->forceFill([
                'erp_roles' => $action === 'grant' ? $roles : [],
                'erp_active' => $action === 'grant',
                'token_version' => (int) $user->token_version + 1,
            ])->save();

            DB::table('erp_auth_tokens')->where('user_id', $user->id)->whereNull('revoked_at')->update(['revoked_at' => now()]);
            DB::table('erp_access_events')->insert([
                'user_id' => $user->id, 'event' => $action === 'grant' ? 'roles_assigned' : 'access_revoked',
                'actor' => 'console', 'details' => json_encode(['roles' => $user->erp_roles], JSON_THROW_ON_ERROR),
                'created_at' => now(),
            ]);
            $this->info('Acceso local actualizado para '.$username.'. Las sesiones anteriores quedaron revocadas.');

            return self::SUCCESS;
        }, 3);
    }
}
