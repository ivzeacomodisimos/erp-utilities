<?php

namespace Ivandzb\UiKit\Theme;

use Ivandzb\UiKit\Component\Button;
use Ivandzb\UiKit\Component\Layout;
use Ivandzb\UiKit\Component\Menu;
use Ivandzb\UiKit\Component\Toolbar;
use Ivandzb\UiKit\Html;
use Ivandzb\UiKit\Node\Fragment;
use Ivandzb\UiKit\Page;
use Ivandzb\UiKit\UiKit;

/**
 * Business application theme: brand bar with links and the user on top, navigation menu
 * on the left, content in the center, an optional right panel and a footer.
 *
 *   $page = CorporateTheme::make()
 *     ->brand('Intranet', 'index.php', 'img/logo.png')
 *     ->link('Soporte', 'index.php?modulo=Actividades', 'support_agent')
 *     ->user('Ivan Zea', 'index.php?modulo=login&cerrar=1')
 *     ->menu($menu)
 *     ->content($pantalla)
 *     ->footer('Espumas Plásticas')
 *     ->page($ui, 'Lista de picking');
 */
class CorporateTheme implements Theme
{
  /** @var string */
  private $brand = '';
  /** @var string|null */
  private $home;
  /** @var string|null */
  private $logo;
  /** @var array[] label, href, icon */
  private $links = array();
  /** @var string|null */
  private $userName;
  /** @var string|null */
  private $logoutUrl;
  /** @var string */
  private $logoutText = 'Salir';
  /** @var Menu|null */
  private $menu;
  /** @var bool */
  private $floatingMenu = false;
  /** @var Fragment */
  private $content;
  /** @var Fragment */
  private $right;
  /** @var Fragment */
  private $footer;
  /** @var string */
  private $primaryColor = '#3d6ea6';

  public function __construct()
  {
    $this->content = new Fragment();
    $this->right = new Fragment();
    $this->footer = new Fragment();
  }

  /**
   * @return static
   */
  public static function make()
  {
    return new static();
  }

  /** @return $this */
  public function brand($title, $homeUrl = null, $logoUrl = null)
  {
    $this->brand = (string) $title;
    $this->home = $homeUrl;
    $this->logo = $logoUrl;
    return $this;
  }

  /**
   * A link in the header bar.
   *
   * @return $this
   */
  public function link($label, $href, $icon = null)
  {
    $this->links[] = array('label' => (string) $label, 'href' => (string) $href, 'icon' => $icon);
    return $this;
  }

  /** @return $this */
  public function user($name, $logoutUrl = null, $logoutText = 'Salir')
  {
    $this->userName = $name === null ? null : (string) $name;
    $this->logoutUrl = $logoutUrl;
    $this->logoutText = (string) $logoutText;
    return $this;
  }

  /** @return $this */
  public function menu(?Menu $menu = null)
  {
    if ($menu !== null) {
      // The primary navigation already has its own drawer on small screens.
      $menu->mobileDropdown(false);
    }
    $this->menu = $menu;
    return $this;
  }

  /**
   * The menu stays hidden until the header button opens it, floating over the content and
   * as tall as the window (Layout::floatingLeft()).
   *
   * @return $this
   */
  public function floatingMenu($floating = true)
  {
    $this->floatingMenu = (bool) $floating;
    return $this;
  }

  /**
   * @param mixed ...$content
   * @return $this
   */
  public function content(...$content)
  {
    $this->content->add(...$content);
    return $this;
  }

  /**
   * @param mixed ...$content
   * @return $this
   */
  public function right(...$content)
  {
    $this->right->add(...$content);
    return $this;
  }

  /**
   * @param mixed ...$content
   * @return $this
   */
  public function footer(...$content)
  {
    $this->footer->add(...$content);
    return $this;
  }

  /** @return $this */
  public function primaryColor($color)
  {
    $this->primaryColor = (string) $color;
    return $this;
  }

  public function page(UiKit $ui, $title)
  {
    return $ui->page($title)->primaryColor($this->primaryColor)->add($this->layout());
  }

  /**
   * The layout alone, to place it in a page built elsewhere.
   *
   * @return Layout
   */
  public function layout()
  {
    $toolbar = Toolbar::make($this->brand)->logo($this->logo)->home($this->home)->addClass('uk-theme-bar');
    foreach ($this->links as $link) {
      $toolbar->add(Button::make($link['label'])->href($link['href'])->icon($link['icon'])->flat()->color(null)->addClass('uk-theme-link'));
    }
    if ($this->userName !== null) {
      $toolbar->add(Html::span($this->userName)->addClass('uk-theme-user'));
    }
    if ($this->logoutUrl !== null) {
      $toolbar->add(Button::make($this->logoutText)->href($this->logoutUrl)->icon('logout')->outline()->color(null)->addClass('uk-theme-logout'));
    }

    $layout = Layout::make()->addClass('uk-theme-corporate')->header($toolbar)->add($this->content);
    if ($this->menu !== null) {
      $layout->left($this->menu)->floatingLeft($this->floatingMenu);
    }
    if (!$this->right->isEmpty()) {
      $layout->right($this->right);
    }
    if (!$this->footer->isEmpty()) {
      $layout->footer($this->footer);
    }
    return $layout;
  }
}
