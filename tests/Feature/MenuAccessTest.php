<?php

namespace Tests\Feature;

use App\Http\Controllers\SystemsManagementController;
use App\Models\User;
use App\Support\Auth\JwtTokens;
use App\Support\Kits\MenuKitPermissions;
use App\Support\Menu\MenuAccess;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;
use Ivandzb\CrudKit\Definition\Crud;
use Ivandzb\CrudKit\Render\Quasar\QuasarRenderer;
use Tests\TestCase;

class MenuAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['access.jwt.secret' => str_repeat('test-', 30), 'erp.legacy_base_url' => 'http://localhost/IntranetLocal/']);
        Route::middleware(['web', 'erp.jwt', 'erp.menu'])->get('/testing/orders', fn () => 'Orders')->name('test.orders');
        Route::middleware(['web', 'erp.jwt', 'erp.menu'])->get('/testing/private', fn () => 'Private')->name('test.private');
        Route::getRoutes()->refreshNameLookups();
        config(['erp.migrated_menu_options' => array_merge(config('erp.migrated_menu_options'), [
            'test.orders' => ['label' => 'Pedidos', 'route' => 'test.orders'],
            'test.private' => ['label' => 'Privado', 'route' => 'test.private'],
        ])]);
        foreach ([[50, 0, 'Aplicaciones'], [74, 0, 'Públicas'], [100, 50, 'Ventas'], [101, 100, 'Consulta pedidos'], [102, 100, 'Privado']] as [$id, $parent, $label]) {
            DB::table('menu_items')->insert(['id' => $id, 'parent_id' => $parent, 'label' => $label, 'legacy_url' => $id > 100 ? 'index.php?modulo=ventas' : '',
                'sort_order' => (string) $id, 'active' => true, 'is_public' => false, 'revision' => 1]);
        }
        DB::table('menu_items')->where('id', 101)->update(['migration_enabled' => true, 'migration_key' => 'test.orders']);
        DB::table('menu_items')->where('id', 102)->update(['migration_enabled' => true, 'migration_key' => 'test.private']);
        foreach ([103 => 'access.permissions', 104 => 'access.users', 105 => 'access.options'] as $id => $key) {
            DB::table('menu_items')->insert(['id' => $id, 'parent_id' => 50, 'label' => $key, 'legacy_url' => '',
                'migration_enabled' => true, 'migration_key' => $key]);
        }
    }

    private function account(string $role = 'usuario'): User
    {
        return User::factory()->create(['ldap_username' => fake()->unique()->userName(), 'ldap_guid' => bin2hex(random_bytes(16)),
            'erp_active' => true, 'erp_roles' => [$role], 'token_version' => 1]);
    }

    private function login(User $user): void
    {
        $this->withToken(app(JwtTokens::class)->issue($user)['token']);
    }

    private function grant(User $user, int $menu = 101, array $extra = []): int
    {
        return DB::table('menu_grants')->insertGetId($extra + ['user_id' => $user->id, 'menu_item_id' => $menu, 'can_view' => true, 'revision' => 1]);
    }

    public function test_menu_and_direct_routes_require_explicit_permissions(): void
    {
        $user = $this->account();
        $this->grant($user);
        $this->login($user);
        $this->get('/')->assertOk()->assertSee('Consulta pedidos')->assertDontSee('Privado')->assertDontSee('Permisos por usuario');
        $this->get('/menu/101')->assertRedirect('/testing/orders');
        $this->get('/menu/102')->assertForbidden();
        $this->get('/menu/100')->assertForbidden();
        $this->get('/menu/102/abrir')->assertForbidden();
        $this->postJson('/administracion/permisos?crud=access-permisos&action=create', ['user_id' => $user->id, 'menu_item_id' => 102])->assertForbidden();
    }

    public function test_menu_name_suggestions_show_hierarchy_and_preserve_literal_text_filtering(): void
    {
        $url = '/administracion/menu?crud=access-menu&action=suggest&field=label';
        $this->login($this->account());
        $this->postJson($url, ['term' => 'Consulta'])->assertForbidden();
        $this->login($this->account('administrador'));
        DB::table('menu_items')->insert([
            ['id' => 106, 'parent_id' => 74, 'label' => 'Consulta pedidos', 'legacy_url' => ''],
            ['id' => 107, 'parent_id' => 50, 'label' => 'Descuento 10%', 'legacy_url' => ''],
            ['id' => 0, 'parent_id' => 0, 'label' => 'Inicio', 'legacy_url' => ''],
        ]);
        $this->postJson($url, ['term' => 'Consulta pedi'])->assertOk()->assertExactJson([
            ['value' => 'Consulta pedidos', 'label' => 'Consulta pedidos', 'caption' => 'Aplicaciones › Ventas'],
            ['value' => 'Consulta pedidos', 'label' => 'Consulta pedidos', 'caption' => 'Públicas'],
        ]);
        $this->postJson($url, ['term' => '%'])->assertOk()->assertJsonCount(1)->assertJsonPath('0.label', 'Descuento 10%');
        $this->postJson($url, ['term' => ''])->assertOk()->assertExactJson([]);
        $this->postJson('/administracion/menu?crud=access-menu&action=suggest&field=legacy_url', ['term' => 'Consulta'])->assertUnprocessable();
        $this->get($url)->assertStatus(405);
        $this->postJson('/administracion/menu?crud=access-menu&action=list', ['label' => 'Consulta pedi'])
            ->assertOk()->assertJsonPath('TotalRecordCount', 2);
    }

    public function test_public_options_are_authenticated_and_do_not_grant_write_access(): void
    {
        DB::table('menu_items')->where('id', 101)->update(['is_public' => true]);
        $user = $this->account();
        $access = app(MenuAccess::class)->permissions($user, 101);
        $this->assertTrue($access['view']);
        $this->assertFalse($access['create']);
        $this->get('/menu/101')->assertRedirect('/login');
        $this->login($user);
        $this->get('/menu/101')->assertRedirect('/testing/orders');
    }

    public function test_parent_autocomplete_resolves_ids_hierarchy_and_existing_labels_without_allowing_cycles(): void
    {
        $url = '/administracion/menu?crud=access-menu&action=autocomplete&field=parent_id';
        $this->login($this->account());
        $this->postJson($url, ['term' => 'Ventas'])->assertForbidden();
        $this->login($this->account('administrador'));
        $this->postJson($url, ['term' => 'Ventas'])->assertOk()->assertExactJson([
            ['id' => 100, 'label' => '100 · Ventas', 'caption' => 'Aplicaciones'],
        ]);
        $this->postJson($url, ['term' => '101'])->assertOk()->assertExactJson([
            ['id' => 101, 'label' => '101 · Consulta pedidos', 'caption' => 'Aplicaciones › Ventas'],
        ]);
        $this->postJson($url, ['term' => 'Raíz'])->assertOk()->assertExactJson([
            ['id' => 0, 'label' => 'Raíz', 'caption' => 'Sin opción padre'],
        ]);
        $this->postJson('/administracion/menu?crud=access-menu&action=autocomplete&field=legacy_url', ['term' => 'Ventas'])->assertUnprocessable();
        $this->postJson('/administracion/menu?crud=access-menu&action=list', ['label' => 'Consulta pedidos'])->assertOk()
            ->assertJsonPath('Records.0.parent_id', 100)->assertJsonPath('Records.0.parent_id__text', '100 · Ventas');
        $values = ['id' => 101, 'revision' => 1, 'label' => 'Consulta pedidos', 'active' => 1, 'is_public' => 0];
        $saveUrl = '/administracion/menu?crud=access-menu&action=update';
        $this->postJson($saveUrl, ['parent_id' => 101] + $values)->assertUnprocessable();
        $this->postJson($saveUrl, ['parent_id' => 999999] + $values)->assertUnprocessable();
        $this->postJson($saveUrl, ['parent_id' => 74] + $values)->assertOk()
            ->assertJsonPath('Record.parent_id', 74)->assertJsonPath('Record.parent_id__text', '74 · Públicas');
    }

    public function test_inactive_parent_cycles_and_revocation_fail_closed(): void
    {
        $user = $this->account();
        $this->grant($user);
        $this->login($user);
        DB::table('menu_items')->where('id', 100)->update(['active' => false]);
        $this->get('/menu/101')->assertForbidden();
        DB::table('menu_items')->where('id', 100)->update(['active' => true, 'parent_id' => 101]);
        $this->get('/menu/101')->assertForbidden();
        DB::table('menu_items')->where('id', 100)->update(['parent_id' => 50]);
        DB::table('menu_grants')->delete();
        $this->get('/menu/101')->assertForbidden();
    }

    public function test_crud_adapter_preserves_each_operation_independently(): void
    {
        $user = $this->account();
        $this->grant($user, 101, ['can_create' => true, 'can_update' => false, 'can_delete' => false]);
        $adapter = new MenuKitPermissions($user, 101);
        $crud = Crud::make('orders');
        $this->assertTrue($adapter->allows($crud, Crud::LIST, null));
        $this->assertTrue($adapter->allows($crud, Crud::CREATE, null));
        $this->assertFalse($adapter->allows($crud, Crud::UPDATE, null));
        $this->assertFalse($adapter->allows($crud, Crud::DELETE, null));
        $this->assertFalse((new MenuKitPermissions($user, 102))->allows($crud, Crud::CREATE, null));
    }

    public function test_destinations_cannot_escape_the_configured_legacy_host(): void
    {
        $access = app(MenuAccess::class);
        foreach (['javascript:alert(1)', '//evil.test', 'https://evil.test/', '../config.php', '%2e%2e/config.php', 'http://user:pass@localhost/'] as $url) {
            $this->assertNull($access->destination((object) ['id' => 101, 'legacy_url' => $url]));
        }
        $this->assertSame('http://localhost/IntranetLocal/index.php?modulo=ventas&idMenu=101',
            $access->destination((object) ['id' => 101, 'legacy_url' => 'index.php?modulo=ventas']));
    }

    public function test_admin_can_manage_grants_and_changes_apply_to_an_existing_session(): void
    {
        $admin = $this->account('administrador');
        $user = $this->account();
        $token = app(JwtTokens::class)->issue($user)['token'];
        $this->login($admin);
        $response = $this->postJson('/administracion/permisos?crud=access-permisos&action=create',
            ['user_id' => $user->id, 'menu_item_id' => 101, 'can_view' => 1, 'can_create' => 0, 'can_update' => 0, 'can_delete' => 0, 'can_approve' => 0])
            ->assertOk()->assertJsonPath('Result', 'OK');
        $id = $response->json('Record.id');
        $this->withToken($token)->get('/menu/101')->assertRedirect('/testing/orders');
        $this->login($admin);
        $this->postJson('/administracion/permisos?crud=access-permisos&action=delete', ['id' => $id])->assertOk();
        $this->withToken($token)->get('/menu/101')->assertForbidden();
        $this->assertDatabaseHas('erp_access_events', ['event' => 'permission_revoked']);
    }

    public function test_menu_updates_reject_stale_revisions_cycles_and_client_action_tampering(): void
    {
        $this->login($this->account('administrador'));
        $url = '/administracion/menu?crud=access-menu&action=update';
        $data = ['id' => 100, 'revision' => 1, 'label' => 'Ventas', 'parent_id' => 101, 'legacy_url' => '', 'sort_order' => '', 'active' => 1, 'is_public' => 0];
        $this->postJson($url, $data)->assertUnprocessable();
        $data['parent_id'] = 50;
        $this->postJson($url, $data)->assertOk()->assertJsonPath('Record.revision', 2);
        $this->postJson($url, $data)->assertUnprocessable();
        $this->postJson('/administracion/menu?crud=access-menu&action=list', $data + ['action' => 'create'])->assertOk();
        $this->assertDatabaseCount('menu_items', 8);
    }

    public function test_user_management_hides_secrets_and_prevents_removing_last_admin(): void
    {
        $admin = $this->account('administrador');
        $this->login($admin);
        $this->postJson('/administracion/usuarios?crud=access-usuarios&action=list')->assertOk()
            ->assertJsonMissingPath('Records.0.password')->assertJsonMissingPath('Records.0.ldap_guid');
        $this->postJson('/administracion/usuarios?crud=access-usuarios&action=update',
            ['id' => $admin->id, 'revision' => 1, 'erp_active' => 0, 'is_admin' => 0])->assertUnprocessable();
        $this->assertTrue($admin->fresh()->erp_active);
    }

    public function test_cookie_mutations_require_csrf_and_no_nexo_business_routes_exist(): void
    {
        $this->app->instance('env', 'local');
        $token = app(JwtTokens::class)->issue($this->account('administrador'))['token'];
        $this->withCookie(config('access.jwt.cookie'), $token);
        $this->post('/administracion/permisos?crud=access-permisos&action=delete', ['id' => 1])->assertStatus(419);
        $this->get('/tiendas/solicitudes')->assertNotFound();
        $this->get('/tecnologia/procesos')->assertNotFound();
    }

    public function test_ui_kit_and_crud_kit_render_and_assets_are_available(): void
    {
        $this->login($this->account('administrador'));
        $this->get('/administracion/menu')->assertOk()->assertSee('CrudKitQuasar')->assertSee('UiKitQuasar');
        $this->get('/desarrollo/assets/ui-kit/quasar/ui-kit-quasar.js')->assertOk();
        $this->get('/desarrollo/assets/crud-kit/quasar/crud-kit-quasar.js')->assertOk();
    }

    public function test_management_pages_can_supply_isolated_quasar_fixtures(): void
    {
        $admin = $this->account('administrador');
        $user = $this->account();
        $this->grant($user);
        $this->login($admin);
        $fixture = [];
        DB::table('option_grants')->insert(['user_id' => $user->id, 'module' => 'ventas', 'file' => 'pedidos',
            'option_id' => 7, 'can_read' => true, 'revision' => 1]);
        foreach (array_keys(SystemsManagementController::TITLES) as $index => $section) {
            DB::table('menu_items')->insert(['id' => 300 + $index, 'parent_id' => 50, 'label' => $section,
                'legacy_url' => '', 'migration_key' => 'systems.'.$section, 'migration_enabled' => true]);
        }
        DB::table('system_objects')->insert(['id' => 1210, 'parent_id' => 0, 'name' => 'GESTIONES_ASIGNADAS', 'default_value' => '-']);
        foreach (['menu', 'permisos', 'usuarios', 'opciones', 'rutas', 'programas', 'generador', 'campos'] as $section) {
            (new \ReflectionProperty(QuasarRenderer::class, 'assetsWritten'))->setValue(null, false);
            $path = '/administracion/'.match ($section) {
                'rutas' => 'rutas-menu', 'programas' => 'registro-rutas', 'generador' => 'programas', 'campos' => 'campos-programa', default => $section
            };
            $fixture[$section] = $this->get($path)->assertOk()->getContent();
            $fixture[$section.'_list'] = $this->postJson($path.'?crud=access-'.$section.'&action=list')->assertOk()->json();
        }
        foreach (array_keys(SystemsManagementController::TITLES) as $section) {
            (new \ReflectionProperty(QuasarRenderer::class, 'assetsWritten'))->setValue(null, false);
            $fixture[$section] = $this->get('/administracion/'.$section)->assertOk()->getContent();
            $fixture[$section.'_list'] = $this->postJson('/administracion/'.$section.'?crud=systems-'.$section.'&action=list')->assertOk()->json();
        }
        $this->login($user);
        $fixture['user'] = $this->get('/')->assertOk()->getContent();
        if (getenv('ERP_CAPTURE_UI') === '1') {
            File::ensureDirectoryExists(base_path('.runtime/tests'));
            File::put(base_path('.runtime/tests/access-ui.json'), json_encode($fixture, JSON_THROW_ON_ERROR));
        }
    }

    public function test_disabling_user_revokes_existing_session_without_changing_ldap_identity(): void
    {
        $admin = $this->account('administrador');
        $user = $this->account();
        $token = app(JwtTokens::class)->issue($user)['token'];
        $this->login($admin);
        $this->postJson('/administracion/usuarios?crud=access-usuarios&action=update',
            ['id' => $user->id, 'revision' => 1, 'erp_active' => 0, 'is_admin' => 0, 'ldap_username' => 'changed.user'])
            ->assertOk()->assertJsonPath('Record.erp_active', 0);
        $this->assertSame($user->ldap_username, $user->fresh()->ldap_username);
        $this->withToken($token)->getJson('/api/v1/me')->assertUnauthorized();
    }

    public function test_local_legacy_urls_accept_spaces_and_root_paths_without_leaving_the_source_host(): void
    {
        $access = app(MenuAccess::class);
        $this->assertSame('http://localhost/IntranetLocal/index.php?name=Informe%20Ventas&idMenu=101',
            $access->destination((object) ['id' => 101, 'legacy_url' => 'index.php?name=Informe Ventas']));
        $this->assertSame('http://localhost/tareas/index.php?idMenu=101',
            $access->destination((object) ['id' => 101, 'legacy_url' => '/tareas/index.php']));
        $this->assertNull($access->destination((object) ['id' => 101, 'legacy_url' => '/../../config.php']));
    }

    public function test_only_explicitly_authorized_external_origins_can_open(): void
    {
        config(['erp.legacy_allowed_origins' => ['https://correo.comodisimos.com.co']]);
        $access = app(MenuAccess::class);
        $this->assertSame('https://correo.comodisimos.com.co/?idMenu=101',
            $access->destination((object) ['id' => 101, 'legacy_url' => 'https://correo.comodisimos.com.co/']));
        $this->assertNull($access->destination((object) ['id' => 101, 'legacy_url' => 'https://correo.comodisimos.com.co.evil.test/']));
        $this->assertNull($access->destination((object) ['id' => 101, 'legacy_url' => 'https://correo.comodisimos.com.co:9999/']));
        $this->assertNull($access->destination((object) ['id' => 101, 'legacy_url' => 'http://user:pass@correo.comodisimos.com.co/']));
    }
}
