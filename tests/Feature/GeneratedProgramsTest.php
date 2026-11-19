<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\Auth\JwtTokens;
use App\Support\Ui\ErpPage;
use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Testing\TestResponse;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class GeneratedProgramsTest extends TestCase
{
    use RefreshDatabase;

    private array $controllers = [];

    protected function setUp(): void
    {
        parent::setUp();
        config(['access.jwt.secret' => str_repeat('generated-ui-', 14)]);
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

    private function controllerName(): string
    {
        $name = 'GeneratedUiTest'.bin2hex(random_bytes(6)).'Controller';
        $this->controllers[] = $name;

        return $name;
    }

    private function createProgram(array $changes = []): TestResponse
    {
        return $this->postJson('/administracion/programas?crud=access-generador&action=create', $changes + [
            'controller_name' => $this->controllerName(), 'title' => 'Programa creado desde ERP', 'content' => 'Contenido inicial', 'active' => 1,
        ]);
    }

    private function bind(array $program): int
    {
        $this->postJson('/administracion/registro-rutas?crud=access-programas&action=create', [
            'label' => 'Página nueva', 'name' => 'pagina.nueva', 'uri' => '/aplicaciones/pagina-nueva', 'http_method' => 'GET',
            'program' => 'controller:'.$program['action'], 'program_parameters' => '{}', 'active' => 1,
        ])->assertOk();

        return $this->postJson('/administracion/menu?crud=access-menu&action=create', [
            'label' => 'Página nueva', 'parent_id' => 50, 'active' => 1, 'is_public' => 0,
            'migration_enabled' => 1, 'route_name' => 'pagina.nueva', 'route_parameters' => '{}',
        ])->assertOk()->json('Record.id');
    }

    public function test_controller_is_generated_then_registered_and_associated_with_menu_entirely_through_the_interface(): void
    {
        $this->login();
        $program = $this->createProgram()->assertOk()->json('Record');
        $path = app_path('Http/Controllers/'.$program['controller_name'].'.php');
        $this->assertFileExists($path);
        $this->assertStringContainsString('public function index(Request $request, ErpPage $pages): Response', file_get_contents($path));
        $this->get('/administracion/registro-rutas')->assertOk()->assertSee($program['controller_name']);
        $menu = $this->bind($program);
        $this->get('/menu/'.$menu)->assertRedirect('/aplicaciones/pagina-nueva');
        $this->get('/aplicaciones/pagina-nueva')->assertOk()->assertSee('Programa creado desde ERP')->assertSee('Contenido inicial');
        $user = $this->login(false);
        $this->get('/aplicaciones/pagina-nueva')->assertForbidden();
        DB::table('menu_grants')->insert(['user_id' => $user->id, 'menu_item_id' => $menu, 'can_view' => true]);
        $this->get('/aplicaciones/pagina-nueva')->assertOk();
        $this->assertDatabaseHas('erp_access_events', ['event' => 'generated_program_created']);
    }

    public function test_title_and_content_are_updated_without_overwriting_controller_source_and_revisions_are_enforced(): void
    {
        $this->login();
        $program = $this->createProgram()->assertOk()->json('Record');
        $this->bind($program);
        $path = app_path('Http/Controllers/'.$program['controller_name'].'.php');
        $hash = hash_file('sha256', $path);
        $values = $program;
        $values['title'] = 'Título actualizado';
        $values['content'] = 'Contenido actualizado';
        $url = '/administracion/programas?crud=access-generador&action=update';
        $this->postJson($url, $values)->assertOk();
        $this->postJson($url, $values)->assertUnprocessable();
        $this->get('/aplicaciones/pagina-nueva')->assertOk()->assertSee('Título actualizado')->assertSee('Contenido actualizado');
        $this->assertSame($hash, hash_file('sha256', $path));
    }

    public function test_program_defaults_to_inactive_and_deactivation_blocks_existing_routes(): void
    {
        $this->login();
        $program = $this->postJson('/administracion/programas?crud=access-generador&action=create', [
            'controller_name' => $this->controllerName(), 'title' => 'Borrador', 'content' => 'Contenido',
        ])->assertOk()->assertJsonPath('Record.active', 0)->json('Record');
        $this->get('/administracion/registro-rutas')->assertOk()->assertDontSee($program['controller_name']);
        $program['active'] = 1;
        $program = $this->postJson('/administracion/programas?crud=access-generador&action=update', $program)->assertOk()->json('Record');
        $this->bind($program);
        $this->get('/aplicaciones/pagina-nueva')->assertOk();
        $this->postJson('/administracion/programas?crud=access-generador&action=delete', [
            'id' => $program['id'], 'revision' => $program['revision'],
        ])->assertOk();
        $this->get('/aplicaciones/pagina-nueva')->assertNotFound();
        $this->get('/')->assertOk()->assertDontSee('Página nueva');
        $this->assertFileExists(app_path('Http/Controllers/'.$program['controller_name'].'.php'));
    }

    public function test_invalid_names_and_existing_controllers_cannot_be_overwritten(): void
    {
        $this->login();
        foreach (['../AuthController', 'Ventas/PedidosController', 'App\\Http\\Controllers\\NuevoController', 'Controller', 'invalid', 'NuevoController;phpinfo()', 'Nuevo<script>Controller'] as $name) {
            $this->createProgram(['controller_name' => $name])->assertUnprocessable();
        }
        $path = app_path('Http/Controllers/AuthController.php');
        $hash = hash_file('sha256', $path);
        $this->createProgram(['controller_name' => 'AuthController'])->assertUnprocessable();
        $this->assertSame($hash, hash_file('sha256', $path));
        $program = $this->createProgram()->assertOk()->json('Record');
        $this->createProgram(['controller_name' => $program['controller_name']])->assertUnprocessable();
        $this->createProgram(['controller_name' => strtoupper(substr($program['controller_name'], 0, -10)).'Controller'])->assertUnprocessable();
        $this->assertDatabaseCount('generated_programs', 1);
    }

    public function test_content_is_data_and_is_never_interpreted_as_php_or_html(): void
    {
        $this->login();
        $content = '<?php echo "Injected"; ?><script>window.hacked=true</script>';
        $program = $this->createProgram(['title' => 'Texto seguro', 'content' => $content])->assertOk()->json('Record');
        $this->bind($program);
        $this->assertStringNotContainsString($content, file_get_contents(app_path('Http/Controllers/'.$program['controller_name'].'.php')));
        $this->get('/aplicaciones/pagina-nueva')->assertOk()->assertSee('\u003Cscript\u003Ewindow.hacked=true\u003C/script\u003E', false)->assertDontSee('<script>window.hacked=true</script>', false);
        $this->postJson('/administracion/registro-rutas?crud=access-programas&action=create', [
            'label' => 'No permitido', 'name' => 'pagina.guardar', 'uri' => '/aplicaciones/guardar', 'http_method' => 'POST',
            'program' => 'controller:'.$program['action'], 'program_parameters' => '{}', 'active' => 1,
        ])->assertUnprocessable();
    }

    public function test_generation_is_restricted_to_administrators_even_for_menu_managers(): void
    {
        $this->get('/administracion/programas')->assertRedirect('/login');
        $user = $this->login(false);
        DB::table('option_grants')->insert(['user_id' => $user->id, 'module' => 'menuaplic', 'file' => 'mantmenu', 'option_id' => 1, 'can_read' => true]);
        $this->assertTrue($user->can('menu.manage'));
        $this->createProgram()->assertForbidden();
        $this->get('/administracion/programas')->assertForbidden();
        $this->get('/administracion/menu')->assertOk()->assertDontSee('Crear programa');
        $this->assertDatabaseCount('generated_programs', 0);
    }

    public function test_generation_requires_csrf_with_cookie_authentication(): void
    {
        $admin = $this->login();
        $token = app(JwtTokens::class)->issue($admin)['token'];
        $this->flushHeaders();
        $this->app->instance('env', 'local');
        $this->withCookie(config('access.jwt.cookie'), $token)->post('/administracion/programas?crud=access-generador&action=create', [
            'controller_name' => $this->controllerName(), 'title' => 'Intento', 'content' => 'Contenido', 'active' => 1,
        ])->assertStatus(419);
        $this->assertDatabaseCount('generated_programs', 0);
    }

    public function test_file_and_database_record_are_removed_if_the_transaction_cannot_complete(): void
    {
        $this->login();
        $name = $this->controllerName();
        $reject = true;
        $failed = false;
        DB::listen(function (QueryExecuted $query) use (&$reject, &$failed): void {
            if ($reject && str_starts_with(strtolower($query->sql), 'insert') && str_contains($query->sql, 'erp_access_events')) {
                $failed = true;
                throw new \RuntimeException('Simulated audit failure');
            }
        });
        try {
            $this->createProgram(['controller_name' => $name])->assertUnprocessable();
        } finally {
            $reject = false;
        }
        $this->assertTrue($failed);
        $this->assertDatabaseCount('generated_programs', 0);
        $this->assertFileDoesNotExist(app_path('Http/Controllers/'.$name.'.php'));
    }

    public function test_generated_controller_rejects_execution_without_authorized_menu_context(): void
    {
        $this->login();
        $program = $this->createProgram()->assertOk()->json('Record');
        $class = 'App\\Http\\Controllers\\'.$program['controller_name'];
        $controller = new $class;
        $request = Request::create('/unmapped');
        $request->setUserResolver(fn () => auth()->user());
        $this->expectException(HttpException::class);
        $controller->index($request, app(ErpPage::class));
    }
}
