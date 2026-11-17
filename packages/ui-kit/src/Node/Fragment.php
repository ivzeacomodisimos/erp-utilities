<?php

namespace Ivandzb\UiKit\Node;

/**
 * Several nodes with no wrapping element.
 */
class Fragment extends Container
{
  /**
   * @param mixed ...$items
   * @return static
   */
  public static function of(...$items)
  {
    return (new static())->add(...$items);
  }
}
