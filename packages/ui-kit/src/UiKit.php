<?php

namespace Ivandzb\UiKit;

use InvalidArgumentException;
use Ivandzb\UiKit\Render\HtmlRenderer;
use Ivandzb\UiKit\Render\QuasarRenderer;
use Ivandzb\UiKit\Render\Renderer;

/**
 * Entry point (Facade): knows where the package assets are published and which
 * technology paints the pages.
 *
 *   $ui = UiKit::make('packages/ui-kit/assets', Renderer::QUASAR);
 *   $page = $ui->page('Inicio')->add(Html::h(1, 'Hola'));
 *   echo $page->getHtml();
 */
final class UiKit
{
  /** @var string|null */
  private $assetsUrl;
  /** @var string */
  private $default;
  /** @var string|null */
  private $jqueryUrl;

  /**
   * @param string|null $assetsUrl public URL of packages/ui-kit/assets
   * @param string $default Renderer::JQUERY or Renderer::QUASAR
   * @param string|null $jqueryUrl jQuery for jQuery pages that do not load it already
   */
  public function __construct($assetsUrl = null, $default = Renderer::QUASAR, $jqueryUrl = null)
  {
    $this->assetsUrl = $assetsUrl;
    $this->default = self::checkName($default);
    $this->jqueryUrl = $jqueryUrl;
  }

  /**
   * @return self
   */
  public static function make($assetsUrl = null, $default = Renderer::QUASAR, $jqueryUrl = null)
  {
    return new self($assetsUrl, $default, $jqueryUrl);
  }

  /**
   * @param string|null $name jquery or quasar (default: the one given to the constructor)
   * @return Renderer
   */
  public function renderer($name = null)
  {
    $name = self::checkName($name === null ? $this->default : $name);
    return $name === Renderer::QUASAR ? new QuasarRenderer($this->assetsUrl) : new HtmlRenderer($this->assetsUrl, $this->jqueryUrl);
  }

  /**
   * A page painted with the given technology (or the default one).
   *
   * @return Page
   */
  public function page($title = '', $renderer = null)
  {
    return (new Page($title))->renderer($this->renderer($renderer));
  }

  private static function checkName($name)
  {
    if (!in_array($name, array(Renderer::JQUERY, Renderer::QUASAR), true)) {
      throw new InvalidArgumentException("Unknown renderer: '$name' (use 'jquery' or 'quasar')");
    }
    return $name;
  }
}
