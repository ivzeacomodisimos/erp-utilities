<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\Auth\JwtTokens;
use App\Support\Menu\GeneratedCrud;
use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use Illuminate\Testing\TestResponse;
use Ivandzb\CrudKit\Render\Quasar\QuasarRenderer;
use Tests\TestCase;

class GeneratedCrudTest extends TestCase
{
    use RefreshDatabase;

    private array $controllers = [];

    protected function setUp(): void
    {
        parent::setUp();
        config(['access.jwt.secret' => str_repeat('crud-generator-', 12)]);
        DB::table('menu_items')->insert(['id' => 50, 'parent_id' => 0, 'label' => 'Aplicaciones', 'legacy_url' => '', 'active' => true]);
    }

    protected function tearDown(): void
    {
        foreach ($this->controllers as $name) {
            $path = app_path('Http/Controllers/'.$name.'.php');
            if (is_file($path)) {
                unlink($path);
            }
        }
        parent::tearDown();
    }

    private function login(bool $admin = true): User
    {
        $user = User::factory()->create(['ldap_username' => fake()->unique()->userName(), 'ldap_guid' => bin2hex(random_bytes(16)),
            'erp_roles' => [$admin ? 'administrador' : 'usuario'], 'erp_active' => true, 'token_version' => 1]);
        $this->withToken(app(JwtTokens::class)->issue($user)['token']);

        return $user;
    }

    private function draft(string $mode = 'new', string $table = 'clientes'): array
    {
        $name = 'CrudUiTest'.bin2hex(random_bytes(6)).'Controller';
        $this->controllers[] = $name;

        return $this->postJson('/administracion/programas?crud=access-generador&action=create', [
            'controller_name' => $name, 'title' => 'Catálogo CRUD', 'content' => '', 'active' => 0,
            'program_type' => 'crud', 'table_mode' => $mode, 'table_name' => $table,
            'auto_detect_fields' => false,
        ])->assertOk()->json('Record');
    }

    private function field(int $program, string $name = 'nombre', string $type = 'string', array $extra = []): TestResponse
    {
        return $this->postJson('/administracion/campos-programa?crud=access-campos&action=create', $extra + [
            'program_id' => $program, 'column_name' => $name, 'label' => ucfirst($name), 'field_type' => $type,
            'required' => 1, 'max_length' => 150, 'position' => 0,
        ]);
    }

    private function prepare(int $id): TestResponse
    {
        return $this->postJson('/administracion/programas/preparar', ['program_id' => $id]);
    }

    private function bind(array $program): int
    {
        $row = DB::table('generated_programs')->find($program['id']);
        $this->postJson('/administracion/programas?crud=access-generador&action=update', [
            'id' => $row->id, 'revision' => $row->revision, 'title' => $row->title, 'active' => 1,
        ])->assertOk();
        $this->postJson('/administracion/registro-rutas?crud=access-programas&action=create', [
            'label' => 'Catálogo', 'name' => 'crud.catalogo', 'uri' => '/aplicaciones/catalogo',
            'http_method' => 'GET|POST', 'program' => 'controller:'.$program['action'], 'program_parameters' => '{}', 'active' => 1,
        ])->assertOk();

        return $this->postJson('/administracion/menu?crud=access-menu&action=create', [
            'label' => 'Catálogo', 'parent_id' => 50, 'active' => 1, 'is_public' => 0,
            'migration_enabled' => 1, 'route_name' => 'crud.catalogo', 'route_parameters' => '{}',
        ])->assertOk()->json('Record.id');
    }

    private function operation(int $program, string $action, array $values = []): TestResponse
    {
        return $this->postJson('/aplicaciones/catalogo?crud=generated-program-'.$program.'&action='.$action, $values);
    }

    private function catalog(): array
    {
        $this->login();
        $program = $this->draft();
        $this->field($program['id'])->assertOk();
        $this->prepare($program['id'])->assertOk();
        $menu = $this->bind($program);

        return [$program, $menu];
    }

