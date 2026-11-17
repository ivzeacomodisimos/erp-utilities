<?php

namespace Ivandzb\UiKit\Tests;

use Ivandzb\UiKit\Component\Alert;
use Ivandzb\UiKit\Component\Button;
use Ivandzb\UiKit\Component\Card;
use Ivandzb\UiKit\Component\Component;
use Ivandzb\UiKit\Component\Layout;
use Ivandzb\UiKit\Component\Input;
use Ivandzb\UiKit\Component\Menu;
use Ivandzb\UiKit\Component\MenuItem;
use Ivandzb\UiKit\Component\Tabs;
use Ivandzb\UiKit\Html;
use Ivandzb\UiKit\Page;
use Ivandzb\UiKit\Render\QuasarRenderer;

final class QuasarRendererTest extends TestCase
{
  public function testFormInputAndHeaderActions()
  {
    $renderer=new QuasarRenderer();
    $field=Input::text('serial','Ficho / serial')->id('serial')->hint('Presione Enter')->attr('required',true);
    $vnode=$renderer->describe($field);
    $this->assertSame('uk-input',$vnode['t']);
    $this->assertSame('serial',$vnode['p']['id']);
    $this->assertSame('Presione Enter',$vnode['p']['hint']);
    $this->assertSame('',$vnode['p']['required']);
    $file=$renderer->describe(Input::file('archivo','Archivo Excel')->attr('accept','.xls'));
    $this->assertSame('file',$file['p']['type']);
    $this->assertSame('.xls',$file['p']['accept']);
    $card=$renderer->describe(Card::make('Lectura')->headerActions(Button::make('Info')->id('info'))->add($field));
    $this->assertSame('q-btn',$card['c'][0]['c'][1]['c'][0]['t']);
    $this->assertSame('info',$card['c'][0]['c'][1]['c'][0]['p']['id']);
    $html=(new \Ivandzb\UiKit\Render\HtmlRenderer())->fragment($field);
    $this->assertContains('for="serial"',$html);
    $this->assertContains('id="serial"',$html);
  }

  public function testElementsAndTexts()
  {
    $vnode = (new QuasarRenderer())->describe(Html::div('Hola', Html::a('/x', 'Ir')->attr('target', '_blank'))->id('d')->addClass('a b')->style('color', 'red'));
    $this->assertSame(array(
      't' => 'div',
      'p' => array('id' => 'd', 'class' => 'a b', 'style' => 'color: red'),
      'c' => array('Hola', array('t' => 'a', 'p' => array('href' => '/x', 'target' => '_blank'), 'c' => array('Ir'))),
    ), $vnode);
  }

  public function testFragmentsAreFlattened()
  {
    $vnode = (new QuasarRenderer())->describe(Html::div(Html::fragment('a', Html::fragment('b')), 'c'));
    $this->assertSame(array('a', 'b', 'c'), $vnode['c']);
  }

  public function testComponentsBecomeQuasarComponents()
  {
    $renderer = new QuasarRenderer();
    $this->assertSame(array('t' => 'q-btn', 'p' => array('label' => 'Ver', 'icon' => 'list', 'color' => 'primary', 'href' => '/v', 'flat' => true, 'noCaps' => true)),
      $renderer->describe(Button::make('Ver')->icon('list')->href('/v')->flat()));

    $card = $renderer->describe(Card::make('Título')->add('cuerpo')->actions(Button::make('Ok')));
    $this->assertSame('q-card', $card['t']);
    $this->assertSame(array('q-card-section', 'q-card-section', 'q-separator', 'q-card-actions'), array_column($card['c'], 't'));

    $alert = $renderer->describe(Alert::error('Falló'));
    $this->assertSame('q-banner', $alert['t']);
    $this->assertSame('error', $alert['s']['avatar'][0]['p']['name']);
  }

