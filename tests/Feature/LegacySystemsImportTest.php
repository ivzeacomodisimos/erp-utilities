<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\Administration\LegacySystemsImporter;
use App\Support\Administration\SystemObjects;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use RuntimeException;
use Tests\TestCase;

class LegacySystemsImportTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        User::factory()->create(['legacy_user_id' => 65]);
        DB::table('menu_items')->insert([['id' => 50, 'legacy_id' => 50, 'parent_id' => 0, 'label' => 'Aplicaciones', 'legacy_url' => ''], ['id' => 46, 'legacy_id' => 46, 'parent_id' => 50, 'label' => 'Mantenimiento de Menu', 'legacy_url' => 'index.php?modulo=menuaplic&file=mantmenu']]);
    }

    private function source(): array
    {
        return [
            'users' => [['US_Id' => 65, 'US_Correo' => 'ana@empresa.test', 'US_UserNameUNO' => 'ANA', 'US_IdEmpleado' => 10]],
            'groups' => [['idGestion' => 1, 'Nombre' => 'Planta', 'idGestionPadre' => 0]],
            'employees' => [['idEmpleado' => 10, 'Empl_Gestion_idGestion' => 1, 'Cedula' => '123', 'Nombre' => 'Ana', 'Apellidos' => 'Pérez', 'Correo' => '', 'Estado' => 'A', 'CodigoInterno' => '01', 'FIngreso' => null, 'FRetiro' => null]],
            'objects' => [['K_id' => 3, 'K_nombre' => 'OS', 'K_descripcion' => 'Raíz', 'K_idKPadre' => 0, 'K_orden' => '01', 'K_valorDefecto' => ''], ['K_id' => 1210, 'K_nombre' => 'GESTIONES_ASIGNADAS', 'K_descripcion' => 'Gestiones', 'K_idKPadre' => 3, 'K_orden' => '01.01', 'K_valorDefecto' => '-']],
            'object_values' => [['KUV_idK' => 1210, 'KUV_idUsuario' => 65, 'KUV_Valor' => '1']],
            'document_types' => [['NSID' => 'F01', 'NSDES' => 'Factura'], ['NSID' => 'CONSECUTIVO_LARGO', 'NSDES' => 'Otro consecutivo']],
            'document_defaults' => [['TD_IdUsuario' => 65, 'TD_Modulo' => 'Ventas', 'TD_File' => 'Pedidos', 'TD_TipoDocumento' => 'F01']],
            'menus' => [['ID' => 46, 'IMAGENICONO' => 'settings', 'INDICADOR_CONCATENAR_ID' => 0]],
        ];
    }

    public function test_import_preserves_ids_profiles_restrictions_and_maps_menu_46_to_existing_administration(): void
    {
        $summary = app(LegacySystemsImporter::class)->import($this->source(), activate: true);
        $this->assertSame(1, $summary['employees']);
        $this->assertSame(2, $summary['objects']);
        $this->assertDatabaseHas('employees', ['id' => 10, 'legacy_id' => 10, 'first_name' => 'Ana']);
        $this->assertDatabaseHas('document_types', ['code' => 'CONSECUTIVO_LARGO']);
        $this->assertDatabaseHas('users', ['legacy_user_id' => 65, 'employee_id' => 10, 'corporate_email' => 'ana@empresa.test', 'siesa_username' => 'ANA']);
        $this->assertDatabaseHas('menu_items', ['id' => 46, 'migration_key' => 'access.menu', 'migration_enabled' => 1, 'icon' => 'settings', 'append_legacy_id' => 0]);
        $this->assertSame([1], app(SystemObjects::class)->employeeGroups(User::first()));
        $this->assertSame('F01', app(SystemObjects::class)->documentType(User::first(), 'ventas', 'pedidos'));
        $this->assertDatabaseHas('erp_access_events', ['event' => 'systems_imported']);
    }

    public function test_dry_run_and_default_enablement_do_not_activate_unmigrated_options(): void
    {
        $importer = app(LegacySystemsImporter::class);
        $summary = $importer->import($this->source(), dryRun: true);
        $this->assertSame(1, $summary['employees']);
        $this->assertDatabaseCount('employees', 0);
        $this->assertDatabaseCount('systems_import_runs', 0);
        $importer->import($this->source());
        $this->assertDatabaseHas('menu_items', ['id' => 46, 'migration_key' => 'access.menu', 'migration_enabled' => 0]);
    }

    public function test_replace_preserves_local_edits_bindings_and_removes_stale_imported_defaults(): void
    {
        $importer = app(LegacySystemsImporter::class);
        $importer->import($this->source(), activate: true);
        DB::table('employees')->where('id', 10)->update(['first_name' => 'Editado', 'imported' => false]);
        DB::table('users')->where('legacy_user_id', 65)->update(['corporate_email' => 'local@empresa.test', 'profile_imported' => false]);
        DB::table('menu_items')->where('id', 46)->update(['migration_enabled' => false]);
        $source = $this->source();
        $source['document_defaults'] = [];
        $summary = $importer->import($source, replace: true, activate: true);
        $this->assertGreaterThanOrEqual(1, $summary['preserved_local']);
        $this->assertDatabaseHas('employees', ['id' => 10, 'first_name' => 'Editado']);
        $this->assertDatabaseHas('users', ['legacy_user_id' => 65, 'corporate_email' => 'local@empresa.test']);
        $this->assertDatabaseHas('menu_items', ['id' => 46, 'migration_enabled' => 0]);
        $this->assertDatabaseCount('user_document_defaults', 0);
    }

    public function test_import_rejects_identity_collisions_and_missing_employee_restriction_object_atomically(): void
    {
        $source = $this->source();
        $source['objects'] = [];
        try {
            app(LegacySystemsImporter::class)->import($source, activate: true);
            $this->fail('Debe conservar el objeto de restricciones.');
        } catch (RuntimeException) {
            $this->assertDatabaseCount('employees', 0);
            $this->assertDatabaseCount('systems_import_runs', 0);
            $this->assertDatabaseHas('menu_items', ['id' => 46, 'migration_key' => null]);
        }
        $this->artisan('erp:import-systems', ['--dry-run' => true])->assertFailed();
    }

    public function test_local_employee_ids_are_not_reassigned_to_a_different_legacy_identity(): void
    {
        DB::table('employees')->insert(['id' => 10, 'first_name' => 'Registro local']);
        try {
            app(LegacySystemsImporter::class)->import($this->source());
            $this->fail('Debe rechazar la colisión de identidades.');
        } catch (RuntimeException) {
            $this->assertDatabaseHas('employees', ['id' => 10, 'legacy_id' => null, 'first_name' => 'Registro local']);
            $this->assertDatabaseCount('systems_import_runs', 0);
        }
    }

    public function test_distinct_accented_employee_identifiers_are_not_combined(): void
    {
        $source = $this->source();
        $source['employees'][0]['Cedula'] = 'N123';
        $source['employees'][] = ['idEmpleado' => 11, 'Cedula' => 'Ñ123', 'CodigoInterno' => null] + $source['employees'][0];
        app(LegacySystemsImporter::class)->import($source);
        $this->assertDatabaseCount('employees', 2);
        $this->assertDatabaseHas('employees', ['id' => 10, 'identity_number' => 'N123']);
        $this->assertDatabaseHas('employees', ['id' => 11, 'identity_number' => 'Ñ123']);
    }

    public function test_import_preserves_invisible_legacy_identifier_characters_without_merging_employee_ids(): void
    {
        $source = $this->source();
        $source['employees'][0]['Cedula'] = "123\t\t";
        $source['employees'][] = ['idEmpleado' => 11, 'Cedula' => '123', 'CodigoInterno' => null] + $source['employees'][0];
        app(LegacySystemsImporter::class)->import($source);
        $this->assertDatabaseCount('employees', 2);
        $this->assertDatabaseHas('employees', ['id' => 10, 'identity_number' => "123\t\t"]);
        $this->assertDatabaseHas('employees', ['id' => 11, 'identity_number' => '123']);
        app(LegacySystemsImporter::class)->import($source, replace: true);
        $this->assertDatabaseCount('employees', 2);
    }
}
