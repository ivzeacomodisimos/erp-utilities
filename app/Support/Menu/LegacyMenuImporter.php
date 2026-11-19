<?php

namespace App\Support\Menu;

use App\Models\User;
use App\Support\Auth\LdapAuthenticator;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class LegacyMenuImporter
{
    public function import(array $menus, array $users, array $grants, bool $replace = false): array
    {
        $connection = DB::connection();
        $mode = null;
        try {
            if ($connection->getDriverName() === 'mysql') {
                $mode = $connection->selectOne('SELECT @@SESSION.sql_mode AS mode')->mode;
                $connection->statement('SET SESSION sql_mode = ?', [implode(',', array_unique([...array_filter(explode(',', $mode)), 'NO_AUTO_VALUE_ON_ZERO']))]);
            }

            return $this->perform($menus, $users, $grants, $replace);
        } finally {
            if ($mode !== null) {
                $connection->statement('SET SESSION sql_mode = ?', [$mode]);
            }
        }
    }

    private function perform(array $menus, array $users, array $grants, bool $replace = false): array
    {
        return DB::transaction(function () use ($menus, $users, $grants, $replace): array {
            if (DB::table('legacy_import_runs')->exists() && ! $replace) {
                throw new RuntimeException('Ya existe una importación. Use --replace para aplicar de nuevo el origen y reemplazar permisos importados.');
            }
            $normalized = [];
            $directory = app(LdapAuthenticator::class);
            foreach ($users as $source) {
                try {
                    $normalized[(int) $source['US_Id']] = $directory->normalizeUsername((string) $source['US_UserName']);
                } catch (AuthenticationException) {
                    continue;
                }
            }
            $counts = array_count_values($normalized);
            $mapping = [];
            $rejectedUsers = 0;
            foreach ($users as $source) {
                $legacy = (int) $source['US_Id'];
                $username = $normalized[$legacy] ?? null;
                if (! $username || $counts[$username] !== 1) {
                    $rejectedUsers++;

                    continue;
                }
                $user = User::where('legacy_user_id', $legacy)->first();
                if (! $user) {
                    $user = User::where('ldap_username', $username)->first();
                    if ($user && $user->legacy_user_id !== null && $user->legacy_user_id !== $legacy) {
                        $rejectedUsers++;

                        continue;
                    }
                }
                if ($user && $user->ldap_username !== $username) {
                    $rejectedUsers++;

                    continue;
                }
                $user ??= new User;
                $user->forceFill([
                    'legacy_user_id' => $legacy, 'ldap_username' => $username,
                    'name' => mb_substr(trim($source['US_Nombre'].' '.$source['US_Apellidos']) ?: $username, 0, 180),
                    'email' => 'legacy-'.$legacy.'@erp.invalid', 'password' => null,
                    'erp_active' => $source['US_Estado'] === 'A',
                    'erp_roles' => (int) $source['US_SuperUsuario'] === 1 ? ['administrador'] : ['usuario'],
                    'token_version' => (int) $user->token_version + 1,
                    'access_revision' => (int) ($user->access_revision ?? 0) + 1,
                ])->save();
                $mapping[$legacy] = $user->id;
            }
            $timestamp = now();
            $menuIds = [];
            foreach ($menus as $source) {
                $id = (int) $source['ID'];
                $menuIds[$id] = true;
                $old = DB::table('menu_items')->where('legacy_id', $id)->first();
                if (! $old && DB::table('menu_items')->where('id', $id)->exists()) {
                    throw new RuntimeException('Un ID del menú original coincide con una opción local.');
                }
                $values = [
                    'legacy_id' => $id, 'parent_id' => max(0, (int) $source['PADRE']),
                    'label' => mb_substr(trim((string) $source['DES']), 0, 200),
                    'legacy_url' => trim((string) $source['URL']), 'sort_order' => (string) $source['ORDEN'],
                    'active' => $source['ACTIVADO'] === 'S', 'is_public' => (int) $source['PUBLICA'] === 1,
                    'description' => $source['DESDETALLE'] ?? null,
                    'icon' => $source['IMAGENICONO'] ?? '',
                    'append_legacy_id' => (int) ($source['INDICADOR_CONCATENAR_ID'] ?? 1) === 1,
                    'revision' => $old ? $old->revision + 1 : 1, 'updated_at' => $timestamp,
                ];
                if ($old) {
                    DB::table('menu_items')->where('id', $old->id)->update($values);
                } else {
                    DB::table('menu_items')->insert($values + ['id' => $id, 'created_at' => $timestamp]);
                }
            }
            if ($replace) {
                DB::table('menu_items')->whereNotNull('legacy_id')->whereNotIn('legacy_id', array_keys($menuIds))->update(['active' => false]);
                User::whereNotNull('legacy_user_id')->whereNotIn('legacy_user_id', array_keys($mapping))
                    ->update(['erp_active' => false, 'token_version' => DB::raw('token_version + 1')]);
                DB::table('menu_grants')->where('imported', true)->delete();
            }
            $rows = [];
            $rejectedGrants = 0;
            foreach ($grants as $source) {
                $legacyUser = (int) $source['id_usuario'];
                $menuId = (int) $source['id_OpcionRestringida'];
                if (! isset($mapping[$legacyUser], $menuIds[$menuId])) {
                    $rejectedGrants++;

                    continue;
                }
                $key = $mapping[$legacyUser].':'.$menuId;
                $row = $rows[$key] ?? [
                    'user_id' => $mapping[$legacyUser], 'menu_item_id' => $menuId,
                    'can_view' => false, 'can_create' => false, 'can_update' => false, 'can_delete' => false, 'can_approve' => false,
                    'imported' => true, 'revision' => 1, 'created_at' => $timestamp, 'updated_at' => $timestamp,
                ];
                foreach (['view' => 'Consulta', 'create' => 'Creacion', 'update' => 'Modificacion', 'delete' => 'Eliminacion', 'approve' => 'Aprobacion'] as $operation => $column) {
                    $row['can_'.$operation] = $row['can_'.$operation] || (int) ($source[$column] ?? 0) === 1;
                }
                $rows[$key] = $row;
            }
            foreach (array_chunk(array_values($rows), 500) as $chunk) {
                DB::table('menu_grants')->upsert($chunk, ['user_id', 'menu_item_id'],
                    ['can_view', 'can_create', 'can_update', 'can_delete', 'can_approve', 'imported', 'revision', 'updated_at']);
            }
            DB::table('erp_auth_tokens')->whereIn('user_id', array_values($mapping))->update(['revoked_at' => $timestamp]);
            $summary = ['menus' => count($menus), 'users' => count($mapping), 'grants' => count($rows),
                'skipped_users' => $rejectedUsers, 'skipped_grants' => $rejectedGrants];
            DB::table('legacy_import_runs')->insert(['summary' => json_encode($summary, JSON_THROW_ON_ERROR), 'created_at' => $timestamp]);
            DB::table('erp_access_events')->insert(['user_id' => null, 'event' => 'legacy_import',
                'actor' => 'console', 'details' => json_encode($summary, JSON_THROW_ON_ERROR), 'created_at' => $timestamp]);

            return $summary;
        });
    }
}
