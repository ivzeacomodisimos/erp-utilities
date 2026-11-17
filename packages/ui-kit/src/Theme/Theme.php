<?php

namespace Ivandzb\UiKit\Theme;

use Ivandzb\UiKit\Page;
use Ivandzb\UiKit\UiKit;

/**
 * A theme builds the whole page around the content: header, side panels and footer.
 * Implement it to create another look; the content and the renderers do not change.
 */
interface Theme
{
  /**
   * @return Page
   */
  public function page(UiKit $ui, $title);
}
