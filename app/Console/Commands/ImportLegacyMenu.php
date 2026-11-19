<?php

namespace App\Console\Commands;

use App\Support\Menu\LegacyMenuImporter;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ImportLegacyMenu extends Command
{
    protected $signature = 'erp:import-menu {--replace : Reemplazar explícitamente la configuración importada} {--dry-run : Mostrar cantidades sin modificar la base local}';

    protected $description = 'Importa menú, identidades y permisos desde MySQL de IntranetLocal; nunca copia contraseñas ni escribe en el origen.';

    public function handle(LegacyMenuImporter $importer): int
    {
        if (app()->environment('testing')) {
            $this->error('No se abren conexiones externas desde pruebas automáticas.');

            return self::FAILURE;
        }
        try {
            $source = DB::connection('intranet_mysql');
            $menus = $source->table('intranet_menu_aplicaciones')->select(['ID', 'PADRE', 'DES', 'URL', 'ORDEN', 'PUBLICA', 'ACTIVADO', 'DESDETALLE', 'IMAGENICONO', 'INDICADOR_CONCATENAR_ID'])->get()->map(fn (object $row): array => (array) $row)->all();
            $users = $source->table('intranet_usuarios')->select(['US_Id', 'US_Nombre', 'US_Apellidos', 'US_UserName', 'US_Estado', 'US_SuperUsuario'])->get()->map(fn (object $row): array => (array) $row)->all();
            $grants = $source->table('intranet_menu_aplicaciones_accesos')->select(['id_usuario', 'id_OpcionRestringida', 'Consulta', 'Creacion', 'Modificacion', 'Eliminacion', 'Aprobacion'])->get()->map(fn (object $row): array => (array) $row)->all();
            if ($this->option('dry-run')) {
                $this->line(json_encode(['source_menus' => count($menus), 'source_users' => count($users), 'source_grants' => count($grants)]));
            } else {
                $this->line(json_encode($importer->import($menus, $users, $grants, (bool) $this->option('replace'))));
            }

            return self::SUCCESS;
        } catch (\Throwable $exception) {
            report($exception);
            $this->error('Importación no aplicada. Revise el registro local; no se modificó el origen.');

            return self::FAILURE;
        } finally {
            DB::disconnect('intranet_mysql');
        }
    }
}