    public function test_new_table_and_crud_are_created_from_the_interface_with_all_supported_field_types(): void
    {
        $this->login();
        $program = $this->draft();
        foreach (['nombre' => 'string', 'notas' => 'text', 'cantidad' => 'integer', 'precio' => 'decimal', 'fecha' => 'date', 'activo' => 'boolean'] as $name => $type) {
            $this->field($program['id'], $name, $type)->assertOk();
        }
        $this->prepare($program['id'])->assertOk();
        $this->assertTrue(Schema::hasTable('app_data_clientes'));
        $this->bind($program);
        $this->get('/aplicaciones/catalogo')->assertOk()->assertSee('CrudKitQuasar');
        $record = $this->operation($program['id'], 'create', [
            'nombre' => 'Cliente uno', 'notas' => 'Observaciones', 'cantidad' => 4, 'precio' => '123.45', 'fecha' => '2026-11-18', 'activo' => 1,
        ])->assertOk()->json('Record');
        $this->operation($program['id'], 'list')->assertOk()->assertJsonPath('TotalRecordCount', 1);
        $values = $record;
        $values['nombre'] = 'Cliente modificado';
        $new = $this->operation($program['id'], 'update', $values)->assertOk()->json('Record');
        $this->operation($program['id'], 'update', $values)->assertUnprocessable();
        $this->operation($program['id'], 'delete', ['id' => $new['id'], '_row_version' => $new['_row_version']])->assertOk();
        $this->operation($program['id'], 'list')->assertOk()->assertJsonPath('TotalRecordCount', 0);
        $this->assertNotNull(DB::table('app_data_clientes')->where('id', $record['id'])->value('deleted_at'));
        $this->assertDatabaseHas('erp_access_events', ['event' => 'generated_crud_record_created']);
    }

    public function test_each_operation_enforces_the_authenticated_user_and_menu_permissions_including_post_lists(): void
    {
        [$program, $menu] = $this->catalog();
        $record = $this->operation($program['id'], 'create', ['nombre' => 'Original'])->assertOk()->json('Record');
        $user = $this->login(false);
        $this->get('/aplicaciones/catalogo')->assertForbidden();
        DB::table('menu_grants')->insert(['user_id' => $user->id, 'menu_item_id' => $menu, 'can_view' => true]);
        $this->operation($program['id'], 'list')->assertOk();
        $this->operation($program['id'], 'create', ['nombre' => 'No autorizado', 'user_id' => 1, 'menu_id' => 50])->assertForbidden();
        $this->operation($program['id'], 'update', $record + ['nombre' => 'Cambio'])->assertForbidden();
        $this->operation($program['id'], 'delete', $record)->assertForbidden();
        DB::table('menu_grants')->where('user_id', $user->id)->update(['can_create' => true]);
        $this->operation($program['id'], 'create', ['nombre' => 'Permitido'])->assertOk();
        DB::table('menu_grants')->where('user_id', $user->id)->update(['can_update' => true]);
        $record['nombre'] = 'Modificado';
        $updated = $this->operation($program['id'], 'update', $record)->assertOk()->json('Record');
        DB::table('menu_grants')->where('user_id', $user->id)->update(['can_delete' => true]);
        $this->operation($program['id'], 'delete', $updated)->assertOk();
        DB::table('menu_grants')->where('user_id', $user->id)->update(['can_view' => false]);
        $this->operation($program['id'], 'create', ['nombre' => 'Revocado'])->assertForbidden();
    }

    public function test_existing_business_table_is_linked_without_altering_schema_or_unselected_columns(): void
    {
        $this->login();
        Schema::create('business_clients', function (Blueprint $table): void {
            $table->id();
            $table->string('nombre', 150)->unique();
            $table->string('private_note')->default('Privado');
            $table->binary('private_blob')->nullable();
        });
        DB::table('business_clients')->insert(['nombre' => 'Existente', 'private_note' => 'No mostrar', 'private_blob' => "\xFF\x00"]);
        $signature = app(GeneratedCrud::class)->signature('business_clients');
        $program = $this->draft('existing', 'business_clients');
        $this->field($program['id'])->assertOk();
        $this->prepare($program['id'])->assertOk();
        $this->bind($program);
        $response = $this->operation($program['id'], 'list')->assertOk();
        $response->assertDontSee('No mostrar')->assertJsonPath('Records.0.nombre', 'Existente');
        $record = $response->json('Records.0');
        $record['nombre'] = 'Editado';
        $record['private_note'] = 'Ataque';
        $record['table_name'] = 'users';
        $this->operation($program['id'], 'update', $record)->assertOk();
        $this->assertDatabaseHas('business_clients', ['nombre' => 'Editado', 'private_note' => 'No mostrar']);
        $this->operation($program['id'], 'create', ['nombre' => 'Nuevo'])->assertOk();
        $this->operation($program['id'], 'create', ['nombre' => 'Nuevo'])->assertUnprocessable();
        $this->assertSame($signature, app(GeneratedCrud::class)->signature('business_clients'));
    }

