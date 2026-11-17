<?php

namespace App\Models;

use App\Support\Auth\AccessRoles;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email'])]
#[Hidden(['password', 'remember_token', 'ldap_guid', 'token_version'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'erp_roles' => 'array',
            'erp_active' => 'boolean',
            'token_version' => 'integer',
            'last_login_at' => 'datetime',
        ];
    }

    public function hasErpAccess(): bool
    {
        return $this->erp_active && AccessRoles::roles($this) !== [];
    }
}
