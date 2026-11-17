<?php

namespace Ivandzb\UiKit\Node;

/**
 * Paints nodes that belong to another container, without adopting them.
 *
 * Used by Component::build(): the built tree shows the component's children and slots
 * while they stay where they are, so the component can be rendered any number of times.
 */
final class Ref extends Node
{
  /** @var Node[] */
  private $nodes;

  /**
   * @param Node[] $nodes
   */
  public function __construct(array $nodes)
  {
    $this->nodes = array_values($nodes);
  }

  /**
   * @param Node[] $nodes
   * @return self
   */
  public static function to(array $nodes)
  {
    return new self($nodes);
  }

  /**
   * @return Node[]
   */
  public function nodes()
  {
    return $this->nodes;
  }
}
