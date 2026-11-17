<?php

namespace Ivandzb\UiKit\Component;

use InvalidArgumentException;
use Ivandzb\UiKit\Html;
use Ivandzb\UiKit\Node\Ref;

/**
 * A button, or a link that looks like one when it has an href.
 *
 *   Button::make('Guardar')->icon('save')->color('primary')
 *   Button::make('Ver viajes')->href('index.php?modulo=logistica')->flat()
 */
class Button extends Component
{
  const COLORS = array('primary', 'secondary', 'positive', 'negative', 'warning', 'info', 'dark');
  const STYLES = array('filled', 'flat', 'outline');

  /** @var string */
  private $label;
  /** @var string|null */
  private $icon;
  /** @var string|null */
  private $href;
  /** @var string */
  private $type = 'button';
  /** @var string|null null: inherits the text color */
  private $color = 'primary';
  /** @var string */
  private $look = 'filled';

  public function __construct($label = '')
  {
    $this->label = (string) $label;
  }

  /**
   * @return static
   */
  public static function make($label = '')
  {
    return new static($label);
  }

  /** @return $this */
  public function icon($icon)
  {
    $this->icon = $icon === null ? null : (string) $icon;
    return $this;
  }

  /** @return $this */
  public function href($href)
  {
    $this->href = $href === null ? null : (string) $href;
    return $this;
  }

  /**
   * button, submit or reset (ignored when the button is a link).
   *
   * @return $this
   */
  public function type($type)
  {
    if (!in_array($type, array('button', 'submit', 'reset'), true)) {
      throw new InvalidArgumentException("Invalid button type: '$type'");
    }
    $this->type = $type;
    return $this;
  }

  /**
   * One of COLORS, or null to take the text color of where it is (e.g. a header bar).
   *
   * @return $this
   */
  public function color($color)
  {
    if ($color !== null && !in_array($color, self::COLORS, true)) {
      throw new InvalidArgumentException("Invalid button color: '$color'");
    }
    $this->color = $color;
    return $this;
  }

  /** @return $this */
  public function flat()
  {
    $this->look = 'flat';
    return $this;
  }

  /** @return $this */
  public function outline()
  {
    $this->look = 'outline';
    return $this;
  }

  public function label()
  {
    return $this->label;
  }

  public function getIcon()
  {
    return $this->icon;
  }

  public function getHref()
  {
    return $this->href;
  }

  public function getType()
  {
    return $this->type;
  }

  public function getColor()
  {
    return $this->color;
  }

  public function look()
  {
    return $this->look;
  }

  public function build()
  {
    $element = $this->href !== null
      ? Html::a($this->href)
      : Html::element('button')->attr('type', $this->type);
    $element->attrs($this->getAttributes())->style($this->getStyles())
      ->addClass('uk-btn', 'uk-btn--' . ($this->color !== null ? $this->color : 'inherit'), 'uk-btn--' . $this->look, ...$this->getClasses());
    if ($this->icon !== null) {
      $element->add(Icon::make($this->icon));
    }
    if ($this->label !== '') {
      $element->add(Html::span($this->label));
    }
    return $element->add(Ref::to($this->children()));
  }
}
