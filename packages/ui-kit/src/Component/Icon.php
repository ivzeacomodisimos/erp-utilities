<?php

namespace Ivandzb\UiKit\Component;

use Ivandzb\UiKit\Html;

/**
 * An icon: a Material Icons name ("local_shipping", the Quasar icon set, shipped with the
 * package) or Font Awesome classes ("fas fa-truck", the page must load Font Awesome).
 */
class Icon extends Component
{
  /** @var string */
  private $name;
  /** @var string|null CSS size, e.g. "20px" */
  private $size;

  public function __construct($name)
  {
    $this->name = trim((string) $name);
  }

  /**
   * @return static
   */
  public static function make($name)
  {
    return new static($name);
  }

  /**
   * @return $this
   */
  public function size($size)
  {
    $this->size = $size === null ? null : (string) $size;
    return $this;
  }

  public function name()
  {
    return $this->name;
  }

  public function getSize()
  {
    return $this->size;
  }

  public function isFontAwesome()
  {
    return self::isFontAwesomeName($this->name);
  }

  public static function isFontAwesomeName($name)
  {
    return (bool) preg_match('/^(fa|fas|far|fab|fal|fad|fa-solid|fa-regular|fa-brands)\s/', (string) $name);
  }

  public function build()
  {
    $icon = $this->isFontAwesome()
      ? Html::element('i')->addClass($this->name)
      : Html::element('i', $this->name)->addClass('uk-mi');
    $icon->attr('aria-hidden', 'true')->attrs($this->getAttributes())->addClass(...$this->getClasses())->style($this->getStyles());
    if ($this->size !== null) {
      $icon->style('font-size', $this->size);
    }
    return $icon;
  }
}
