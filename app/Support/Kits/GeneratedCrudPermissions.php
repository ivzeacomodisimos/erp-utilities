<?php

namespace App\Support\Kits;

use App\Models\User;
use App\Support\Menu\MenuAccess;
use Ivandzb\CrudKit\Definition\Crud;
use Ivandzb\CrudKit\Ports\Permissions;

class GeneratedCrudPermissions implements Permissions
{
    public function __construct(private User $user, private int $menuId) {}

    public function allows(Crud $crud, $operation, $code): bool
    {
        $key = match ($operation) {
            Crud::LIST, 'autocomplete' => 'view', Crud::CREATE => 'create', Crud::UPDATE => 'update', Crud::DELETE => 'delete', default => null,
        };
        $permissions = app(MenuAccess::class)->permissions($this->user, $this->menuId);

        return $key && $permissions['view'] && $permissions[$key];
    }
}
