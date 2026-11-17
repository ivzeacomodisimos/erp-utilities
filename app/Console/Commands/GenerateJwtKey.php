<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class GenerateJwtKey extends Command
{
    protected $signature = 'erp:jwt-key {--force : Rotar la clave e invalidar los JWT anteriores}';

    protected $description = 'Guarda una clave JWT independiente en .env, sin mostrar su valor.';

    public function handle(): int
    {
        $path = app()->environmentFilePath();
        if (! is_file($path) || ! is_writable($path)) {
            $this->error('No se puede actualizar el archivo de entorno.');

            return self::FAILURE;
        }

        $contents = file_get_contents($path);
        if (preg_match('/^ERP_JWT_SECRET=(.+)$/m', $contents) && ! $this->option('force')) {
            $this->error('Ya existe una clave. Use --force solo si desea invalidar todos los JWT emitidos.');

            return self::FAILURE;
        }

        $line = 'ERP_JWT_SECRET='.bin2hex(random_bytes(64));
        $contents = preg_match('/^ERP_JWT_SECRET=.*$/m', $contents)
            ? preg_replace('/^ERP_JWT_SECRET=.*$/m', $line, $contents)
            : rtrim($contents)."\n".$line."\n";
        file_put_contents($path, $contents, LOCK_EX);
        $this->callSilent('config:clear');
        $this->info('Clave JWT guardada sin mostrarla. Recree los servicios si capturan .env al arrancar.');

        return self::SUCCESS;
    }
}
