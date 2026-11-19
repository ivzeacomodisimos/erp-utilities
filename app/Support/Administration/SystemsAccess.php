<?php

namespace App\Support\Administration;

use App\Models\User;
use App\Support\Menu\OptionAccess;

class SystemsAccess
{
    public const SECTIONS = ['empleados' => ['aplicacion', 'empleados', 4], 'tipos-documento' => ['menuaplic', 'manttiposdocumentodefecto', 5], 'objetos' => ['menuaplic', 'objetos', 7], 'objetos-usuarios' => ['menuaplic', 'objetosyusuarios', 8]];

    public function allows(User $user, string $section, string $operation = 'list'): bool
    {
        if (! isset(self::SECTIONS[$section]) || ! $user->hasErpAccess() || ! in_array($operation, ['list', 'create', 'update', 'delete', 'ordenar', 'datosDeCedula'], true)) {
            return false;
        }
        [$module,$file,$option] = self::SECTIONS[$section];
        if (! app(OptionAccess::class)->allows($user, $module, $file, $option)) {
            return false;
        }
        if ($section === 'empleados' && in_array($operation, ['update', 'delete'], true)) {
            return in_array('administrador', $user->erp_roles ?? [], true);
        }

        return ! in_array($section, ['objetos', 'objetos-usuarios'], true) || $operation !== 'delete';
    }
}
