<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\Auth\JwtTokens;
use App\Support\Menu\GeneratedCrud;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Testing\TestResponse;
use Ivandzb\CrudKit\Render\Quasar\QuasarRenderer;
use Tests\TestCase;

class GeneratedCrudDependenciesTest extends TestCase
{
    use RefreshDatabase;

    private array $controllers = [];

    protected function setUp(): void
    {
        parent::setUp();
        config(['access.jwt.secret' => str_repeat('dependent-crud-', 14)]);
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

    private function draft(string $name): array
    {
        $class = 'DependentUiTest'.bin2hex(random_bytes(6)).'Controller';
        $this->controllers[] = $class;

        return $this->postJson('/administracion/programas?crud=access-generador&action=create', [
            'controller_name' => $class, 'title' => ucfirst($name), 'program_type' => 'crud',
            'table_mode' => 'new', 'table_name' => 'dep_'.$name, 'active' => 0,
        ])->assertOk()->json('Record');
    }

    private function field(array $program, string $name, string $type = 'string', array $extra = []): array
    {
        return $this->postJson('/administracion/campos-programa?crud=access-campos&action=create', $extra + [
            'program_id' => $program['id'], 'column_name' => $name, 'label' => ucfirst($name),
            'field_type' => $type, 'required' => 1, 'max_length' => 150, 'position' => 0,
        ])->assertOk()->json('Record');
    }

    private function activate(array $program, bool $active = true): void
    {
        $row = DB::table('generated_programs')->find($program['id']);
        $this->postJson('/administracion/programas?crud=access-generador&action=update', [
            'id' => $row->id, 'revision' => $row->revision, 'title' => $row->title, 'active' => (int) $active,
        ])->assertOk();
    }

    private function bind(array $program, string $name): int
    {
        $this->postJson('/administracion/programas/preparar', ['program_id' => $program['id']])->assertOk();
        $this->activate($program);
        $this->postJson('/administracion/registro-rutas?crud=access-programas&action=create', [
            'label' => $name, 'name' => 'dep.'.$name, 'uri' => '/aplicaciones/dep-'.$name, 'http_method' => 'GET|POST',
            'program' => 'controller:'.$program['action'], 'program_parameters' => '{}', 'active' => 1,
        ])->assertOk();

        return $this->postJson('/administracion/menu?crud=access-menu&action=create', [
            'label' => $name, 'parent_id' => 50, 'active' => 1, 'is_public' => 0, 'migration_enabled' => 1,
            'route_name' => 'dep.'.$name, 'route_parameters' => '{}',
        ])->assertOk()->json('Record.id');
    }

    private function operation(array $program, string $name, string $action, array $values = []): TestResponse
    {
        return $this->postJson('/aplicaciones/dep-'.$name.'?crud=generated-program-'.$program['id'].'&action='.$action, $values);
    }

    private function relation(array $program, int $menu, array $extra = []): array
    {
        return $extra + ['related_program_id' => $program['id'], 'related_menu_id' => $menu, 'related_label' => 'nombre'];
    }

    private function setupChain(bool $dependencies = true): array
    {
        $this->login();
        $departments = $this->draft('departamentos');
        $this->field($departments, 'nombre');
        $this->field($departments, 'pais_id', 'integer');
        $departmentMenu = $this->bind($departments, 'departamentos');
        $a = $this->operation($departments, 'departamentos', 'create', ['nombre' => 'Departamento A', 'pais_id' => 1])->assertOk()->json('Record');
        $b = $this->operation($departments, 'departamentos', 'create', ['nombre' => 'Departamento B', 'pais_id' => 2])->assertOk()->json('Record');
        $c = $this->operation($departments, 'departamentos', 'create', ['nombre' => 'Departamento C', 'pais_id' => 1])->assertOk()->json('Record');
        $cities = $this->draft('ciudades');
        $this->field($cities, 'nombre');
        $this->field($cities, 'departamento_id', 'relation', $this->relation($departments, $departmentMenu));
        $cityMenu = $this->bind($cities, 'ciudades');
        $cityA = $this->operation($cities, 'ciudades', 'create', ['nombre' => 'Ciudad A', 'departamento_id' => $a['id']])->assertOk()->json('Record');
        $cityB = $this->operation($cities, 'ciudades', 'create', ['nombre' => 'Ciudad B', 'departamento_id' => $b['id']])->assertOk()->json('Record');
        $cityC = $this->operation($cities, 'ciudades', 'create', ['nombre' => 'Ciudad C', 'departamento_id' => $c['id']])->assertOk()->json('Record');
        $owner = $this->draft('ubicaciones');
        $this->field($owner, 'pais_id', 'integer');
        $departmentField = $this->field($owner, 'departamento_id', 'relation', $this->relation($departments, $departmentMenu,
            $dependencies ? ['depends_on' => 'pais_id', 'related_filter' => 'pais_id'] : []));
        $cityField = $this->field($owner, 'ciudad_id', 'relation', $this->relation($cities, $cityMenu,
            $dependencies ? ['depends_on' => 'departamento_id', 'related_filter' => 'departamento_id'] : []));
        $ownerMenu = $this->bind($owner, 'ubicaciones');

        return compact('departments', 'cities', 'owner', 'departmentMenu', 'cityMenu', 'ownerMenu', 'a', 'b', 'c', 'cityA', 'cityB', 'cityC', 'departmentField', 'cityField');
    }

    private function search(array $state, string $field, array $context, string $term = 'Ciudad'): TestResponse
    {
        return $this->operation($state['owner'], 'ubicaciones', 'autocomplete', [
            'field' => $field, 'term' => $term, 'lookup_context' => json_encode($context ?: (object) []),
        ]);
    }

    public function test_options_are_filtered_by_parent_and_ancestors_and_missing_context_returns_no_options(): void
    {
        $state = $this->setupChain();
        $this->search($state, 'ciudad_id', ['pais_id' => 1, 'departamento_id' => $state['a']['id']])
            ->assertOk()->assertJsonCount(1)->assertJsonPath('0.label', 'Ciudad A');
        $this->search($state, 'ciudad_id', ['pais_id' => 1, 'departamento_id' => $state['c']['id']])
            ->assertOk()->assertJsonPath('0.label', 'Ciudad C');
        $this->search($state, 'ciudad_id', [])->assertOk()->assertExactJson([]);
        $this->search($state, 'ciudad_id', ['departamento_id' => $state['a']['id']])->assertOk()->assertExactJson([]);
        $this->search($state, 'ciudad_id', ['pais_id' => 1, 'departamento_id' => $state['a']['id']], (string) $state['cityB']['id'])
            ->assertOk()->assertExactJson([]);
        $this->search($state, 'departamento_id', ['pais_id' => 1], 'Departamento')->assertOk()->assertJsonCount(2);
    }

    public function test_save_and_update_reject_cross_group_values_even_with_forged_search_context(): void
    {
        $state = $this->setupChain();
        $wrong = ['pais_id' => 1, 'departamento_id' => $state['a']['id'], 'ciudad_id' => $state['cityB']['id'],
            'lookup_context' => '{"pais_id":2,"departamento_id":2}'];
        $this->operation($state['owner'], 'ubicaciones', 'create', $wrong)->assertUnprocessable();
        $this->operation($state['owner'], 'ubicaciones', 'create', ['pais_id' => 2, 'departamento_id' => $state['a']['id'], 'ciudad_id' => $state['cityA']['id']])->assertUnprocessable();
        $record = $this->operation($state['owner'], 'ubicaciones', 'create', [
            'pais_id' => 1, 'departamento_id' => $state['a']['id'], 'ciudad_id' => $state['cityA']['id'],
        ])->assertOk()->json('Record');
        $record['departamento_id'] = $state['c']['id'];
        $this->operation($state['owner'], 'ubicaciones', 'update', $record)->assertUnprocessable();
        $record['ciudad_id'] = $state['cityC']['id'];
        $this->operation($state['owner'], 'ubicaciones', 'update', $record)->assertOk();
        $this->assertDatabaseCount('app_data_dep_ubicaciones', 1);
    }

    public function test_context_is_typed_and_cannot_override_configured_filters_or_permissions(): void
    {
        $state = $this->setupChain();
        $this->search($state, 'ciudad_id', ['pais_id' => 2, 'departamento_id' => $state['a']['id']])->assertUnprocessable();
        $this->search($state, 'ciudad_id', ['pais_id' => '1 OR 1=1', 'departamento_id' => $state['a']['id']])->assertUnprocessable();
        $this->search($state, 'ciudad_id', ['pais_id' => 1, 'departamento_id' => $state['a']['id'], 'table' => 'users'])->assertUnprocessable();
        foreach (['[]', 'null', 'invalid', '{"pais_id":{}}'] as $context) {
            $this->operation($state['owner'], 'ubicaciones', 'autocomplete', ['field' => 'departamento_id', 'term' => 'Departamento', 'lookup_context' => $context])->assertUnprocessable();
        }
        $this->operation($state['owner'], 'ubicaciones', 'autocomplete', [
            'field' => 'ciudad_id', 'term' => 'Ciudad', 'lookup_context' => json_encode(['pais_id' => 1, 'departamento_id' => $state['a']['id']]),
            'related_filter' => 'pais_id', 'depends_on' => 'otro', 'table' => 'users',
        ])->assertOk()->assertJsonCount(1)->assertJsonPath('0.label', 'Ciudad A');
    }

    public function test_all_menu_permissions_and_read_only_rules_are_preserved(): void
    {
        $state = $this->setupChain();
        $user = $this->login(false);
        foreach (['ownerMenu', 'cityMenu'] as $key) {
            DB::table('menu_grants')->insert(['user_id' => $user->id, 'menu_item_id' => $state[$key], 'can_view' => true]);
        }
        $context = ['pais_id' => 1, 'departamento_id' => $state['a']['id']];
        $this->search($state, 'ciudad_id', $context)->assertForbidden();
        DB::table('menu_grants')->insert(['user_id' => $user->id, 'menu_item_id' => $state['departmentMenu'], 'can_view' => true]);
        $this->search($state, 'ciudad_id', $context)->assertOk();
        $this->operation($state['owner'], 'ubicaciones', 'create', $context + ['ciudad_id' => $state['cityA']['id']])->assertForbidden();
        DB::table('menu_items')->where('id', $state['departmentMenu'])->update(['migration_enabled' => false]);
        $this->search($state, 'ciudad_id', $context)->assertForbidden();
    }

    public function test_catalog_updates_cannot_invalidate_saved_dependent_combinations(): void
    {
        $state = $this->setupChain();
        $this->operation($state['owner'], 'ubicaciones', 'create', [
            'pais_id' => 1, 'departamento_id' => $state['a']['id'], 'ciudad_id' => $state['cityA']['id'],
        ])->assertOk();
        $department = $state['a'];
        $department['pais_id'] = 2;
        $this->operation($state['departments'], 'departamentos', 'update', $department)->assertUnprocessable();
        $city = $state['cityA'];
        $city['departamento_id'] = $state['c']['id'];
        $this->operation($state['cities'], 'ciudades', 'update', $city)->assertUnprocessable();
        $city['departamento_id'] = $state['a']['id'];
        $city['nombre'] = 'Nombre actualizado';
        $this->operation($state['cities'], 'ciudades', 'update', $city)->assertOk();
    }

    public function test_definition_rejects_missing_fields_incompatible_columns_and_cycles(): void
    {
        $state = $this->setupChain();
        $this->activate($state['owner'], false);
        $url = '/administracion/campos-programa?crud=access-campos&action=update';
        $base = $state['departmentField'];
        foreach ([
            ['depends_on' => 'missing', 'related_filter' => 'pais_id'],
            ['depends_on' => 'departamento_id', 'related_filter' => 'pais_id'],
            ['depends_on' => 'pais_id', 'related_filter' => 'nombre'],
            ['depends_on' => 'pais_id', 'related_filter' => 'private_column'],
            ['depends_on' => 'pais_id', 'related_filter' => 'pais_id;DROP'],
        ] as $change) {
            $this->postJson($url, array_merge($base, $change))->assertUnprocessable();
        }
        $this->postJson($url, array_merge($base, ['depends_on' => 'ciudad_id', 'related_filter' => 'pais_id']))->assertUnprocessable();
        $this->assertDatabaseHas('generated_program_fields', ['id' => $base['id'], 'depends_on' => 'pais_id', 'related_filter' => 'pais_id']);
    }

    public function test_dependencies_can_be_added_to_inactive_programs_without_schema_changes_but_not_over_invalid_data(): void
    {
        $state = $this->setupChain(false);
        $this->operation($state['owner'], 'ubicaciones', 'create', [
            'pais_id' => 2, 'departamento_id' => $state['a']['id'], 'ciudad_id' => $state['cityA']['id'],
        ])->assertOk();
        $signature = app(GeneratedCrud::class)->signature('app_data_dep_ubicaciones');
        $this->activate($state['owner'], false);
        $values = $state['departmentField'] + [];
        $values['depends_on'] = 'pais_id';
        $values['related_filter'] = 'pais_id';
        $this->postJson('/administracion/campos-programa?crud=access-campos&action=update', $values)->assertUnprocessable();
        $this->assertSame($signature, app(GeneratedCrud::class)->signature('app_data_dep_ubicaciones'));
        $this->assertDatabaseHas('generated_program_fields', ['id' => $values['id'], 'depends_on' => null]);
    }

    public function test_false_and_zero_are_valid_parent_values_not_missing_context(): void
    {
        $this->login();
        $catalog = $this->draft('opciones');
        $this->field($catalog, 'nombre');
        $this->field($catalog, 'activo', 'boolean');
        $catalogMenu = $this->bind($catalog, 'opciones');
        $this->operation($catalog, 'opciones', 'create', ['nombre' => 'Inactiva', 'activo' => 0])->assertOk();
        $this->operation($catalog, 'opciones', 'create', ['nombre' => 'Activa', 'activo' => 1])->assertOk();
        $owner = $this->draft('banderas');
        $this->field($owner, 'activo', 'boolean');
        $this->field($owner, 'opcion_id', 'relation', $this->relation($catalog, $catalogMenu, ['depends_on' => 'activo', 'related_filter' => 'activo']));
        $this->bind($owner, 'banderas');
        foreach ([false, 0, '0'] as $value) {
            $this->operation($owner, 'banderas', 'autocomplete', ['field' => 'opcion_id', 'term' => 'a', 'lookup_context' => json_encode(['activo' => $value])])
                ->assertOk()->assertJsonCount(1)->assertJsonPath('0.label', 'Inactiva');
        }
    }

    public function test_designer_autocomplete_is_scoped_to_the_selected_program_and_requires_administration(): void
    {
        $state = $this->setupChain();
        $url = '/administracion/campos-programa?crud=access-campos&action=autocomplete';
        $this->postJson($url, ['field' => 'depends_on', 'term' => 'pais', 'lookup_context' => json_encode(['program_id' => $state['owner']['id']])])
            ->assertOk()->assertJsonCount(1)->assertJsonPath('0.id', 'pais_id');
        $this->postJson($url, ['field' => 'related_filter', 'term' => 'departamento', 'lookup_context' => json_encode(['related_program_id' => $state['cities']['id']])])
            ->assertOk()->assertJsonPath('0.id', 'departamento_id');
        $this->postJson($url, ['field' => 'related_filter', 'term' => 'id', 'lookup_context' => '{"table":"users"}'])->assertUnprocessable();
        $this->login(false);
        $this->postJson($url, ['field' => 'depends_on', 'term' => 'pais', 'lookup_context' => json_encode(['program_id' => $state['owner']['id']])])->assertForbidden();
    }

    public function test_clearing_a_parent_dependency_clears_its_filter_definition(): void
    {
        $state = $this->setupChain();
        $this->activate($state['owner'], false);
        $field = $state['cityField'];
        $field['depends_on'] = null;
        $this->postJson('/administracion/campos-programa?crud=access-campos&action=update', $field)
            ->assertOk()->assertJsonPath('Record.depends_on', null)->assertJsonPath('Record.related_filter', null);
    }

    public function test_cookie_lookup_requires_csrf_and_related_catalogues_remain_protected(): void
    {
        $state = $this->setupChain();
        $admin = User::whereJsonContains('erp_roles', 'administrador')->firstOrFail();
        $token = app(JwtTokens::class)->issue($admin)['token'];
        $this->flushHeaders();
        $this->app->instance('env', 'local');
        $this->withCookie(config('access.jwt.cookie'), $token)->post('/aplicaciones/dep-ubicaciones?crud=generated-program-'.$state['owner']['id'].'&action=autocomplete', [
            'field' => 'ciudad_id', 'term' => 'Ciudad', 'lookup_context' => json_encode(['pais_id' => 1, 'departamento_id' => $state['a']['id']]),
        ])->assertStatus(419);
    }

    public function test_dependent_form_can_supply_browser_fixtures_with_initial_values(): void
    {
        $state = $this->setupChain();
        $this->operation($state['owner'], 'ubicaciones', 'create', [
            'pais_id' => 1, 'departamento_id' => $state['a']['id'], 'ciudad_id' => $state['cityA']['id'],
        ])->assertOk();
        (new \ReflectionProperty(QuasarRenderer::class, 'assetsWritten'))->setValue(null, false);
        $fixture = ['dependent_program_id' => $state['owner']['id'], 'dependent_state' => [
            'department_a' => $state['a']['id'], 'department_c' => $state['c']['id'],
            'city_a' => $state['cityA']['id'], 'city_c' => $state['cityC']['id'],
        ]];
        $fixture['dependent-admin'] = $this->get('/aplicaciones/dep-ubicaciones')->assertOk()->getContent();
        $fixture['dependent-admin_list'] = $this->operation($state['owner'], 'ubicaciones', 'list')->assertOk()->json();
        $user = $this->login(false);
        foreach (['ownerMenu', 'departmentMenu', 'cityMenu'] as $key) {
            DB::table('menu_grants')->insert(['user_id' => $user->id, 'menu_item_id' => $state[$key], 'can_view' => true]);
        }
        (new \ReflectionProperty(QuasarRenderer::class, 'assetsWritten'))->setValue(null, false);
        $fixture['dependent-reader'] = $this->get('/aplicaciones/dep-ubicaciones')->assertOk()->getContent();
        $fixture['dependent-reader_list'] = $this->operation($state['owner'], 'ubicaciones', 'list')->assertOk()->json();
        if (getenv('ERP_CAPTURE_UI') === '1') {
            File::ensureDirectoryExists(base_path('.runtime/tests'));
            File::put(base_path('.runtime/tests/generated-dependencies-ui.json'), json_encode($fixture, JSON_THROW_ON_ERROR));
        }
    }
}
