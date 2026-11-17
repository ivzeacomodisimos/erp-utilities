<?php

namespace Ivandzb\UiKit;

use Ivandzb\UiKit\Node\Container;
use Ivandzb\UiKit\Node\Raw;
use Ivandzb\UiKit\Render\HtmlRenderer;
use Ivandzb\UiKit\Render\Renderer;

/**
 * The whole document. Its children are the body; the head collects title, stylesheets,
 * scripts and any trusted HTML (for example the head of a legacy page).
 *
 *   $page = UiKit::make('assets')->page('Picking');
 *   $page->add($layout);
 *   echo $page->getHtml();
 */
final class Page extends Container
{
  /** @var string */
  private $title;
  /** @var string */
  private $lang = 'es';
  /** @var string|null */
  private $primaryColor;
  /** @var string[] */
  private $stylesheets = array();
  /** @var string[] */
  private $headScripts = array();
  /** @var string[] */
  private $bodyScripts = array();
  /** @var string[] */
  private $css = array();
  /** @var string[] */
  private $inlineScripts = array();
  /** @var Raw[] */
  private $headHtml = array();
  /** @var Raw[] */
  private $bodyEndHtml = array();
  /** @var Renderer|null */
  private $renderer;

  public function __construct($title = '')
  {
    $this->title = (string) $title;
  }

  /** @return $this */
  public function title($title)
  {
    $this->title = (string) $title;
    return $this;
  }

  /** @return $this */
  public function lang($lang)
  {
    $this->lang = preg_match('/^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8})*$/', (string) $lang) ? (string) $lang : 'es';
    return $this;
  }

  /**
   * Main color of the theme (CSS color), used by both renderers.
   *
   * @return $this
   */
  public function primaryColor($color)
  {
    $this->primaryColor = preg_match('/^(#[0-9a-fA-F]{3,8}|[a-z]+|rgba?\([0-9., %]+\))$/', (string) $color) ? (string) $color : null;
    return $this;
  }

  /** @return $this */
  public function stylesheet($url)
  {
    if (!in_array((string) $url, $this->stylesheets, true)) {
      $this->stylesheets[] = (string) $url;
    }
    return $this;
  }

  /**
   * CSS of the page's own classes. Use this instead of a <style> in headHtml(): with the
   * Quasar renderer each selector is prefixed with the app root (#uk-app#uk-app), so the
   * rules win over Quasar's own CSS and over the reset that keeps the host page's global
   * CSS away from Quasar.
   *
   * @return $this
   */
  public function css($css)
  {
    $this->css[] = (string) $css;
    return $this;
  }

  /**
   * JavaScript code run at the end of the body, after the page is painted.
   *
   * @return $this
   */
  public function inlineScript($code)
  {
    $this->inlineScripts[] = (string) $code;
    return $this;
  }

  /**
   * @return string[]
   */
  public function getInlineScripts()
  {
    return $this->inlineScripts;
  }

  /**
   * @return string[]
   */
  public function getCss()
  {
    return $this->css;
  }

  /**
   * @param bool $inHead true: in <head> (for libraries the content needs while the page loads)
   * @return $this
   */
  public function script($url, $inHead = false)
  {
    $list = $inHead ? 'headScripts' : 'bodyScripts';
    if (!in_array((string) $url, $this->$list, true)) {
      $this->$list[] = (string) $url;
    }
    return $this;
  }

  /**
   * Trusted HTML for the head: meta tags, the head of a legacy page...
   *
   * @param string|object|callable $html
   * @return $this
   */
  public function headHtml($html)
  {
    $this->headHtml[] = new Raw($html);
    return $this;
  }

  /**
   * Trusted HTML at the end of the body, after the page is painted (legacy footer scripts).
   *
   * @param string|object|callable $html
   * @return $this
   */
  public function bodyEndHtml($html)
  {
    $this->bodyEndHtml[] = new Raw($html);
    return $this;
  }

  /** @return $this */
  public function renderer(Renderer $renderer)
  {
    $this->renderer = $renderer;
    return $this;
  }

  public function getTitle()
  {
    return $this->title;
  }

  public function getLang()
  {
    return $this->lang;
  }

  public function getPrimaryColor()
  {
    return $this->primaryColor;
  }

  public function getStylesheets()
  {
    return $this->stylesheets;
  }

  public function getHeadScripts()
  {
    return $this->headScripts;
  }

  public function getBodyScripts()
  {
    return $this->bodyScripts;
  }

  /** @return Raw[] */
  public function getHeadHtml()
  {
    return $this->headHtml;
  }

  /** @return Raw[] */
  public function getBodyEndHtml()
  {
    return $this->bodyEndHtml;
  }

  /**
   * The full document, painted with the given renderer, the one set with renderer(),
   * or plain HTML.
   */
  public function getHtml(?Renderer $renderer = null)
  {
    $renderer = $renderer !== null ? $renderer : ($this->renderer !== null ? $this->renderer : new HtmlRenderer());
    return $renderer->page($this);
  }
}
