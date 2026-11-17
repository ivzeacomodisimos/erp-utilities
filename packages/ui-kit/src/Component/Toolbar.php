<?php

namespace Ivandzb\UiKit\Component;

use Ivandzb\UiKit\Html;
use Ivandzb\UiKit\Node\Ref;

/**
 * Bar with the brand (logo and title) on the left; its children go on the right.
 *
 *   Toolbar::make('Intranet')->logo('img/logo.png')->home('index.php')->add($botonSalir)
 */
class Toolbar extends Component
{
  /** @var string */
  private $title;
  /** @var string|null */
  private $logo;
  /** @var string|null */
  private $home;

  public function __construct($title = '')
  {
    $this->title = (string) $title;
  }

  /**
   * @return static
   */
  public static function make($title = '')
  {
    return new static($title);
  }

  /** @return $this */
  public function logo($url)
  {
    $this->logo = $url === null ? null : (string) $url;
    return $this;
  }

  /** @return $this */
  public function home($url)
  {
    $this->home = $url === null ? null : (string) $url;
    return $this;
  }

  public function getTitle()
  {
    return $this->title;
  }

  public function getLogo()
  {
    return $this->logo;
  }

  public function getHome()
  {
    return $this->home;
  }

  public function build()
  {
    $brand = array();
    if ($this->logo !== null) {
      $brand[] = Html::img($this->logo, '')->addClass('uk-brand-logo');
    }
    if ($this->title !== '') {
      $brand[] = Html::span($this->title)->addClass('uk-brand-title');
    }
    $brandNode = $this->home !== null ? Html::a($this->home, $brand) : Html::span($brand);
    return Html::div(
      $brandNode->addClass('uk-brand'),
      Html::div(Ref::to($this->children()))->addClass('uk-toolbar-actions')
    )->attrs($this->getAttributes())->style($this->getStyles())->addClass('uk-toolbar', ...$this->getClasses());
  }
}
