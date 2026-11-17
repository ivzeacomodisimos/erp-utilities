<?php

namespace Ivandzb\UiKit\Component;

use Ivandzb\UiKit\Html;
use Ivandzb\UiKit\Node\Ref;

/**
 * A panel with an optional title. Children are the body; buttons go in slot('actions').
 *
 *   Card::make('Viajes de hoy')->add(Html::p('...'))->actions(Button::make('Ver')->href('...'))
 */
class Card extends Component
{
  /** @var string|null */
  private $title;
  /** @var string|null */
  private $subtitle;

  public function __construct($title = null)
  {
    $this->title = $title === null ? null : (string) $title;
  }

  /**
   * @return static
   */
  public static function make($title = null)
  {
    return new static($title);
  }

  /** @return $this */
  public function subtitle($subtitle)
  {
    $this->subtitle = $subtitle === null ? null : (string) $subtitle;
    return $this;
  }

  /**
   * @param mixed ...$buttons
   * @return $this
   */
  public function actions(...$buttons)
  {
    $this->slot('actions')->add(...$buttons);
    return $this;
  }

  /** Buttons beside the title; existing cards keep their original header. */
  public function headerActions(...$buttons)
  {
    $this->slot('headerActions')->add(...$buttons);
    return $this;
  }

  public function getTitle()
  {
    return $this->title;
  }

  public function getSubtitle()
  {
    return $this->subtitle;
  }

  public function build()
  {
    $card = Html::element('section')->attrs($this->getAttributes())->style($this->getStyles())
      ->addClass('uk-card', ...$this->getClasses());
    if ($this->title !== null || $this->subtitle !== null || $this->hasSlot('headerActions')) {
      $header = Html::element('header')->addClass('uk-card-header');
      if ($this->title !== null) {
        $header->add(Html::h(2, $this->title)->addClass('uk-card-title'));
      }
      if ($this->subtitle !== null) {
        $header->add(Html::p($this->subtitle)->addClass('uk-card-subtitle'));
      }
      if ($this->hasSlot('headerActions')) {
        $header->add(Html::div(Ref::to($this->slot('headerActions')->children()))->addClass('uk-card-header-actions'));
      }
      $card->add($header);
    }
    $card->add(Html::div(Ref::to($this->children()))->addClass('uk-card-body'));
    if ($this->hasSlot('actions')) {
      $card->add(Html::element('footer', Ref::to($this->slot('actions')->children()))->addClass('uk-card-actions'));
    }
    return $card;
  }
}
