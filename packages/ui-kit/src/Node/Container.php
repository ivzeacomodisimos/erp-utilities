<?php

namespace Ivandzb\UiKit\Node;

use InvalidArgumentException;

/**
 * A node that holds other nodes, in order.
 *
 * add() takes nodes, plain strings (always escaped as text), numbers, arrays of any of
 * them, and legacy objects with a getHtml() method (painted as trusted HTML when the
 * page is rendered, so they can still be filled after being added).
 */
abstract class Container extends Node
{
  /** @var Node[] */
  private $children = array();

  /**
   * @param mixed ...$items
   * @return $this
   */
  public function add(...$items)
  {
    foreach (self::nodes($items) as $node) {
      $node->attachTo($this);
      $this->children[] = $node;
    }
    return $this;
  }

  /**
   * Same as add(), but strings are trusted HTML (like addHtml() of the legacy cHtml).
   *
   * @param mixed ...$items
   * @return $this
   */
  public function addHtml(...$items)
  {
    foreach ($items as $item) {
      $this->add(is_string($item) ? new Raw($item) : $item);
    }
    return $this;
  }

  /**
   * @param mixed ...$items
   * @return $this
   */
  public function prepend(...$items)
  {
    $nodes = self::nodes($items);
    foreach ($nodes as $node) {
      $node->attachTo($this);
    }
    $this->children = array_merge($nodes, $this->children);
    return $this;
  }

  /**
   * @return $this
   */
  public function remove(Node $node)
  {
    foreach ($this->children as $index => $child) {
      if ($child === $node) {
        array_splice($this->children, $index, 1);
        $node->attachTo(null);
        break;
      }
    }
    return $this;
  }

  /**
   * @return $this
   */
  public function clear()
  {
    foreach ($this->children as $child) {
      $child->attachTo(null);
    }
    $this->children = array();
    return $this;
  }

  /**
   * @return Node[]
   */
  public function children()
  {
    return $this->children;
  }

  public function isEmpty()
  {
    return count($this->children) === 0;
  }

  /**
   * First element or component with this id, searching the whole subtree.
   *
   * @return Node|null
   */
  public function find($id)
  {
    foreach ($this->children as $child) {
      if (method_exists($child, 'getId') && $child->getId() === $id) {
        return $child;
      }
      if ($child instanceof Container) {
        $found = $child->find($id);
        if ($found !== null) {
          return $found;
        }
      }
    }
    return null;
  }

  /**
   * @param array $items
   * @return Node[]
   */
  private static function nodes(array $items)
  {
    $nodes = array();
    foreach ($items as $item) {
      if ($item === null || $item === '') {
        continue;
      }
      if (is_array($item)) {
        $nodes = array_merge($nodes, self::nodes($item));
      } elseif ($item instanceof Node) {
        $nodes[] = $item;
      } elseif (is_string($item) || is_int($item) || is_float($item)) {
        $nodes[] = new Text((string) $item);
      } elseif (is_object($item) && method_exists($item, 'getHtml')) {
        $nodes[] = new Raw($item);
      } else {
        throw new InvalidArgumentException('Cannot add ' . (is_object($item) ? get_class($item) : gettype($item)) . ' to the tree');
      }
    }
    return $nodes;
  }
}
