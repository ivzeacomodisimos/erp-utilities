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
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class GeneratedCrudStorageTest extends TestCase
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

    public function test_new_tables_and_writes_use_the_selected_connection_and_enforce_user_menu_permissions(): void
    {
        $this->login();
        $program = $this->draft('main.prueba')->assertOk()->json('Record');
        $this->field($program)->assertOk();
        $this->prepare($program)->assertOk();
        $menu = $this->bind($program);
        $this->assertFalse(Schema::hasTable('prueba'));
        $this->assertTrue(Schema::connection('crud_business')->hasTable('prueba'));
        $record = $this->operation($program, 'create', ['nombre' => 'Uno', 'table_name' => 'users', 'table_connection' => ''])->assertOk()->json('Record');
        $this->assertSame(1, DB::connection('crud_business')->table('prueba')->count());
        $reader = $this->login(false);
        $this->operation($program, 'list')->assertForbidden();
        DB::table('menu_grants')->insert(['user_id' => $reader->id, 'menu_item_id' => $menu, 'can_view' => true]);
        $this->operation($program, 'list')->assertOk()->assertJsonPath('Records.0.nombre', 'Uno');
        $this->operation($program, 'create', ['nombre' => 'No permitido', 'user_id' => 1, 'menu_id' => 50])->assertForbidden();
        $this->operation($program, 'update', $record)->assertForbidden();
        $this->operation($program, 'delete', $record)->assertForbidden();
        DB::table('menu_grants')->where('user_id', $reader->id)->update(['can_update' => true, 'can_delete' => true]);
        $record['nombre'] = 'Dos';
        $updated = $this->operation($program, 'update', $record)->assertOk()->json('Record');
        $this->operation($program, 'update', $record)->assertUnprocessable();
        $this->operation($program, 'delete', $updated)->assertOk();
        $this->operation($program, 'list')->assertOk()->assertJsonPath('TotalRecordCount', 0);
        DB::table('menu_items')->where('id', $menu)->update(['migration_enabled' => false]);
        $this->operation($program, 'list')->assertForbidden();
    }

    public function test_listing_uses_unique_sort_columns_and_stable_pagination(): void
    {
        $this->login();
        $program = $this->draft('ordenamiento')->assertOk()->json('Record');
        $this->field($program)->assertOk();
        $this->prepare($program)->assertOk();
        $this->bind($program);
        foreach (['B', 'A', 'A'] as $name) {
            $this->operation($program, 'create', ['nombre' => $name])->assertOk();
        }
        $connection = DB::connection('crud_business');
        $connection->enableQueryLog();
        try {
            foreach (['' => [1, 2, 3], 'id ASC' => [1, 2, 3], 'id DESC' => [3, 2, 1],
                'id DESC, id ASC' => [3, 2, 1], 'nombre ASC, nombre DESC' => [2, 3, 1]] as $sort => $expected) {
                foreach ($expected as $offset => $id) {
                    $connection->flushQueryLog();
                    $this->operation($program, 'list', array_filter(['jtSorting' => $sort, 'jtStartIndex' => $offset, 'jtPageSize' => 1], fn (mixed $value): bool => $value !== ''))
                        ->assertOk()->assertJsonPath('TotalRecordCount', 3)->assertJsonPath('Records.0.id', $id);
                    $sql = collect($connection->getQueryLog())->pluck('query')->first(fn (string $sql): bool => str_starts_with($sql, 'select * from') && str_contains($sql, 'ordenamiento') && str_contains($sql, 'order by'));
                    $this->assertNotNull($sql);
                    $order = explode(' limit ', explode(' order by ', $sql)[1])[0];
                    $this->assertSame(1, substr_count($order, '"id"'), $sql);
                    $this->assertLessThanOrEqual(1, substr_count($order, '"nombre"'));
                }
            }
        } finally {
            $connection->disableQueryLog();
        }
    }

    public function test_existing_external_tables_are_linked_without_altering_their_structure(): void
    {
        $this->login();
        $schema = Schema::connection('crud_business');
        $schema->create('negocio', function (Blueprint $table): void {
            $table->id();
            $table->string('nombre', 150);
        });
        $before = app(GeneratedCrud::class)->signature('negocio', 'crud_business');
        $program = $this->draft('main.negocio', 'existing')->assertOk()->json('Record');
        $this->field($program)->assertOk();
        $this->prepare($program)->assertOk();
        $this->bind($program);
        $row = $this->operation($program, 'create', ['nombre' => 'Negocio'])->assertOk()->json('Record');
        $this->operation($program, 'delete', $row)->assertOk();
        $this->assertSame($before, app(GeneratedCrud::class)->signature('negocio', 'crud_business'));
        $this->assertFalse(Schema::hasTable('negocio'));
    }

    public function test_relations_and_dependent_autocomplete_use_the_external_database_and_reject_cross_connection_catalogues(): void
    {
        $this->login();
        $parent = $this->draft('catalogo')->assertOk()->json('Record');
        $this->field($parent)->assertOk();
        $this->field($parent, 'grupo', 'integer')->assertOk();
        $this->prepare($parent)->assertOk();
        $parentMenu = $this->bind($parent);
        $a = $this->operation($parent, 'create', ['nombre' => 'Opción A', 'grupo' => 1])->assertOk()->json('Record');
        $b = $this->operation($parent, 'create', ['nombre' => 'Opción B', 'grupo' => 2])->assertOk()->json('Record');
        $owner = $this->draft('formulario')->assertOk()->json('Record');
        $this->field($owner, 'grupo', 'integer')->assertOk();
        $relation = ['related_program_id' => $parent['id'], 'related_menu_id' => $parentMenu, 'related_label' => 'nombre', 'depends_on' => 'grupo', 'related_filter' => 'grupo'];
        $this->field($owner, 'opcion_id', 'relation', $relation)->assertOk();
        $this->prepare($owner)->assertOk();
        $ownerMenu = $this->bind($owner);
        $this->operation($owner, 'autocomplete', ['field' => 'opcion_id', 'term' => 'Opción', 'lookup_context' => '{"grupo":1}'])
            ->assertOk()->assertJsonCount(1)->assertJsonPath('0.label', 'Opción A');
        $this->operation($owner, 'create', ['grupo' => 1, 'opcion_id' => $b['id']])->assertUnprocessable();
        $this->operation($owner, 'create', ['grupo' => 1, 'opcion_id' => $a['id']])->assertOk();
        $a['grupo'] = 2;
        $this->operation($parent, 'update', $a)->assertUnprocessable();
        $this->operation($parent, 'delete', $a)->assertUnprocessable();
        $local = $this->draft('local', 'new', '')->assertOk()->json('Record');
        $this->field($local, 'grupo', 'integer')->assertOk();
        $this->field($local, 'opcion_id', 'relation', $relation)->assertUnprocessable();
        $reader = $this->login(false);
        DB::table('menu_grants')->insert(['user_id' => $reader->id, 'menu_item_id' => $ownerMenu, 'can_view' => true]);
        $this->operation($owner, 'autocomplete', ['field' => 'opcion_id', 'term' => 'Opción', 'lookup_context' => '{"grupo":1}'])->assertForbidden();
    }

    public function test_sql_server_three_part_names_select_database_and_schema_without_requiring_a_connection_query(): void
    {
        config(['database.connections.crud_sql_test' => ['driver' => 'sqlsrv', 'host' => 'configured-server', 'database' => 'original', 'username' => 'configured-user', 'password' => 'test-only', 'prefix' => '']]);
        $storage = app(GeneratedCrudStorage::class)->resolve('comodisimos.test.prueba', 'crud_sql_test');
        $this->assertSame('comodisimos', $storage['connection']->getDatabaseName());
        $this->assertSame('test.prueba', $storage['table']);
        $this->assertSame('comodisimos.test.prueba', $storage['canonical']);
        $this->assertSame('original', config('database.connections.crud_sql_test.database'));
        $this->assertStringContainsString('[test].[prueba]', $storage['connection']->table($storage['table'])->where('id', 1)->toSql());
        $this->login();
        $this->draft('comodisimos.test.prueba', 'new', 'crud_sql_test')->assertOk()->assertJsonPath('Record.table_name', 'comodisimos.test.prueba');
        $this->draft('comodisimos.test.prueba', 'existing', 'crud_sql_test')->assertUnprocessable();
    }

    public function test_unknown_connections_unsafe_names_and_protected_tables_are_rejected_on_the_server(): void
    {
        $this->login();
        foreach (['main.users', 'main.generated_programs', 'main.erp_secret', 'main.Prueba;DROP', 'one.two.three.four', 'main..prueba', 'main.[prueba]', '../prueba'] as $table) {
            $this->draft($table)->assertUnprocessable();
        }
        $this->draft('prueba', 'new', 'attacker')->assertUnprocessable();
        config(['database.connections.crud_sql_test' => ['driver' => 'sqlsrv', 'host' => 'configured-server', 'database' => 'original', 'prefix' => '']]);
        foreach (['master.dbo.prueba', 'comodisimos.sys.prueba', 'comodisimos.information_schema.prueba', 'comodisimos.test.users'] as $table) {
            $this->draft($table, 'new', 'crud_sql_test')->assertUnprocessable();
        }
        $this->login(false);
        $this->draft('prueba')->assertForbidden();
    }

    public function test_prepared_programmes_cannot_switch_connections_or_tables(): void
    {
        $this->login();
        $program = $this->draft('prueba')->assertOk()->json('Record');
        $this->field($program)->assertOk();
        $this->prepare($program)->assertOk();
        $this->postJson('/administracion/programas?crud=access-generador&action=update', [
            'id' => $program['id'], 'revision' => 2, 'title' => 'Cambio', 'active' => 0, 'table_connection' => '',
        ])->assertUnprocessable();
        $this->assertDatabaseHas('generated_programs', ['id' => $program['id'], 'table_connection' => 'crud_business', 'table_name' => 'prueba']);
    }

    public function test_mysql_three_part_names_give_a_specific_engine_validation_error(): void
    {
        config(['database.connections.crud_mysql_test' => ['driver' => 'mysql', 'host' => 'configured-server', 'database' => 'business', 'prefix' => '']]);
        $this->expectException(ValidationException::class);
        app(GeneratedCrudStorage::class)->resolve('comodisimos.test.prueba', 'crud_mysql_test');
    }

    public function test_sqlserver_connection_can_create_and_link_isolated_tables_with_rollback(): void
    {
        if (getenv('ERP_TEST_SQLSERVER') !== '1') {
            $this->markTestSkipped('Integración SQL Server habilitada mediante ERP_TEST_SQLSERVER=1.');
        }
        $this->login();
        $reference = 'comodisimos.'.(getenv('ERP_SQLSERVER_TEST_SCHEMA') ?: 'dbo').'.codex_crud_'.bin2hex(random_bytes(6));
        $storage = app(GeneratedCrudStorage::class)->resolve($reference, 'intranet_sqlsrv');
        app(GeneratedCrudStorage::class)->assertSchema($storage);
        $connection = $storage['connection'];
        $connection->beginTransaction();
        try {
            $program = $this->draft($reference, 'new', 'intranet_sqlsrv')->assertOk()->json('Record');
            foreach (['nombre' => 'string', 'notas' => 'text', 'cantidad' => 'integer', 'precio' => 'decimal', 'fecha' => 'date', 'activo' => 'boolean'] as $name => $type) {
                $this->field($program, $name, $type)->assertOk();
            }
            $this->prepare($program)->assertOk();
            $menu = $this->bind($program);
            $record = $this->operation($program, 'create', ['nombre' => 'Prueba aislada', 'notas' => 'Temporal', 'cantidad' => 2, 'precio' => '12.50', 'fecha' => '2026-11-18', 'activo' => 1])->assertOk()->json('Record');
            $record['nombre'] = 'Modificada';
            $record = $this->operation($program, 'update', $record)->assertOk()->json('Record');
            $this->operation($program, 'list', ['nombre' => 'Modificada'])->assertOk()->assertJsonPath('TotalRecordCount', 1);
            foreach (['id ASC', 'id DESC', 'id ASC, id DESC', 'nombre ASC, nombre DESC', 'nombre DESC, id DESC'] as $sort) {
                $this->operation($program, 'list', ['jtSorting' => $sort, 'jtStartIndex' => 0, 'jtPageSize' => 10])
                    ->assertOk()->assertJsonPath('TotalRecordCount', 1)->assertJsonPath('Records.0.id', $record['id']);
            }
            $child = $this->draft($reference.'_child', 'new', 'intranet_sqlsrv')->assertOk()->json('Record');
            $this->field($child, 'cantidad', 'integer')->assertOk();
            $this->field($child, 'padre_id', 'relation', ['related_program_id' => $program['id'], 'related_menu_id' => $menu,
                'related_label' => 'nombre', 'depends_on' => 'cantidad', 'related_filter' => 'cantidad'])->assertOk();
            $this->prepare($child)->assertOk();
            $this->bind($child);
            $this->operation($child, 'autocomplete', ['field' => 'padre_id', 'term' => 'Modificada', 'lookup_context' => '{"cantidad":2}'])
                ->assertOk()->assertJsonCount(1);
            $this->operation($child, 'create', ['cantidad' => 3, 'padre_id' => $record['id']])->assertUnprocessable();
            $childRow = $this->operation($child, 'create', ['cantidad' => 2, 'padre_id' => $record['id']])->assertOk()->json('Record');
            $this->operation($program, 'delete', $record)->assertUnprocessable();
            $this->operation($child, 'delete', $childRow)->assertOk();
            $this->operation($program, 'delete', $record)->assertOk();
            $reader = $this->login(false);
            DB::table('menu_grants')->insert(['user_id' => $reader->id, 'menu_item_id' => $menu, 'can_view' => true]);
            $this->operation($program, 'list')->assertOk();
            $this->operation($program, 'create', ['nombre' => 'No autorizado'])->assertForbidden();
            $this->login();
            $existing = $reference.'_existing';
            $target = app(GeneratedCrudStorage::class)->resolve($existing, 'intranet_sqlsrv');
            $target['schema']->create($target['table'], function (Blueprint $table): void {
                $table->id();
                $table->string('nombre', 150);
            });
            $signature = app(GeneratedCrud::class)->signature($existing, 'intranet_sqlsrv');
            $linked = $this->draft($existing, 'existing', 'intranet_sqlsrv')->assertOk()->json('Record');
            $this->field($linked)->assertOk();
            $this->prepare($linked)->assertOk();
            $this->bind($linked);
            $this->operation($linked, 'create', ['nombre' => 'Vinculada'])->assertOk();
            $this->assertSame($signature, app(GeneratedCrud::class)->signature($existing, 'intranet_sqlsrv'));
        } finally {
            $connection->rollBack();
        }
        $this->assertFalse($storage['schema']->hasTable($storage['table']));
        $invalid = $this->draft('comodisimos.codex_missing_'.bin2hex(random_bytes(5)).'.prueba', 'new', 'intranet_sqlsrv')->assertOk()->json('Record');
        $this->field($invalid)->assertOk();
        $this->prepare($invalid)->assertUnprocessable();
        $this->assertDatabaseHas('generated_programs', ['id' => $invalid['id'], 'crud_ready' => false, 'crud_building' => false]);
    }
}
