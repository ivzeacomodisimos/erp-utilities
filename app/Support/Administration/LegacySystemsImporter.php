<?php

namespace App\Support\Administration;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class LegacySystemsImporter
{
    public function import(array $source, bool $replace = false, bool $activate = false, bool $dryRun = false): array
    {
        $connection = DB::connection();
        $mode = null;
        try {
            if ($connection->getDriverName() === 'mysql') {
                $mode = $connection->selectOne('SELECT @@SESSION.sql_mode AS mode')->mode;
                $connection->statement('SET SESSION sql_mode = ?', [implode(',', array_unique([...array_filter(explode(',', $mode)), 'NO_AUTO_VALUE_ON_ZERO']))]);
            }

            return DB::transaction(function () use ($source, $replace, $activate, $dryRun): array {
                $first = ! DB::table('systems_import_runs')->exists();
                if (! $first && ! $replace && ! $dryRun) {
                    throw new RuntimeException('Ya existe una importación. Use --replace para conciliar solo los registros importados.');
                }
                $users = User::whereNotNull('legacy_user_id')->pluck('id', 'legacy_user_id')->all();
                $summary = ['groups' => 0, 'employees' => 0, 'user_profiles' => 0, 'objects' => 0, 'object_values' => 0, 'document_types' => 0, 'document_defaults' => 0, 'skipped_users' => 0, 'skipped_invalid' => 0, 'preserved_local' => 0, 'bound_menus' => 0, 'preserved_bindings' => 0];
                $groups = [];
                foreach ($source['groups'] as $r) {
                    $groups[(int) $r['idGestion']] = ['id' => (int) $r['idGestion'], 'name' => mb_substr((string) $r['Nombre'], 0, 100), 'parent_id' => $r['idGestionPadre'] === null ? null : max(0, (int) $r['idGestionPadre'])];
                }
                $summary['groups'] = count($groups);
                if (! $dryRun && $groups !== []) {
                    DB::table('employee_groups')->upsert(array_values($groups), ['id'], ['name', 'parent_id']);
                }
                $employees = [];
                foreach ($source['employees'] as $r) {
                    $id = (int) $r['idEmpleado'];
                    $date = static fn (mixed $v): ?string => is_string($v) && preg_match('/^[1-9][0-9]{3}-[0-9]{2}-[0-9]{2}$/', $v) ? $v : null;
                    $employees[] = ['id' => $id, 'legacy_id' => $id, 'management_id' => isset($groups[(int) $r['Empl_Gestion_idGestion']]) ? (int) $r['Empl_Gestion_idGestion'] : null,
                        'identity_number' => trim((string) $r['Cedula']) !== '' ? (string) $r['Cedula'] : null, 'first_name' => mb_substr((string) $r['Nombre'], 0, 50), 'last_name' => mb_substr((string) ($r['Apellidos'] ?? ''), 0, 50),
                        'email' => mb_substr((string) ($r['Correo'] ?? ''), 0, 100), 'status' => $r['Estado'] === 'A' ? 'A' : 'R', 'internal_code' => trim((string) ($r['CodigoInterno'] ?? '')) !== '' ? (string) $r['CodigoInterno'] : null,
                        'joined_at' => $date($r['FIngreso'] ?? null), 'retired_at' => $date($r['FRetiro'] ?? null)];
                }
                $summary['employees'] = $this->write('employees', $employees, ['id'], $replace, $dryRun, $summary);
                $profiles = [];
                $employeeIds = array_column($employees, 'id');
                $profileQuery = DB::table('users')->select(['id', 'profile_imported']);
                if (! $dryRun) {
                    $profileQuery->lockForUpdate();
                }
                $localUsers = $profileQuery->get()->keyBy('id');
                foreach ($source['users'] ?? [] as $row) {
                    $userId = $users[(int) $row['US_Id']] ?? null;
                    if (! $userId || ! $localUsers[$userId]->profile_imported) {
                        continue;
                    }
                    $employee = (int) ($row['US_IdEmpleado'] ?? 0);
                    $profiles[] = ['id' => $userId, 'corporate_email' => mb_substr((string) ($row['US_Correo'] ?? ''), 0, 100),
                        'siesa_username' => mb_substr((string) ($row['US_UserNameUNO'] ?? ''), 0, 8),
                        'employee_id' => in_array($employee, $employeeIds, true) ? $employee : null];
                }
                $summary['user_profiles'] = count($profiles);
                if (! $dryRun) {
                    foreach (array_chunk($profiles, 200) as $chunk) {
                        $clauses = [];
                        $bindings = [];
                        foreach (['corporate_email', 'siesa_username', 'employee_id'] as $field) {
                            $case = 'CASE id';
                            foreach ($chunk as $row) {
                                $case .= ' WHEN ? THEN ?';
                                $bindings[] = $row['id'];
                                $bindings[] = $row[$field];
                            }
                            $clauses[] = $field.' = '.$case.' ELSE '.$field.' END';
                        }
                        $bindings = array_merge($bindings, array_column($chunk, 'id'));
                        DB::update('UPDATE users SET '.implode(', ', $clauses).' WHERE id IN ('.implode(',', array_fill(0, count($chunk), '?')).')', $bindings);
                    }
                }
                $objects = [];
                foreach ($source['objects'] as $r) {
                    $id = (int) $r['K_id'];
                    $objects[$id] = ['id' => $id, 'legacy_id' => $id, 'parent_id' => max(0, (int) $r['K_idKPadre']), 'name' => (string) $r['K_nombre'], 'description' => $r['K_descripcion'], 'sort_order' => (string) ($r['K_orden'] ?? ''), 'default_value' => (string) ($r['K_valorDefecto'] ?? '')];
                }
                if (! isset($objects[1210])) {
                    throw new RuntimeException('Falta el objeto 1210 de restricciones de gestión; no se habilitó el catálogo de empleados.');
                }
                $summary['objects'] = $this->write('system_objects', array_values($objects), ['id'], $replace, $dryRun, $summary);
                $values = [];
                foreach ($source['object_values'] as $r) {
                    $user = $users[(int) $r['KUV_idUsuario']] ?? null;
                    if (! $user) {
                        $summary['skipped_users']++;

                        continue;
                    }
                    if (! isset($objects[(int) $r['KUV_idK']])) {
                        $summary['skipped_invalid']++;

                        continue;
                    }
                    $values[] = ['user_id' => $user, 'object_id' => (int) $r['KUV_idK'], 'value' => (string) $r['KUV_Valor']];
                }
                $summary['object_values'] = $this->write('system_object_values', $values, ['user_id', 'object_id'], $replace, $dryRun, $summary);
                $types = [];
                foreach ($source['document_types'] as $r) {
                    $code = strtoupper(trim((string) $r['NSID']));
                    if ($code === '' || mb_strlen($code) > 100) {
                        $summary['skipped_invalid']++;

                        continue;
                    }
                    $types[$code] = ['code' => $code, 'description' => (string) ($r['NSDES'] ?? '')];
                }
                $summary['document_types'] = count($types);
                if (! $dryRun && $types !== []) {
                    DB::table('document_types')->upsert(array_values($types), ['code'], ['description']);
                }
                $defaults = [];
                foreach ($source['document_defaults'] as $r) {
                    if ($r['TD_Modulo'] === null || $r['TD_File'] === null) {
                        $summary['skipped_invalid']++;

                        continue;
                    }
                    $user = $users[(int) $r['TD_IdUsuario']] ?? null;
                    if (! $user) {
                        $summary['skipped_users']++;

                        continue;
                    }
                    $module = mb_strtolower(rtrim((string) $r['TD_Modulo'], ' '));
                    $file = mb_strtolower(rtrim((string) $r['TD_File'], ' '));
                    $type = strtoupper(trim((string) $r['TD_TipoDocumento']));
                    if ($module === '' || ! isset($types[$type])) {
                        $summary['skipped_invalid']++;

                        continue;
                    }
                    $defaults[] = ['user_id' => $user, 'module' => $module, 'file' => $file, 'document_type' => $type];
                }
                $summary['document_defaults'] = $this->write('user_document_defaults', $defaults, ['user_id', 'module', 'file'], $replace, $dryRun, $summary);
                if ($first && ! $dryRun) {
                    foreach ($source['menus'] as $row) {
                        DB::table('menu_items')->where('legacy_id', (int) $row['ID'])->update(['icon' => (string) ($row['IMAGENICONO'] ?? ''), 'append_legacy_id' => (int) ($row['INDICADOR_CONCATENAR_ID'] ?? 1) === 1]);
                    }
                }
                $this->bindMenus($activate, $dryRun, $summary);
                if (! $dryRun) {
                    app(Hierarchy::class)->reorder('menu_items', 3);
                    DB::table('systems_import_runs')->insert(['summary' => json_encode($summary, JSON_THROW_ON_ERROR), 'created_at' => now()]);
                    DB::table('erp_access_events')->insert(['user_id' => null, 'actor' => 'console', 'event' => 'systems_imported', 'details' => json_encode($summary, JSON_THROW_ON_ERROR), 'created_at' => now()]);
                }

                return $summary;
            }, 3);
        } finally {
            if ($mode !== null) {
                $connection->statement('SET SESSION sql_mode = ?', [$mode]);
            }
        }
    }

