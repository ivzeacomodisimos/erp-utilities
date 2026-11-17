<?php

namespace App\Support\Auth;

use App\Models\User;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\ServiceUnavailableHttpException;
use UnexpectedValueException;

class JwtTokens
{
    /** @return array{token: string, expires_in: int} */
    public function issue(User $user, ?CarbonInterface $sessionExpiresAt = null): array
    {
        if (! $user->hasErpAccess() || ! $user->ldap_guid) {
            throw new AuthenticationException;
        }

        $issuedAt = now()->getTimestamp();
        $sessionExpiresAt ??= now()->addMinutes((int) config('access.jwt.session_minutes'));
        $expires = min($issuedAt + (int) config('access.jwt.ttl_minutes') * 60, $sessionExpiresAt->getTimestamp());
        if ($expires <= $issuedAt) {
            throw new AuthenticationException;
        }

        $jti = bin2hex(random_bytes(32));
        $token = JWT::encode([
            'iss' => config('access.jwt.issuer'),
            'aud' => config('access.jwt.audience'),
            'sub' => (string) $user->getKey(),
            'jti' => $jti,
            'iat' => $issuedAt,
            'nbf' => $issuedAt,
            'exp' => $expires,
            'ver' => $user->token_version,
        ], $this->secret(), 'HS256');

        DB::table('erp_auth_tokens')->insert([
            'id' => hash('sha256', $jti),
            'user_id' => $user->id,
            'expires_at' => CarbonImmutable::createFromTimestamp($expires),
            'session_expires_at' => $sessionExpiresAt,
            'revoked_at' => null,
            'created_at' => now(),
        ]);

        return ['token' => $token, 'expires_in' => $expires - $issuedAt];
    }

    /** @return array{user: User, claims: array<string, mixed>} */
    public function authenticate(string $token): array
    {
        try {
            $claims = (array) JWT::decode($token, new Key($this->secret(), 'HS256'));
        } catch (UnexpectedValueException|\DomainException) {
            throw new AuthenticationException;
        }

        foreach (['iss', 'aud', 'sub', 'jti', 'iat', 'nbf', 'exp', 'ver'] as $claim) {
            if (! isset($claims[$claim])) {
                throw new AuthenticationException;
            }
        }

        if ($claims['iss'] !== config('access.jwt.issuer') || $claims['aud'] !== config('access.jwt.audience')
            || ! is_string($claims['sub']) || ! ctype_digit($claims['sub'])
            || ! is_string($claims['jti']) || preg_match('/^[a-f0-9]{64}$/D', $claims['jti']) !== 1
            || ! is_int($claims['iat']) || ! is_int($claims['nbf']) || ! is_int($claims['exp'])
            || ! is_int($claims['ver']) || $claims['exp'] <= now()->getTimestamp()) {
            throw new AuthenticationException;
        }

        $record = DB::table('erp_auth_tokens')->where('id', hash('sha256', $claims['jti']))
            ->where('user_id', $claims['sub'])->whereNull('revoked_at')
            ->where('expires_at', '>', now())->where('session_expires_at', '>', now())->first();
        $user = User::find($claims['sub']);
        if (! $record || ! $user || ! $user->hasErpAccess() || ! $user->ldap_guid || $user->token_version !== $claims['ver']) {
            throw new AuthenticationException;
        }

        return ['user' => $user, 'claims' => $claims];
    }

    /** @param array<string, mixed> $claims
     * @return array{token: string, expires_in: int}
     */
    public function rotate(array $claims): array
    {
        return DB::transaction(function () use ($claims): array {
            $user = User::whereKey($claims['sub'])->lockForUpdate()->first();
            $record = DB::table('erp_auth_tokens')->where('id', hash('sha256', $claims['jti']))
                ->where('user_id', $claims['sub'])->whereNull('revoked_at')
                ->where('expires_at', '>', now())->where('session_expires_at', '>', now())->lockForUpdate()->first();
            if (! $user || ! $user->hasErpAccess() || ! $record || $user->token_version !== $claims['ver']) {
                throw new AuthenticationException;
            }

            $this->revoke($claims);
            $issued = $this->issue($user, CarbonImmutable::parse($record->session_expires_at));
            DB::table('erp_access_events')->insert([
                'user_id' => $user->id, 'event' => 'token_rotated', 'actor' => 'application',
                'details' => null, 'created_at' => now(),
            ]);

            return $issued;
        }, 3);
    }

    /** @param array<string, mixed> $claims */
    public function revoke(array $claims): void
    {
        DB::table('erp_auth_tokens')->where('id', hash('sha256', $claims['jti']))
            ->where('user_id', $claims['sub'])->whereNull('revoked_at')->update(['revoked_at' => now()]);
    }

    private function secret(): string
    {
        $secret = (string) config('access.jwt.secret');
        if (strlen($secret) < 64) {
            throw new ServiceUnavailableHttpException(null, 'La firma de acceso requiere configuración de Tecnología.');
        }

        return $secret;
    }
}
