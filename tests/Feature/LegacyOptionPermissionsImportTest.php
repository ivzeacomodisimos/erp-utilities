<?php
namespace Tests\Feature;
use App\Models\User;
use App\Support\Menu\LegacyOptionPermissionsImporter;
use App\Support\Menu\OptionAccess;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use RuntimeException;
use Tests\TestCase;
class LegacyOptionPermissionsImportTest extends TestCase {
    use RefreshDatabase;
    private function account(): User {
        return User::factory()->create(['legacy_user_id' => 65, 'ldap_username' => 'test.user', 'erp_active' => true, 'erp_roles' => ['usuario']]);
    }
    private function source(array $extra = []): array {
        return $extra + ['IP_IdUsuario' => 65, 'IP_Modulo' => 'Ventas', 'IP_File' => '', 'IP_IdOpcion' => 7,
            'IP_Read' => 1, 'IP_Insert' => 0, 'IP_Write' => 0, 'IP_Delete' => 1];
    }
    public function test_import_maps_legacy_users_preserves_all_flags_and_exact_denials(): void {
        $user = $this->account();
        $summary = app(LegacyOptionPermissionsImporter::class)->import([
            $this->source(), $this->source(['IP_File' => 'Pedidos', 'IP_Read' => 0, 'IP_Delete' => 0]),
            $this->source(['IP_IdUsuario' => 9999]),
        ]);
        $this->assertSame(['source_permissions' => 3, 'imported' => 2, 'skipped_users' => 1, 'preserved_local' => 0], $summary);
        $this->assertDatabaseHas('option_grants', ['user_id' => $user->id, 'module' => 'ventas', 'file' => '', 'can_read' => 1, 'can_delete' => 1, 'can_insert' => 0, 'can_write' => 0]);
        $this->assertFalse(app(OptionAccess::class)->allows($user, 'ventas', 'pedidos', 7));
        $this->assertTrue(app(OptionAccess::class)->allows($user, 'ventas', 'otra', 7));
        $this->assertDatabaseHas('erp_access_events', ['event' => 'option_permissions_imported']);
        $this->assertDatabaseCount('users', 1);
    }
    public function test_dry_run_does_not_write_and_repeat_requires_explicit_replace(): void {
        $this->account();
        $importer = app(LegacyOptionPermissionsImporter::class);
        $this->assertSame(1, $importer->import([$this->source()], dryRun: true)['imported']);
        $this->assertDatabaseCount('option_grants', 0);
        $this->assertDatabaseCount('option_permission_import_runs', 0);
        $importer->import([$this->source()]);
        $this->expectException(RuntimeException::class);
        $importer->import([$this->source()]);
    }
    public function test_replace_revokes_removed_imports_and_preserves_local_overrides(): void {
        $user = $this->account();
        $importer = app(LegacyOptionPermissionsImporter::class);
        $importer->import([$this->source(), $this->source(['IP_IdOpcion' => 8])]);
        DB::table('option_grants')->where('option_id', 7)->update(['imported' => false, 'can_read' => false, 'can_delete' => false, 'revision' => 2]);
        $summary = $importer->import([$this->source()], replace: true);
        $this->assertSame(1, $summary['preserved_local']);
        $this->assertDatabaseCount('option_grants', 1);
        $this->assertFalse(app(OptionAccess::class)->allows($user, 'ventas', 'otra', 7));
        $this->assertDatabaseHas('option_grants', ['option_id' => 7, 'revision' => 2, 'imported' => 0]);
    }
    public function test_duplicate_rows_do_not_union_privileges_or_partially_replace_existing_records(): void {
        $this->account();
        $importer = app(LegacyOptionPermissionsImporter::class);
        $importer->import([$this->source()]);
        try {
            $importer->import([$this->source(), $this->source(['IP_Modulo' => 'VENTAS', 'IP_Write' => 1])], replace: true);
            $this->fail('Debe rechazar identidades de permiso duplicadas.');
        } catch (RuntimeException) {
            $this->assertDatabaseCount('option_permission_import_runs', 1);
            $this->assertDatabaseHas('option_grants', ['option_id' => 7, 'can_write' => 0]);
        }
    }
    public function test_invalid_source_flags_abort_without_writes_and_tests_never_open_the_source(): void {
        $this->account();
        try {
            app(LegacyOptionPermissionsImporter::class)->import([$this->source(), $this->source(['IP_IdOpcion' => 8, 'IP_Read' => 2])]);
            $this->fail('Debe rechazar indicadores inválidos.');
        } catch (ValidationException) {
            $this->assertDatabaseCount('option_grants', 0);
            $this->assertDatabaseCount('option_permission_import_runs', 0);
        }
        $this->artisan('erp:import-option-permissions', ['--dry-run' => true])->assertFailed();
    }
}