    private function write(string $table, array $rows, array $keys, bool $replace, bool $dryRun, array &$summary): int
    {
        $identity = static fn (array $r): string => json_encode(array_map(static fn (string $key): string => (string) ($r[$key] ?? ''), $keys), JSON_THROW_ON_ERROR);
        $existingQuery = DB::table($table);
        if (! $dryRun) {
            $existingQuery->lockForUpdate();
        }
        $existing = $existingQuery->get()->mapWithKeys(fn (object $r): array => [$identity((array) $r) => (array) $r])->all();
        $seen = [];
        $batch = [];
        $retained = [];
        foreach ($rows as $row) {
            $key = $identity($row);
            if (isset($seen[$key])) {
                throw new RuntimeException("Hay identidades duplicadas en $table; no se combinaron datos.");
            }
            $seen[$key] = true;
            $old = $existing[$key] ?? null;
            if ($old && isset($row['legacy_id']) && ($old['legacy_id'] === null || (int) $old['legacy_id'] !== (int) $row['legacy_id'])) {
                throw new RuntimeException("Un ID de $table coincide con un registro local sin vínculo al origen.");
            }
            if ($old && ! $old['imported']) {
                $summary['preserved_local']++;

                continue;
            }
            $data = $row + ['id' => $old['id'] ?? null, 'imported' => true, 'revision' => $old ? $old['revision'] + 1 : 1, 'created_at' => $old['created_at'] ?? now(), 'updated_at' => now()];
            $retained[] = $old['id'] ?? null;
            $batch[] = $data;
        }
        if (! $dryRun) {
            if ($replace && in_array($table, ['system_object_values', 'user_document_defaults'], true)) {
                DB::table($table)->where('imported', true)->whereNotIn('id', array_filter($retained, fn (mixed $id): bool => $id !== null))->delete();
            }
            if ($table === 'employees') {
                $updates = [];
                $inserts = [];
                foreach ($batch as $row) {
                    if (isset($existing[$identity($row)])) {
                        $updates[] = $row;
                    } else {
                        $inserts[] = $row;
                    }
                }
                foreach (array_chunk($updates, 200) as $chunk) {
                    DB::table($table)->whereIn('id', array_column($chunk, 'id'))->update(['identity_number' => null, 'internal_code' => null]);
                }
                foreach (array_chunk($updates, 100) as $chunk) {
                    $clauses = [];
                    $bindings = [];
                    foreach (array_diff(array_keys($chunk[0]), ['id', 'legacy_id', 'created_at']) as $field) {
                        $case = 'CASE id';
                        foreach ($chunk as $row) {
                            $case .= ' WHEN ? THEN ?';
                            $bindings[] = $row['id'];
                            $bindings[] = $row[$field];
                        }
                        $clauses[] = $field.' = '.$case.' ELSE '.$field.' END';
                    }
                    $bindings = array_merge($bindings, array_column($chunk, 'id'));
                    DB::update('UPDATE employees SET '.implode(', ', $clauses).' WHERE id IN ('.implode(',', array_fill(0, count($chunk), '?')).')', $bindings);
                }
                foreach (array_chunk($inserts, 300) as $chunk) {
                    DB::table($table)->insert($chunk);
                }
            } else {
                foreach (array_chunk($batch, 300) as $chunk) {
                    DB::table($table)->upsert($chunk, $keys, array_values(array_diff(array_keys($chunk[0]), ['id', 'legacy_id', 'created_at'])));
                }
            }
            if (in_array($table, ['employees', 'system_objects'], true) && DB::table($table)->whereIn('legacy_id', array_column($rows, 'legacy_id'))->count() !== count($rows)) {
                throw new RuntimeException('La conciliación de '.$table.' no conservó todas las identidades del origen; se revirtió la carga.');
            }
        }

        return count($batch);
    }

