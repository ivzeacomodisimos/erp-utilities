<?php

namespace Ivandzb\UiKit\Node;

use InvalidArgumentException;

/**
 * Any HTML element: <div>, <a>, <table>... (see Ivandzb\UiKit\Html for shortcuts).
 */
class Element extends Container
{
  use HasAttributes;

  const VOID = array('area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr');

  /** @var string */
  private $tag;

  public function __construct($tag)
  {
    $tag = strtolower(trim((string) $tag));
    if (!preg_match('/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/', $tag)) {
      throw new InvalidArgumentException("Invalid tag name: '$tag'");
    }
    $this->tag = $tag;
  }

  /**
   * @return static
   */
  public static function make($tag)
  {
    return new static($tag);
  }

  public function tag()
  {
    return $this->tag;
  }

  public function isVoid()
  {
    return in_array($this->tag, self::VOID, true);
  }

  public function add(...$items)
  {
    if ($this->isVoid() && count(array_filter($items, function ($item) {
      return $item !== null && $item !== '';
    })) > 0) {
      throw new InvalidArgumentException("<{$this->tag}> cannot have children");
    }
    return parent::add(...$items);
  }
}
