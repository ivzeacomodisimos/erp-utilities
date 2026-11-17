<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\Menu\LegacyMenuImporter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use RuntimeException;
use Tests\TestCase;

class LegacyMenuImportTest extends TestCase
{
    use RefreshDatabase;

    private function source(): array
    {
        return [
            [['ID' => 50, 'PADRE' => 0, 'DES' => 'Aplicaciones', 'URL' => '', 'ORDEN' => '001', 'PUBLICA' => 0, 'ACTIVADO' => 'S'],
                ['ID' => 101, 'PADRE' => 50, 'DES' => 'Ventas', 'URL' => 'index.php?modulo=ventas', 'ORDEN' => '001.001', 'PUBLICA' => 0, 'ACTIVADO' => 'S']],
            [['US_Id' => 65, 'US_UserName' => 'test.user', 'US_Nombre' => 'Usuario', 'US_Apellidos' => 'Prueba', 'US_Estado' => 'A', 'US_SuperUsuario' => 0],
                ['US_Id' => 66, 'US_UserName' => 'old.user', 'US_Nombre' => 'Retirado', 'US_Apellidos' => '', 'US_Estado' => 'I', 'US_SuperUsuario' => 1]],
            [['id_usuario' => 65, 'id_OpcionRestringida' => 101, 'Consulta' => 1, 'Creacion' => 0, 'Modificacion' => 1, 'Eliminacion' => 0, 'Aprobacion' => 0]],
        ];
    }

    public function test_import_preserves_ids_flags_and_inactivity_without_passwords_or_guid(): void
    {
        $summary = app(LegacyMenuImporter::class)->import(...$this->source());
        $this->assertSame(['menus' => 2, 'users' => 2, 'grants' => 1, 'skipped_users' => 0, 'skipped_grants' => 0], $summary);
        $user = User::where('ldap_username', 'test.user')->firstOrFail();
        $this->assertNull($user->password);
        $this->assertNull($user->ldap_guid);
        $this->assertSame(65, $user->legacy_user_id);
        $this->assertSame(['usuario'], $user->erp_roles);
        $this->assertFalse(User::where('ldap_username', 'old.user')->firstOrFail()->erp_active);
        $this->assertDatabaseHas('menu_grants', ['user_id' => $user->id, 'menu_item_id' => 101, 'can_view' => 1, 'can_create' => 0, 'can_update' => 1, 'can_delete' => 0]);
        $this->assertDatabaseHas('erp_access_events', ['event' => 'legacy_import']);
        $this->assertDatabaseHas('menu_items', ['id' => 101, 'active' => 1, 'migration_enabled' => 0, 'migration_key' => null]);
    }

    public function test_duplicate_usernames_are_skipped_without_combining_identities_or_grants(): void
    {
        [$menus, $users, $grants] = $this->source();
        $users[1]['US_UserName'] = ' TEST.USER ';
        $summary = app(LegacyMenuImporter::class)->import($menus, $users, $grants);
        $this->assertSame(2, $summary['skipped_users']);
        $this->assertSame(1, $summary['skipped_grants']);
        $this->assertDatabaseCount('users', 0);
        $this->assertDatabaseCount('menu_grants', 0);
    }

    public function test_repeat_import_requires_explicit_replace_and_revokes_removed_access(): void
    {
        $importer = app(LegacyMenuImporter::class);
        $source = $this->source();
        $importer->import(...$source);
        try {
            $importer->import(...$source);
            $this->fail('Debe rechazar la repetición implícita.');
        } catch (RuntimeException) {
            $this->assertDatabaseCount('legacy_import_runs', 1);
        }
        $source[2] = [];
        $source[1][0]['US_Estado'] = 'I';
        $importer->import(...[...$source, true]);
        $this->assertDatabaseCount('menu_grants', 0);
        $this->assertFalse(User::where('ldap_username', 'test.user')->firstOrFail()->erp_active);
        $this->assertDatabaseCount('legacy_import_runs', 2);
    }

    public function test_reimport_conflict_rolls_back_everything(): void
    {
        DB::table('menu_items')->insert(['id' => 101, 'parent_id' => 50, 'label' => 'Local', 'legacy_url' => '', 'sort_order' => '', 'active' => true, 'is_public' => false]);
        try {
            app(LegacyMenuImporter::class)->import(...$this->source());
            $this->fail('Debe rechazar colisión de identificadores.');
        } catch (RuntimeException) {
            $this->assertDatabaseCount('users', 0);
            $this->assertDatabaseCount('menu_items', 1);
            $this->assertDatabaseCount('legacy_import_runs', 0);
        }
    }

    public function test_reimport_preserves_local_enablement_and_does_not_enable_new_legacy_options(): void
    {
        $importer = app(LegacyMenuImporter::class);
        [$menus, $users, $grants] = $this->source();
        $importer->import($menus, $users, $grants);
        DB::table('menu_items')->where('id', 101)->update(['migration_enabled' => true, 'migration_key' => 'access.users']);
        $menus[] = ['ID' => 102, 'PADRE' => 50, 'DES' => 'Nueva', 'URL' => '', 'ORDEN' => '002', 'PUBLICA' => 1, 'ACTIVADO' => 'S'];
        $importer->import($menus, $users, $grants, true);
        $this->assertDatabaseHas('menu_items', ['id' => 101, 'migration_enabled' => 1, 'migration_key' => 'access.users']);
        $this->assertDatabaseHas('menu_items', ['id' => 102, 'migration_enabled' => 0, 'migration_key' => null]);
        $importer->import([$menus[0]], $users, [], true);
        $this->assertDatabaseHas('menu_items', ['id' => 101, 'active' => 0]);
    }
}
