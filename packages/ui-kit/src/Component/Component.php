<?php

namespace Ivandzb\UiKit\Component;

use InvalidArgumentException;
use Ivandzb\UiKit\Node\Container;
use Ivandzb\UiKit\Node\Fragment;
use Ivandzb\UiKit\Node\HasAttributes;
use Ivandzb\UiKit\Node\Node;

/**
 * A complex component: built from basic elements or from other components.
 *
 * Its children (add()) are the default content; named areas go in slots
 * (slot('actions')->add(...)). Each renderer may paint a component its own way
 * (a Quasar component, an HTML block with jQuery behavior); when a renderer has
 * no view for it, it paints build(), so a new component only needs build() to work
 * everywhere.
 */
abstract class Component extends Container
{
  use HasAttributes;

  /** @var Fragment[] name => content */
  private $slots = array();

  /**
   * Named area of the component, created on first use.
   *
   * @return Fragment
   */
  public function slot($name)
  {
    if (!preg_match('/^[a-z][a-zA-Z0-9_-]*$/', (string) $name)) {
      throw new InvalidArgumentException("Invalid slot name: '$name'");
    }
    if (!isset($this->slots[$name])) {
      $this->slots[$name] = new Fragment();
      $this->slots[$name]->attachTo($this);
    }
    return $this->slots[$name];
  }

  public function hasSlot($name)
  {
    return isset($this->slots[$name]) && !$this->slots[$name]->isEmpty();
  }

  /**
   * @return Fragment[]
   */
  public function slots()
  {
    return $this->slots;
  }

  public function find($id)
  {
    $found = parent::find($id);
    foreach ($this->slots as $slot) {
      if ($found !== null) {
        break;
      }
      $found = $slot->find($id);
    }
    return $found;
  }

  /**
   * The component made of simpler nodes, used by renderers without a view for it.
   *
   * @return Node
   */
  abstract public function build();
}
