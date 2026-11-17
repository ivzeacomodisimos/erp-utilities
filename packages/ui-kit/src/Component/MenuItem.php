<?php

namespace Ivandzb\UiKit\Component;

/**
 * An option of a Menu: a link, or a group with sub-options.
 */
final class MenuItem
{
  /** @var string */
  private $label;
  /** @var string|null */
  private $href;
  /** @var string|null */
  private $icon;
  /** @var bool */
  private $active = false;
  /** @var string|null */
  private $badge;
  /** @var MenuItem[] */
  private $items = array();

  public function __construct($label, $href = null)
  {
    $this->label = (string) $label;
    $this->href = $href === null || $href === '' || $href === '#' ? null : (string) $href;
  }

  /**
   * @return self
   */
  public static function make($label, $href = null)
  {
    return new self($label, $href);
  }

  /**
   * ['label' => ..., 'href' => ..., 'icon' => ..., 'active' => bool, 'badge' => ..., 'items' => [...]]
   *
   * @return self
   */
  public static function fromArray(array $data)
  {
    $item = new self(isset($data['label']) ? $data['label'] : '', isset($data['href']) ? $data['href'] : null);
    if (!empty($data['icon'])) {
      $item->icon($data['icon']);
    }
    if (!empty($data['active'])) {
      $item->active();
    }
    if (isset($data['badge']) && $data['badge'] !== '') {
      $item->badge($data['badge']);
    }
    foreach (isset($data['items']) ? $data['items'] : array() as $child) {
      $item->items($child instanceof self ? $child : self::fromArray($child));
    }
    return $item;
  }

  /** @return $this */
  public function icon($icon)
  {
    $this->icon = $icon === null ? null : (string) $icon;
    return $this;
  }

  /** @return $this */
  public function active($active = true)
  {
    $this->active = (bool) $active;
    return $this;
  }

  /** @return $this */
  public function badge($badge)
  {
    $this->badge = $badge === null ? null : (string) $badge;
    return $this;
  }

  /**
   * @param MenuItem ...$items
   * @return $this
   */
  public function items(MenuItem ...$items)
  {
    foreach ($items as $item) {
      $this->items[] = $item;
    }
    return $this;
  }

  public function label()
  {
    return $this->label;
  }

  public function href()
  {
    return $this->href;
  }

  public function getIcon()
  {
    return $this->icon;
  }

  public function getBadge()
  {
    return $this->badge;
  }

  public function isActive()
  {
    return $this->active;
  }

  /**
   * @return MenuItem[]
   */
  public function children()
  {
    return $this->items;
  }

  public function isGroup()
  {
    return count($this->items) > 0;
  }

  /**
   * True when this option or one below it is active (a group opens to show it).
   */
  public function containsActive()
  {
    if ($this->active) {
      return true;
    }
    foreach ($this->items as $item) {
      if ($item->containsActive()) {
        return true;
      }
    }
    return false;
  }

  /**
   * Marks as active the options whose href is $href (compared without the host).
   */
  public function markActive($href)
  {
    if ($this->href !== null && self::sameLink($this->href, $href)) {
      $this->active = true;
    }
    foreach ($this->items as $item) {
      $item->markActive($href);
    }
  }

  private static function sameLink($a, $b)
  {
    $normalize = function ($url) {
      $parts = parse_url((string) $url);
      $path = isset($parts['path']) ? ltrim($parts['path'], '/') : '';
      parse_str(isset($parts['query']) ? $parts['query'] : '', $query);
      ksort($query);
      return $path . '?' . http_build_query($query);
    };
    return $normalize($a) === $normalize($b);
  }
}
