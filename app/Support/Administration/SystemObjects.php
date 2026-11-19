<?php

namespace App\Support\Administration;

use App\Models\User;
use Illuminate\Support\Facades\DB;

class SystemObjects
{
    public function identityFromSiesa(string $identity): array
    {
        if (trim($identity) === '') {
            return [];
        }
        $row = DB::connection('siesa')->table('t200_mm_terceros')->where('f200_id', trim($identity))->select(['f200_nombres', 'f200_apellido1', 'f200_apellido2'])->first();

        return $row ? ['first_name' => trim($row->f200_nombres), 'last_name' => trim(trim($row->f200_apellido1).' '.trim($row->f200_apellido2))] : [];
    }

    public function userValue(int $objectId, User $user): ?string
    {
        $value = DB::table('system_object_values')->where('object_id', $objectId)->where('user_id', $user->id)->value('value');

        return $value === null ? null : (string) $value;
    }

    public function value(int $objectId, ?User $user = null): ?string
    {
        if ($user !== null) {
            $value = $this->userValue($objectId, $user);
            if ($value !== null) {
                return $value;
            }
        }

        return DB::table('system_objects')->where('id', $objectId)->value('default_value');
    }

    public function values(int $objectId, ?User $user = null): array
    {
        $value = $this->value($objectId, $user);

        return $value === null ? [] : explode(',', $value);
    }

    public function employeeGroups(User $user): ?array
    {
        $value = $this->userValue(1210, $user);
        if ($value === null) {
            return null;
        }
        $ids = [];
        foreach (explode(',', $value) as $part) {
            if (ctype_digit(trim($part))) {
                $ids[] = (int) trim($part);
            }
        }

        return $ids === [] ? null : array_values(array_unique($ids));
    }

    public function documentType(User $user, string $module, string $file): ?string
    {
        return DB::table('user_document_defaults')->where('user_id', $user->id)->where('module', mb_strtolower($module))->where('file', mb_strtolower($file))->value('document_type');
    }
}
