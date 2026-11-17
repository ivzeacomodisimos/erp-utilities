<?php

namespace Ivandzb\UiKit\Component;

use InvalidArgumentException;
use Ivandzb\UiKit\Html;
use Ivandzb\UiKit\Node\Ref;

/**
 * Tabs with one panel each.
 *
 *   Tabs::make()
 *     ->tab('viajes', 'Viajes', $tablaViajes)->icon('local_shipping')
 *     ->tab('listas', 'Listas', $tablaListas)
 *     ->active('listas')
 */
class Tabs extends Component
{
  /** @var array name => ['label' => string, 'icon' => string|null] */
  private $tabs = array();
  /** @var string|null */
  private $active;
  /** @var string|null last tab added, for icon() */
  private $last;
  private $keepPanelsMounted = false;

  /** Keep inactive forms in the DOM so external controllers and file selections survive. */
  public function keepPanelsMounted()
  {
    $this->keepPanelsMounted = true;
    return $this;
  }

  public function keepsPanelsMounted()
  {
    return $this->keepPanelsMounted;
  }

  /**
   * @return static
   */
  public static function make()
  {
    return new static();
  }

  /**
   * @param mixed ...$content the panel
   * @return $this
   */
  public function tab($name, $label, ...$content)
  {
    $name = (string) $name;
    if (!preg_match('/^[a-z][a-zA-Z0-9_-]*$/', $name)) {
      throw new InvalidArgumentException("Invalid tab name: '$name'");
    }
    $this->tabs[$name] = array('label' => (string) $label, 'icon' => null);
    $this->slot('tab-' . $name)->add(...$content);
    $this->last = $name;
    return $this;
  }

  /**
   * Icon of the last tab added.
   *
   * @return $this
   */
  public function icon($icon)
  {
    if ($this->last === null) {
      throw new InvalidArgumentException('Add a tab before setting its icon');
    }
    $this->tabs[$this->last]['icon'] = (string) $icon;
    return $this;
  }

  /** @return $this */
  public function active($name)
  {
    if (!isset($this->tabs[$name])) {
      throw new InvalidArgumentException("Unknown tab: '$name'");
    }
    $this->active = $name;
    return $this;
  }

  /**
   * @return array name => ['label', 'icon']
   */
  public function tabs()
  {
    return $this->tabs;
  }

  /**
   * @return string|null the active tab (the first one by default)
   */
  public function getActive()
  {
    if ($this->active !== null) {
      return $this->active;
    }
    $names = array_keys($this->tabs);
    return $names ? $names[0] : null;
  }

  public function panel($name)
  {
    return $this->slot('tab-' . $name);
  }

  public function build()
  {
    $id = $this->getId() !== null ? $this->getId() : 'uk-tabs-' . substr(md5(spl_object_hash($this)), 0, 8);
    $list = Html::div()->addClass('uk-tab-list')->attr('role', 'tablist');
    $panels = array();
    foreach ($this->tabs as $name => $tab) {
      $selected = $name === $this->getActive();
      $button = Html::element('button')->attr('type', 'button')->attr('role', 'tab')
        ->attr('id', "$id-tab-$name")->attr('aria-controls', "$id-panel-$name")
        ->attr('aria-selected', $selected ? 'true' : 'false')->data('uk-tab', $name)
        ->addClass('uk-tab');
      if ($tab['icon'] !== null) {
        $button->add(Icon::make($tab['icon']));
      }
      $list->add($button->add(Html::span($tab['label'])));
      $panels[] = Html::div(Ref::to($this->panel($name)->children()))
        ->attr('role', 'tabpanel')->attr('id', "$id-panel-$name")->attr('aria-labelledby', "$id-tab-$name")
        ->data('uk-panel', $name)->attr('hidden', !$selected)->addClass('uk-tab-panel');
    }
    return Html::div($list, $panels)->attrs($this->getAttributes())->attr('id', $id)->style($this->getStyles())
      ->data('uk-tabs', '')->addClass('uk-tabs', ...$this->getClasses());
  }
}
