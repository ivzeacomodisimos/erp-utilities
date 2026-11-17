<?php

namespace Ivandzb\UiKit\Component;

use InvalidArgumentException;
use Ivandzb\UiKit\Html;
use Ivandzb\UiKit\Node\Ref;

/**
 * A message box. Its children are the message.
 *
 *   Alert::warning('Base de datos de pruebas')->title('Atención')
 */
class Alert extends Component
{
  const TYPES = array('info' => 'info', 'success' => 'check_circle', 'warning' => 'warning', 'error' => 'error');

  /** @var string */
  private $type;
  /** @var string|null */
  private $title;

  public function __construct($type = 'info', ...$message)
  {
    if (!isset(self::TYPES[$type])) {
      throw new InvalidArgumentException("Invalid alert type: '$type'");
    }
    $this->type = $type;
    $this->add(...$message);
  }

  /** @return static */
  public static function info(...$message)
  {
    return new static('info', ...$message);
  }

  /** @return static */
  public static function success(...$message)
  {
    return new static('success', ...$message);
  }

  /** @return static */
  public static function warning(...$message)
  {
    return new static('warning', ...$message);
  }

  /** @return static */
  public static function error(...$message)
  {
    return new static('error', ...$message);
  }

  /** @return $this */
  public function title($title)
  {
    $this->title = $title === null ? null : (string) $title;
    return $this;
  }

  public function type()
  {
    return $this->type;
  }

  public function iconName()
  {
    return self::TYPES[$this->type];
  }

  public function getTitle()
  {
    return $this->title;
  }

  public function build()
  {
    $text = Html::div()->addClass('uk-alert-text');
    if ($this->title !== null) {
      $text->add(Html::strong($this->title), ' ');
    }
    $text->add(Ref::to($this->children()));
    return Html::div(Icon::make($this->iconName()), $text)
      ->attrs($this->getAttributes())->style($this->getStyles())
      ->attr('role', $this->type === 'error' || $this->type === 'warning' ? 'alert' : 'status')
      ->addClass('uk-alert', 'uk-alert--' . $this->type, ...$this->getClasses());
  }
}
