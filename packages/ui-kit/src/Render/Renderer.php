<?php

namespace Ivandzb\UiKit\Render;

use Ivandzb\UiKit\Node\Node;
use Ivandzb\UiKit\Page;

/**
 * Paints a tree (Strategy): HtmlRenderer for HTML + jQuery, QuasarRenderer for Vue 3 + Quasar.
 */
interface Renderer
{
  const JQUERY = 'jquery';
  const QUASAR = 'quasar';

  /**
   * The full document.
   *
   * @return string
   */
  public function page(Page $page);

  /**
   * A part of a page, to embed in another one (for example a legacy screen).
   *
   * @return string
   */
  public function fragment(Node $node);
}