    private function bindMenus(bool $activate, bool $dryRun, array &$summary): void
    {
        $items = DB::table('menu_items')->orderBy('id')->get();
        if (! $items->contains(fn (object $item): bool => (int) $item->id === 50)) {
            throw new RuntimeException('Importe primero el menú y las identidades del sistema anterior.');
        }
        foreach (config('erp.migrated_menu_options') as $key => $option) {
            if (! isset($option['legacy'])) {
                continue;
            }
            if ($items->contains(fn (object $item): bool => $item->migration_key === $key)) {
                $summary['preserved_bindings']++;

                continue;
            }
            $match = $items->first(function (object $item) use ($option): bool {
                if ($item->migration_key !== null || $item->archived) {
                    return false;
                }
                parse_str((string) parse_url($item->legacy_url, PHP_URL_QUERY), $query);

                return mb_strtolower((string) ($query['modulo'] ?? '')) === $option['legacy']['module'] && mb_strtolower((string) ($query['file'] ?? '')) === $option['legacy']['file'];
            });
            if (! $dryRun) {
                if ($match) {
                    DB::table('menu_items')->where('id', $match->id)->update(['migration_key' => $key, 'migration_enabled' => $activate, 'revision' => $match->revision + 1, 'updated_at' => now()]);
                } else {
                    DB::table('menu_items')->insert(['label' => $option['label'], 'parent_id' => $items->contains(fn (object $item): bool => (int) $item->id === 44 && ! $item->archived) ? 44 : 50, 'legacy_url' => '', 'sort_order' => '', 'active' => true, 'migration_key' => $key, 'migration_enabled' => $activate, 'revision' => 1, 'created_at' => now(), 'updated_at' => now()]);
                }
            }
            $summary['bound_menus']++;
        }
    }
}
