<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\Auth\JwtTokens;
use App\Support\Menu\GeneratedCrud;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use Illuminate\Testing\TestResponse;
use Ivandzb\CrudKit\Render\Quasar\QuasarRenderer;
use Tests\TestCase;

class GeneratedCrudRelationsTest extends TestCase
{
    use RefreshDatabase;

    private array $controllers = [];

    protected function setUp(): void
    {
        parent::setUp();
        config(['access.jwt.secret' => str_repeat('related-crud-', 16)]);
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

    private function draft(string $table, string $mode = 'new'): array
    {
        $name = 'RelationUiTest'.bin2hex(random_bytes(6)).'Controller';
        $this->controllers[] = $name;

        return $this->postJson('/administracion/programas?crud=access-generador&action=create', [
            'controller_name' => $name, 'title' => ucfirst($table), 'active' => 0, 'program_type' => 'crud',
            'table_mode' => $mode, 'table_name' => $table, 'auto_detect_fields' => false,
        ])->assertOk()->json('Record');
    }

    private function field(int $program, string $name, string $type = 'string', array $extra = []): TestResponse
    {
        return $this->postJson('/administracion/campos-programa?crud=access-campos&action=create', $extra + [
            'program_id' => $program, 'column_name' => $name, 'label' => $name === 'cliente_id' ? 'Cliente' : ucfirst($name), 'field_type' => $type,
            'required' => 1, 'max_length' => 150, 'position' => 0,
        ]);
    }

    private function activate(array $program, bool $active = true): void
    {
        $row = DB::table('generated_programs')->find($program['id']);
        $this->postJson('/administracion/programas?crud=access-generador&action=update', [
            'id' => $row->id, 'revision' => $row->revision, 'title' => $row->title, 'active' => (int) $active,
        ])->assertOk();
    }

    private function bind(array $program, string $route): int
    {
        $this->postJson('/administracion/programas/preparar', ['program_id' => $program['id']])->assertOk();
        $this->activate($program);
        $this->postJson('/administracion/registro-rutas?crud=access-programas&action=create', [
            'label' => $route, 'name' => 'relations.'.$route, 'uri' => '/aplicaciones/rel-'.$route, 'http_method' => 'GET|POST',
            'program' => 'controller:'.$program['action'], 'program_parameters' => '{}', 'active' => 1,
        ])->assertOk();

        return $this->postJson('/administracion/menu?crud=access-menu&action=create', [
            'label' => $route, 'parent_id' => 50, 'active' => 1, 'is_public' => 0, 'migration_enabled' => 1,
            'route_name' => 'relations.'.$route, 'route_parameters' => '{}',
        ])->assertOk()->json('Record.id');
    }

    private function operation(array $program, string $route, string $action, array $values = []): TestResponse
    {
        return $this->postJson('/aplicaciones/rel-'.$route.'?crud=generated-program-'.$program['id'].'&action='.$action, $values);
    }

    private function relation(array $parent, int $menu, array $extra = []): array
    {
        return $extra + ['related_program_id' => $parent['id'], 'related_menu_id' => $menu, 'related_label' => 'nombre'];
    }

    private function setupRelation(bool $required = true, bool $existingParent = false): array
    {
        $this->login();
        if ($existingParent) {
            Schema::create('relation_clients', function (Blueprint $table): void {
                $table->id();
                $table->string('nombre');
                $table->string('private_note')->default('Información privada');
            });
        }
        $parent = $this->draft($existingParent ? 'relation_clients' : 'relation_clientes', $existingParent ? 'existing' : 'new');
        $this->field($parent['id'], 'nombre')->assertOk();
        $parentMenu = $this->bind($parent, 'clientes');
        $parentRecord = $this->operation($parent, 'clientes', 'create', ['nombre' => 'Cliente ABC'])->assertOk()->json('Record');
        $child = $this->draft('relation_pedidos');
        $this->field($child['id'], 'descripcion')->assertOk();
        $this->field($child['id'], 'cliente_id', 'relation', $this->relation($parent, $parentMenu, ['required' => (int) $required]))->assertOk();
        $childMenu = $this->bind($child, 'pedidos');

        return [$parent, $child, $parentMenu, $childMenu, $parentRecord];
    }

    public function test_related_field_uses_autocomplete_and_preserves_id_and_display_text_on_create_edit_and_list(): void
    {
        [$parent, $child, $parentMenu, $childMenu, $client] = $this->setupRelation();
        $this->get('/aplicaciones/rel-pedidos')->assertOk()->assertSee('autocomplete');
        $this->operation($child, 'pedidos', 'autocomplete', ['field' => 'cliente_id', 'term' => 'ABC'])
            ->assertOk()->assertJsonPath('0.id', (string) $client['id'])->assertJsonPath('0.label', 'Cliente ABC');
        $record = $this->operation($child, 'pedidos', 'create', ['descripcion' => 'Pedido', 'cliente_id' => $client['id']])
            ->assertOk()->assertJsonPath('Record.cliente_id__text', 'Cliente ABC')->json('Record');
        $record['descripcion'] = 'Pedido editado';
        $this->operation($child, 'pedidos', 'update', $record)->assertOk()->assertJsonPath('Record.cliente_id', (string) $client['id']);
        $this->operation($child, 'pedidos', 'list')->assertOk()->assertJsonPath('Records.0.cliente_id__text', 'Cliente ABC');
        $foreign = Schema::getForeignKeys('app_data_relation_pedidos');
        $this->assertCount(1, $foreign);
        $this->assertSame(['cliente_id'], $foreign[0]['columns']);
        $this->assertSame('app_data_relation_clientes', $foreign[0]['foreign_table']);
    }

    public function test_view_access_is_required_in_both_menus_and_lookup_never_grants_write_permissions(): void
    {
        [$parent, $child, $parentMenu, $childMenu, $client] = $this->setupRelation();
        $user = $this->login(false);
        $this->operation($child, 'pedidos', 'autocomplete', ['field' => 'cliente_id', 'term' => 'Cliente'])->assertForbidden();
        DB::table('menu_grants')->insert(['user_id' => $user->id, 'menu_item_id' => $childMenu, 'can_view' => true]);
        $this->get('/aplicaciones/rel-pedidos')->assertForbidden();
        $this->operation($child, 'pedidos', 'autocomplete', ['field' => 'cliente_id', 'term' => 'Cliente'])->assertForbidden();
        DB::table('menu_grants')->insert(['user_id' => $user->id, 'menu_item_id' => $parentMenu, 'can_view' => true]);
        $this->operation($child, 'pedidos', 'autocomplete', ['field' => 'cliente_id', 'term' => 'Cliente'])->assertOk();
        $this->operation($child, 'pedidos', 'list')->assertOk();
        $this->operation($child, 'pedidos', 'create', ['descripcion' => 'Ataque', 'cliente_id' => $client['id']])->assertForbidden();
        DB::table('menu_grants')->where('user_id', $user->id)->where('menu_item_id', $childMenu)->update(['can_create' => true]);
        $this->operation($child, 'pedidos', 'create', ['descripcion' => 'Permitido', 'cliente_id' => $client['id']])->assertOk();
        DB::table('menu_grants')->where('user_id', $user->id)->where('menu_item_id', $parentMenu)->update(['can_view' => false]);
        $this->operation($child, 'pedidos', 'create', ['descripcion' => 'Revocado', 'cliente_id' => $client['id'], 'related_menu_id' => $childMenu])->assertForbidden();
    }

    public function test_nonexistent_deleted_and_unselected_values_are_rejected_by_the_server(): void
    {
        [$parent, $child, $parentMenu, $childMenu, $client] = $this->setupRelation();
        foreach ([999999, 'Cliente ABC', '1 OR 1=1', null, 0, -1] as $invalid) {
            $this->operation($child, 'pedidos', 'create', ['descripcion' => 'No guardar', 'cliente_id' => $invalid])->assertUnprocessable();
        }
        DB::table('app_data_relation_clientes')->where('id', $client['id'])->update(['deleted_at' => now()]);
        $this->operation($child, 'pedidos', 'autocomplete', ['field' => 'cliente_id', 'term' => 'Cliente'])->assertOk()->assertExactJson([]);
        $this->operation($child, 'pedidos', 'create', ['descripcion' => 'Eliminado', 'cliente_id' => $client['id']])->assertUnprocessable();
        $this->assertDatabaseCount('app_data_relation_pedidos', 0);
    }

    public function test_optional_relation_accepts_null_but_still_rejects_invalid_nonnull_ids(): void
    {
        [$parent, $child] = $this->setupRelation(false);
        $this->operation($child, 'pedidos', 'create', ['descripcion' => 'Sin cliente', 'cliente_id' => null])
            ->assertOk()->assertJsonPath('Record.cliente_id', null)->assertJsonPath('Record.cliente_id__text', '');
        $this->operation($child, 'pedidos', 'create', ['descripcion' => 'Inválido', 'cliente_id' => 99999])->assertUnprocessable();
    }

    public function test_search_is_bounded_escaped_and_cannot_select_arbitrary_tables_or_fields(): void
    {
        [$parent, $child] = $this->setupRelation();
        for ($index = 0; $index < 25; $index++) {
            DB::table('app_data_relation_clientes')->insert(['nombre' => 'Cliente '.$index]);
        }
        DB::table('app_data_relation_clientes')->insert(['nombre' => 'Precio 100%_real']);
        $this->operation($child, 'pedidos', 'autocomplete', ['field' => 'cliente_id', 'term' => 'Cliente'])->assertOk()->assertJsonCount(20);
        $this->operation($child, 'pedidos', 'autocomplete', ['field' => 'cliente_id', 'term' => '%_'])->assertOk()->assertJsonCount(1);
        $this->operation($child, 'pedidos', 'autocomplete', ['field' => 'cliente_id', 'term' => "' OR 1=1 --"])->assertOk()->assertExactJson([]);
        $this->operation($child, 'pedidos', 'autocomplete', ['field' => 'descripcion', 'term' => 'Cliente'])->assertUnprocessable();
        $this->operation($child, 'pedidos', 'autocomplete', ['field' => 'cliente_id', 'term' => str_repeat('x', 101)])->assertUnprocessable();
        $this->operation($child, 'pedidos', 'autocomplete', ['field' => 'cliente_id', 'term' => 'ABC', 'table' => 'users', 'related_label' => 'password'])
            ->assertOk()->assertJsonPath('0.label', 'Cliente ABC');
    }

    public function test_only_configured_text_columns_and_correct_menu_bindings_can_define_a_relation(): void
    {
        [$parent, $child, $parentMenu, $childMenu] = $this->setupRelation(true, true);
        $draft = $this->draft('relation_extra');
        $this->field($draft['id'], 'cliente_id', 'relation', $this->relation($parent, $childMenu))->assertUnprocessable();
        foreach (['private_note', 'password', 'id', 'nombre;DROP TABLE users'] as $column) {
            $this->field($draft['id'], 'cliente_id', 'relation', $this->relation($parent, $parentMenu, ['related_label' => $column]))->assertUnprocessable();
        }
        $this->field($draft['id'], 'cliente_id', 'relation')->assertUnprocessable();
        $this->field($draft['id'], 'cliente_id', 'relation', $this->relation($parent, $parentMenu))->assertOk();
        $this->operation($child, 'pedidos', 'autocomplete', ['field' => 'cliente_id', 'term' => 'Cliente'])->assertOk()->assertDontSee('Información privada');
    }

    public function test_related_catalog_cannot_be_deleted_while_referenced_by_active_records(): void
    {
        [$parent, $child, $parentMenu, $childMenu, $client] = $this->setupRelation();
        $record = $this->operation($child, 'pedidos', 'create', ['descripcion' => 'Pedido', 'cliente_id' => $client['id']])->assertOk()->json('Record');
        $this->operation($parent, 'clientes', 'delete', $client)->assertUnprocessable();
        $this->assertNull(DB::table('app_data_relation_clientes')->where('id', $client['id'])->value('deleted_at'));
        $this->operation($child, 'pedidos', 'delete', $record)->assertOk();
        $this->operation($parent, 'clientes', 'delete', $client)->assertOk();
    }

    public function test_hard_deletion_preserves_references_from_historical_child_records(): void
    {
        [$parent, $child, $parentMenu, $childMenu, $client] = $this->setupRelation(true, true);
        $record = $this->operation($child, 'pedidos', 'create', ['descripcion' => 'Histórico', 'cliente_id' => $client['id']])->assertOk()->json('Record');
        $this->operation($child, 'pedidos', 'delete', $record)->assertOk();
        $this->operation($parent, 'clientes', 'delete', $client)->assertUnprocessable()->assertSee('relaciones vigentes', false);
        $this->assertDatabaseHas('relation_clients', ['id' => $client['id'], 'nombre' => 'Cliente ABC']);
    }

    public function test_existing_integer_columns_can_be_configured_as_relations_without_altering_the_table(): void
    {
        $this->login();
        $parent = $this->draft('relation_clientes');
        $this->field($parent['id'], 'nombre')->assertOk();
        $parentMenu = $this->bind($parent, 'clientes');
        $client = $this->operation($parent, 'clientes', 'create', ['nombre' => 'Cliente existente'])->assertOk()->json('Record');
        $child = $this->draft('relation_pedidos');
        $field = $this->field($child['id'], 'cliente_id', 'integer')->assertOk()->json('Record');
        $this->bind($child, 'pedidos');
        $this->operation($child, 'pedidos', 'create', ['cliente_id' => $client['id']])->assertOk();
        $signature = app(GeneratedCrud::class)->signature('app_data_relation_pedidos');
        $values = array_merge($field, $this->relation($parent, $parentMenu), ['field_type' => 'relation']);
        $url = '/administracion/campos-programa?crud=access-campos&action=update';
        $this->postJson($url, $values)->assertUnprocessable();
        $this->activate($child, false);
        $this->postJson($url, $values)->assertOk();
        $this->assertSame($signature, app(GeneratedCrud::class)->signature('app_data_relation_pedidos'));
        $this->activate($child);
        $this->operation($child, 'pedidos', 'list')->assertOk()->assertJsonPath('Records.0.cliente_id__text', 'Cliente existente');
    }

    public function test_existing_orphans_prevent_relation_configuration_and_preserve_the_original_field(): void
    {
        $this->login();
        $parent = $this->draft('relation_clientes');
        $this->field($parent['id'], 'nombre')->assertOk();
        $parentMenu = $this->bind($parent, 'clientes');
        $child = $this->draft('relation_pedidos');
        $field = $this->field($child['id'], 'cliente_id', 'integer')->assertOk()->json('Record');
        $this->bind($child, 'pedidos');
        $this->operation($child, 'pedidos', 'create', ['cliente_id' => 99999])->assertOk();
        $this->activate($child, false);
        $this->postJson('/administracion/campos-programa?crud=access-campos&action=update', array_merge($field, $this->relation($parent, $parentMenu), ['field_type' => 'relation']))->assertUnprocessable();
        $this->assertDatabaseHas('generated_program_fields', ['id' => $field['id'], 'field_type' => 'integer']);
    }

    public function test_parent_disable_revoke_or_reassigned_menu_blocks_the_lookup_even_for_administrators(): void
    {
        [$parent, $child, $parentMenu] = $this->setupRelation();
        DB::table('menu_items')->where('id', $parentMenu)->update(['migration_enabled' => false]);
        $this->operation($child, 'pedidos', 'autocomplete', ['field' => 'cliente_id', 'term' => 'Cliente'])->assertForbidden();
        DB::table('menu_items')->where('id', $parentMenu)->update(['migration_enabled' => true]);
        $this->activate($parent, false);
        $this->operation($child, 'pedidos', 'autocomplete', ['field' => 'cliente_id', 'term' => 'Cliente'])->assertForbidden();
    }

    public function test_related_lookup_cookie_requests_require_csrf(): void
    {
        [$parent, $child] = $this->setupRelation();
        $admin = User::whereJsonContains('erp_roles', 'administrador')->firstOrFail();
        $token = app(JwtTokens::class)->issue($admin)['token'];
        $this->flushHeaders();
        $this->app->instance('env', 'local');
        $this->withCookie(config('access.jwt.cookie'), $token)
            ->post('/aplicaciones/rel-pedidos?crud=generated-program-'.$child['id'].'&action=autocomplete', ['field' => 'cliente_id', 'term' => 'Cliente'])->assertStatus(419);
    }

    public function test_relation_defaults_are_provided_by_the_designer_and_require_administration_permissions(): void
    {
        [$parent, $child, $parentMenu] = $this->setupRelation();
        $this->postJson('/administracion/campos-programa?crud=access-campos&action=relationDefaults', ['related_program_id' => $parent['id']])
            ->assertOk()->assertJsonPath('Record.related_menu_id', $parentMenu)->assertJsonPath('Record.related_label', 'nombre');
        $user = $this->login(false);
        DB::table('option_grants')->insert(['user_id' => $user->id, 'module' => 'menuaplic', 'file' => 'mantmenu', 'option_id' => 1, 'can_read' => true]);
        $this->postJson('/administracion/campos-programa?crud=access-campos&action=relationDefaults', ['related_program_id' => $parent['id']])->assertForbidden();
    }

    public function test_related_schema_changes_and_menu_reassignment_cannot_redirect_the_lookup(): void
    {
        [$parent, $child, $parentMenu] = $this->setupRelation();
        DB::table('menu_items')->where('id', $parentMenu)->update(['route_name' => 'relations.pedidos']);
        $this->operation($child, 'pedidos', 'autocomplete', ['field' => 'cliente_id', 'term' => 'Cliente'])->assertUnprocessable();
        DB::table('menu_items')->where('id', $parentMenu)->update(['route_name' => 'relations.clientes']);
        Schema::table('app_data_relation_clientes', fn (Blueprint $table) => $table->string('extra')->nullable());
        $this->operation($child, 'pedidos', 'autocomplete', ['field' => 'cliente_id', 'term' => 'Cliente'])->assertUnprocessable();
        $this->assertDatabaseCount('app_data_relation_pedidos', 0);
    }

    public function test_related_ui_can_supply_isolated_autocomplete_fixtures(): void
    {
        [$parent, $child, $parentMenu, $childMenu, $client] = $this->setupRelation();
        $this->operation($child, 'pedidos', 'create', ['descripcion' => 'Pedido UI', 'cliente_id' => $client['id']])->assertOk();
        $fixture = ['related_program_id' => $child['id']];
        (new \ReflectionProperty(QuasarRenderer::class, 'assetsWritten'))->setValue(null, false);
        $fixture['related-admin'] = $this->get('/aplicaciones/rel-pedidos')->assertOk()->getContent();
        $fixture['related-admin_list'] = $this->operation($child, 'pedidos', 'list')->assertOk()->json();
        $fixture['related_options'] = $this->operation($child, 'pedidos', 'autocomplete', ['field' => 'cliente_id', 'term' => 'Cliente'])->assertOk()->json();
        $user = $this->login(false);
        DB::table('menu_grants')->insert([
            ['user_id' => $user->id, 'menu_item_id' => $childMenu, 'can_view' => true],
            ['user_id' => $user->id, 'menu_item_id' => $parentMenu, 'can_view' => true],
        ]);
        (new \ReflectionProperty(QuasarRenderer::class, 'assetsWritten'))->setValue(null, false);
        $fixture['related-reader'] = $this->get('/aplicaciones/rel-pedidos')->assertOk()->getContent();
        $fixture['related-reader_list'] = $this->operation($child, 'pedidos', 'list')->assertOk()->json();
        if (getenv('ERP_CAPTURE_UI') === '1') {
            File::ensureDirectoryExists(base_path('.runtime/tests'));
            File::put(base_path('.runtime/tests/generated-relations-ui.json'), json_encode($fixture, JSON_THROW_ON_ERROR));
        }
    }
}
