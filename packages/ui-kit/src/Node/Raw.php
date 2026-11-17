<?php

namespace Ivandzb\UiKit\Node;

use InvalidArgumentException;

/**
 * Trusted HTML, painted as is: markup built elsewhere (a legacy cHtml object, a crud-kit
 * screen, a template). It may carry its own <script> tags.
 *
 * The source can be a string, an object with getHtml() or a callable; objects and
 * callables are read when the page is rendered, so they can be filled after being added.
 *
 * With the Quasar renderer the HTML is not handed to Vue: it is written in the page as is
 * and moved into place when the app mounts, so its scripts run normally and keep their
 * event handlers.
 */
final class Raw extends Node
{
  /** @var string|object|callable */
  private $source;

  /**
   * @param string|object|callable $source
   */
  public function __construct($source)
  {
    if (!is_string($source) && !is_callable($source) && !(is_object($source) && method_exists($source, 'getHtml'))) {
      throw new InvalidArgumentException('Raw expects a string, a callable or an object with getHtml()');
    }
    $this->source = $source;
  }

  public function html()
  {
    if (is_string($this->source)) {
      return $this->source;
    }
    if (is_object($this->source) && method_exists($this->source, 'getHtml')) {
      return (string) $this->source->getHtml();
    }
    return (string) call_user_func($this->source);
  }
}
