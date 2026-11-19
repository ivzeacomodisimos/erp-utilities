<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\Auth\JwtTokens;
use App\Support\Menu\GeneratedCrudStorage;
use App\Support\Menu\ManagedApplicationRoutes;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class GeneratedProgramWizardTest extends TestCase
{
    use RefreshDatabase;

    private array $controllers = [];

    protected function setUp(): void
    {
        parent::setUp();
        config(['access.jwt.secret' => str_repeat('storage-crud-', 16),
            'database.connections.crud_business' => ['driver' => 'sqlite', 'database' => ':memory:', 'prefix' => '', 'foreign_key_constraints' => true]]);
        DB::purge('crud_business');
        DB::table('menu_items')->insert(['id' => 50, 'parent_id' => 0, 'label' => 'Aplicaciones', 'legacy_url' => '', 'active' => true]);
    }

    protected function tearDown(): void
    {
        foreach ($this->controllers as $controller) {
            $path = app_path('Http/Controllers/'.$controller.'.php');
            if (is_file($path)) {
                unlink($path);
            }
        }
        DB::purge('crud_business');
        parent::tearDown();
    }

    private function login(bool $admin = true): User
    {
        $user = User::factory()->create(['ldap_username' => fake()->unique()->userName(), 'ldap_guid' => bin2hex(random_bytes(16)),
            'erp_roles' => [$admin ? 'administrador' : 'usuario'], 'erp_active' => true, 'token_version' => 1]);
        $this->withToken(app(JwtTokens::class)->issue($user)['token']);

        return $user;
    }

    private function draft(string $table, string $mode = 'new', string $connection = 'crud_business'): TestResponse
    {
        $controller = 'StorageUiTest'.bin2hex(random_bytes(6)).'Controller';
        $this->controllers[] = $controller;

        return $this->postJson('/administracion/programas?crud=access-generador&action=create', [
            'controller_name' => $controller, 'title' => 'Prueba', 'active' => 0,
            'program_type' => 'crud', 'table_mode' => $mode, 'table_name' => $table, 'table_connection' => $connection, 'auto_detect_fields' => false,
        ]);
    }

    private function field(array $program, string $name = 'nombre', string $type = 'string', array $extra = []): TestResponse
    {
        return $this->postJson('/administracion/campos-programa?crud=access-campos&action=create', $extra + [
            'program_id' => $program['id'], 'column_name' => $name, 'label' => ucfirst($name),
            'field_type' => $type, 'required' => 1, 'max_length' => 150, 'position' => 0,
        ]);
    }

    private function prepare(array $program): TestResponse
    {
        return $this->postJson('/administracion/programas/preparar', ['program_id' => $program['id']]);
    }

    private function bind(array $program): int
    {
        $row = DB::table('generated_programs')->find($program['id']);
        $this->postJson('/administracion/programas?crud=access-generador&action=update', [
            'id' => $row->id, 'revision' => $row->revision, 'title' => $row->title, 'active' => 1,
        ])->assertOk();
        $this->postJson('/administracion/registro-rutas?crud=access-programas&action=create', [
            'label' => 'Externo', 'name' => 'storage.'.$program['id'], 'uri' => '/aplicaciones/storage-'.$program['id'],
            'http_method' => 'GET|POST', 'program' => 'controller:'.$program['action'], 'program_parameters' => '{}', 'active' => 1,
        ])->assertOk();

        return $this->postJson('/administracion/menu?crud=access-menu&action=create', [
            'label' => 'Externo', 'parent_id' => 50, 'active' => 1, 'is_public' => 0, 'migration_enabled' => 1,
            'route_name' => 'storage.'.$program['id'], 'route_parameters' => '{}',
        ])->assertOk()->json('Record.id');
    }

    private function operation(array $program, string $action, array $values = []): TestResponse
    {
        return $this->postJson('/aplicaciones/storage-'.$program['id'].'?crud=generated-program-'.$program['id'].'&action='.$action, $values);
    }

    private function wizardState(array $program): array
    {
        return $this->getJson('/administracion/asistente-programas?program_id='.$program['id'])->assertOk()->json('State');
    }

    private function wizardPrepare(array $program): array
    {
        $state = $this->wizardState($program);

        return $this->postJson('/administracion/asistente-programas', ['action' => 'prepare', 'program_id' => $program['id'], 'snapshot' => $state['snapshot']])->assertOk()->json('State');
    }

    private function payload(array $state, array $extra = []): array
    {
        $route = $state['bindings']['routes'][0] ?? null;
        $menu = $state['bindings']['menus'][0] ?? null;

        return $extra + ['action' => 'publish', 'program_id' => $state['program']['id'], 'snapshot' => $state['snapshot'],
            'route_id' => $route['id'] ?? null, 'menu_id' => $menu['id'] ?? null,
            'route_name' => $route['name'] ?? $state['defaults']['route_name'], 'route_uri' => $route['uri'] ?? $state['defaults']['route_uri'],
            'menu_label' => 'Prueba', 'parent_id' => 50, 'is_public' => false, 'grants' => [], 'revoked_user_ids' => []];
    }

    private function grant(User $user, bool $create = false): array
    {
        return ['user_id' => $user->id, 'can_view' => true, 'can_create' => $create, 'can_update' => false, 'can_delete' => false];
    }

    private function subject(): array
    {
        $program = $this->draft('wizard_data')->assertOk()->json('Record');
        $this->field($program)->assertOk();

        return $program;
    }

    public function test_wizard_prepares_and_atomically_enables_the_programme_route_menu_and_user_permissions(): void
    {
        $admin = $this->login();
        $reader = User::factory()->create(['ldap_username' => 'wizard-reader', 'ldap_guid' => bin2hex(random_bytes(16)), 'token_version' => 1, 'erp_roles' => ['usuario'], 'erp_active' => true]);
        $program = $this->subject();
        $state = $this->wizardPrepare($program);
        $this->assertTrue($state['program']['ready']);
        $this->assertFalse($state['program']['active']);
        $this->assertDatabaseCount('managed_application_routes', 0);
        $state = $this->postJson('/administracion/asistente-programas', $this->payload($state, ['grants' => [$this->grant($reader, true)]]))->assertOk()->json('State');
        $this->assertTrue($state['program']['active']);
        $route = $state['bindings']['routes'][0];
        $menu = $state['bindings']['menus'][0];
        $this->assertSame('GET|POST', $route['http_method']);
        $this->assertEquals(1, $menu['migration_enabled']);
        $this->assertDatabaseHas('menu_grants', ['user_id' => $reader->id, 'menu_item_id' => $menu['id'], 'can_view' => true, 'can_create' => true, 'can_update' => false]);
        $this->withToken(app(JwtTokens::class)->issue($reader)['token']);
        $this->get('/aplicaciones/prueba')->assertOk();
        $row = $this->postJson('/aplicaciones/prueba?crud=generated-program-'.$program['id'].'&action=create', ['nombre' => 'Desde asistente'])->assertOk()->json('Record');
        $this->postJson('/aplicaciones/prueba?crud=generated-program-'.$program['id'].'&action=delete', $row)->assertForbidden();
        $this->assertDatabaseHas('erp_access_events', ['event' => 'generated_program_onboarded', 'user_id' => $admin->id]);
    }

    public function test_wizard_rolls_back_all_enablement_when_a_late_permission_operation_fails(): void
    {
        $this->login();
        $program = $this->subject();
        $state = $this->wizardPrepare($program);
        $this->postJson('/administracion/asistente-programas', $this->payload($state, ['revoked_user_ids' => [99999]]))->assertUnprocessable();
        $this->assertDatabaseHas('generated_programs', ['id' => $program['id'], 'active' => false, 'crud_ready' => true]);
        $this->assertDatabaseCount('managed_application_routes', 0);
        $this->assertDatabaseCount('menu_items', 1);
        $this->assertDatabaseCount('menu_grants', 0);
        $this->assertDatabaseMissing('erp_access_events', ['event' => 'generated_program_onboarded']);
    }

    public function test_reusing_existing_bindings_preserves_unlisted_grants_and_only_revokes_explicit_users(): void
    {
        $this->login();
        $program = $this->subject();
        $state = $this->wizardPrepare($program);
        $a = User::factory()->create(['ldap_username' => 'wizard-a', 'ldap_guid' => bin2hex(random_bytes(16)), 'token_version' => 1, 'erp_roles' => ['usuario'], 'erp_active' => true]);
        $b = User::factory()->create(['ldap_username' => 'wizard-b', 'ldap_guid' => bin2hex(random_bytes(16)), 'token_version' => 1, 'erp_roles' => ['usuario'], 'erp_active' => true]);
        $state = $this->postJson('/administracion/asistente-programas', $this->payload($state, ['grants' => [$this->grant($a), $this->grant($b)]]))->assertOk()->json('State');
        $menuId = $state['bindings']['menus'][0]['id'];
        DB::table('menu_grants')->where('user_id', $b->id)->update(['can_approve' => true]);
        DB::table('menu_items')->where('id', $menuId)->update(['legacy_url' => 'index.php?modulo=prueba']);
        DB::table('managed_application_routes')->update(['label' => 'Descripción previa']);
        $state = $this->wizardState($program);
        $state = $this->postJson('/administracion/asistente-programas', $this->payload($state, ['grants' => [$this->grant($a, true)]]))->assertOk()->json('State');
        $this->assertDatabaseCount('managed_application_routes', 1);
        $this->assertDatabaseCount('menu_items', 2);
        $this->assertDatabaseHas('menu_grants', ['user_id' => $b->id, 'menu_item_id' => $menuId, 'can_approve' => true]);
        $this->assertDatabaseHas('menu_items', ['id' => $menuId, 'legacy_url' => 'index.php?modulo=prueba']);
        $this->assertDatabaseHas('managed_application_routes', ['label' => 'Descripción previa']);
        $this->postJson('/administracion/asistente-programas', $this->payload($state, ['revoked_user_ids' => [$a->id]]))->assertOk();
        $this->assertDatabaseMissing('menu_grants', ['user_id' => $a->id, 'menu_item_id' => $menuId]);
        $this->assertDatabaseHas('menu_grants', ['user_id' => $b->id, 'menu_item_id' => $menuId]);
    }

    public function test_stale_state_unprepared_programmes_and_reserved_routes_cannot_be_published(): void
    {
        $this->login();
        $program = $this->subject();
        $state = $this->wizardState($program);
        $this->postJson('/administracion/asistente-programas', $this->payload($state))->assertUnprocessable();
        $state = $this->wizardPrepare($program);
        $this->postJson('/administracion/asistente-programas', $this->payload($state, ['route_uri' => '/login']))->assertUnprocessable();
        DB::table('generated_programs')->where('id', $program['id'])->increment('revision');
        $this->postJson('/administracion/asistente-programas', $this->payload($state))->assertUnprocessable()->assertJsonValidationErrors('snapshot');
        $this->assertDatabaseCount('managed_application_routes', 0);
        $this->assertDatabaseHas('generated_programs', ['id' => $program['id'], 'active' => false]);
    }

    public function test_foreign_bindings_invalid_grants_and_inactive_parents_are_rejected(): void
    {
        $this->login();
        $program = $this->subject();
        $state = $this->wizardPrepare($program);
        $this->postJson('/administracion/asistente-programas', $this->payload($state, ['route_id' => 99999]))->assertUnprocessable();
        $this->postJson('/administracion/asistente-programas', $this->payload($state, ['menu_id' => 50]))->assertUnprocessable();
        $user = User::factory()->create(['ldap_username' => 'inactive-wizard', 'ldap_guid' => bin2hex(random_bytes(16)), 'token_version' => 1, 'erp_roles' => ['usuario'], 'erp_active' => false]);
        $this->postJson('/administracion/asistente-programas', $this->payload($state, ['grants' => [$this->grant($user)]]))->assertUnprocessable();
        DB::table('menu_items')->where('id', 50)->update(['active' => false]);
        $this->postJson('/administracion/asistente-programas', $this->payload($state))->assertUnprocessable();
        $this->assertDatabaseCount('managed_application_routes', 0);
    }

    public function test_wizard_is_admin_only_and_cookie_posts_require_csrf(): void
    {
        $admin = $this->login();
        $program = $this->subject();
        $state = $this->wizardState($program);
        $this->login(false);
        $this->get('/administracion/asistente-programas')->assertForbidden();
        $this->getJson('/administracion/asistente-programas?program_id='.$program['id'])->assertForbidden();
        $this->postJson('/administracion/asistente-programas', $this->payload($state))->assertForbidden();
        $this->flushHeaders();
        $this->app->instance('env', 'local');
        $this->withCookie(config('access.jwt.cookie'), app(JwtTokens::class)->issue($admin)['token'])->post('/administracion/asistente-programas', $this->payload($state))->assertStatus(419);
    }

    public function test_catalogue_read_permissions_require_explicit_consent_and_do_not_grant_catalogue_writes(): void
    {
        $this->login();
        $parent = $this->draft('parent_data')->assertOk()->json('Record');
        $this->field($parent)->assertOk();
        $parentState = $this->wizardPrepare($parent);
        $parentState = $this->postJson('/administracion/asistente-programas', $this->payload($parentState, ['route_name' => 'catalogue.index', 'route_uri' => '/aplicaciones/catalogue']))->assertOk()->json('State');
        $parentMenu = $parentState['bindings']['menus'][0]['id'];
        $child = $this->draft('child_data')->assertOk()->json('Record');
        $this->field($child, 'parent_id', 'relation', ['related_program_id' => $parent['id'], 'related_menu_id' => $parentMenu, 'related_label' => 'nombre'])->assertOk();
        $state = $this->wizardPrepare($child);
        $user = User::factory()->create(['ldap_username' => 'catalogue-reader', 'ldap_guid' => bin2hex(random_bytes(16)), 'token_version' => 1, 'erp_roles' => ['usuario'], 'erp_active' => true]);
        $values = $this->payload($state, ['grants' => [$this->grant($user)]]);
        $this->postJson('/administracion/asistente-programas', $values)->assertUnprocessable();
        $this->assertDatabaseHas('generated_programs', ['id' => $child['id'], 'active' => false]);
        $this->postJson('/administracion/asistente-programas', $values + ['grant_related_view' => true])->assertOk();
        $this->assertDatabaseHas('menu_grants', ['user_id' => $user->id, 'menu_item_id' => $parentMenu, 'can_view' => true, 'can_create' => false, 'can_update' => false, 'can_delete' => false]);
        $this->withToken(app(JwtTokens::class)->issue($user)['token']);
        $this->get('/aplicaciones/prueba')->assertOk();
        $this->postJson('/aplicaciones/catalogue?crud=generated-program-'.$parent['id'].'&action=create', ['nombre' => 'No permitido'])->assertForbidden();
    }

    public function test_wizard_preparation_can_be_retried_without_duplicate_tables_and_does_not_expose_system_actions(): void
    {
        $this->login();
        $program = $this->subject();
        $state = $this->wizardPrepare($program);
        $again = $this->postJson('/administracion/asistente-programas', ['action' => 'prepare', 'program_id' => $program['id'], 'snapshot' => $state['snapshot']])->assertOk()->json('State');
        $this->assertTrue($again['program']['ready']);
        foreach (app(ManagedApplicationRoutes::class)->programs() as $action) {
            $this->assertStringNotContainsString('GeneratedProgramWizardController', $action['action']);
        }
    }

    public function test_wizard_can_supply_an_isolated_browser_fixture_for_the_complete_flow(): void
    {
        $this->login();
        $program = $this->subject();
        $reader = User::factory()->create(['name' => 'Usuario de prueba', 'ldap_username' => 'wizard-reader-ui', 'ldap_guid' => bin2hex(random_bytes(16)), 'token_version' => 1, 'erp_roles' => ['usuario'], 'erp_active' => true]);
        $html = $this->get('/administracion/asistente-programas?program_id='.$program['id'])->assertOk()->assertSee('Asistente de alta de programas')->getContent();
        $initial = $this->wizardState($program);
        $prepared = $this->wizardPrepare($program);
        $published = $this->postJson('/administracion/asistente-programas', $this->payload($prepared, ['grants' => [$this->grant($reader, true)]]))->assertOk()->json('State');
        if (getenv('ERP_CAPTURE_UI') === '1') {
            File::ensureDirectoryExists(base_path('.runtime/tests'));
            File::put(base_path('.runtime/tests/program-wizard-ui.json'), json_encode(compact('html', 'initial', 'prepared', 'published') + ['reader_id' => $reader->id], JSON_THROW_ON_ERROR));
        }
    }

    public function test_wizard_can_prepare_and_enable_an_existing_sqlserver_table(): void
    {
        if (getenv('ERP_TEST_SQLSERVER') !== '1') {
            $this->markTestSkipped('Integración SQL Server opcional.');
        }
        $this->login();
        $reference = 'comodisimos.test.codex_wizard_'.bin2hex(random_bytes(5));
        $storage = app(GeneratedCrudStorage::class)->resolve($reference, 'intranet_sqlsrv');
        $storage['connection']->beginTransaction();
        try {
            $storage['schema']->create($storage['table'], function (Blueprint $table): void {
                $table->id();
                $table->string('nombre', 80);
            });
            $program = $this->draft($reference, 'existing', 'intranet_sqlsrv')->assertOk()->json('Record');
            $this->field($program, 'nombre', 'string', ['max_length' => 80])->assertOk();
            $state = $this->wizardPrepare($program);
            $this->postJson('/administracion/asistente-programas', $this->payload($state))->assertOk();
            $this->get('/aplicaciones/prueba')->assertOk();
            $this->postJson('/aplicaciones/prueba?crud=generated-program-'.$program['id'].'&action=create', ['nombre' => 'Validación aislada'])->assertOk();
        } finally {
            $storage['connection']->rollBack();
        }
        $this->assertFalse($storage['schema']->hasTable($storage['table']));
    }
}
