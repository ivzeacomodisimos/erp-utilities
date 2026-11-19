<?php

namespace App\Http\Controllers {
    use Illuminate\Http\JsonResponse;
    use Illuminate\Http\Request;

    class ManagedRouteExampleController extends Controller
    {
        public function index(Request $request, string $format = 'html'): JsonResponse
        {
            return response()->json(['user_id' => $request->user()->id, 'menu_id' => $request->attributes->get('erp.menu_id'), 'format' => $format]);
        }

        public function save(Request $request): JsonResponse
        {
            return response()->json(['saved' => true, 'menu_id' => $request->attributes->get('erp.menu_id')]);
        }

        public function report(Request $request, int $year): JsonResponse
        {
            return response()->json(['year' => $year]);
        }

        private function helper(): void {}
    }
}

namespace Tests\Feature {
    use App\Models\User;
    use App\Support\Auth\JwtTokens;
    use App\Support\Menu\ManagedApplicationRoutes;
    use Illuminate\Foundation\Testing\RefreshDatabase;
    use Illuminate\Support\Facades\DB;
    use Illuminate\Support\Facades\File;
    use Illuminate\Testing\TestResponse;
    use Symfony\Component\Finder\SplFileInfo;
    use Tests\TestCase;

    class ManagedApplicationRoutesTest extends TestCase
    {
        use RefreshDatabase;

        protected function setUp(): void
        {
            parent::setUp();
            config(['access.jwt.secret' => str_repeat('managed-routes-', 12)]);
            File::partialMock()->shouldReceive('allFiles')->andReturn([new SplFileInfo(__FILE__, '', 'ManagedRouteExampleController.php')]);
            DB::table('menu_items')->insert(['id' => 50, 'parent_id' => 0, 'label' => 'Aplicaciones', 'legacy_url' => '', 'active' => true]);
        }

        private function login(bool $admin = true): User
        {
            $user = User::factory()->create(['ldap_username' => fake()->unique()->userName(), 'ldap_guid' => bin2hex(random_bytes(16)),
                'erp_roles' => [$admin ? 'administrador' : 'usuario'], 'erp_active' => true, 'token_version' => 1]);
            $this->withToken(app(JwtTokens::class)->issue($user)['token']);

            return $user;
        }

        private function saveRoute(array $changes = []): TestResponse
        {
            return $this->postJson('/administracion/registro-rutas?crud=access-programas&action=create', $changes + [
                'label' => 'Consulta nueva', 'name' => 'ventas.nueva', 'uri' => '/ventas/nueva', 'http_method' => 'GET',
                'program' => 'controller:App\\Http\\Controllers\\ManagedRouteExampleController@index', 'program_parameters' => '{}', 'active' => 1,
            ]);
        }

        private function bindMenu(string $route = 'ventas.nueva'): int
        {
            return $this->postJson('/administracion/menu?crud=access-menu&action=create', [
                'label' => 'Mi programa', 'parent_id' => 50, 'active' => 1, 'is_public' => 0,
                'migration_enabled' => 1, 'route_name' => $route, 'route_parameters' => '{}',
            ])->assertOk()->json('Record.id');
        }

        public function test_a_typed_route_is_created_from_the_interface_then_associated_with_a_menu(): void
        {
            $admin = $this->login();
            $this->saveRoute()->assertOk();
            $this->getJson('/ventas/nueva')->assertForbidden();
            $this->get('/administracion/menu')->assertOk()->assertSee('ventas.nueva');
            $id = $this->bindMenu();
            $this->getJson('/ventas/nueva')->assertOk()->assertJsonPath('user_id', $admin->id)->assertJsonPath('menu_id', $id)->assertJsonPath('format', 'html');
            $this->get('/menu/'.$id)->assertRedirect('/ventas/nueva');
            $this->assertSame('/ventas/nueva', route('ventas.nueva', [], false));
            $this->get('/administracion/registro-rutas')->assertOk()->assertSee('Dirección URL')->assertSee('Programa a ejecutar');
            $this->assertDatabaseHas('erp_access_events', ['event' => 'access_programas_created']);
        }

        public function test_permissions_are_checked_after_route_creation_and_requests_cannot_forge_ids(): void
        {
            $admin = $this->login();
            $this->saveRoute()->assertOk();
            $id = $this->bindMenu();
            $user = $this->login(false);
            $this->getJson('/ventas/nueva?id_user='.$admin->id.'&id_menu=50')->assertForbidden();
            DB::table('menu_grants')->insert(['user_id' => $user->id, 'menu_item_id' => $id, 'can_view' => true]);
            $this->getJson('/ventas/nueva')->assertOk()->assertJsonPath('user_id', $user->id);
            DB::table('menu_items')->where('id', $id)->update(['migration_enabled' => false]);
            $this->getJson('/ventas/nueva')->assertForbidden();
        }

        public function test_created_post_route_can_be_associated_with_the_create_permission(): void
        {
            $this->login();
            $this->saveRoute()->assertOk();
            $id = $this->bindMenu();
            $this->saveRoute(['name' => 'ventas.guardar', 'http_method' => 'POST',
                'program' => 'controller:App\\Http\\Controllers\\ManagedRouteExampleController@save'])->assertOk();
            $this->postJson('/administracion/rutas-menu?crud=access-rutas&action=create', [
                'menu_item_id' => $id, 'route_name' => 'ventas.guardar', 'operation' => 'create',
            ])->assertOk();
            $user = $this->login(false);
            DB::table('menu_grants')->insert(['user_id' => $user->id, 'menu_item_id' => $id, 'can_view' => true]);
            $this->postJson('/ventas/nueva')->assertForbidden();
            DB::table('menu_grants')->where('user_id', $user->id)->update(['can_create' => true]);
            $this->postJson('/ventas/nueva')->assertOk()->assertJsonPath('saved', true);
        }