    public function test_internal_tables_and_sql_identifiers_cannot_be_exposed(): void
    {
        $this->login();
        foreach (['users', 'menu_items', 'generated_programs', 'employees', 'erp_auth_tokens', 'option_grants', 'sqlite_sequence', '../clients', 'clients;DROP TABLE users', 'other.clients'] as $table) {
            $name = 'CrudUiTest'.bin2hex(random_bytes(6)).'Controller';
            $this->controllers[] = $name;
            $this->postJson('/administracion/programas?crud=access-generador&action=create', [
                'controller_name' => $name, 'title' => 'Prohibido', 'program_type' => 'crud', 'table_mode' => 'existing', 'table_name' => $table, 'active' => 0,
            ])->assertUnprocessable();
        }
        $program = $this->draft();
        foreach (['id', 'deleted_at', 'is_admin', 'password', 'revision', 'action', 'crud', 'constructor', 'name;drop', '../name'] as $field) {
            $this->field($program['id'], $field)->assertUnprocessable();
        }
        $this->field($program['id'], 'nombre')->assertOk();
        $this->field($program['id'], 'nombre')->assertUnprocessable();
        $this->assertDatabaseCount('generated_program_fields', 1);
    }

    public function test_definition_requires_fields_and_cannot_be_activated_or_changed_before_preparation(): void
    {
        $this->login();
        $program = $this->draft();
        $this->prepare($program['id'])->assertUnprocessable();
        $this->assertFalse((bool) DB::table('generated_programs')->where('id', $program['id'])->value('crud_building'));
        $this->postJson('/administracion/programas?crud=access-generador&action=update', [
            'id' => $program['id'], 'revision' => $program['revision'], 'title' => 'Intento', 'active' => 1, 'crud_ready' => 1,
        ])->assertUnprocessable();
        $field = $this->field($program['id'])->assertOk()->json('Record');
        $this->prepare($program['id'])->assertOk();
        $this->field($program['id'], 'otra')->assertUnprocessable();
        $this->postJson('/administracion/campos-programa?crud=access-campos&action=delete', ['id' => $field['id'], 'revision' => $field['revision']])->assertUnprocessable();
    }

    public function test_missing_existing_columns_and_required_columns_are_rejected_without_modifying_data(): void
    {
        $this->login();
        DB::statement('CREATE TABLE business_required (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre VARCHAR(20) NOT NULL, required_code INTEGER NOT NULL)');
        $program = $this->draft('existing', 'business_required');
        $this->field($program['id'], 'missing')->assertUnprocessable();
        $this->field($program['id'], 'nombre', 'integer')->assertUnprocessable();
        $this->field($program['id'], 'nombre', 'string', ['max_length' => 150])->assertUnprocessable();
        $this->field($program['id'], 'nombre', 'string', ['max_length' => 20])->assertOk();
        $this->prepare($program['id'])->assertUnprocessable();
        $this->field($program['id'], 'required_code', 'integer')->assertOk();
        $this->prepare($program['id'])->assertOk();
        $this->assertDatabaseCount('business_required', 0);
    }

    public function test_configuration_and_preparation_are_restricted_to_administrators(): void
    {
        $this->login();
        $program = $this->draft();
        $user = $this->login(false);
        DB::table('option_grants')->insert(['user_id' => $user->id, 'module' => 'menuaplic', 'file' => 'mantmenu', 'option_id' => 1, 'can_read' => true]);
        $this->field($program['id'])->assertForbidden();
        $this->prepare($program['id'])->assertForbidden();
        $this->get('/administracion/campos-programa')->assertForbidden();
    }

