<?php

namespace App\Support\Kits;

use App\Models\User;
use App\Support\Administration\SystemsAccess;
use Ivandzb\CrudKit\Definition\Crud;
use Ivandzb\CrudKit\Ports\Permissions;

class SystemsKitPermissions implements Permissions
{
    public function __construct(private User $user, private string $section) {}

    public function allows(Crud $crud, $operation, $code): bool
    {
        return app(SystemsAccess::class)->allows($this->user, $this->section, (string) $operation);
    }
}
