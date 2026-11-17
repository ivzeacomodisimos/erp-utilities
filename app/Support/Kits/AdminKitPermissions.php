<?php

namespace App\Support\Kits;

use App\Models\User;
use Ivandzb\CrudKit\Definition\Crud;
use Ivandzb\CrudKit\Ports\Permissions;

class AdminKitPermissions implements Permissions
{
    public function __construct(private User $user, private string $ability = 'menu.manage') {}

    public function allows(Crud $crud, $operation, $code): bool
    {
        return $this->user->can($this->ability);
    }
}
