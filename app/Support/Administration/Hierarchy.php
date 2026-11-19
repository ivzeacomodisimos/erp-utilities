<?php

namespace App\Support\Administration;

use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class Hierarchy
{
    private array $trees = [];

    public function validateParent(string $table, ?int $id, int $parent): void
    {
        $rows = DB::table($table)->pluck('parent_id', 'id')->all();
        $seen = $id === null ? [] : [$id => true];
        while ($parent !== 0) {
            if (isset($seen[$parent]) || ! array_key_exists($parent, $rows)) {
                throw ValidationException::withMessages(['parent_id' => 'El padre no existe o generaría un ciclo en la jerarquía.']);
            }
            $seen[$parent] = true;
            $parent = (int) $rows[$parent];
        }
    }

    public function reorder(string $table, int $digits, ?int $skipRevisionFor = null): int
    {
        return DB::transaction(function () use ($table, $digits, $skipRevisionFor): int {
            $query = DB::table($table)->orderBy('id');
            if ($table === 'menu_items') {
                $query->where('archived', false);
            }
            $rows = $query->lockForUpdate()->get()->keyBy('id');
            $children = [];
            foreach ($rows as $row) {
                $children[(int) $row->parent_id][] = $row;
            }
            $seen = [];
            $orders = [];
            $walk = function (int $parent, string $prefix) use (&$walk, &$seen, &$orders, $children, $digits): void {
                $position = 1;
                foreach ($children[$parent] ?? [] as $row) {
                    if (isset($seen[$row->id])) {
                        throw ValidationException::withMessages(['parent_id' => 'La jerarquía contiene un ciclo.']);
                    }
                    $seen[$row->id] = true;
                    $order = $prefix.str_pad((string) $position++, $digits, '0', STR_PAD_LEFT);
                    $orders[$row->id] = $order;
                    if ((int) $row->id !== $parent) {
                        $walk((int) $row->id, $order.'.');
                    }
                }
            };
            $walk(0, '');
            if (count($seen) !== $rows->count()) {
                throw ValidationException::withMessages(['parent_id' => 'Hay registros con padre inexistente o ciclos. Corrija la jerarquía antes de ordenar.']);
            }
            foreach ($orders as $id => $order) {
                if ($rows[$id]->sort_order !== $order) {
                    $values = ['sort_order' => $order, 'updated_at' => now()];
                    if ($id !== $skipRevisionFor) {
                        $values['revision'] = DB::raw('revision + 1');
                    } DB::table($table)->where('id', $id)->update($values);
                }
            }

            return count($orders);
        });
    }

    public function path(string $table, int $id): string
    {
        $rows = $this->trees[$table] ??= DB::table($table)->select(['id', 'parent_id', $table === 'system_objects' ? 'name' : 'label'])->get()->keyBy('id');
        $names = [];
        $seen = [];
        $current = $rows->get($id);
        while ($current && ! isset($seen[$current->id])) {
            $seen[$current->id] = true;
            array_unshift($names, $current->name ?? $current->label);
            $current = (int) $current->parent_id === 0 ? null : $rows->get($current->parent_id);
        }

        return implode(' › ', $names);
    }
}
