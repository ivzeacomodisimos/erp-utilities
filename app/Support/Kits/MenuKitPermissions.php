<?php

namespace App\Support\Kits;

use App\Models\User;
use App\Support\Menu\MenuAccess;
use Ivandzb\CrudKit\Definition\Crud;
use Ivandzb\CrudKit\Ports\Permissions;

class MenuKitPermissions implements Permissions
{
    public function __construct(private User $user, private int $menuId) {}

    public function allows(Crud $crud, $operation, $code): bool
    {
        $key = match ($operation) {
            Crud::LIST => 'view', Crud::CREATE => 'create', Crud::UPDATE => 'update', Crud::DELETE => 'delete', default => null,
        };

        return $key !== null && app(MenuAccess::class)->permissions($this->user, $this->menuId)[$key];
    }
}
