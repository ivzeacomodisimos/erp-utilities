<?php

namespace Ivandzb\UiKit\Tests;

use Ivandzb\UiKit\Component\Menu;
use Ivandzb\UiKit\Component\MenuItem;
use Ivandzb\UiKit\Html;
use Ivandzb\UiKit\Render\Renderer;
use Ivandzb\UiKit\Theme\CorporateTheme;
use Ivandzb\UiKit\UiKit;

final class ThemeTest extends TestCase
{
  private function theme()
  {
    return CorporateTheme::make()
      ->brand('Intranet', 'index.php', 'logo.png')
      ->link('Soporte', 'soporte.php', 'support_agent')
      ->user('Ivan Zea', 'salir.php')
      ->menu(Menu::make()->items(MenuItem::make('Inicio', 'index.php')->icon('home')))
      ->content(Html::h(1, 'Picking'))
      ->footer('Comodísimos');
  }

  public function testJqueryPage()
  {
    $html = $this->theme()->page(UiKit::make('assets', Renderer::JQUERY), 'Picking')->getHtml();
    $this->assertContains('<title>Picking</title>', $html);
    $this->assertContains('<a href="index.php" class="uk-brand"><img src="logo.png" alt="" class="uk-brand-logo"><span class="uk-brand-title">Intranet</span></a>', $html);
    $this->assertContains('href="soporte.php" class="uk-btn uk-btn--inherit uk-btn--flat uk-theme-link"', $html);
    $this->assertContains('<span class="uk-theme-user">Ivan Zea</span>', $html);
    $this->assertContains('<main class="uk-main"><h1>Picking</h1></main>', $html);
    $this->assertContains('<footer class="uk-footer">Comodísimos</footer>', $html);
    $this->assertContains('--uk-primary: #3d6ea6', $html);
  }

  public function testQuasarPage()
  {
    $html = $this->theme()->page(UiKit::make('assets'), 'Picking')->getHtml();
    $this->assertContains('UiKitQuasar.mount("#uk-app"', $html);
    $this->assertContains('"t":"uk-layout"', $html);
    $this->assertContains('"t":"uk-menu"', $html);
    $this->assertContains('"label":"Soporte"', $html);
    $this->assertContains('--q-primary: #3d6ea6', $html);
    $this->assertNotContains('"leftFloating"', $html);
  }

  public function testFloatingMenu()
  {
    $jquery = $this->theme()->floatingMenu()->page(UiKit::make('assets', Renderer::JQUERY), 'Picking')->getHtml();
    $this->assertContains('class="uk-layout uk-theme-corporate has-left is-left-floating"', $jquery);
    $this->assertContains('aria-label="Cerrar menú" data-uk-close="" class="uk-drawer-close"', $jquery);
    $this->assertNotContains('uk-drawer-close', $this->theme()->page(UiKit::make('assets', Renderer::JQUERY), 'Picking')->getHtml());
    $this->assertNotContains('is-left-floating', $this->theme()->page(UiKit::make('assets', Renderer::JQUERY), 'Picking')->getHtml());

    $quasar = $this->theme()->floatingMenu()->page(UiKit::make('assets'), 'Picking')->getHtml();
    $this->assertContains('"leftFloating":true', $quasar);
  }
}
