<?php

namespace App\Console\Commands;

use App\Support\Administration\LegacySystemsImporter;
use Illuminate\Console\Command;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Throwable;

class ImportLegacySystems extends Command
{
    protected $signature = 'erp:import-systems {--dry-run : Validar y mostrar cantidades sin escribir} {--replace : Conciliar registros importados conservando cambios locales} {--activate : Habilitar únicamente las nuevas vinculaciones de Administración}';

    protected $description = 'Migra catálogos de Sistemas a Administración sin modificar MySQL ni SQL Server del origen.';

    public function handle(LegacySystemsImporter $importer): int
    {
        if (app()->environment('testing')) {
            $this->error('No se abren conexiones externas desde pruebas.');

            return self::FAILURE;
        }
        try {
            $mysql = DB::connection('intranet_mysql');
            $read = static fn (string $table, array $columns): array => $mysql->table($table)->select($columns)->get()->map(fn (object $r): array => (array) $r)->all();
            $source = [
                'users' => $read('intranet_usuarios', ['US_Id', 'US_Correo', 'US_UserNameUNO', 'US_IdEmpleado']),
                'groups' => $read('empl_gestion', ['idGestion', 'Nombre', 'idGestionPadre']),
                'employees' => $read('empl_empleado', ['idEmpleado', 'Empl_Gestion_idGestion', 'Cedula', 'Nombre', 'Apellidos', 'Correo', 'Estado', 'CodigoInterno', 'FIngreso', 'FRetiro']),
                'objects' => $read('intranet_objetos', ['K_id', 'K_nombre', 'K_descripcion', 'K_idKPadre', 'K_orden', 'K_valorDefecto']),
                'object_values' => $read('intranet_objetos_usuarios', ['KUV_idK', 'KUV_idUsuario', 'KUV_Valor']),
                'document_defaults' => $read('tipo_documento_defecto', ['TD_IdUsuario', 'TD_Modulo', 'TD_File', 'TD_TipoDocumento']),
                'document_types' => DB::connection('intranet_sqlsrv')->table('aplicacion.numerosiguiente')->select(['NSID', 'NSDES'])->get()->map(fn (object $r): array => (array) $r)->all(),
                'menus' => $read('intranet_menu_aplicaciones', ['ID', 'IMAGENICONO', 'INDICADOR_CONCATENAR_ID']),
            ];
            $this->line(json_encode($importer->import($source, (bool) $this->option('replace'), (bool) $this->option('activate'), (bool) $this->option('dry-run')), JSON_THROW_ON_ERROR));

            return self::SUCCESS;
        } catch (Throwable $e) {
            report($e);
            $this->error('No se aplicó la importación. '.($e instanceof \RuntimeException && ! $e instanceof QueryException ? $e->getMessage() : 'Revise el registro local.'));

            return self::FAILURE;
        } finally {
            DB::disconnect('intranet_mysql');
            DB::disconnect('intranet_sqlsrv');
        }
    }
}
