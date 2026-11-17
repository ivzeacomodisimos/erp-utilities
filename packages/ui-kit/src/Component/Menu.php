<?php

namespace Ivandzb\UiKit\Component;

use Ivandzb\UiKit\Html;
use Ivandzb\UiKit\Node\Element;

/**
 * Navigation menu with groups that open and close.
 *
 *   Menu::make()->items(
 *     MenuItem::make('Inicio', 'index.php')->icon('home'),
 *     MenuItem::make('Logística')->icon('local_shipping')->items(
 *       MenuItem::make('Lista de picking', 'index.php?modulo=logistica&file=mant_lista_picking')
 *     )
 *   )->activeHref($_SERVER['REQUEST_URI']);
 */
class Menu extends Component
{
  /** @var MenuItem[] */
  private $items = array();
  /** @var string|null placeholder of the search box (null: no search box) */
  private $search;
  /** @var string */
  private $noResults = 'Sin resultados';
  private $mobileDropdown = true;

  /** Quasar: collapse this module menu into a full-width selector on small screens. */
  public function mobileDropdown($enabled = true)
  {
    $this->mobileDropdown = (bool) $enabled;
    return $this;
  }

  public function usesMobileDropdown()
  {
    return $this->mobileDropdown;
  }

  /**
   * @return static
   */
  public static function make()
  {
    return new static();
  }

  /**
   * @param array $items MenuItem::fromArray() data, one entry per option
   * @return static
   */
  public static function fromArray(array $items)
  {
    $menu = new static();
    foreach ($items as $item) {
      $menu->items($item instanceof MenuItem ? $item : MenuItem::fromArray($item));
    }
    return $menu;
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

  /**
   * Marks as active the options that link to $href.
   *
   * @return $this
   */
  public function activeHref($href)
  {
    foreach ($this->items as $item) {
      $item->markActive($href);
    }
    return $this;
  }

  /**
   * A search box above the options. It ignores case and accents and also looks in the
   * options inside groups: a group stays (opened) when one of its options matches, and a
   * group whose own name matches keeps all its options.
   *
   * @return $this
   */
  public function searchable($placeholder = 'Buscar', $noResults = 'Sin resultados')
  {
    $this->search = (string) $placeholder;
    $this->noResults = (string) $noResults;
    return $this;
  }

  /** @return string|null */
  public function searchPlaceholder()
  {
    return $this->search;
  }

  public function noResultsText()
  {
    return $this->noResults;
  }

  /**
   * @return MenuItem[]
   */
  public function menuItems()
  {
    return $this->items;
  }

  public function build()
  {
    $nav = Html::element('nav')->attrs($this->getAttributes())
      ->style($this->getStyles())->addClass('uk-menu', ...$this->getClasses());
    if ($this->search !== null) {
      $nav->add(
        Html::div(
          Icon::make('search'),
          Html::element('input')->attr('type', 'search')->attr('placeholder', $this->search)->attr('aria-label', $this->search)
            ->attr('autocomplete', 'off')->data('uk-menu-search', '')
        )->addClass('uk-menu-search'),
        Html::p($this->noResults)->addClass('uk-menu-empty')->attr('hidden', true)
      );
    }
    return $nav->add($this->listOf($this->items));
  }

  /**
   * @param MenuItem[] $items
   * @return Element
   */
  private function listOf(array $items)
  {
    $list = Html::element('ul');
    foreach ($items as $item) {
      $content = array();
      if ($item->getIcon() !== null) {
        $content[] = Icon::make($item->getIcon());
      }
      $content[] = Html::span($item->label())->addClass('uk-menu-label');
      if ($item->getBadge() !== null) {
        $content[] = Badge::make($item->getBadge());
      }
      if ($item->isGroup()) {
        $open = $item->containsActive();
        $content[] = Icon::make('expand_more')->addClass('uk-menu-caret');
        $li = Html::li(
          Html::element('button', $content)->attr('type', 'button')->attr('aria-expanded', $open ? 'true' : 'false')
            ->data('uk-menu-toggle', '')->addClass('uk-menu-item'),
          $this->listOf($item->children())->attr('hidden', !$open)
        )->addClass('uk-menu-group');
        if ($open) {
          $li->addClass('is-open');
        }
      } else {
        $link = $item->href() !== null ? Html::a($item->href(), $content) : Html::span($content);
        $link->addClass('uk-menu-item');
        if ($item->isActive()) {
          $link->addClass('is-active')->attr('aria-current', 'page');
        }
        $li = Html::li($link);
      }
      $list->add($li);
    }
    return $list;
  }
}
