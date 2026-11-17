<?php

namespace Ivandzb\UiKit\Component;

use Ivandzb\UiKit\Html;
use Ivandzb\UiKit\Node\Ref;

/**
 * Page skeleton: header, left side panel, center, right side panel and footer.
 * Its children are the center; the other areas are slots.
 *
 *   Layout::make()
 *     ->header(Toolbar::make('Intranet'))
 *     ->left($menu)
 *     ->add($contenido)
 *     ->footer('Comodísimos')
 *
 * The side panels collapse into a drawer opened from the header on narrow screens.
 * With floatingLeft() the left panel is always a drawer: hidden on load, opened from the
 * header button over the content (which does not move) and as tall as the window.
 */
class Layout extends Component
{
  /** @var int px */
  private $leftWidth = 270;
  /** @var int px */
  private $rightWidth = 280;
  /** @var bool */
  private $leftFloating = false;

  /**
   * @return static
   */
  public static function make()
  {
    return new static();
  }

  /** @return $this */
  public function header(...$content)
  {
    $this->slot('header')->add(...$content);
    return $this;
  }

  /** @return $this */
  public function left(...$content)
  {
    $this->slot('left')->add(...$content);
    return $this;
  }

  /** @return $this */
  public function right(...$content)
  {
    $this->slot('right')->add(...$content);
    return $this;
  }

  /** @return $this */
  public function footer(...$content)
  {
    $this->slot('footer')->add(...$content);
    return $this;
  }

  /** @return $this */
  public function leftWidth($px)
  {
    $this->leftWidth = max(120, (int) $px);
    return $this;
  }

  /** @return $this */
  public function rightWidth($px)
  {
    $this->rightWidth = max(120, (int) $px);
    return $this;
  }

  /**
   * The left panel floats over the content at every width, hidden until the menu button opens it.
   *
   * @return $this
   */
  public function floatingLeft($floating = true)
  {
    $this->leftFloating = (bool) $floating;
    return $this;
  }

  public function isLeftFloating()
  {
    return $this->leftFloating;
  }

  public function getLeftWidth()
  {
    return $this->leftWidth;
  }

  public function getRightWidth()
  {
    return $this->rightWidth;
  }

  public function build()
  {
    $layout = Html::div()->attrs($this->getAttributes())->addClass('uk-layout', ...$this->getClasses())
      ->style(array('--uk-left-width' => $this->leftWidth . 'px', '--uk-right-width' => $this->rightWidth . 'px'))
      ->style($this->getStyles())->data('uk-layout', '');
    $header = Html::element('header')->addClass('uk-header');
    if ($this->hasSlot('left')) {
      $layout->addClass('has-left');
      if ($this->leftFloating) {
        $layout->addClass('is-left-floating');
      }
      $header->add(Html::element('button', Icon::make('menu'))->attr('type', 'button')
        ->attr('aria-label', 'Menú')->data('uk-toggle', 'left')->addClass('uk-drawer-toggle'));
    }
    $header->add(Ref::to($this->slot('header')->children()));
    $body = Html::div()->addClass('uk-body');
    if ($this->hasSlot('left')) {
      $left = Html::element('aside')->addClass('uk-left');
      if ($this->leftFloating) {
        $left->add(Html::div(
          Html::span('Menú')->addClass('uk-drawer-title'),
          Html::element('button', Icon::make('close'))->attr('type', 'button')->attr('aria-label', 'Cerrar menú')
            ->data('uk-close', '')->addClass('uk-drawer-close')
        )->addClass('uk-drawer-head'));
      }
      $body->add($left->add(Ref::to($this->slot('left')->children())));
    }
    $body->add(Html::element('main', Ref::to($this->children()))->addClass('uk-main'));
    if ($this->hasSlot('right')) {
      $layout->addClass('has-right');
      $body->add(Html::element('aside', Ref::to($this->slot('right')->children()))->addClass('uk-right'));
    }
    $layout->add($header, $body, Html::div()->addClass('uk-scrim')->data('uk-close', ''));
    if ($this->hasSlot('footer')) {
      $layout->add(Html::element('footer', Ref::to($this->slot('footer')->children()))->addClass('uk-footer'));
    }
    return $layout;
  }
}
