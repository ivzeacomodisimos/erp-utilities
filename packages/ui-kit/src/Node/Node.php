<?php

namespace Ivandzb\UiKit\Node;

use Ivandzb\UiKit\Render\HtmlRenderer;
use Ivandzb\UiKit\Render\Renderer;

/**
 * A node of the page tree (Composite): an element, a text, trusted HTML, a fragment
 * or a component. Nodes are added one inside another, like the browser DOM, and the
 * whole tree is painted at the end with getHtml().
 */
abstract class Node
{
  /** @var Container|null */
  private $parent;

  /**
   * @return Container|null the node this one was added to
   */
  public function parent()
  {
    return $this->parent;
  }

  /**
   * @internal used by Container when the node is added or removed
   */
  public function attachTo(?Container $parent = null)
  {
    if ($parent !== null && $this->parent !== null && $this->parent !== $parent) {
      $this->parent->remove($this);
    }
    $this->parent = $parent;
  }

  /**
   * Paints this node and everything inside it. Without a renderer it is painted as
   * plain HTML (the jQuery renderer without page assets).
   */
  public function getHtml(?Renderer $renderer = null)
  {
    return ($renderer !== null ? $renderer : new HtmlRenderer())->fragment($this);
  }

  public function __toString()
  {
    return $this->getHtml();
  }
}