        public function test_route_disable_and_address_changes_apply_without_restarting_or_writing_files(): void
        {
            $this->login();
            $record = $this->saveRoute()->assertOk()->json('Record');
            $id = $this->bindMenu();
            $this->getJson('/ventas/nueva')->assertOk();
            $url = '/administracion/registro-rutas?crud=access-programas&action=update';
            $values = $record;
            $values['uri'] = '/ventas/nueva-direccion';
            $this->postJson($url, $values)->assertOk();
            $this->getJson('/ventas/nueva')->assertNotFound();
            $this->getJson('/ventas/nueva-direccion')->assertOk();
            $this->get('/menu/'.$id)->assertRedirect('/ventas/nueva-direccion');
            $this->postJson('/administracion/registro-rutas?crud=access-programas&action=delete', [
                'id' => $record['id'], 'revision' => $record['revision'] + 1,
            ])->assertOk();
            $this->getJson('/ventas/nueva-direccion')->assertForbidden();
            $this->get('/')->assertOk()->assertDontSee('Mi programa');
            $this->assertDatabaseHas('managed_application_routes', ['id' => $record['id'], 'active' => 0]);
        }

        public function test_reserved_urls_duplicates_and_invalid_programs_are_rejected(): void
        {
            $this->login();
            foreach (['/login', '/administracion/falsa', '/api/falsa', '/menu/50', '/up', '//external.test', 'https://external.test', '/ventas/../auth', '/ventas/{id}', '/ventas?x=1'] as $uri) {
                $this->saveRoute(['uri' => $uri])->assertUnprocessable();
            }
            foreach (['dashboard', 'access.manage'] as $name) {
                $this->saveRoute(['name' => $name])->assertUnprocessable();
            }
            foreach (['controller:App\\Http\\Controllers\\AuthController@login', 'controller:App\\Http\\Controllers\\ManagedRouteExampleController@helper', 'phpinfo', 'controller:MissingController@index'] as $program) {
                $this->saveRoute(['program' => $program])->assertUnprocessable();
            }
            $this->saveRoute()->assertOk();
            $this->saveRoute()->assertUnprocessable();
            $this->saveRoute(['name' => 'ventas.duplicada'])->assertUnprocessable();
            $this->saveRoute(['name' => 'systems.empleados', 'uri' => '/ventas/otra'])->assertUnprocessable();
        }

        public function test_program_parameters_are_validated_and_not_injected_as_dependencies(): void
        {
            $this->login();
            $program = 'controller:App\\Http\\Controllers\\ManagedRouteExampleController@report';
            $this->saveRoute(['program' => $program])->assertUnprocessable();
            $this->saveRoute(['program' => $program, 'program_parameters' => '{"year":"invalid"}'])->assertUnprocessable();
            $this->saveRoute(['program_parameters' => '{"request":"forged"}'])->assertUnprocessable();
            $this->saveRoute(['program' => $program, 'program_parameters' => '{"year":2026}'])->assertOk();
            $this->bindMenu();
            $this->getJson('/ventas/nueva')->assertOk()->assertJsonPath('year', 2026);
        }

        public function test_native_programs_preserve_their_existing_authorization(): void
        {
            $this->login();
            $this->saveRoute(['program' => 'route:systems.empleados'])->assertOk();
            $id = $this->bindMenu();
            $user = $this->login(false);
            DB::table('menu_grants')->insert(['user_id' => $user->id, 'menu_item_id' => $id, 'can_view' => true]);
            $this->getJson('/ventas/nueva')->assertForbidden();
        }

        public function test_only_authorized_managers_can_register_routes_and_cookie_posts_require_csrf(): void
        {
            $this->get('/administracion/registro-rutas')->assertRedirect('/login');
            $this->login(false);
            $this->saveRoute()->assertForbidden();
            $this->get('/administracion/registro-rutas')->assertForbidden();
            $admin = $this->login();
            $this->saveRoute()->assertOk();
            $id = $this->bindMenu();
            $this->saveRoute(['name' => 'ventas.guardar', 'http_method' => 'POST',
                'program' => 'controller:App\\Http\\Controllers\\ManagedRouteExampleController@save'])->assertOk();
            $this->postJson('/administracion/rutas-menu?crud=access-rutas&action=create', [
                'menu_item_id' => $id, 'route_name' => 'ventas.guardar', 'operation' => 'create',
            ])->assertOk();
            $token = app(JwtTokens::class)->issue($admin)['token'];
            $this->flushHeaders();
            $this->app->instance('env', 'local');
            $this->withCookie(config('access.jwt.cookie'), $token)
                ->post('/administracion/registro-rutas?crud=access-programas&action=create')->assertStatus(419);
            $this->post('/ventas/nueva')->assertStatus(419);
        }

        public function test_database_routes_survive_a_compiled_base_route_collection(): void
        {
            $this->login();
            $this->saveRoute()->assertOk();
            $this->bindMenu();
            $router = app('router');
            $compiled = $router->getRoutes()->compile();
            $router->setCompiledRoutes($compiled);
            app(ManagedApplicationRoutes::class)->load();
            $this->getJson('/ventas/nueva')->assertOk();
        }
    }
}
