<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\Auth\JwtTokens;
use App\Support\Kits\OptionKitPermissions;
use App\Support\Menu\OptionAccess;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;
use Ivandzb\CrudKit\Definition\Crud;
use Tests\TestCase;

class OptionPermissionsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['access.jwt.secret' => str_repeat('option-tests-', 16)]);
        Route::middleware(['web', 'erp.jwt', 'erp.menu', 'erp.option:test.orders,ventas,pedidos,7'])
            ->get('/testing/option', fn () => 'Botón autorizado')->name('test.option');
        Route::middleware(['web', 'erp.jwt', 'erp.menu', 'erp.option:test.orders,ventas,pedidos,7,write'])
            ->post('/testing/option/write', fn () => 'Modificado')->name('test.option.write');
        Route::getRoutes()->refreshNameLookups();
        config(['erp.migrated_menu_options' => array_merge(config('erp.migrated_menu_options'), [
            'test.orders' => ['label' => 'Pedidos', 'route' => 'test.option'],
        ])]);
        DB::table('menu_items')->insert(['id' => 50, 'parent_id' => 0, 'label' => 'Aplicaciones', 'legacy_url' => '']);
        foreach ([101 => 'access.options', 102 => 'test.orders'] as $id => $key) {
            DB::table('menu_items')->insert(['id' => $id, 'parent_id' => 50, 'label' => $key,
                'legacy_url' => '', 'migration_enabled' => true, 'migration_key' => $key]);
        }
    }

    private function account(string $role = 'usuario'): User
    {
        return User::factory()->create(['ldap_username' => fake()->unique()->userName(),
            'ldap_guid' => bin2hex(random_bytes(16)), 'erp_active' => true, 'erp_roles' => [$role], 'token_version' => 1]);
    }

    private function login(User $user): void
    {
        $this->withToken(app(JwtTokens::class)->issue($user)['token']);
    }

    private function grant(User $user, array $extra = []): int
    {
        return DB::table('option_grants')->insertGetId($extra + ['user_id' => $user->id, 'module' => 'ventas', 'file' => 'pedidos', 'option_id' => 7]);
    }

    private function menuGrant(User $user, int $id = 102): void
    {
        DB::table('menu_grants')->insert(['user_id' => $user->id, 'menu_item_id' => $id,
            'can_view' => true, 'can_create' => true, 'can_update' => true, 'can_delete' => true]);
    }

    public function test_exact_denial_overrides_module_permission_and_only_absent_records_fall_back(): void
    {
        $user = $this->account();
        $access = app(OptionAccess::class);
        $this->grant($user, ['file' => '', 'can_read' => true, 'can_write' => true, 'can_insert' => true, 'can_delete' => true]);
        $this->assertTrue($access->allows($user, 'VENTAS', 'Pedidos', 7));
        $this->assertTrue($access->allows($user, 'VENTAS ', 'Pedidos ', 7));
        $id = $this->grant($user);
        $this->assertFalse($access->allows($user, 'ventas', 'pedidos', 7));
        $this->assertFalse($access->allows($user, 'ventas', 'pedidos', 7, 'insert'));
        DB::table('option_grants')->where('id', $id)->update(['can_write' => true]);
        $this->assertTrue(Gate::forUser($user)->allows('option.access', ['ventas', 'pedidos', 7]));
        $this->assertFalse($access->allows($user, 'ventas', 'pedidos', 7, 'read'));
        $this->assertFalse($access->allows($user, 'ventas', 'pedidos', 8));
        $this->assertFalse($access->allows($user, 'otro', 'pedidos', 7));
        DB::table('option_grants')->where('id', $id)->delete();
        $this->assertTrue($access->allows($user, 'ventas', 'pedidos', 7));
    }

    public function test_insert_and_delete_are_independent_of_legacy_entry_and_unknown_operations_fail_closed(): void
    {
        $user = $this->account();
        $this->grant($user, ['can_insert' => true, 'can_delete' => true]);
        $access = app(OptionAccess::class);
        $this->assertFalse($access->allows($user, 'ventas', 'pedidos', 7));
        $this->assertTrue($access->allows($user, 'ventas', 'pedidos', 7, 'insert'));
        $this->assertTrue($access->allows($user, 'ventas', 'pedidos', 7, 'delete'));
        $this->assertFalse($access->allows($user, 'ventas', 'pedidos', 7, 'write'));
        $this->assertFalse($access->allows($user, 'ventas', 'pedidos', 7, 'approve'));
        $user->erp_active = false;
        $this->assertFalse($access->allows($user, 'ventas', 'pedidos', 7, 'insert'));
        $admin = $this->account('administrador');
        $this->assertTrue($access->allows($admin, 'ventas', 'pedidos', 7, 'delete'));
        $this->assertFalse($access->allows($admin, 'ventas', 'pedidos', 7, 'unknown'));
    }

    public function test_direct_requests_use_server_context_and_changes_apply_to_existing_sessions(): void
    {
        $user = $this->account();
        $this->menuGrant($user);
        $this->login($user);
        $this->get('/testing/option?module=otro&file=otro&option=0')->assertForbidden();
        $id = $this->grant($user, ['can_read' => true]);
        $this->get('/testing/option')->assertOk();
        $this->postJson('/testing/option/write', ['can_write' => 1, 'user_id' => 1])->assertForbidden();
        DB::table('option_grants')->where('id', $id)->update(['can_write' => true]);
        $this->postJson('/testing/option/write')->assertOk();
        DB::table('menu_grants')->where('user_id', $user->id)->update(['can_update' => false]);
        $this->postJson('/testing/option/write')->assertForbidden();
        DB::table('menu_grants')->where('user_id', $user->id)->update(['can_update' => true]);
        DB::table('option_grants')->where('id', $id)->update(['can_read' => false, 'can_write' => false]);
        $this->get('/testing/option')->assertForbidden();
        $this->login($this->account('administrador'));
        DB::table('menu_items')->where('id', 102)->update(['migration_enabled' => false]);
        $this->get('/testing/option')->assertForbidden();
        $this->postJson('/testing/option/write')->assertForbidden();
    }

    public function test_crud_buttons_and_server_operations_share_permissions(): void
    {
        $user = $this->account();
        $this->menuGrant($user);
        $this->grant($user, ['can_read' => true, 'can_insert' => true]);
        $adapter = new OptionKitPermissions($user, 102, 'ventas', 'pedidos', 7);
        $crud = Crud::make('orders');
        $this->assertTrue($adapter->allows($crud, Crud::LIST, null));
        $this->assertTrue($adapter->allows($crud, Crud::CREATE, null));
        $this->assertFalse($adapter->allows($crud, Crud::UPDATE, null));
        $this->assertFalse($adapter->allows($crud, Crud::DELETE, null));
        DB::table('menu_items')->where('id', 102)->update(['migration_enabled' => false]);
        $this->assertFalse($adapter->allows($crud, Crud::CREATE, null));
    }

    public function test_administration_validates_identity_uniqueness_revisions_and_audits_revocation(): void
    {
        $admin = $this->account('administrador');
        $user = $this->account();
        $this->login($admin);
        $base = '/administracion/opciones?crud=access-opciones&action=';
        $values = ['user_id' => $user->id, 'module' => 'VENTAS', 'file' => '', 'option_id' => 7,
            'can_read' => 1, 'can_insert' => 0, 'can_write' => 0, 'can_delete' => 0];
        $this->get('/administracion/opciones')->assertOk()->assertSee('Permisos de opciones y botones');
        $response = $this->postJson($base.'create', $values)->assertOk()->assertJsonPath('Record.module', 'ventas');
        $id = $response->json('Record.id');
        $this->postJson($base.'create', $values)->assertUnprocessable();
        $this->postJson($base.'create', ['option_id' => -1] + $values)->assertUnprocessable();
        $this->postJson($base.'create', ['module' => 'dos palabras'] + $values)->assertUnprocessable();
        $this->postJson($base.'create', ['user_id' => 999999] + $values)->assertUnprocessable();
        $this->postJson($base.'create', ['can_write' => 2, 'option_id' => 8] + $values)->assertUnprocessable();
        $this->postJson($base.'update', ['id' => $id, 'revision' => 1, 'can_write' => 1] + $values)
            ->assertOk()->assertJsonPath('Record.revision', 2);
        $this->postJson($base.'update', ['id' => $id, 'revision' => 1] + $values)->assertUnprocessable();
        $this->postJson($base.'delete', ['id' => $id, 'revision' => 1])->assertUnprocessable();
        $this->postJson($base.'delete', ['id' => $id, 'revision' => 2])->assertOk();
        $this->assertDatabaseHas('erp_access_events', ['event' => 'access_opciones_created']);
        $this->assertDatabaseHas('erp_access_events', ['event' => 'option_permission_revoked']);
        $this->get($base.'delete')->assertStatus(405);
        $this->postJson($base.'list', ['action' => 'create'])->assertOk();
        $this->assertDatabaseCount('option_grants', 0);
    }

    public function test_legacy_management_options_three_and_six_are_preserved_without_granting_menu_administration(): void
    {
        $user = $this->account();
        $this->menuGrant($user, 101);
        $this->login($user);
        $this->get('/administracion/opciones')->assertForbidden();
        $id = $this->grant($user, ['module' => 'menuaplic', 'file' => '', 'option_id' => 3, 'can_read' => true]);
        $this->get('/administracion/opciones')->assertOk();
        $this->postJson('/administracion/opciones?crud=access-opciones&action=list')->assertOk();
        $this->get('/administracion/menu')->assertForbidden();
        DB::table('option_grants')->where('id', $id)->update(['option_id' => 6, 'can_read' => false, 'can_write' => true]);
        $this->get('/administracion/opciones')->assertOk();
        DB::table('option_grants')->where('id', $id)->delete();
        $this->get('/administracion/opciones')->assertForbidden();
    }

    public function test_anonymous_and_cookie_mutations_cannot_bypass_authentication_or_csrf(): void
    {
        $this->get('/administracion/opciones')->assertRedirect('/login');
        $this->postJson('/administracion/opciones?crud=access-opciones&action=create')->assertUnauthorized();
        $admin = $this->account('administrador');
        $token = app(JwtTokens::class)->issue($admin)['token'];
        $this->app->instance('env', 'local');
        $this->withCookie(config('access.jwt.cookie'), $token)->post('/administracion/opciones?crud=access-opciones&action=create')->assertStatus(419);
    }
}
