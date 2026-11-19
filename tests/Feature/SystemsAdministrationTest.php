<?php

namespace Tests\Feature;

use App\Http\Controllers\SystemsManagementController;
use App\Models\User;
use App\Support\Administration\SystemObjects;
use App\Support\Administration\SystemsAccess;
use App\Support\Auth\JwtTokens;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Mockery\MockInterface;
use Tests\TestCase;

class SystemsAdministrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['access.jwt.secret' => str_repeat('systems-', 20)]);
        DB::table('menu_items')->insert(['id' => 50, 'parent_id' => 0, 'label' => 'Aplicaciones', 'legacy_url' => '']);
        DB::table('menu_items')->insert(['id' => 46, 'parent_id' => 50, 'label' => 'Menú original', 'legacy_url' => 'index.php?modulo=menuaplic&file=mantmenu', 'migration_key' => 'access.menu', 'migration_enabled' => true]);
        foreach (array_keys(SystemsManagementController::TITLES) as $index => $section) {
            DB::table('menu_items')->insert(['id' => 300 + $index, 'parent_id' => 50, 'label' => $section, 'legacy_url' => '', 'migration_key' => 'systems.'.$section, 'migration_enabled' => true]);
        }
        DB::table('employee_groups')->insert([['id' => 1, 'name' => 'Planta'], ['id' => 2, 'name' => 'Ventas']]);
        DB::table('employees')->insert([['id' => 10, 'management_id' => 1, 'identity_number' => '100', 'first_name' => 'Empleado planta', 'last_name' => '', 'email' => '', 'status' => 'A'], ['id' => 20, 'management_id' => 2, 'identity_number' => '200', 'first_name' => 'Empleado ventas', 'last_name' => '', 'email' => '', 'status' => 'A']]);
        DB::table('system_objects')->insert([['id' => 3, 'parent_id' => 0, 'name' => 'OS', 'default_value' => '', 'sort_order' => '01'], ['id' => 4, 'parent_id' => 3, 'name' => 'PRUEBA', 'default_value' => 'A,B', 'sort_order' => '01.01'], ['id' => 1210, 'parent_id' => 3, 'name' => 'GESTIONES_ASIGNADAS', 'default_value' => '-', 'sort_order' => '01.02']]);
        DB::table('document_types')->insert(['code' => 'F01', 'description' => 'Factura']);
    }

    private function account(string $role = 'administrador'): User
    {
        return User::factory()->create(['ldap_username' => fake()->unique()->userName(), 'ldap_guid' => bin2hex(random_bytes(16)), 'erp_active' => true, 'erp_roles' => [$role], 'token_version' => 1]);
    }

    private function login(User $user): void
    {
        $this->withToken(app(JwtTokens::class)->issue($user)['token']);
    }

    private function grant(User $user, string $section, int $id): void
    {
        $context = SystemsAccess::SECTIONS[$section];
        DB::table('option_grants')->insert(['user_id' => $user->id, 'module' => $context[0], 'file' => $context[1], 'option_id' => $context[2], 'can_read' => true]);
        DB::table('menu_grants')->insert(['user_id' => $user->id, 'menu_item_id' => $id, 'can_view' => true]);
    }

    private function url(string $section, string $action): string
    {
        return '/administracion/'.$section.'?crud=systems-'.$section.'&action='.$action;
    }

    public function test_all_systems_screens_live_in_administration_and_direct_access_honors_enablement(): void
    {
        $this->login($this->account());
        foreach (['empleados', 'tipos-documento', 'objetos', 'objetos-usuarios'] as $section) {
            $this->get('/administracion/'.$section)->assertOk()->assertSee('Administración');
            $this->postJson($this->url($section, 'list'))->assertOk();
        }
        $home = $this->get('/')->assertOk();
        $home->assertSee('/administracion/empleados')->assertSee('/administracion/objetos');
        DB::table('menu_items')->where('migration_key', 'systems.objetos')->update(['migration_enabled' => false]);
        $this->get('/administracion/objetos')->assertForbidden();
        $this->postJson('/administracion/objetos/ordenar')->assertForbidden();
    }

    public function test_employee_scope_applies_to_lists_lookups_writes_and_internal_codes(): void
    {
        $user = $this->account('usuario');
        $this->grant($user, 'empleados', 300);
        DB::table('system_object_values')->insert(['user_id' => $user->id, 'object_id' => 1210, 'value' => '1']);
        $this->login($user);
        $this->postJson($this->url('empleados', 'list'))->assertOk()->assertJsonPath('TotalRecordCount', 1)->assertJsonPath('Records.0.id', 10)->assertJsonMissingPath('Records.0.internal_code');
        $this->postJson($this->url('empleados', 'autocomplete').'&field=management_id', ['term' => 'Ventas'])->assertOk()->assertExactJson([]);
        $data = ['management_id' => 1, 'identity_number' => '300', 'first_name' => 'Nuevo', 'last_name' => '', 'email' => '', 'status' => 'A'];
        $this->postJson($this->url('empleados', 'create'), ['management_id' => 2] + $data)->assertUnprocessable();
        $this->postJson($this->url('empleados', 'create'), ['internal_code' => '123'] + $data)->assertUnprocessable();
        $this->postJson($this->url('empleados', 'create'), $data)->assertOk();
        $this->postJson($this->url('empleados', 'update'), ['id' => 10, 'revision' => 1] + $data)->assertUnprocessable();
        $this->postJson($this->url('empleados', 'delete'), ['id' => 10, 'revision' => 1])->assertUnprocessable();
        $this->get('/administracion/menu')->assertForbidden();
    }

    public function test_employee_management_validates_duplicates_and_retires_without_destroying_identity(): void
    {
        $this->login($this->account());
        $data = ['management_id' => 1, 'identity_number' => '300', 'first_name' => 'Nuevo', 'last_name' => '', 'email' => '', 'status' => 'A', 'internal_code' => '003'];
        $result = $this->postJson($this->url('empleados', 'create'), $data)->assertOk();
        $id = $result->json('Record.id');
        $this->postJson($this->url('empleados', 'create'), $data)->assertUnprocessable();
        $this->postJson($this->url('empleados', 'delete'), ['id' => $id, 'revision' => 1])->assertOk();
        $this->assertDatabaseHas('employees', ['id' => $id, 'status' => 'R', 'revision' => 2]);
        $this->assertDatabaseHas('erp_access_events', ['event' => 'systems_empleados_removed']);
    }

    public function test_employee_identity_fill_uses_siesa_read_service(): void
    {
        $this->login($this->account());
        $this->partialMock(SystemObjects::class, function (MockInterface $mock): void {
            $mock->shouldReceive('identityFromSiesa')->once()->with('123')->andReturn(['first_name' => 'Ana', 'last_name' => 'Pérez']);
        });
        $this->postJson($this->url('empleados', 'datosDeCedula'), ['identity_number' => '123'])->assertOk()->assertJsonPath('Record.first_name', 'Ana');
    }

    public function test_editing_profiles_does_not_normalize_or_merge_legacy_employee_identifiers(): void
    {
        $this->login($this->account());
        DB::table('employees')->where('id', 10)->update(['identity_number' => "123\t\t"]);
        DB::table('employees')->where('id', 20)->update(['identity_number' => '123']);
        $this->postJson($this->url('empleados', 'update'), ['id' => 10, 'revision' => 1, 'management_id' => 1,
            'identity_number' => '123', 'first_name' => 'Nombre revisado', 'last_name' => '', 'email' => '', 'status' => 'A'])->assertOk();
        $this->assertDatabaseHas('employees', ['id' => 10, 'identity_number' => "123\t\t", 'first_name' => 'Nombre revisado']);
        $this->assertDatabaseHas('employees', ['id' => 20, 'identity_number' => '123']);
    }

    public function test_document_defaults_require_valid_types_and_preserve_composite_identity(): void
    {
        $user = $this->account();
        $this->login($user);
        $data = ['user_id' => $user->id, 'module' => 'ventas', 'file' => 'pedidos', 'document_type' => 'F01'];
        $this->postJson($this->url('tipos-documento', 'create'), ['document_type' => 'ZZZ'] + $data)->assertUnprocessable();
        $result = $this->postJson($this->url('tipos-documento', 'create'), $data)->assertOk();
        $id = $result->json('Record.id');
        $this->postJson($this->url('tipos-documento', 'create'), $data)->assertUnprocessable();
        $this->postJson($this->url('tipos-documento', 'update'), ['id' => $id, 'revision' => 1, 'file' => 'otra'] + $data)->assertUnprocessable();
        $this->assertSame('F01', app(SystemObjects::class)->documentType($user, 'Ventas', 'Pedidos'));
        $this->postJson($this->url('tipos-documento', 'delete'), ['id' => $id, 'revision' => 1] + $data)->assertOk();
        $this->assertNull(app(SystemObjects::class)->documentType($user, 'ventas', 'pedidos'));
    }

    public function test_objects_preserve_default_and_empty_user_values_and_reject_cycles_and_stale_updates(): void
    {
        $user = $this->account();
        $this->login($user);
        $objects = app(SystemObjects::class);
        $this->assertSame(['A', 'B'], $objects->values(4, $user));
        $response = $this->postJson($this->url('objetos-usuarios', 'create'), ['user_id' => $user->id, 'object_id' => 4, 'value' => ''])->assertOk();
        $this->assertSame('', $objects->value(4, $user));
        $this->assertSame([''], $objects->values(4, $user));
        $id = $response->json('Record.id');
        $this->postJson($this->url('objetos-usuarios', 'update'), ['id' => $id, 'revision' => 1, 'user_id' => $user->id, 'object_id' => 4, 'value' => 'C'])->assertOk();
        $this->postJson($this->url('objetos-usuarios', 'update'), ['id' => $id, 'revision' => 1, 'user_id' => $user->id, 'object_id' => 4, 'value' => 'D'])->assertUnprocessable();
        $this->postJson($this->url('objetos', 'update'), ['id' => 3, 'revision' => 1, 'parent_id' => 4, 'name' => 'OS', 'default_value' => ''])->assertUnprocessable();
        $this->postJson($this->url('objetos', 'delete'), ['id' => 4, 'revision' => 1])->assertUnprocessable();
        $this->postJson('/administracion/objetos/ordenar')->assertOk()->assertJsonPath('Total', 3);
    }

    public function test_menu_is_conciled_with_legacy_fields_automatic_order_and_safe_retirement(): void
    {
        $this->login($this->account());
        $this->get('/administracion/menu')->assertOk()->assertSee('Ordenar menú')->assertSee('Icono o ruta heredada');
        $url = '/administracion/menu?crud=access-menu&action=';
        $data = ['label' => 'Nueva opción', 'parent_id' => 50, 'active' => 1, 'is_public' => 0, 'icon' => 'settings', 'append_legacy_id' => 0];
        $result = $this->postJson($url.'create', $data)->assertOk();
        $id = $result->json('Record.id');
        $this->assertMatchesRegularExpression('/^\\d{3}(\\.\\d{3})+$/', $result->json('Record.sort_order'));
        $this->assertDatabaseHas('menu_items', ['id' => $id, 'icon' => 'settings', 'append_legacy_id' => 0, 'migration_enabled' => 0]);
        $this->postJson('/administracion/menu/ordenar')->assertOk();
        $revision = DB::table('menu_items')->where('id', $id)->value('revision');
        $this->postJson($url.'delete', ['id' => 50, 'revision' => DB::table('menu_items')->where('id', 50)->value('revision')])->assertUnprocessable();
        $this->postJson($url.'delete', ['id' => $id, 'revision' => $revision])->assertOk();
        $this->assertDatabaseHas('menu_items', ['id' => $id, 'archived' => 1, 'active' => 0]);
        $this->assertDatabaseHas('erp_access_events', ['event' => 'menu_archived']);
    }

    public function test_anonymous_users_cannot_access_catalogs_or_mutate_without_csrf(): void
    {
        $this->get('/administracion/empleados')->assertRedirect('/login');
        $this->postJson($this->url('objetos', 'create'))->assertUnauthorized();
        $admin = $this->account();
        $token = app(JwtTokens::class)->issue($admin)['token'];
        $this->app->instance('env', 'local');
        $this->withCookie(config('access.jwt.cookie'), $token)->post($this->url('objetos', 'create'))->assertStatus(419);
    }

    public function test_user_profile_creation_links_employee_without_passwords_and_keeps_ldap_identity_immutable(): void
    {
        $this->login($this->account());
        $data = ['ldap_username' => 'new.employee', 'name' => 'Nueva persona', 'employee_id' => 10,
            'corporate_email' => 'persona@empresa.test', 'siesa_username' => 'UNO1', 'erp_active' => 1, 'is_admin' => 0];
        $url = '/administracion/usuarios?crud=access-usuarios&action=';
        DB::table('menu_items')->insert(['id' => 400, 'parent_id' => 50, 'label' => 'Usuarios', 'legacy_url' => '', 'migration_key' => 'access.users', 'migration_enabled' => true]);
        $result = $this->postJson($url.'create', $data)->assertOk()->assertJsonMissingPath('Record.password');
        $id = $result->json('Record.id');
        $this->assertDatabaseHas('users', ['id' => $id, 'employee_id' => 10, 'password' => null, 'ldap_guid' => null]);
        $this->postJson($url.'create', $data)->assertUnprocessable();
        $this->postJson($url.'update', ['id' => $id, 'revision' => 1, 'ldap_username' => 'changed.identity'] + $data)->assertOk();
        $this->assertDatabaseHas('users', ['id' => $id, 'ldap_username' => 'new.employee', 'profile_imported' => false]);
    }

    public function test_legacy_delegated_menu_and_profile_managers_do_not_gain_administrator_powers(): void
    {
        $user = $this->account('usuario');
        $this->login($user);
        DB::table('option_grants')->insert(['user_id' => $user->id, 'module' => 'menuaplic', 'file' => 'mantmenu', 'option_id' => 1, 'can_read' => true]);
        $this->get('/administracion/menu')->assertOk();
        $this->get('/administracion/usuarios')->assertForbidden();
        DB::table('option_grants')->insert(['user_id' => $user->id, 'module' => 'aplicacion', 'file' => 'usuarios', 'option_id' => 3, 'can_write' => true]);
        DB::table('menu_items')->insert(['id' => 400, 'parent_id' => 50, 'label' => 'Usuarios', 'legacy_url' => '', 'migration_key' => 'access.users', 'migration_enabled' => true]);
        DB::table('menu_grants')->insert(['user_id' => $user->id, 'menu_item_id' => 400, 'can_view' => true]);
        $this->get('/administracion/usuarios')->assertOk();
        $data = ['ldap_username' => 'delegated.user', 'name' => 'Persona', 'erp_active' => 1];
        $url = '/administracion/usuarios?crud=access-usuarios&action=create';
        $this->postJson($url, ['is_admin' => 1] + $data)->assertForbidden();
        $this->postJson($url, $data)->assertOk()->assertJsonPath('Record.is_admin', 0);
        $this->get('/administracion/permisos')->assertForbidden();
    }
}