    public function test_validation_and_concurrency_prevent_invalid_or_stale_writes(): void
    {
        $this->login();
        $program = $this->draft();
        $this->field($program['id'], 'nombre', 'string', ['max_length' => 10])->assertOk();
        $this->field($program['id'], 'precio', 'decimal')->assertOk();
        $this->field($program['id'], 'fecha', 'date')->assertOk();
        $this->prepare($program['id'])->assertOk();
        $this->bind($program);
        foreach ([
            ['nombre' => 'Demasiado largo', 'precio' => '1.00', 'fecha' => '2026-11-18'],
            ['nombre' => 'Correcto', 'precio' => '1.001', 'fecha' => '2026-11-18'],
            ['nombre' => 'Correcto', 'precio' => '1.00', 'fecha' => '18/11/2026'],
        ] as $invalid) {
            $this->operation($program['id'], 'create', $invalid)->assertUnprocessable();
        }
        $record = $this->operation($program['id'], 'create', ['nombre' => 'Correcto', 'precio' => '1.00', 'fecha' => '2026-11-18'])->assertOk()->json('Record');
        DB::table('app_data_clientes')->where('id', $record['id'])->update(['nombre' => 'Externo']);
        $this->operation($program['id'], 'update', $record)->assertUnprocessable();
        $this->operation($program['id'], 'delete', $record)->assertUnprocessable();
        $this->assertDatabaseHas('app_data_clientes', ['nombre' => 'Externo']);
    }

    public function test_route_disable_parent_disable_and_forged_action_cannot_bypass_permissions(): void
    {
        [$program, $menu] = $this->catalog();
        $this->operation($program['id'], 'list', ['action' => 'create', 'nombre' => 'No insertar'])->assertOk()->assertJsonPath('TotalRecordCount', 0);
        $this->postJson('/aplicaciones/catalogo')->assertStatus(405);
        $this->postJson('/aplicaciones/catalogo?crud=generated-program-999&action=create', ['nombre' => 'Ataque'])->assertStatus(405);
        $this->operation($program['id'], 'unknown')->assertForbidden();
        DB::table('menu_items')->where('id', 50)->update(['active' => false]);
        $this->operation($program['id'], 'list')->assertForbidden();
        DB::table('menu_items')->where('id', 50)->update(['active' => true]);
        DB::table('managed_application_routes')->where('name', 'crud.catalogo')->update(['active' => false]);
        $this->operation($program['id'], 'create', ['nombre' => 'Bloqueado'])->assertForbidden();
    }

    public function test_schema_drift_is_detected_before_any_data_write(): void
    {
        [$program] = $this->catalog();
        Schema::table('app_data_clientes', fn (Blueprint $table) => $table->string('extra')->nullable());
        $this->operation($program['id'], 'create', ['nombre' => 'No guardar'])->assertStatus(409);
        $this->assertDatabaseCount('app_data_clientes', 0);
    }

    public function test_generated_crud_cookie_requests_require_csrf(): void
    {
        [$program] = $this->catalog();
        $admin = User::whereJsonContains('erp_roles', 'administrador')->firstOrFail();
        $token = app(JwtTokens::class)->issue($admin)['token'];
        $this->flushHeaders();
        $this->app->instance('env', 'local');
        $this->withCookie(config('access.jwt.cookie'), $token)->post('/aplicaciones/catalogo?crud=generated-program-'.$program['id'].'&action=create', ['nombre' => 'Bloqueado'])->assertStatus(419);
        $this->assertDatabaseCount('app_data_clientes', 0);
    }

    public function test_new_table_creation_never_overwrites_an_existing_table(): void
    {
        $this->login();
        Schema::create('app_data_clientes', function (Blueprint $table): void {
            $table->id();
            $table->string('conservar');
        });
        DB::table('app_data_clientes')->insert(['conservar' => 'Dato original']);
        $program = $this->draft();
        $this->field($program['id'])->assertOk();
        $this->prepare($program['id'])->assertUnprocessable();
        $this->assertDatabaseHas('app_data_clientes', ['conservar' => 'Dato original']);
    }

