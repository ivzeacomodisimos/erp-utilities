<?php

namespace App\Support\Menu;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use RuntimeException;

class LegacyOptionPermissionsImporter
{
    public function import(array $permissions, bool $replace = false, bool $dryRun = false): array
    {
        $apply = function () use ($permissions, $replace, $dryRun): array {
            if (! $dryRun && DB::table('option_permission_import_runs')->exists() && ! $replace) {
                throw new RuntimeException('Ya existe una importación de opciones. Use --replace para reemplazar solo los permisos importados.');
            }
            $users = User::whereNotNull('legacy_user_id')->pluck('id', 'legacy_user_id')->all();
            $existingRows = DB::table('option_grants')->get()->keyBy(fn (object $row): string => json_encode(
                [(int) $row->user_id, $row->module, $row->file, (int) $row->option_id], JSON_THROW_ON_ERROR
            ))->all();
            $summary = ['source_permissions' => count($permissions), 'imported' => 0, 'skipped_users' => 0, 'skipped_invalid' => 0, 'preserved_local' => 0];
            $rows = [];
            foreach ($permissions as $source) {
                foreach (['IP_Modulo', 'IP_File'] as $field) {
                    if (isset($source[$field]) && is_string($source[$field])) {
                        $source[$field] = rtrim($source[$field], ' ');
                    }
                }
                if (! isset($source['IP_Modulo'], $source['IP_File'], $source['IP_IdOpcion'], $source['IP_IdUsuario'])
                    || $source['IP_Modulo'] === '' || preg_match('/[\x00-\x20\x7f]/u', $source['IP_Modulo'].$source['IP_File'])) {
                    $summary['skipped_invalid']++;

                    continue;
                }
                $data = Validator::make($source, [
                    'IP_IdUsuario' => ['required', 'integer', 'min:0'],
                    'IP_Modulo' => ['required', 'string', 'max:60', 'regex:/^\\S+$/u'],
                    'IP_File' => ['present', 'string', 'max:60', 'regex:/^\\S*$/u'],
                    'IP_IdOpcion' => ['required', 'integer', 'min:0', 'max:4294967295'],
                    'IP_Read' => ['required', 'boolean'], 'IP_Insert' => ['required', 'boolean'],
                    'IP_Write' => ['required', 'boolean'], 'IP_Delete' => ['required', 'boolean'],
                ])->validate();
                $user = $users[$data['IP_IdUsuario']] ?? null;
                if (! $user) {
                    $summary['skipped_users']++;

                    continue;
                }
                $row = ['user_id' => $user, 'module' => mb_strtolower($data['IP_Modulo']),
                    'file' => mb_strtolower($data['IP_File']), 'option_id' => (int) $data['IP_IdOpcion']];
                $key = json_encode(array_values($row), JSON_THROW_ON_ERROR);
                if (isset($rows[$key])) {
                    throw new RuntimeException('El origen contiene permisos de opción duplicados; no se combinaron sus autorizaciones.');
                }
                foreach (['read' => 'Read', 'insert' => 'Insert', 'write' => 'Write', 'delete' => 'Delete'] as $operation => $column) {
                    $row['can_'.$operation] = (bool) $data['IP_'.$column];
                }
                $rows[$key] = $row;
            }
            if ($replace && ! $dryRun) {
                DB::table('option_grants')->where('imported', true)->delete();
            }
            $inserts = [];
            foreach ($rows as $key => $row) {
                $existing = $existingRows[$key] ?? null;
                if ($existing && ! $existing->imported) {
                    $summary['preserved_local']++;

                    continue;
                }
                if ($existing && ! $replace && ! $dryRun) {
                    throw new RuntimeException('Ya existen permisos importados. Use --replace.');
                }
                if (! $dryRun) {
                    $inserts[] = $row + ['imported' => true, 'revision' => 1, 'created_at' => now(), 'updated_at' => now()];
                }
                $summary['imported']++;
            }
            if (! $dryRun) {
                foreach (array_chunk($inserts, 500) as $chunk) {
                    DB::table('option_grants')->insert($chunk);
                }
                DB::table('option_permission_import_runs')->insert(['summary' => json_encode($summary, JSON_THROW_ON_ERROR), 'created_at' => now()]);
                DB::table('erp_access_events')->insert(['user_id' => null, 'event' => 'option_permissions_imported',
                    'actor' => 'console', 'details' => json_encode($summary, JSON_THROW_ON_ERROR), 'created_at' => now()]);
            }

            return $summary;
        };

        return $dryRun ? $apply() : DB::transaction($apply);
    }
}
