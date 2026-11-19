<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\Auth\JwtTokens;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class DatabaseMenuRoutesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['access.jwt.secret' => str_repeat('database-menu-', 12)]);
        Route::middleware(['web', 'erp.jwt', 'erp.menu'])->group(function (): void {
            $response = fn (Request $request) => response()->json(['user_id' => $request->user()->id, 'menu_id' => $request->attributes->get('erp.menu_id')]);
            Route::get('/testing/new-app', $response)->name('new-app.index');
            Route::get('/testing/other-app', $response)->name('other-app.index');
            Route::get('/testing/new-app/{record}', $response)->whereNumber('record')->name('new-app.show');
            Route::post('/testing/new-app', $response)->name('new-app.store');
            Route::put('/testing/new-app/{record}', $response)->name('new-app.update');
            Route::delete('/testing/new-app/{record}', $response)->name('new-app.destroy');
            Route::post('/testing/new-app/{record}/approve', $response)->name('new-app.approve');
        });
        Route::get('/testing/unprotected', fn () => 'Public')->name('unprotected');
        Route::getRoutes()->refreshNameLookups();
        DB::table('menu_items')->insert(['id' => 50, 'parent_id' => 0, 'label' => 'Aplicaciones', 'legacy_url' => '', 'active' => true]);
    }

    private function account(bool $admin = false): User
    {
        return User::factory()->create(['ldap_username' => fake()->unique()->userName(), 'ldap_guid' => bin2hex(random_bytes(16)),
            'erp_roles' => [$admin ? 'administrador' : 'usuario'], 'erp_active' => true, 'token_version' => 1]);
    }

    private function login(User $user): void
    {
        $this->withToken(app(JwtTokens::class)->issue($user)['token']);
    }

    private function createMenu(array $changes = []): TestResponse
    {
        return $this->postJson('/administracion/menu?crud=access-menu&action=create', $changes + [
            'label' => 'Mi aplicación', 'parent_id' => 50, 'active' => 1, 'is_public' => 0,
            'migration_enabled' => 1, 'route_name' => 'new-app.index', 'route_parameters' => '{}',
        ]);
    }

    private function action(int $menu, string $route, string $operation): TestResponse
    {
        return $this->postJson('/administracion/rutas-menu?crud=access-rutas&action=create', [
            'menu_item_id' => $menu, 'route_name' => $route, 'operation' => $operation,
        ]);
    }

    public function test_menu_and_named_route_are_linked_from_the_interface_without_configuration(): void
    {
        $admin = $this->account(true);
        $this->login($admin);
        $this->get('/testing/new-app')->assertForbidden();
        $id = $this->createMenu()->assertOk()->json('Record.id');
        $this->assertArrayNotHasKey('new-app.index', config('erp.migrated_menu_options'));
        $this->assertDatabaseHas('menu_items', ['id' => $id, 'route_name' => 'new-app.index', 'migration_key' => 'menu.'.$id]);
        $this->get('/menu/'.$id)->assertRedirect('/testing/new-app');
        $this->get('/testing/new-app')->assertOk()->assertJsonPath('user_id', $admin->id)->assertJsonPath('menu_id', $id);
        $this->get('/')->assertOk()->assertSee('Mi aplicación')->assertSee('/testing/new-app');
        $this->get('/administracion/menu')->assertOk()->assertSee('Ruta Laravel');
        $this->get('/administracion/rutas-menu')->assertOk()->assertSee('Permiso requerido');
    }

    public function test_authenticated_user_and_menu_grant_are_required_and_cannot_be_spoofed(): void
    {
        $admin = $this->account(true);
        $this->login($admin);
        $id = $this->createMenu()->assertOk()->json('Record.id');
        $user = $this->account();
        $this->login($user);
        $this->getJson('/testing/new-app?id_user='.$admin->id.'&id_menu=50')->assertForbidden();
        $this->postJson('/administracion/rutas-menu?crud=access-rutas&action=create')->assertForbidden();
        DB::table('menu_grants')->insert(['user_id' => $user->id, 'menu_item_id' => $id, 'can_view' => true]);
        $this->getJson('/testing/new-app?id_user='.$admin->id.'&id_menu=50')->assertOk()->assertJsonPath('user_id', $user->id)->assertJsonPath('menu_id', $id);
        DB::table('menu_grants')->where('user_id', $user->id)->update(['can_view' => false]);
        $this->getJson('/testing/new-app')->assertForbidden();
    }

    public function test_action_routes_enforce_each_operation_and_revoke_immediately(): void
    {
        $this->login($this->account(true));
        $id = $this->createMenu()->assertOk()->json('Record.id');
        foreach (['show' => 'view', 'store' => 'create', 'update' => 'update', 'destroy' => 'delete', 'approve' => 'approve'] as $route => $operation) {
            $this->action($id, 'new-app.'.$route, $operation)->assertOk();
        }
        $user = $this->account();
        DB::table('menu_grants')->insert(['user_id' => $user->id, 'menu_item_id' => $id, 'can_view' => true]);
        $this->login($user);
        $this->getJson('/testing/new-app/77')->assertOk()->assertJsonPath('menu_id', $id);
        foreach ([['POST', '/testing/new-app', 'create'], ['PUT', '/testing/new-app/77', 'update'],
            ['DELETE', '/testing/new-app/77', 'delete'], ['POST', '/testing/new-app/77/approve', 'approve']] as [$method, $url, $operation]) {
            $this->json($method, $url)->assertForbidden();
            DB::table('menu_grants')->where('user_id', $user->id)->update(['can_'.$operation => true]);
            $this->json($method, $url)->assertOk();
            DB::table('menu_grants')->where('user_id', $user->id)->update(['can_'.$operation => false]);
        }
        DB::table('menu_items')->where('id', $id)->update(['migration_enabled' => false]);
        $this->getJson('/testing/new-app/77')->assertForbidden();
        $this->getJson('/testing/new-app')->assertForbidden();
        DB::table('menu_items')->where('id', $id)->update(['migration_enabled' => true]);
        DB::table('menu_items')->where('id', 50)->update(['active' => false]);
        $this->getJson('/testing/new-app/77')->assertForbidden();
    }

    public function test_public_menu_only_grants_view_and_unknown_routes_are_denied(): void
    {
        $this->login($this->account(true));
        $id = $this->createMenu(['is_public' => 1])->assertOk()->json('Record.id');
        $this->action($id, 'new-app.store', 'create')->assertOk();
        $this->login($this->account());
        $this->getJson('/testing/new-app')->assertOk();
        $this->postJson('/testing/new-app')->assertForbidden();
        $this->getJson('/testing/other-app')->assertForbidden();
        $this->putJson('/testing/new-app/5')->assertForbidden();
    }

    public function test_only_valid_routes_and_fixed_parameters_can_be_registered(): void
    {
        $this->login($this->account(true));
        foreach (['missing.route', 'https://external.test', 'login', 'unprotected', 'dashboard', 'new-app.store', 'access.routes'] as $route) {
            $this->createMenu(['route_name' => $route])->assertUnprocessable();
        }
        foreach (['[]', 'bad json', '{"record": {"id":1}}', '{"record":"../secret"}', '{"record":"%2f"}', '{"record":"abc"}', '{"record":1,"query":2}'] as $parameters) {
            $this->createMenu(['route_name' => 'new-app.show', 'route_parameters' => $parameters])->assertUnprocessable();
        }
        $this->createMenu(['route_name' => 'new-app.show'])->assertUnprocessable();
        $this->createMenu(['route_name' => 'new-app.show', 'route_parameters' => '{"record":123}'])->assertOk();
        $this->get('/testing/new-app/123')->assertOk();
        $this->get('/testing/new-app/124')->assertForbidden();
        $this->createMenu(['route_name' => 'access.manage', 'route_parameters' => '{"section":"inventada"}'])->assertUnprocessable();
    }

    public function test_duplicate_bindings_are_rejected_and_reassignment_closes_old_route(): void
    {
        $this->login($this->account(true));
        $id = $this->createMenu()->assertOk()->json('Record.id');
        $this->createMenu()->assertUnprocessable();
        $this->action($id, 'new-app.index', 'view')->assertUnprocessable();
        $action = $this->action($id, 'new-app.store', 'create')->assertOk()->json('Record');
        $this->action($id, 'new-app.store', 'view')->assertUnprocessable();
        $this->action($id, 'other-app.index', 'invalid')->assertUnprocessable();
        $this->postJson('/administracion/rutas-menu?crud=access-rutas&action=delete', ['id' => $action['id'], 'revision' => $action['revision']])->assertOk();
        $this->postJson('/testing/new-app')->assertForbidden();
        $this->postJson('/administracion/menu?crud=access-menu&action=update', [
            'id' => $id, 'revision' => DB::table('menu_items')->where('id', $id)->value('revision'),
            'label' => 'Mi aplicación', 'parent_id' => 50, 'active' => 1, 'is_public' => 0,
            'migration_enabled' => 1, 'route_name' => 'other-app.index', 'route_parameters' => '{}',
        ])->assertOk();
        $this->get('/testing/new-app')->assertForbidden();
        $this->get('/testing/other-app')->assertOk();
        $this->assertDatabaseHas('erp_access_events', ['event' => 'menu_route_revoked']);
    }

    public function test_actions_can_be_updated_with_revision_control_and_menu_stays_disabled(): void
    {
        $this->login($this->account(true));
        $id = $this->createMenu(['migration_enabled' => 0])->assertOk()->json('Record.id');
        $this->get('/testing/new-app')->assertForbidden();
        $record = $this->action($id, 'new-app.store', 'create')->assertOk()->json('Record');
        $url = '/administracion/rutas-menu?crud=access-rutas&action=update';
        $values = ['id' => $record['id'], 'revision' => $record['revision'], 'menu_item_id' => $id, 'route_name' => 'new-app.store', 'operation' => 'approve'];
        $this->postJson($url, $values)->assertOk();
        $this->postJson($url, $values)->assertUnprocessable();
        $this->postJson('/administracion/rutas-menu?crud=access-rutas&action=list')->assertOk()->assertJsonPath('Records.0.operation', 'approve');
    }

    public function test_migration_backfills_native_routes_without_enabling_them_and_can_roll_back(): void
    {
        DB::table('menu_items')->insert(['id' => 46, 'parent_id' => 50, 'label' => 'Menú', 'legacy_url' => '',
            'migration_key' => 'access.menu', 'migration_enabled' => false]);
        $migration = require database_path('migrations/2026_11_18_145414_add_database_route_bindings_to_menu.php');
        $migration->down();
        $this->assertFalse(Schema::hasColumn('menu_items', 'route_name'));
        $migration->up();
        $row = DB::table('menu_items')->find(46);
        $this->assertSame('access.manage', $row->route_name);
        $this->assertSame(['section' => 'menu'], json_decode($row->route_parameters, true));
        $this->assertFalse((bool) $row->migration_enabled);
    }

    public function test_fixed_parameters_work_with_laravel_model_binding(): void
    {
        $admin = $this->account(true);
        $other = $this->account();
        $this->login($admin);
        Route::bind('record', fn (string $value): User => User::findOrFail($value));
        $this->createMenu(['route_name' => 'new-app.show', 'route_parameters' => json_encode(['record' => $admin->id])])->assertOk();
        $this->get('/testing/new-app/'.$admin->id)->assertOk();
        $this->get('/testing/new-app/'.$other->id)->assertForbidden();
    }
}
