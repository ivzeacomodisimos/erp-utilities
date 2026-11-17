<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\Auth\JwtTokens;
use Firebase\JWT\JWT;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class JwtTokenTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['access.jwt.secret' => str_repeat('test-key-', 16), 'access.jwt.secure_cookie' => false, 'erp.ldap.domain' => 'corp.test']);
    }

    private function account(string $role = 'administrador', string $username = 'erp.test'): User
    {
        return User::factory()->create([
            'ldap_username' => $username, 'ldap_guid' => str_repeat('a', 32),
            'erp_roles' => [$role], 'erp_active' => true, 'token_version' => 1,
        ]);
    }

    public function test_bad_signature_wrong_algorithm_and_malformed_tokens_are_rejected(): void
    {
        $issued = app(JwtTokens::class)->issue($this->account());
        $claims = app(JwtTokens::class)->authenticate($issued['token'])['claims'];
        foreach ([
            JWT::encode($claims, str_repeat('wrong', 30), 'HS256'),
            JWT::encode($claims, config('access.jwt.secret'), 'HS512'),
            'not-a-jwt',
        ] as $token) {
            $this->withToken($token)->getJson('/api/v1/me')->assertUnauthorized();
        }
    }

    public function test_issuer_audience_expiry_and_required_claims_are_validated(): void
    {
        $issued = app(JwtTokens::class)->issue($this->account());
        $claims = app(JwtTokens::class)->authenticate($issued['token'])['claims'];
        $variants = [];
        foreach (['iss' => 'other-issuer', 'aud' => 'other-audience', 'exp' => time() - 10, 'nbf' => time() + 60] as $key => $value) {
            $variants[] = array_replace($claims, [$key => $value]);
        }
        $withoutExpiry = $claims;
        unset($withoutExpiry['exp']);
        $variants[] = $withoutExpiry;
        foreach ($variants as $variant) {
            $this->withToken(JWT::encode($variant, config('access.jwt.secret'), 'HS256'))->getJson('/api/v1/me')->assertUnauthorized();
        }
    }

    public function test_logout_revokes_the_token_and_prevents_replay(): void
    {
        $this->withToken(app(JwtTokens::class)->issue($this->account())['token']);
        $this->postJson('/api/v1/auth/logout')->assertOk();
        $this->getJson('/api/v1/me')->assertUnauthorized();
        $this->assertNotNull(DB::table('erp_auth_tokens')->first()->revoked_at);
    }

    public function test_refresh_rotates_atomically_without_extending_the_ldap_session(): void
    {
        $issued = app(JwtTokens::class)->issue($this->account());
        $original = DB::table('erp_auth_tokens')->first();
        $response = $this->withToken($issued['token'])->postJson('/api/v1/auth/refresh')->assertOk();
        $this->assertNotSame($issued['token'], $response->json('access_token'));
        $this->withToken($issued['token'])->getJson('/api/v1/me')->assertUnauthorized();
        $this->withToken($response->json('access_token'))->getJson('/api/v1/me')->assertOk();
        $this->assertDatabaseCount('erp_auth_tokens', 2);
        $this->assertSame(1, DB::table('erp_auth_tokens')->whereNull('revoked_at')->count());
        $new = DB::table('erp_auth_tokens')->whereNull('revoked_at')->first();
        $this->assertSame($original->session_expires_at, $new->session_expires_at);
    }

    public function test_disabled_account_and_console_revocation_invalidate_existing_tokens(): void
    {
        $user = $this->account();
        $this->withToken(app(JwtTokens::class)->issue($user)['token']);
        $this->artisan('erp:access revoke erp.test')->assertSuccessful();
        $this->getJson('/api/v1/me')->assertUnauthorized();
    }

    public function test_role_reassignment_invalidates_existing_tokens(): void
    {
        $this->withToken(app(JwtTokens::class)->issue($this->account())['token']);
        $this->artisan('erp:access grant erp.test usuario')->assertSuccessful();
        $this->getJson('/api/v1/me')->assertUnauthorized();
    }

    public function test_api_does_not_authenticate_from_a_cookie(): void
    {
        $token = app(JwtTokens::class)->issue($this->account())['token'];
        $this->withCookie(config('access.jwt.cookie'), $token)->getJson('/api/v1/me')->assertUnauthorized();
        $this->get('/')->assertOk();
    }

    public function test_tokens_require_a_linked_ldap_identity(): void
    {
        $user = $this->account();
        $user->forceFill(['ldap_guid' => null])->save();
        $this->expectException(AuthenticationException::class);
        app(JwtTokens::class)->issue($user);
    }
}
