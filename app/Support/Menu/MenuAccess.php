<?php

namespace App\Support\Menu;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Ivandzb\UiKit\Component\MenuItem;

class MenuAccess
{
    private const OPERATIONS = ['view', 'create', 'update', 'delete', 'approve'];

    public function permissions(User $user, int $id): array
    {
        $denied = array_fill_keys(self::OPERATIONS, false);
        if (! $user->hasErpAccess()) {
            return $denied;
        }
        $item = DB::table('menu_items')->where('id', $id)->first();
        $options = app(MigratedMenuRoutes::class)->options();
        if (! $item || ! $item->migration_enabled || ! isset($options[$item->migration_key ?? '']) || ! $this->activePath($item)) {
            return $denied;
        }
        $ability = $options[$item->migration_key]['ability'] ?? null;
        if ($ability && ! $user->can($ability)) {
            return $denied;
        }
        if (in_array('administrador', $user->erp_roles ?? [], true)) {
            return array_fill_keys(self::OPERATIONS, true);
        }
        $grant = DB::table('menu_grants')->where('user_id', $user->id)->where('menu_item_id', $id)->first();
        foreach (self::OPERATIONS as $operation) {
            $denied[$operation] = (bool) ($grant?->{'can_'.$operation} ?? false);
        }
        $denied['view'] = $denied['view'] || (bool) $item->is_public || $item->parent_id === 74;

        return $denied;
    }

    public function tree(User $user): array
    {
        if (! $user->hasErpAccess()) {
            return [];
        }
        $rows = DB::table('menu_items')->where('active', true)->where('archived', false)->orderBy('sort_order')->orderBy('id')->get()->keyBy('id');
        $grantIds = DB::table('menu_grants')->where('user_id', $user->id)->get()->filter(
            fn (object $grant): bool => $grant->can_view || $grant->can_create || $grant->can_update || $grant->can_delete || $grant->can_approve
        )->pluck('menu_item_id')->all();
        $admin = in_array('administrador', $user->erp_roles ?? [], true);
        $visible = [];
        $options = app(MigratedMenuRoutes::class)->options();
        foreach ($rows as $row) {
            if ($options[$row->migration_key ?? '']['administration'] ?? false) {
                continue;
            }
            if (! $row->migration_enabled || ! isset($options[$row->migration_key ?? ''])) {
                continue;
            }
            if (! $admin && ! $row->is_public && $row->parent_id !== 74 && ! in_array($row->id, $grantIds, true)) {
                continue;
            }
            $current = $row;
            $path = [];
            while ($current && ! in_array($current->id, $path, true)) {
                $path[] = $current->id;
                if (in_array($current->id, [50, 74], true)) {
                    foreach ($path as $id) {
                        $visible[$id] = true;
                    }
                    break;
                }
                $current = $rows->get($current->parent_id);
            }
        }
        $build = function (int $parent, array $path = []) use (&$build, $rows, $visible, $user): array {
            $items = [];
            foreach ($rows as $row) {
                if ($row->parent_id !== $parent || ! isset($visible[$row->id]) || in_array($row->id, $path, true)) {
                    continue;
                }
                $children = $build($row->id, [...$path, $row->id]);
                $canOpen = $this->permissions($user, $row->id)['view'];
                $url = $canOpen ? app(MigratedMenuRoutes::class)->url($row->migration_key) : null;
                if ($children !== []) {
                    if ($url) {
                        array_unshift($children, MenuItem::make($row->label, $url));
                    }
                    $items[] = MenuItem::make($row->label)->items(...$children);
                } elseif ($url) {
                    $items[] = MenuItem::make($row->label, $url);
                }
            }

            return $items;
        };
        $items = $build(50);
        $public = $build(74);
        if ($public !== []) {
            $items[] = MenuItem::make('Públicas')->icon('public')->items(...$public);
        }

        return $items;
    }

    private function activePath(object $item): bool
    {
        $seen = [];
        while (true) {
            if (! $item->active || ($item->archived ?? false) || in_array($item->id, $seen, true)) {
                return false;
            }
            if (in_array($item->id, [50, 74], true)) {
                return true;
            }
            $seen[] = $item->id;
            $item = DB::table('menu_items')->where('id', $item->parent_id)->first();
            if (! $item) {
                return false;
            }
        }
    }

    public function destination(object $item): ?string
    {
        $url = str_replace(' ', '%20', trim($item->legacy_url));
        if ($url === '' || in_array($url, ['#', '-'], true) || preg_match('/[\\x00-\\x20\\x7f\\\\\\\\]/', $url) || str_starts_with($url, '//')) {
            return null;
        }
        $base = rtrim((string) config('erp.legacy_base_url'), '/').'/';
        if (! filter_var($base, FILTER_VALIDATE_URL) || ! in_array(parse_url($base, PHP_URL_SCHEME), ['http', 'https'], true)) {
            return null;
        }
        if (parse_url($url, PHP_URL_SCHEME)) {
            if (! in_array(parse_url($url, PHP_URL_SCHEME), ['http', 'https'], true) || parse_url($url, PHP_URL_USER) || parse_url($url, PHP_URL_PASS)
                || ! in_array($this->origin($url), array_merge([$this->origin($base)], config('erp.legacy_allowed_origins', [])), true)) {
                return null;
            }
            $destination = $url;
        } else {
            if (str_contains(rawurldecode($url), '..')) {
                return null;
            }
            $destination = str_starts_with($url, '/') ? $this->origin($base).$url : $base.$url;
        }
        $separator = str_contains($destination, '?') ? '&' : '?';

        return ($item->append_legacy_id ?? true) ? $destination.$separator.'idMenu='.$item->id : $destination;
    }

    private function origin(string $url): string
    {
        return strtolower((string) parse_url($url, PHP_URL_SCHEME).'://'.(string) parse_url($url, PHP_URL_HOST))
            .(parse_url($url, PHP_URL_PORT) ? ':'.parse_url($url, PHP_URL_PORT) : '');
    }
}