  public function testMenuTabsAndLayout()
  {
    $renderer = new QuasarRenderer();
    $menu = $renderer->describe(Menu::make()->items(MenuItem::make('Grupo')->items(MenuItem::make('Hoja', '/h')->active())));
    $this->assertSame(array(array('label' => 'Grupo', 'open' => true, 'items' => array(array('label' => 'Hoja', 'href' => '/h', 'active' => true)))), $menu['p']['items']);
    $this->assertSame(true,$menu['p']['mobileDropdown']);
    $plain=$renderer->describe(Menu::make()->mobileDropdown(false)->items(MenuItem::make('Inicio','index.php')));
    $this->assertTrue(!isset($plain['p']['mobileDropdown']));

    $this->assertTrue(!isset($menu['p']['search']));
    $buscable = $renderer->describe(Menu::make()->items(MenuItem::make('Hoja', '/h'))->searchable('Buscar opción'));
    $this->assertSame('Buscar opción', $buscable['p']['search']);
    $this->assertSame('Sin resultados', $buscable['p']['noResults']);

    $tabs = $renderer->describe(Tabs::make()->tab('a', 'Uno', 'A')->tab('b', 'Dos', 'B')->active('b'));
    $this->assertSame('uk-tabs', $tabs['t']);
    $this->assertSame('b', $tabs['p']['active']);
    $this->assertTrue(!isset($tabs['p']['keepPanelsMounted']));
    $this->assertSame(true,$renderer->describe(Tabs::make()->tab('form','Formulario')->keepPanelsMounted())['p']['keepPanelsMounted']);
    $this->assertSame(array('a' => array('A'), 'b' => array('B')), (array) $tabs['s']);

    $layout = $renderer->describe(Layout::make()->header('H')->left('L')->add('M'));
    $this->assertSame(array('main' => array('M'), 'header' => array('H'), 'left' => array('L')), $layout['s']);
  }

  public function testRawHtmlIsStashedInThePage()
  {
    $page = (new Page('P'))->add(Layout::make()->add(Html::raw('<table id="legacy"><tr><td>x</td></tr></table><script>init()</script>')));
    $html = $page->getHtml(new QuasarRenderer('assets'));
    $this->assertContains('<div id="uk-raw-1" class="uk-raw-stash" hidden><table id="legacy">', $html);
    $this->assertContains('"t":"uk-raw","p":{"source":"uk-raw-1"}', $html);
    $this->assertTrue(strpos($html, 'uk-raw-stash') < strpos($html, 'UiKitQuasar.mount'), 'the stash is parsed before the app mounts');
    $this->assertContains('src="assets/quasar/ui-kit-quasar.js', $html);
  }

  public function testPageCssIsScopedToTheApp()
  {
    $html = (new Page())->css(".a, .b > i { color: red }\n@media (max-width: 600px) { .a { top: 0 } }\n@keyframes k { from { top: 0 } }")
      ->getHtml(new QuasarRenderer('assets'));
    $this->assertContains('#uk-app#uk-app .a, #uk-app#uk-app .b > i {color: red}', $html);
    $this->assertContains('@media (max-width: 600px) {#uk-app#uk-app .a {top: 0}', $html);
    $this->assertContains('@keyframes k {from { top: 0 }}', $html);
    $this->assertTrue(strpos($html, 'ui-kit-quasar.css') < strpos($html, '#uk-app#uk-app .a'), 'the page CSS comes after the bundle CSS');
  }

  public function testJsonCannotCloseTheScript()
  {
    $html = (new Page())->add(Html::p('</script><script>alert(1)</script>'))->getHtml(new QuasarRenderer());
    $this->assertNotContains('</script><script>alert(1)', $html);
    $this->assertContains('</script>', $html);
  }

  public function testFragmentsLoadTheBundleOnce()
  {
    $renderer = new QuasarRenderer('assets');
    $first = $renderer->fragment(Button::make('A'));
    $second = $renderer->fragment(Button::make('B'));
    $this->assertContains('ui-kit-quasar.js', $first);
    $this->assertNotContains('ui-kit-quasar.js', $second);
    $this->assertContains('UiKitQuasar.mount("#uk-mount-2-', $second);
  }

  public function testCustomComponentsFallBackToBuild()
  {
    $component = new class extends Component {
      public function build()
      {
        return Html::span('build');
      }
    };
    $this->assertSame(array('t' => 'span', 'c' => array('build')), (new QuasarRenderer())->describe($component));
  }
}
