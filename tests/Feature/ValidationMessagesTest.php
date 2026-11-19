<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\Auth\JwtTokens;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Testing\TestResponse;
use Ivandzb\CrudKit\Render\Quasar\QuasarRenderer;
use Tests\TestCase;

class ValidationMessagesTest extends TestCase
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

    public function test_reserved_columns_explain_the_reason_and_how_to_correct_it(): void
    {
        $this->login();
        $program = $this->draft();
        $rejected = $this->field($program['id'], 'id', 'integer')->assertUnprocessable()->assertJsonPath('Errors.column_name',
            'El campo «id» lo administra automáticamente el generador. No debe registrarlo como campo editable.');
        $this->field($program['id'], 'created_at')->assertUnprocessable()->assertJsonPath('Errors.column_name',
            'El campo «created_at» lo administra automáticamente el sistema para auditoría o control de cambios. No debe registrarlo manualmente.');
        $this->field($program['id'], 'password')->assertUnprocessable()->assertJsonPath('Errors.column_name',
            'El nombre «password» está reservado para seguridad o funcionamiento del sistema. Elija otro nombre de columna.');
        $this->assertDatabaseCount('generated_program_fields', 0);
        if (getenv('ERP_CAPTURE_UI') === '1') {
            (new \ReflectionProperty(QuasarRenderer::class, 'assetsWritten'))->setValue(null, false);
            $fixture = ['validation-fields' => $this->get('/administracion/campos-programa?program_id='.$program['id'])->assertOk()->getContent(),
                'validation-fields_list' => $this->postJson('/administracion/campos-programa?crud=access-campos&action=list')->assertOk()->json(),
                'validation_error' => $rejected->json()];
            File::ensureDirectoryExists(base_path('.runtime/tests'));
            File::put(base_path('.runtime/tests/validation-ui.json'), json_encode($fixture, JSON_THROW_ON_ERROR));
        }
    }

    public function test_invalid_and_duplicate_column_names_have_actionable_spanish_messages(): void
    {
        $this->login();
        $program = $this->draft();
        $this->field($program['id'], 'Nombre Campo')->assertUnprocessable()->assertJsonPath('Errors.column_name',
            'Use letras minúsculas, números y guion bajo en el nombre de columna. Comience con una letra; por ejemplo nombre_cliente.');
        $this->field($program['id'], 'nombre__text')->assertUnprocessable()->assertJsonPath('Errors.column_name',
            'El sufijo __text está reservado para mostrar el texto de los autocomplete. Elija otro nombre de columna.');
        $this->field($program['id'])->assertOk();
        $this->field($program['id'])->assertUnprocessable()->assertJsonPath('Errors.column_name',
            'Esta columna ya está configurada en el programa. Edite el campo existente en lugar de agregarlo nuevamente.');
    }

    public function test_controller_names_show_a_valid_example(): void
    {
        $this->login();
        $this->postJson('/administracion/programas?crud=access-generador&action=create', [
            'controller_name' => 'bad_name', 'title' => 'Programa', 'program_type' => 'page', 'active' => 0,
        ])->assertUnprocessable()->assertJsonPath('Errors.controller_name',
            'Escriba un nombre que comience con mayúscula y termine en Controller, por ejemplo PruebaController, sin espacios ni guiones.');
    }

    public function test_generated_value_errors_use_the_label_configured_by_the_administrator(): void
    {
        $this->login();
        $program = $this->draft();
        $this->field($program['id'], 'importe', 'decimal', ['label' => 'Valor del pedido'])->assertOk();
        $this->prepare($program['id'])->assertOk();
        $this->bind($program);
        $response = $this->operation($program['id'], 'create', ['importe' => 'no-numérico'])->assertUnprocessable();
        $this->assertStringContainsString('Ingrese un número válido en «Valor del pedido».', $response->json('Errors.importe'));
        $this->assertStringNotContainsString('The ', $response->json('Message'));
    }

    public function test_request_validation_and_multiple_error_summaries_are_translated(): void
    {
        $this->login();
        $this->postJson('/administracion/programas/preparar', [])->assertUnprocessable()
            ->assertJsonPath('errors.program_id.0', 'Complete el campo «Programa CRUD».');
        $response = $this->postJson('/administracion/campos-programa?crud=access-campos&action=autocomplete', [
            'field' => 'incorrect', 'term' => ['invalid'],
        ])->assertUnprocessable();
        $this->assertStringContainsString('(y 2 errores adicionales)', $response->json('message'));
        $this->assertStringNotContainsString('The ', $response->getContent());
        $this->assertStringNotContainsString('(and ', $response->getContent());
    }

    public function test_every_builtin_validation_rule_has_a_spanish_translation_without_fallback(): void
    {
        $rules = require base_path('vendor/laravel/framework/src/Illuminate/Translation/lang/en/validation.php');
        unset($rules['custom'], $rules['attributes']);
        foreach (array_keys(Arr::dot($rules)) as $key) {
            $this->assertTrue(app('translator')->hasForLocale('validation.'.$key, 'es'), 'Falta traducción para '.$key);
        }
    }
}
