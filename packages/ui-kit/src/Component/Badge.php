<?php

namespace Ivandzb\UiKit\Component;

use InvalidArgumentException;
use Ivandzb\UiKit\Html;

/**
 * A small label: a count, a state.
 */
class Badge extends Component
{
  /** @var string */
  private $label;
  /** @var string */
  private $color = 'primary';

  public function __construct($label)
  {
    $this->label = (string) $label;
  }

  /**
   * @return static
   */
  public static function make($label)
  {
    return new static($label);
  }

  /** @return $this */
  public function color($color)
  {
    if (!in_array($color, Button::COLORS, true)) {
      throw new InvalidArgumentException("Invalid badge color: '$color'");
    }
    $this->color = $color;
    return $this;
  }

  public function label()
  {
    return $this->label;
  }

  public function getColor()
  {
    return $this->color;
  }

  public function build()
  {
    return Html::span($this->label)->attrs($this->getAttributes())->style($this->getStyles())
      ->addClass('uk-badge', 'uk-badge--' . $this->color, ...$this->getClasses());
  }
}
