<?php

// Page used by smoke.mjs: the corporate theme with legacy HTML, tabs and cards.
require __DIR__ . '/../../autoload.php';

use Ivandzb\UiKit\Component\Alert;
use Ivandzb\UiKit\Component\Button;
use Ivandzb\UiKit\Component\Card;
use Ivandzb\UiKit\Component\Menu;
use Ivandzb\UiKit\Component\MenuItem;
use Ivandzb\UiKit\Component\Tabs;
use Ivandzb\UiKit\Html;
use Ivandzb\UiKit\Theme\CorporateTheme;
use Ivandzb\UiKit\UiKit;

$legacy = '<table id="legacy"><tr><td id="legacy-cell">sin clic</td></tr></table>'
  . '<script>document.getElementById("legacy-cell").addEventListener("click", function () { this.textContent = "con clic"; });</script>';

echo CorporateTheme::make()
  ->brand('Intranet', 'index.php', null)
  ->link('Soporte', 'soporte.php', 'support_agent')
  ->user('Ivan Zea', 'salir.php')
  ->menu(Menu::make()->items(
    MenuItem::make('Inicio', 'index.php')->icon('home'),
    MenuItem::make('Logística')->icon('local_shipping')->items(MenuItem::make('Picking', 'picking.php')->active())
  )->searchable('Buscar opción'))
  ->content(
    Alert::warning('Base de datos de pruebas')->title('Atención'),
    Card::make('Viajes')->add(Html::p('Contenido de la tarjeta'))->actions(Button::make('Ver todo')->href('viajes.php')),
    Tabs::make()->tab('nuevo', 'Nuevo', Html::p('Panel nuevo'))->tab('viejo', 'Pantalla vieja', Html::raw($legacy))->active('viejo')
  )
  ->footer('Espumas Plásticas')
  ->page(UiKit::make('../../assets'), 'Prueba')
  ->getHtml();
