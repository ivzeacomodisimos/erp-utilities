<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\Auth\DirectoryIdentity;
use App\Support\Auth\LdapAuthenticator;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Cookie\CookieValuePrefix;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Symfony\Component\HttpKernel\Exception\ServiceUnavailableHttpException;
use Tests\TestCase;

class CorporateAuthenticationTest extends TestCase
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

    public function test_login_form_is_public_and_private_routes_require_jwt(): void
    {
        $this->get('/login')->assertOk()->assertSee('Acceso corporativo')->assertSee('password');
        $this->get('/')->assertRedirect('/login');
        $this->getJson('/api/v1/me')->assertUnauthorized();
        $this->getJson('/administracion/menu?crud=access-menu&action=list')->assertUnauthorized();
    }

    public function test_valid_ldap_identity_receives_jwt_without_storing_the_password(): void
    {
        $user = $this->account();
        $originalPassword = $user->password;
        $this->mock(LdapAuthenticator::class)->shouldReceive('authenticate')->once()
            ->with('erp.test', 'corporate-secret')->andReturn(new DirectoryIdentity('erp.test', str_repeat('a', 32), 'Usuario corporativo'));

        $response = $this->postJson('/api/v1/auth/login', ['username' => 'erp.test', 'password' => 'corporate-secret']);
        $response->assertOk()->assertJsonPath('token_type', 'Bearer')->assertJsonPath('user.roles.0', 'administrador');
        $claims = JWT::decode($response->json('access_token'), new Key(config('access.jwt.secret'), 'HS256'));
        $this->assertSame((string) $user->id, $claims->sub);
        $this->assertFalse(property_exists($claims, 'password'));
        $this->assertFalse(property_exists($claims, 'roles'));
        $this->assertSame($originalPassword, $user->fresh()->password);
        $this->assertDatabaseHas('erp_access_events', ['event' => 'login', 'user_id' => $user->id]);
        $this->withToken($response->json('access_token'))->getJson('/api/v1/me')->assertOk()->assertJsonPath('user.username', 'erp.test');
    }

    public function test_browser_login_uses_an_http_only_cookie_and_logout_revokes_it(): void
    {
        $user = $this->account('usuario');
        $this->mock(LdapAuthenticator::class)->shouldReceive('authenticate')->once()
            ->andReturn(new DirectoryIdentity('erp.test', str_repeat('a', 32), 'Administración'));

        $response = $this->withSession(['_token' => 'nexo-test'])->post('/login', ['username' => 'erp.test', 'password' => 'corporate-secret', '_token' => 'nexo-test']);
        $response->assertRedirect('/')->assertCookie(config('access.jwt.cookie'));
        $cookies = array_filter($response->headers->getCookies(), fn ($cookie): bool => $cookie->getName() === config('access.jwt.cookie'));
        $cookie = array_values($cookies)[0];
        $this->assertTrue($cookie->isHttpOnly());
        $this->assertSame('lax', $cookie->getSameSite());
        $this->assertStringNotContainsString('corporate-secret', $cookie->getValue());
        $plain = app('encrypter')->decrypt($cookie->getValue(), false);
        $token = CookieValuePrefix::remove($plain);
        $this->withCookie(config('access.jwt.cookie'), $token)->get('/')->assertOk()->assertSee('Base de aplicaciones corporativas');
        $this->withSession(['_token' => 'logout-test'])->post('/logout', ['_token' => 'logout-test'])->assertRedirect('/login');
        $this->withToken($token)->getJson('/api/v1/me')->assertUnauthorized();
        $this->assertDatabaseHas('erp_access_events', ['event' => 'logout', 'user_id' => $user->id]);
    }

    public function test_bad_credentials_do_not_issue_tokens_or_fall_back_to_local_password(): void
    {
        $this->account();
        $this->mock(LdapAuthenticator::class)->shouldReceive('authenticate')->once()->andThrow(new AuthenticationException);
        $this->postJson('/api/v1/auth/login', ['username' => 'erp.test', 'password' => 'password'])->assertUnauthorized();
        $this->assertDatabaseCount('erp_auth_tokens', 0);
    }

    public function test_directory_success_does_not_automatically_grant_access(): void
    {
        $this->mock(LdapAuthenticator::class)->shouldReceive('authenticate')->once()
            ->andReturn(new DirectoryIdentity('unknown.user', str_repeat('b', 32), 'Sin acceso'));
        $this->postJson('/api/v1/auth/login', ['username' => 'unknown.user', 'password' => 'secret'])->assertForbidden();
        $this->assertDatabaseCount('users', 0);
        $this->assertDatabaseCount('erp_auth_tokens', 0);
    }

    public function test_inactive_local_account_is_denied_after_directory_authentication(): void
    {
        $this->account()->forceFill(['erp_active' => false])->save();
        $this->mock(LdapAuthenticator::class)->shouldReceive('authenticate')->once()
            ->andReturn(new DirectoryIdentity('erp.test', str_repeat('a', 32), 'Inactivo'));
        $this->postJson('/api/v1/auth/login', ['username' => 'erp.test', 'password' => 'secret'])->assertForbidden();
    }

    public function test_reused_username_with_different_directory_guid_is_denied(): void
    {
        $this->account();
        $this->mock(LdapAuthenticator::class)->shouldReceive('authenticate')->once()
            ->andReturn(new DirectoryIdentity('erp.test', str_repeat('b', 32), 'Otra identidad'));
        $this->postJson('/api/v1/auth/login', ['username' => 'erp.test', 'password' => 'secret'])->assertForbidden();
    }

    public function test_ldap_unavailable_returns_503_without_password_or_token(): void
    {
        $this->mock(LdapAuthenticator::class)->shouldReceive('authenticate')->once()
            ->andThrow(new ServiceUnavailableHttpException(null, 'Unavailable'));
        $this->postJson('/api/v1/auth/login', ['username' => 'erp.test', 'password' => 'secret-value'])
            ->assertStatus(503)->assertDontSee('secret-value')->assertJsonMissingPath('access_token');
    }

    public function test_roles_sent_by_the_client_are_ignored(): void
    {
        $user = $this->account('usuario');
        $this->mock(LdapAuthenticator::class)->shouldReceive('authenticate')->once()
            ->andReturn(new DirectoryIdentity('erp.test', str_repeat('a', 32), 'Administración'));
        $this->postJson('/api/v1/auth/login', ['username' => 'erp.test', 'password' => 'secret', 'roles' => ['administrador']])
            ->assertOk()->assertJsonPath('user.roles', ['usuario']);
        $this->assertSame(['usuario'], $user->fresh()->erp_roles);
    }

    public function test_login_is_rate_limited(): void
    {
        $this->mock(LdapAuthenticator::class)->shouldReceive('authenticate')->times(5)->andThrow(new AuthenticationException);
        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->postJson('/api/v1/auth/login', ['username' => 'limited.user', 'password' => 'bad'])->assertUnauthorized();
        }
        $this->postJson('/api/v1/auth/login', ['username' => 'limited.user', 'password' => 'bad'])->assertStatus(429);
    }

    public function test_ldap_rejects_disabled_and_ambiguous_directory_data(): void
    {
        $directory = new LdapAuthenticator;
        $entry = ['samaccountname' => ['erp.test'], 'useraccountcontrol' => ['514'], 'objectguid' => [str_repeat('a', 16)]];
        $this->expectException(AuthenticationException::class);
        $directory->identityFromEntry($entry, 'erp.test');
    }

    public function test_ldap_normalization_rejects_filter_injection_and_foreign_domains(): void
    {
        $directory = new LdapAuthenticator;
        $this->assertSame('erp.test', $directory->normalizeUsername('ERP.TEST@CORP.TEST'));
        $this->expectException(AuthenticationException::class);
        $directory->normalizeUsername('*)(objectClass=*)');
    }

    public function test_credentials_are_never_sent_without_tls(): void
    {
        config(['erp.ldap.host' => 'ldap.invalid', 'erp.ldap.start_tls' => false, 'erp.ldap.base_dn' => 'dc=corp,dc=test']);
        $this->expectException(ServiceUnavailableHttpException::class);
        (new LdapAuthenticator)->authenticate('erp.test', 'must-not-be-sent');
    }

    public function test_console_grant_only_creates_local_access_without_a_password(): void
    {
        $this->artisan('erp:access grant new.user usuario')->assertSuccessful();
        $user = User::where('ldap_username', 'new.user')->firstOrFail();
        $this->assertNull($user->password);
        $this->assertNull($user->ldap_guid);
        $this->assertSame(['usuario'], $user->erp_roles);
        $this->assertDatabaseHas('erp_access_events', ['user_id' => $user->id, 'event' => 'roles_assigned']);
    }

    public function test_first_valid_login_links_the_directory_guid(): void
    {
        $user = $this->account();
        $user->forceFill(['ldap_guid' => null, 'password' => null])->save();
        $this->mock(LdapAuthenticator::class)->shouldReceive('authenticate')->once()
            ->andReturn(new DirectoryIdentity('erp.test', str_repeat('c', 32), 'Primera sesión'));
        $this->postJson('/api/v1/auth/login', ['username' => 'erp.test', 'password' => 'secret'])
            ->assertOk()->assertJsonMissingPath('user.ldap_guid');
        $this->assertSame(str_repeat('c', 32), $user->fresh()->ldap_guid);
        $this->assertNull($user->fresh()->password);
    }

    public function test_invalid_input_is_rejected_before_ldap(): void
    {
        $this->mock(LdapAuthenticator::class)->shouldNotReceive('authenticate');
        $this->postJson('/api/v1/auth/login', ['username' => ['invalid'], 'password' => 'secret'])->assertUnprocessable();
        $this->postJson('/api/v1/auth/login', ['username' => 'new.user', 'password' => ''])->assertUnprocessable();
    }
}
