<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\Auth\JwtTokens;
use App\Support\Menu\GeneratedCrud;
use App\Support\Menu\GeneratedCrudStorage;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use Illuminate\Testing\TestResponse;
use Ivandzb\CrudKit\Render\Quasar\QuasarRenderer;
use Tests\TestCase;

class GeneratedCrudAutomaticFieldsTest extends TestCase
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

    public function test_new_programmes_show_planned_automatic_fields_as_readonly_without_creating_editable_definitions(): void
    {
        $admin = $this->login();
        $program = $this->draft('automatic')->assertOk()->json('Record');
        $fields = app(GeneratedCrud::class)->automaticFields($program['id'], $admin);
        $this->assertSame(['id', 'created_at', 'updated_at', 'deleted_at', '_row_version'], array_column($fields, 'column_name'));
        $this->assertSame([true], array_values(array_unique(array_column($fields, 'readonly'))));
        $this->assertStringContainsString('Se crea al preparar', $fields[0]['status']);
        $this->assertDatabaseCount('generated_program_fields', 0);
        $this->assertFalse(Schema::connection('crud_business')->hasTable('automatic'));
        (new \ReflectionProperty(QuasarRenderer::class, 'assetsWritten'))->setValue(null, false);
        $page = $this->get('/administracion/campos-programa?program_id='.$program['id'])->assertOk()
            ->assertSee('Campos automáticos (solo lectura)')->assertSee('Administrado por')->assertSee('Clave primaria autoincremental');
        $list = $this->postJson('/administracion/campos-programa?crud=access-campos&action=list')->assertOk()->assertJsonPath('TotalRecordCount', 0);
        if (getenv('ERP_CAPTURE_UI') === '1') {
            File::ensureDirectoryExists(base_path('.runtime/tests'));
            File::put(base_path('.runtime/tests/automatic-fields-ui.json'), json_encode([
                'automatic-fields' => $page->getContent(), 'automatic-fields_list' => $list->json(),
            ], JSON_THROW_ON_ERROR));
        }
    }

    public function test_prepared_new_programmes_keep_automatic_fields_separate_from_business_fields(): void
    {
        $admin = $this->login();
        $program = $this->draft('automatic')->assertOk()->json('Record');
        $this->field($program)->assertOk();
        $this->prepare($program)->assertOk();
        $fields = app(GeneratedCrud::class)->automaticFields($program['id'], $admin);
        $this->assertSame(['id', 'created_at', 'updated_at', 'deleted_at', '_row_version'], array_column($fields, 'column_name'));
        $this->assertSame('Solo lectura', $fields[0]['status']);
        $this->assertSame(['nombre'], array_column(app(GeneratedCrud::class)->fields($program['id']), 'column_name'));
        $this->assertDatabaseCount('generated_program_fields', 1);
    }

    public function test_existing_tables_show_only_real_automatic_columns_and_preserve_audit_values_on_record_updates(): void
    {
        $admin = $this->login();
        Schema::connection('crud_business')->create('actual', function (Blueprint $table): void {
            $table->id();
            $table->string('nombre', 150);
            $table->integer('cantidad')->default(0);
            $table->integer('doble')->storedAs('cantidad * 2');
            $table->dateTime('created_at')->nullable();
        });
        $signature = app(GeneratedCrud::class)->signature('actual', 'crud_business');
        $program = $this->draft('actual', 'existing')->assertOk()->json('Record');
        $fields = app(GeneratedCrud::class)->automaticFields($program['id'], $admin);
        $this->assertSame(['id', 'doble', 'created_at', '_row_version'], array_column($fields, 'column_name'));
        $this->assertSame('Base de datos', $fields[1]['managed_by']);
        $this->field($program)->assertOk();
        $this->prepare($program)->assertOk();
        $this->bind($program);
        $row = $this->operation($program, 'create', ['nombre' => 'Original', 'created_at' => '1900-01-01 00:00:00'])->assertOk()->json('Record');
        $created = DB::connection('crud_business')->table('actual')->value('created_at');
        $this->assertNotSame('1900-01-01 00:00:00', $created);
        $row['nombre'] = 'Cambio';
        $row['created_at'] = '1900-01-01 00:00:00';
        $row['doble'] = 99;
        $this->operation($program, 'update', $row)->assertOk();
        $this->assertSame($created, DB::connection('crud_business')->table('actual')->value('created_at'));
        $this->assertSame(0, DB::connection('crud_business')->table('actual')->value('doble'));
        $this->assertSame($signature, app(GeneratedCrud::class)->signature('actual', 'crud_business'));
    }

    public function test_the_server_rejects_editing_or_deleting_managed_metadata_even_if_the_requested_column_is_renamed(): void
    {
        $this->login();
        $program = $this->draft('automatic')->assertOk()->json('Record');
        $id = DB::table('generated_program_fields')->insertGetId(['program_id' => $program['id'], 'column_name' => 'id',
            'label' => 'Identificador', 'field_type' => 'integer', 'required' => true, 'max_length' => 150, 'position' => 0, 'revision' => 1]);
        $this->postJson('/administracion/campos-programa?crud=access-campos&action=update', [
            'id' => $id, 'revision' => 1, 'program_id' => $program['id'], 'column_name' => 'otro_nombre',
            'label' => 'Cambio', 'field_type' => 'integer', 'required' => 1, 'max_length' => 150, 'position' => 0,
        ])->assertUnprocessable()->assertJsonPath('Errors.column_name', 'El campo «id» es de solo lectura y lo administra el generador o la base de datos. No puede modificarse ni eliminarse desde la configuración.');
        $this->postJson('/administracion/campos-programa?crud=access-campos&action=delete', ['id' => $id, 'revision' => 1])->assertUnprocessable();
        $this->assertDatabaseHas('generated_program_fields', ['id' => $id, 'column_name' => 'id', 'revision' => 1]);
        $this->assertFalse(Schema::connection('crud_business')->hasTable('automatic'));
    }

    public function test_managed_metadata_protection_covers_calculated_columns_and_requires_administration(): void
    {
        $this->login();
        Schema::connection('crud_business')->create('calculated', function (Blueprint $table): void {
            $table->id();
            $table->integer('cantidad');
            $table->integer('doble')->storedAs('cantidad * 2');
        });
        $program = $this->draft('calculated', 'existing')->assertOk()->json('Record');
        $id = DB::table('generated_program_fields')->insertGetId(['program_id' => $program['id'], 'column_name' => 'doble',
            'label' => 'Calculado', 'field_type' => 'integer', 'required' => false, 'max_length' => 150, 'position' => 0, 'revision' => 1]);
        $this->postJson('/administracion/campos-programa?crud=access-campos&action=delete', ['id' => $id, 'revision' => 1])->assertUnprocessable();
        $this->login(false);
        $this->get('/administracion/campos-programa?program_id='.$program['id'])->assertForbidden();
        $this->postJson('/administracion/campos-programa?crud=access-campos&action=delete', ['id' => $id, 'revision' => 1])->assertForbidden();
    }

    public function test_sqlserver_rowversion_and_calculated_columns_appear_as_readonly(): void
    {
        if (getenv('ERP_TEST_SQLSERVER') !== '1') {
            $this->markTestSkipped('Integración SQL Server opcional.');
        }
        $admin = $this->login();
        $reference = 'comodisimos.test.codex_automatic_'.bin2hex(random_bytes(5));
        $storage = app(GeneratedCrudStorage::class)->resolve($reference, 'intranet_sqlsrv');
        $connection = $storage['connection'];
        $connection->beginTransaction();
        try {
            $storage['schema']->create($storage['table'], function (Blueprint $table): void {
                $table->id();
                $table->integer('cantidad');
                $table->timestamps();
            });
            $connection->statement('ALTER TABLE '.$connection->getQueryGrammar()->wrapTable($storage['table']).' ADD [doble] AS ([cantidad] * 2) PERSISTED, [version_datos] rowversion');
            $program = $this->draft($reference, 'existing', 'intranet_sqlsrv')->assertOk()->json('Record');
            $signature = app(GeneratedCrud::class)->signature($reference, 'intranet_sqlsrv');
            $fields = array_column(app(GeneratedCrud::class)->automaticFields($program['id'], $admin), null, 'column_name');
            $this->assertSame('rowversion', $fields['version_datos']['data_type']);
            $this->assertSame('Base de datos', $fields['version_datos']['managed_by']);
            $this->assertTrue($fields['doble']['readonly']);
            $this->get('/administracion/campos-programa?program_id='.$program['id'])->assertOk()->assertSee('version_datos')->assertSee('Solo lectura');
            $this->assertSame($signature, app(GeneratedCrud::class)->signature($reference, 'intranet_sqlsrv'));
        } finally {
            $connection->rollBack();
        }
        $this->assertFalse($storage['schema']->hasTable($storage['table']));
    }
}
