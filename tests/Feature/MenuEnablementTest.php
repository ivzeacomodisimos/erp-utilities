<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\Auth\JwtTokens;
use App\Support\Menu\MenuAccess;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class MenuEnablementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['access.jwt.secret' => str_repeat('enablement-', 16)]);
        Route::middleware(['web', 'erp.jwt', 'erp.menu'])
            ->match(['GET', 'POST'], '/testing/migrated-orders', fn () => response('Pedidos migrados'))
            ->name('test.migrated-orders');
        Route::getRoutes()->refreshNameLookups();
        config(['erp.migrated_menu_options' => array_merge(config('erp.migrated_menu_options'), [
            'test.orders' => ['label' => 'Pedidos migrados', 'route' => 'test.migrated-orders'],
        ])]);
        foreach ([[50, 0, 'Aplicaciones'], [100, 50, 'Comercial'], [101, 100, 'Consultar pedidos']] as [$id, $parent, $label]) {
            DB::table('menu_items')->insert(['id' => $id, 'parent_id' => $parent, 'label' => $label,
                'legacy_url' => 'index.php?modulo=pedidos', 'active' => true]);
        }
    }

    private function login(string $role = 'administrador'): User
    {
        $user = User::factory()->create(['ldap_username' => fake()->unique()->userName(),
            'ldap_guid' => bin2hex(random_bytes(16)), 'erp_active' => true, 'erp_roles' => [$role], 'token_version' => 1]);
        $this->withToken(app(JwtTokens::class)->issue($user)['token']);

        return $user;
    }

    private function saveOption(array $changes = []): TestResponse
    {
        $record = DB::table('menu_items')->find(101);

        return $this->postJson('/administracion/menu?crud=access-menu&action=update', $changes + [
            'id' => 101, 'revision' => $record->revision, 'label' => $record->label, 'parent_id' => 100,
            'active' => 1, 'is_public' => 0, 'migration_enabled' => 1, 'migration_key' => 'test.orders',
        ]);
    }

    public function test_existing_and_new_options_are_disabled_by_default_even_for_administrators(): void
    {
        $this->login();
        $this->assertDatabaseHas('menu_items', ['id' => 101, 'migration_enabled' => 0, 'migration_key' => null]);
        $this->get('/')->assertOk()->assertDontSee('Consultar pedidos');
        $this->get('/menu/101')->assertForbidden();
        $this->get('/menu/101/abrir')->assertForbidden();
        $this->getJson('/api/menu/101/permisos')->assertForbidden();
        $this->get('/testing/migrated-orders')->assertForbidden();
        $this->postJson('/testing/migrated-orders')->assertForbidden();
        $this->get('/administracion/menu')->assertOk()->assertSee('Habilitada en ERP');
        $this->get('/administracion/usuarios')->assertForbidden();
        $this->postJson('/administracion/menu?crud=access-menu&action=create', [
            'label' => 'Pendiente', 'parent_id' => 100, 'active' => 1, 'is_public' => 0,
        ])->assertOk()->assertJsonPath('Record.migration_enabled', 0);
        foreach (['Pendiente 2', 'Pendiente 3'] as $label) {
            $this->postJson('/administracion/menu?crud=access-menu&action=create', [
                'label' => $label, 'parent_id' => 100, 'active' => 1, 'is_public' => 0,
                'migration_enabled' => 0, 'migration_key' => '',
            ])->assertOk()->assertJsonPath('Record.migration_key', null);
        }
    }

    public function test_only_registered_migrated_options_can_be_enabled_and_routes_are_unique(): void
    {
        $this->login();
        $this->saveOption(['migration_key' => null])->assertUnprocessable();
        $this->saveOption(['migration_key' => 'dashboard'])->assertUnprocessable();
        $this->saveOption(['migration_key' => 'https://evil.test'])->assertUnprocessable();
        $options = config('erp.migrated_menu_options');
        $options['missing'] = ['label' => 'No existe', 'route' => 'missing.route'];
        $options['parameterized'] = ['label' => 'Sin parámetros', 'route' => 'access.manage'];
        config(['erp.migrated_menu_options' => $options]);
        $this->saveOption(['migration_key' => 'missing'])->assertUnprocessable();
        $this->saveOption(['migration_key' => 'parameterized'])->assertUnprocessable();
        $this->saveOption()->assertOk()->assertJsonPath('Record.migration_enabled', 1);
        $this->postJson('/administracion/menu?crud=access-menu&action=create', [
            'label' => 'Duplicado', 'parent_id' => 100, 'active' => 1, 'is_public' => 0,
            'migration_enabled' => 1, 'migration_key' => 'test.orders',
        ])->assertUnprocessable();
        $this->assertDatabaseHas('erp_access_events', ['event' => 'access_menu_updated']);
    }

    public function test_enablement_reveals_groups_and_revocation_blocks_existing_sessions_and_direct_urls(): void
    {
        $this->login();
        $this->saveOption()->assertOk();
        $this->get('/')->assertOk()->assertSee('Comercial')->assertSee('Consultar pedidos');
        $this->get('/menu/101')->assertRedirect('/testing/migrated-orders');
        $this->get('/menu/101/abrir')->assertRedirect('/testing/migrated-orders');
        $this->get('/testing/migrated-orders')->assertOk()->assertSee('Pedidos migrados');
        $this->assertDatabaseHas('menu_items', ['id' => 100, 'migration_enabled' => 0]);
        $this->saveOption(['migration_enabled' => 0])->assertOk();
        $this->get('/testing/migrated-orders')->assertForbidden();
        $this->postJson('/testing/migrated-orders')->assertForbidden();
        $this->get('/menu/101')->assertForbidden();
        $this->get('/menu/101/abrir')->assertForbidden();
        $this->get('/')->assertOk()->assertDontSee('Consultar pedidos')->assertDontSee('Comercial');
    }

    public function test_enablement_does_not_grant_user_permissions_and_inactive_parent_blocks_direct_access(): void
    {
        DB::table('menu_items')->where('id', 101)->update(['migration_enabled' => true, 'migration_key' => 'test.orders']);
        $user = $this->login('usuario');
        $this->get('/testing/migrated-orders')->assertForbidden();
        DB::table('menu_grants')->insert(['user_id' => $user->id, 'menu_item_id' => 101, 'can_view' => true]);
        $this->get('/testing/migrated-orders')->assertOk();
        $this->assertFalse(app(MenuAccess::class)->permissions($user, 101)['create']);
        DB::table('menu_items')->where('id', 100)->update(['active' => false]);
        $this->get('/testing/migrated-orders')->assertForbidden();
    }

    public function test_public_options_and_forged_database_flags_cannot_bypass_migration(): void
    {
        DB::table('menu_items')->where('id', 101)->update(['is_public' => true]);
        $user = $this->login('usuario');
        $this->assertFalse(app(MenuAccess::class)->permissions($user, 101)['view']);
        DB::table('menu_items')->where('id', 101)->update(['migration_enabled' => true, 'migration_key' => 'not-migrated']);
        $this->get('/menu/101')->assertForbidden();
        $this->get('/')->assertOk()->assertDontSee('Consultar pedidos');
    }

    public function test_native_administration_routes_check_their_specific_menu_binding(): void
    {
        $this->login();
        DB::table('menu_items')->where('id', 101)->update(['migration_key' => 'access.users']);
        $this->get('/administracion/usuarios')->assertForbidden();
        $this->saveOption(['migration_key' => 'access.users'])->assertOk();
        $this->get('/administracion/usuarios')->assertOk();
        $this->postJson('/administracion/usuarios?crud=access-usuarios&action=list')->assertOk();
        $this->get('/administracion/permisos')->assertForbidden();
        $this->get('/administracion/menu')->assertOk();
        $this->saveOption(['migration_enabled' => 0, 'migration_key' => 'access.users'])->assertOk();
        $this->get('/administracion/usuarios')->assertForbidden();
        $this->postJson('/administracion/usuarios?crud=access-usuarios&action=list')->assertForbidden();
    }
}
