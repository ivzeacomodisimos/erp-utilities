<?php

namespace App\Support\Auth;

use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use SensitiveParameter;

class LoginService
{
    public function __construct(private LdapAuthenticator $directory, private JwtTokens $tokens) {}

    /** @return array{token: string, expires_in: int, user: User} */
    public function login(string $username, #[SensitiveParameter] string $password, string $actor): array
    {
        $identity = $this->directory->authenticate($username, $password);

        return DB::transaction(function () use ($identity, $actor): array {
            $user = User::where('ldap_username', $identity->username)->lockForUpdate()->first();
            if (! $user || ! $user->hasErpAccess()
                || ($user->ldap_guid !== null && ! hash_equals($user->ldap_guid, $identity->guid))) {
                throw new AuthorizationException('Su identidad corporativa no tiene acceso habilitado en ERP Utilities.');
            }

            $user->forceFill(['ldap_guid' => $identity->guid, 'name' => $identity->name, 'last_login_at' => now()])->save();
            $issued = $this->tokens->issue($user);
            DB::table('erp_access_events')->insert([
                'user_id' => $user->id, 'event' => 'login', 'actor' => $actor,
                'details' => null, 'created_at' => now(),
            ]);

            return $issued + ['user' => $user];
        }, 3);
    }
}
