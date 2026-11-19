<?php

namespace App\Support\Menu;

use Illuminate\Database\Connection;
use Illuminate\Database\Query\Builder;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class GeneratedCrudStorage
{
    public function connections(): array
    {
        $options = ['' => 'Base de datos ERP'];
        foreach (config('database.connections', []) as $name => $config) {
            if ($name === config('database.default') || str_starts_with($name, 'generated_crud_')
                || in_array($name, ['sqlite', 'mysql', 'mariadb', 'pgsql', 'sqlsrv', 'intranet_mysql', 'intranet_mysql8'], true)) {
                continue;
            }
            if (in_array($config['driver'] ?? '', ['mysql', 'mariadb', 'pgsql', 'sqlsrv', 'sqlite'], true)
                && ! empty($config['database']) && (($config['driver'] ?? '') === 'sqlite' || ! empty($config['host']))) {
                $label = ['intranet_sqlsrv' => 'Intranet SQL Server', 'siesa' => 'Siesa', 'wms_sqlsrv' => 'WMS SQL Server'][$name] ?? $name;
                $options[$name] = $label.' · '.$config['driver'];
            }
        }

        return $options;
    }

    public function resolve(string $reference, string $selected = ''): array
    {
        if (! array_key_exists($selected, $this->connections())) {
            throw ValidationException::withMessages(['table_connection' => 'Seleccione una conexión de base de datos configurada.']);
        }
        $segments = explode('.', $reference);
        if (count($segments) > 3 || array_filter($segments, fn (string $part): bool => ! preg_match('/^[a-zA-Z][a-zA-Z0-9_]{0,62}$/D', $part))) {
            throw ValidationException::withMessages(['table_name' => 'Use tabla, esquema.tabla o base.esquema.tabla, sin espacios ni caracteres especiales.']);
        }
        $name = $selected ?: config('database.default');
        $config = config('database.connections.'.$name);
        $driver = $config['driver'];
        $database = $config['database'];
        $leaf = array_pop($segments);
        $schema = null;
        if ($driver === 'sqlsrv' || $driver === 'pgsql') {
            $schema = array_pop($segments) ?? ($driver === 'sqlsrv' ? 'dbo' : 'public');
            $database = array_pop($segments) ?? $database;
        } elseif (in_array($driver, ['mysql', 'mariadb'], true)) {
            if (count($segments) > 1) {
                throw ValidationException::withMessages(['table_name' => 'MySQL usa base.tabla. Para base.esquema.tabla seleccione una conexión SQL Server.']);
            }
            $database = array_pop($segments) ?? $database;
            $schema = $database;
        } elseif ($driver === 'sqlite') {
            if (count($segments) > 1 || ($segments && $segments[0] !== 'main')) {
                throw ValidationException::withMessages(['table_name' => 'SQLite admite tabla o main.tabla.']);
            }
            $schema = 'main';
        } else {
            throw ValidationException::withMessages(['table_connection' => 'El motor de esta conexión no está soportado.']);
        }
        if (in_array(strtolower((string) $schema), ['sys', 'information_schema', 'pg_catalog'], true)
            || in_array(strtolower((string) $database), ['master', 'model', 'msdb', 'tempdb', 'mysql', 'performance_schema', 'information_schema'], true)) {
            throw ValidationException::withMessages(['table_name' => 'Las bases y esquemas internos del motor no están disponibles para el generador.']);
        }
        if ($database !== $config['database']) {
            $config['database'] = $database;
            unset($config['url'], $config['read'], $config['write']);
            $name = 'generated_crud_'.hash('sha256', serialize($config));
            config(['database.connections.'.$name => $config]);
        }
        $connection = DB::connection($name);
        $table = in_array($driver, ['sqlsrv', 'pgsql'], true) ? $schema.'.'.$leaf : $leaf;
        $canonical = match ($driver) {
            'sqlsrv', 'pgsql' => $database.'.'.$schema.'.'.$leaf,
            'mysql', 'mariadb' => $selected !== '' || $database !== config('database.connections.'.config('database.default').'.database') ? $database.'.'.$leaf : $leaf,
            default => $leaf,
        };

        return ['connection' => $connection, 'schema' => $connection->getSchemaBuilder(), 'table' => $table,
            'name' => $leaf, 'database' => $database, 'schema_name' => $schema, 'canonical' => $canonical];
    }

    public function forProgram(object $program): array
    {
        return $this->resolve($program->table_name, $program->table_connection ?? '');
    }

    public function query(object $program): Builder
    {
        $storage = $this->forProgram($program);

        return $storage['connection']->table($storage['table']);
    }

    public function connection(object $program): Connection
    {
        return $this->forProgram($program)['connection'];
    }

    public function assertSchema(array $storage): void
    {
        if (in_array($storage['connection']->getDriverName(), ['sqlsrv', 'pgsql'], true)
            && ! in_array($storage['schema_name'], array_column($this->metadata(fn (): array => $storage['schema']->getSchemas()), 'name'), true)) {
            throw ValidationException::withMessages(['table_name' => 'El esquema indicado no existe en la base seleccionada. Créelo en el servidor antes de preparar el CRUD.']);
        }
    }

    public function metadata(callable $callback): mixed
    {
        try {
            return $callback();
        } catch (QueryException|\PDOException $exception) {
            throw ValidationException::withMessages(['table_name' => 'No se pudo acceder a la base, esquema o tabla seleccionados. Verifique que existan y que la conexión tenga los permisos necesarios.']);
        }
    }

    public function create(array $storage, callable $definition): void
    {
        $create = fn () => $storage['schema']->create($storage['table'], $definition);
        if ($storage['connection']->getSchemaGrammar()->supportsSchemaTransactions()) {
            $storage['connection']->transaction($create);
        } else {
            $create();
        }
    }

    public function sameDatabase(array $left, array $right): bool
    {
        return $left['connection']->getName() === $right['connection']->getName();
    }
}
