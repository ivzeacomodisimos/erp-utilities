<?php

namespace App\Support\Kits;

use App\Models\User;
use App\Support\Menu\MenuAccess;
use App\Support\Menu\OptionAccess;
use Ivandzb\CrudKit\Definition\Crud;
use Ivandzb\CrudKit\Ports\Permissions;

class OptionKitPermissions implements Permissions
{
    public function __construct(private User $user, private int $menuId, private string $module, private string $file, private int $optionId) {}

    public function allows(Crud $crud, $operation, $code): bool
    {
        $operations = [
            Crud::LIST => ['view', 'access'], Crud::CREATE => ['create', 'insert'],
            Crud::UPDATE => ['update', 'write'], Crud::DELETE => ['delete', 'delete'],
        ];
        if (! isset($operations[$operation])) {
            return false;
        }
        [$menuOperation, $optionOperation] = $operations[$operation];
        $menuPermissions = app(MenuAccess::class)->permissions($this->user, $this->menuId);

        return $menuPermissions['view'] && $menuPermissions[$menuOperation]
            && app(OptionAccess::class)->allows($this->user, $this->module, $this->file, $this->optionId, $optionOperation);
    }
}