    public function test_generated_forms_can_supply_isolated_browser_fixtures_for_admin_and_reader(): void
    {
        [$program, $menu] = $this->catalog();
        $this->operation($program['id'], 'create', ['nombre' => 'Cliente UI'])->assertOk();
        $fixture = ['generated_program_id' => $program['id']];
        (new \ReflectionProperty(QuasarRenderer::class, 'assetsWritten'))->setValue(null, false);
        $fixture['generated-admin'] = $this->get('/aplicaciones/catalogo')->assertOk()->getContent();
        $fixture['generated-admin_list'] = $this->operation($program['id'], 'list')->assertOk()->json();
        $user = $this->login(false);
        DB::table('menu_grants')->insert(['user_id' => $user->id, 'menu_item_id' => $menu, 'can_view' => true]);
        (new \ReflectionProperty(QuasarRenderer::class, 'assetsWritten'))->setValue(null, false);
        $fixture['generated-reader'] = $this->get('/aplicaciones/catalogo')->assertOk()->getContent();
        $fixture['generated-reader_list'] = $this->operation($program['id'], 'list')->assertOk()->json();
        if (getenv('ERP_CAPTURE_UI') === '1') {
            File::ensureDirectoryExists(base_path('.runtime/tests'));
            File::put(base_path('.runtime/tests/generated-crud-ui.json'), json_encode($fixture, JSON_THROW_ON_ERROR));
        }
    }

    public function test_failed_metadata_publication_cleans_up_only_its_new_empty_table(): void
    {
        $this->login();
        $program = $this->draft();
        $this->field($program['id'])->assertOk();
        $fail = true;
        DB::listen(function (QueryExecuted $query) use (&$fail): void {
            if ($fail && str_starts_with(strtolower($query->sql), 'insert') && str_contains($query->sql, 'erp_access_events')) {
                throw new \RuntimeException('Publication failed');
            }
        });
        $this->withoutExceptionHandling();
        try {
            $this->prepare($program['id']);
            $this->fail('La publicación debía fallar.');
        } catch (\RuntimeException $exception) {
            $this->assertSame('Publication failed', $exception->getMessage());
        } finally {
            $fail = false;
        }
        $this->assertFalse(Schema::hasTable('app_data_clientes'));
        $this->assertDatabaseHas('generated_programs', ['id' => $program['id'], 'crud_ready' => 0, 'crud_building' => 0]);
        $this->prepare($program['id'])->assertOk();
    }

    public function test_existing_tables_with_nonstandard_primary_keys_are_rejected_and_data_is_preserved(): void
    {
        $this->login();
        Schema::create('business_codes', function (Blueprint $table): void {
            $table->string('codigo')->primary();
            $table->string('nombre');
        });
        DB::table('business_codes')->insert(['codigo' => 'A', 'nombre' => 'Conservar']);
        $program = $this->draft('existing', 'business_codes');
        $this->field($program['id'])->assertOk();
        $this->prepare($program['id'])->assertUnprocessable();
        $this->assertDatabaseHas('business_codes', ['codigo' => 'A', 'nombre' => 'Conservar']);
    }

    public function test_route_defaults_select_crud_transport_and_incomplete_routes_are_rejected(): void
    {
        [$program] = $this->catalog();
        $this->postJson('/administracion/registro-rutas?crud=access-programas&action=programDefaults', ['program' => 'controller:'.$program['action']])
            ->assertOk()->assertJsonPath('Record.http_method', 'GET|POST');
        $this->postJson('/administracion/registro-rutas?crud=access-programas&action=create', [
            'label' => 'Incompleta', 'name' => 'crud.incompleta', 'uri' => '/aplicaciones/incompleta',
            'http_method' => 'GET', 'program' => 'controller:'.$program['action'], 'program_parameters' => '{}', 'active' => 1,
        ])->assertUnprocessable();
        $this->postJson('/administracion/registro-rutas?crud=access-programas&action=create', [
            'label' => 'Conflicto', 'name' => 'crud.conflicto', 'uri' => '/aplicaciones/catalogo',
            'http_method' => 'GET|POST', 'program' => 'controller:'.$program['action'], 'program_parameters' => '{}', 'active' => 1,
        ])->assertUnprocessable();
    }
}
