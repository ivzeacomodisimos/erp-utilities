<?php

namespace App\Console\Commands;

use App\Support\Menu\LegacyOptionPermissionsImporter;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Throwable;

class ImportLegacyOptionPermissions extends Command
{
    protected $signature = 'erp:import-option-permissions {--replace : Reemplazar solo los permisos previamente importados} {--dry-run : Validar el origen sin escribir en ERP}';

    protected $description = 'Importa permisos de opciones y botones para los usuarios vinculados; no modifica IntranetLocal.';

    public function handle(LegacyOptionPermissionsImporter $importer): int
    {
        if (app()->environment('testing')) {
            $this->error('No se abren conexiones externas desde pruebas automáticas.');

            return self::FAILURE;
        }
        try {
            $rows = DB::connection('intranet_mysql')->table('intranet_permisos_opcion')
                ->select(['IP_IdUsuario', 'IP_Modulo', 'IP_File', 'IP_IdOpcion', 'IP_Read', 'IP_Insert', 'IP_Write', 'IP_Delete'])
                ->get()->map(fn (object $row): array => (array) $row)->all();
            $this->line(json_encode($importer->import($rows, (bool) $this->option('replace'), (bool) $this->option('dry-run')), JSON_THROW_ON_ERROR));

            return self::SUCCESS;
        } catch (Throwable $exception) {
            report($exception);
            $this->error('Importación no aplicada. Revise el registro local; no se modificó el origen.');
            if ($exception instanceof ValidationException) {
                $this->error(json_encode($exception->errors(), JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR));
            }

            return self::FAILURE;
        } finally {
            DB::disconnect('intranet_mysql');
        }
    }
}
