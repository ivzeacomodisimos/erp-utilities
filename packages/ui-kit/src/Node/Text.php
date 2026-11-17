<?php

namespace Ivandzb\UiKit\Node;

/**
 * Plain text: always escaped when painted.
 */
final class Text extends Node
{
  /** @var string */
  private $text;

  public function __construct($text)
  {
    $this->text = (string) $text;
  }

  public function text()
  {
    return $this->text;
  }
}
