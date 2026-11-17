<?php

namespace Ivandzb\UiKit\Tests;

use Ivandzb\UiKit\Component\Alert;
use Ivandzb\UiKit\Component\Button;
use Ivandzb\UiKit\Component\Component;
use Ivandzb\UiKit\Component\Icon;
use Ivandzb\UiKit\Component\Layout;
use Ivandzb\UiKit\Component\Menu;
use Ivandzb\UiKit\Component\MenuItem;
use Ivandzb\UiKit\Component\Tabs;
use Ivandzb\UiKit\Html;
use Ivandzb\UiKit\Page;
use Ivandzb\UiKit\Render\HtmlRenderer;

final class HtmlRendererTest extends TestCase
{
  public function testButtonsAndIcons()
  {
    $this->assertSame('<button type="submit" class="uk-btn uk-btn--primary uk-btn--filled"><i aria-hidden="true" class="uk-mi">save</i><span>Guardar</span></button>',
      Button::make('Guardar')->icon('save')->type('submit')->getHtml());
    $this->assertSame('<a href="/v" class="uk-btn uk-btn--inherit uk-btn--flat"><span>Ver</span></a>',
      Button::make('Ver')->href('/v')->flat()->color(null)->getHtml());
    $this->assertSame('<i aria-hidden="true" class="fas fa-truck"></i>', Icon::make('fas fa-truck')->getHtml());
  }

  public function testMenuMarksTheActiveOptionAndOpensItsGroup()
  {
    $menu = Menu::fromArray(array(
      array('label' => 'Inicio', 'href' => 'index.php', 'icon' => 'home'),
      array('label' => 'Logística', 'items' => array(
        array('label' => 'Picking', 'href' => 'index.php?modulo=logistica&file=mant_lista_picking'),
      )),
    ))->activeHref('/index.php?file=mant_lista_picking&modulo=logistica');
    $html = $menu->getHtml();
    $this->assertContains('<a href="index.php?modulo=logistica&amp;file=mant_lista_picking" aria-current="page" class="uk-menu-item is-active">', $html);
    $this->assertContains('aria-expanded="true"', $html);
    $this->assertContains('<li class="uk-menu-group is-open">', $html);
    $this->assertNotContains('<ul hidden', $html, 'the open group is not hidden');
    $this->assertContains('class="uk-mi uk-menu-caret"', $html);
  }

  public function testTabs()
  {
    $html = Tabs::make()->id('t')->tab('a', 'Uno', 'A')->tab('b', 'Dos', 'B')->icon('list')->active('b')->getHtml();
    $this->assertContains('id="t-tab-a" aria-controls="t-panel-a" aria-selected="false"', $html);
    $this->assertContains('aria-selected="true" data-uk-tab="b"', $html);
    $this->assertContains('id="t-panel-a" aria-labelledby="t-tab-a" data-uk-panel="a" hidden', $html);
    $this->assertNotContains('data-uk-panel="b" hidden', $html);
  }

  public function testLayoutAndAlert()
  {
    $html = Layout::make()->header('Barra')->left('Menú')->add('Centro')->footer('Pie')->getHtml();
    $this->assertContains('class="uk-layout has-left"', $html);
    $this->assertContains('data-uk-toggle="left"', $html);
    $this->assertContains('<aside class="uk-left">Menú</aside><main class="uk-main">Centro</main>', $html);
    $this->assertContains('<footer class="uk-footer">Pie</footer>', $html);
    $this->assertNotContains('class="uk-right"', $html);

    $alert = Alert::warning('Base de pruebas')->title('Atención')->getHtml();
    $this->assertContains('role="alert" class="uk-alert uk-alert--warning"', $alert);
    $this->assertContains('<strong>Atención</strong> Base de pruebas', $alert);
  }

  public function testCustomViewReplacesBuild()
  {
    $renderer = (new HtmlRenderer())->view(Button::class, function (Button $button) {
      return '<x-btn>' . $button->label() . '</x-btn>';
    });
    $this->assertSame('<div><x-btn>Ok</x-btn></div>', Html::div(Button::make('Ok'))->getHtml($renderer));
  }

  public function testNewComponentsOnlyNeedBuild()
  {
    $component = new class extends Component {
      public function build()
      {
        return Html::span('hecho con build');
      }
    };
    $this->assertSame('<span>hecho con build</span>', $component->getHtml());
  }

  public function testPageCssIsWrittenAsIs()
  {
    $html = (new Page())->css('.a { color: red } </style><script>x()</script>')->getHtml(new HtmlRenderer('assets'));
    $this->assertContains('<style>.a { color: red } <\/style><script>x()</script></style>', $html);
    $this->assertTrue(strpos($html, 'ui-kit.css') < strpos($html, '.a { color: red }'), 'after the package CSS');
  }

  public function testInlineScriptsCannotCloseTheTag()
  {
    $html = (new Page())->inlineScript('go("</script><b>x</b>")')->getHtml(new HtmlRenderer());
    $this->assertContains('<script>go("<\/script><b>x</b>")</script>', $html);
  }

  public function testFullPage()
  {
    $page = (new Page('Título <x>'))->primaryColor('#3d6ea6')->add(Html::p('Hola'))
      ->headHtml('<meta name="legacy">')->bodyEndHtml('<script>legacy()</script>')->stylesheet('a.css')->script('b.js', true);
    $html = $page->getHtml(new HtmlRenderer('assets', 'jquery.js'));
    $this->assertContains('<title>Título &lt;x&gt;</title>', $html);
    $this->assertContains('<meta name="legacy">', $html);
    $this->assertContains('href="assets/ui-kit.css', $html);
    $this->assertContains('<script src="jquery.js"></script>', $html);
    $this->assertContains('<div class="uk-root" style="--uk-primary: #3d6ea6"><p>Hola</p></div>', $html);
    $this->assertTrue(strpos($html, 'ui-kit.js') < strpos($html, 'legacy()'), 'legacy scripts run after the package script');
  }
}
