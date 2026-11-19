<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\Auth\JwtTokens;
use App\Support\Menu\GeneratedCrud;
use App\Support\Menu\GeneratedCrudStorage;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class GeneratedCrudDiscoveryTest extends TestCase
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
            'controller_name' => $controller, 'title' => 'Catálogo externo', 'active' => 0,
            'program_type' => 'crud', 'table_mode' => $mode, 'table_name' => $table, 'table_connection' => $connection, 'auto_detect_fields' => true,
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

    public function test_linking_a_table_detects_types_lengths_required_fields_and_excludes_generated_columns(): void
    {
        $this->login();
        $schema = Schema::connection('crud_business');
        DB::connection('crud_business')->statement('CREATE TABLE detect_types (id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre VARCHAR(80) NOT NULL, descripcion VARCHAR(500), cantidad INTEGER NOT NULL, precio DECIMAL(12,4) NOT NULL,
            activo BOOLEAN NOT NULL, fecha DATE, momento DATETIME, hora TIME, contenido BLOB, password VARCHAR(255),
            created_at DATETIME, updated_at DATETIME, doble INTEGER GENERATED ALWAYS AS (cantidad * 2) STORED)');
        $signature = app(GeneratedCrud::class)->signature('detect_types', 'crud_business');
        $program = $this->draft('detect_types', 'existing')->assertOk()->json('Record');
        $fields = DB::table('generated_program_fields')->where('program_id', $program['id'])->orderBy('position')->get()->keyBy('column_name');
        $this->assertSame(['string', 'text', 'integer', 'decimal', 'boolean', 'date', 'datetime', 'time'], $fields->pluck('field_type')->all());
        $this->assertEquals(80, $fields['nombre']->max_length);
        $this->assertTrue((bool) $fields['nombre']->required);
        $this->assertFalse((bool) $fields['descripcion']->required);
        $this->assertArrayNotHasKey('password', $fields->all());
        $this->assertArrayNotHasKey('contenido', $fields->all());
        $this->assertArrayNotHasKey('doble', $fields->all());
        $this->postJson('/administracion/campos-programa?crud=access-campos&action=update', array_merge((array) $fields['descripcion'], ['max_length' => 501]))->assertUnprocessable();
        $this->prepare($program)->assertOk();
        $this->assertSame($signature, app(GeneratedCrud::class)->signature('detect_types', 'crud_business'));
        $this->get('/administracion/campos-programa?program_id='.$program['id'])->assertOk()->assertSee('Columnas detectadas')->assertSee('No editables');
    }

    private function parentCatalogue(): array
    {
        Schema::connection('crud_business')->create('catalogue', function (Blueprint $table): void {
            $table->id();
            $table->string('nombre', 100);
        });
        $parent = $this->draft('catalogue', 'existing')->assertOk()->json('Record');
        $this->prepare($parent)->assertOk();
        $menu = $this->bind($parent);

        return [$parent, $menu];
    }

    private function childTable(): void
    {
        Schema::connection('crud_business')->create('child', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('catalogue_id')->constrained('catalogue')->restrictOnDelete();
            $table->string('nombre', 100);
        });
    }

    public function test_detected_relations_enforce_related_menu_permissions_and_validate_records_on_the_server(): void
    {
        $this->login();
        [$parent, $parentMenu] = $this->parentCatalogue();
        $this->childTable();
        $child = $this->draft('child', 'existing')->assertOk()->json('Record');
        $this->assertDatabaseHas('generated_program_fields', ['program_id' => $child['id'], 'column_name' => 'catalogue_id',
            'field_type' => 'relation', 'related_program_id' => $parent['id'], 'related_menu_id' => $parentMenu, 'related_label' => 'nombre']);
        $this->prepare($child)->assertOk();
        $childMenu = $this->bind($child);
        $record = $this->operation($parent, 'create', ['nombre' => 'Catálogo'])->assertOk()->json('Record');
        $this->operation($child, 'create', ['catalogue_id' => 999999, 'nombre' => 'No válido'])->assertUnprocessable();
        $this->operation($child, 'create', ['catalogue_id' => $record['id'], 'nombre' => 'Válido'])->assertOk();
        $reader = $this->login(false);
        DB::table('menu_grants')->insert(['user_id' => $reader->id, 'menu_item_id' => $childMenu, 'can_view' => true]);
        $this->operation($child, 'list')->assertForbidden();
        DB::table('menu_grants')->insert(['user_id' => $reader->id, 'menu_item_id' => $parentMenu, 'can_view' => true]);
        $this->operation($child, 'autocomplete', ['field' => 'catalogue_id', 'term' => 'Catálogo'])->assertOk()->assertJsonCount(1);
        $this->operation($child, 'list')->assertOk();
        $this->operation($child, 'create', ['catalogue_id' => $record['id'], 'nombre' => 'No autorizado'])->assertForbidden();
    }

    public function test_unregistered_catalogues_remain_pending_and_redetection_resolves_them_without_overwriting_labels(): void
    {
        $this->login();
        Schema::connection('crud_business')->create('catalogue', function (Blueprint $table): void {
            $table->id();
            $table->string('nombre', 100);
        });
        $this->childTable();
        $child = $this->draft('child', 'existing')->assertOk()->json('Record');
        $report = json_decode(DB::table('generated_programs')->where('id', $child['id'])->value('discovery_report'), true);
        $this->assertArrayHasKey('catalogue_id', $report['pending']);
        $this->prepare($child)->assertUnprocessable();
        $field = DB::table('generated_program_fields')->where('program_id', $child['id'])->where('column_name', 'catalogue_id')->first();
        $this->postJson('/administracion/campos-programa?crud=access-campos&action=update', array_merge((array) $field, ['label' => 'Mi catálogo']))->assertOk();
        $parent = $this->draft('catalogue', 'existing')->assertOk()->json('Record');
        $this->prepare($parent)->assertOk();
        $this->bind($parent);
        $url = '/administracion/programas/detectar';
        $this->postJson($url, ['program_id' => $child['id']])->assertOk()->assertJsonCount(0, 'Report.pending');
        $updated = DB::table('generated_program_fields')->find($field->id);
        $this->assertSame('Mi catálogo', $updated->label);
        $this->assertSame('relation', $updated->field_type);
        $this->postJson($url, ['program_id' => $child['id']])->assertOk();
        $this->assertSame($updated->revision, DB::table('generated_program_fields')->find($field->id)->revision);
        $this->assertSame(2, DB::table('generated_program_fields')->where('program_id', $child['id'])->count());
        $this->prepare($child)->assertOk();
        $this->postJson($url, ['program_id' => $child['id']])->assertUnprocessable();
    }

    public function test_foreign_keys_cannot_be_downgraded_to_bypass_catalogue_permissions(): void
    {
        $this->login();
        $this->parentCatalogue();
        $this->childTable();
        $child = $this->draft('child', 'existing')->assertOk()->json('Record');
        $field = DB::table('generated_program_fields')->where('program_id', $child['id'])->where('column_name', 'catalogue_id')->first();
        $this->postJson('/administracion/campos-programa?crud=access-campos&action=update', array_merge((array) $field, ['field_type' => 'integer']))->assertOk();
        $this->prepare($child)->assertUnprocessable();
        $this->postJson('/administracion/programas/detectar', ['program_id' => $child['id']])->assertOk();
        $this->prepare($child)->assertOk();
    }

    public function test_unknown_required_types_and_composite_relations_are_reported_and_cannot_be_prepared(): void
    {
        $this->login();
        $schema = Schema::connection('crud_business');
        $schema->create('unsupported', function (Blueprint $table): void {
            $table->id();
            $table->string('nombre');
            $table->binary('archivo');
        });
        $program = $this->draft('unsupported', 'existing')->assertOk()->json('Record');
        $this->prepare($program)->assertUnprocessable();
        $this->get('/administracion/campos-programa?program_id='.$program['id'])->assertOk()->assertSee('archivo requiere un tipo');
        $schema->create('composite_parent', function (Blueprint $table): void {
            $table->integer('a');
            $table->integer('b');
            $table->primary(['a', 'b']);
        });
        $schema->create('composite_child', function (Blueprint $table): void {
            $table->id();
            $table->integer('a');
            $table->integer('b');
            $table->foreign(['a', 'b'])->references(['a', 'b'])->on('composite_parent');
        });
        $child = $this->draft('composite_child', 'existing')->assertOk()->json('Record');
        $this->prepare($child)->assertUnprocessable();
        $report = json_decode(DB::table('generated_programs')->where('id', $child['id'])->value('discovery_report'), true);
        $this->assertArrayHasKey('a, b', $report['pending']);
    }

    public function test_datetime_and_time_validation_preserves_fractional_seconds(): void
    {
        $this->login();
        Schema::connection('crud_business')->create('times', function (Blueprint $table): void {
            $table->id();
            $table->dateTime('momento', 6);
            $table->time('hora', 6);
            $table->float('medida');
        });
        $program = $this->draft('times', 'existing')->assertOk()->json('Record');
        $this->prepare($program)->assertOk();
        $this->bind($program);
        $this->operation($program, 'create', ['momento' => '2026-02-30 10:20:30', 'hora' => '25:00:00'])->assertUnprocessable();
        $row = $this->operation($program, 'create', ['momento' => '2026-11-19 10:20:30.1234567', 'hora' => '10:20:30.1234567', 'medida' => '1.23456789'])->assertOk()->json('Record');
        $this->operation($program, 'update', $row)->assertOk();
        $this->assertSame('2026-11-19 10:20:30.1234567', DB::connection('crud_business')->table('times')->value('momento'));
    }

    public function test_detection_requires_administration_and_cookie_requests_require_csrf(): void
    {
        $admin = $this->login();
        Schema::connection('crud_business')->create('secure', function (Blueprint $table): void {
            $table->id();
            $table->string('nombre');
        });
        $program = $this->draft('secure', 'existing')->assertOk()->json('Record');
        $this->login(false);
        $this->postJson('/administracion/programas/detectar', ['program_id' => $program['id']])->assertForbidden();
        $this->postJson('/administracion/programas/detectar', ['program_id' => 99999])->assertForbidden();
        $this->flushHeaders();
        $this->app->instance('env', 'local');
        $token = app(JwtTokens::class)->issue($admin)['token'];
        $this->withCookie(config('access.jwt.cookie'), $token)->post('/administracion/programas/detectar', ['program_id' => $program['id']])->assertStatus(419);
    }

    public function test_failed_detection_rolls_back_the_programme_and_generated_controller(): void
    {
        $this->login();
        $this->draft('missing_table', 'existing')->assertUnprocessable();
        $this->assertDatabaseCount('generated_programs', 0);
        foreach ($this->controllers as $controller) {
            $this->assertFileDoesNotExist(app_path('Http/Controllers/'.$controller.'.php'));
        }
    }

    public function test_sqlserver_metadata_detection_infers_uuid_rowversion_computed_fields_and_foreign_keys(): void
    {
        if (getenv('ERP_TEST_SQLSERVER') !== '1') {
            $this->markTestSkipped('Integración SQL Server opcional.');
        }
        $this->login();
        $prefix = 'comodisimos.test.codex_detect_'.bin2hex(random_bytes(5));
        $storage = app(GeneratedCrudStorage::class)->resolve($prefix, 'intranet_sqlsrv');
        $connection = $storage['connection'];
        $connection->beginTransaction();
        try {
            $storage['schema']->create($storage['table'], function (Blueprint $table): void {
                $table->id();
                $table->string('nombre', 90);
            });
            $parent = $this->draft($prefix, 'existing', 'intranet_sqlsrv')->assertOk()->json('Record');
            $this->assertDatabaseHas('generated_program_fields', ['program_id' => $parent['id'], 'column_name' => 'nombre', 'max_length' => 90]);
            $this->prepare($parent)->assertOk();
            $menu = $this->bind($parent);
            $parentRow = $this->operation($parent, 'create', ['nombre' => 'Catálogo real'])->assertOk()->json('Record');
            $target = app(GeneratedCrudStorage::class)->resolve($prefix.'_child', 'intranet_sqlsrv');
            $target['schema']->create($target['table'], function (Blueprint $table) use ($storage): void {
                $table->id();
                $table->foreignId('catalogue_id');
                $table->foreign('catalogue_id')->references('id')->on($storage['table'])->noActionOnDelete();
                $table->uuid('referencia');
                $table->dateTime('momento', 7);
                $table->time('hora', 7);
                $table->boolean('activo');
                $table->integer('cantidad');
                $table->binary('archivo')->nullable();
            });
            $connection->statement('ALTER TABLE '.$connection->getQueryGrammar()->wrapTable($target['table']).' ADD [doble] AS ([cantidad] * 2) PERSISTED, [version_datos] rowversion');
            $signature = app(GeneratedCrud::class)->signature($prefix.'_child', 'intranet_sqlsrv');
            $child = $this->draft($prefix.'_child', 'existing', 'intranet_sqlsrv')->assertOk()->json('Record');
            $this->assertDatabaseHas('generated_program_fields', ['program_id' => $child['id'], 'column_name' => 'referencia', 'field_type' => 'uuid']);
            $this->assertDatabaseMissing('generated_program_fields', ['program_id' => $child['id'], 'column_name' => 'version_datos']);
            $this->assertDatabaseMissing('generated_program_fields', ['program_id' => $child['id'], 'column_name' => 'doble']);
            $this->assertDatabaseHas('generated_program_fields', ['program_id' => $child['id'], 'column_name' => 'catalogue_id', 'field_type' => 'relation', 'related_menu_id' => $menu]);
            $this->prepare($child)->assertOk();
            $this->bind($child);
            $created = $this->operation($child, 'create', ['catalogue_id' => $parentRow['id'], 'referencia' => '28c4811a-9981-4dca-88b5-6348f18a0c6d',
                'momento' => '2026-11-19 10:20:30.1234567', 'hora' => '10:20:30.1234567', 'activo' => 1, 'cantidad' => 5]);
            $this->assertSame(200, $created->status(), $created->getContent());
            $row = $created->json('Record');
            $this->operation($child, 'update', $row)->assertOk();
            $this->operation($child, 'list')->assertOk()->assertJsonPath('TotalRecordCount', 1);
            $this->assertSame($signature, app(GeneratedCrud::class)->signature($prefix.'_child', 'intranet_sqlsrv'));
        } finally {
            $connection->rollBack();
        }
        $this->assertFalse($storage['schema']->hasTable($storage['table']));
    }
}
