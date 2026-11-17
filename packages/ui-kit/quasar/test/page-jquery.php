<?php

// Page used by jquery.mjs: the same theme painted with HTML + jQuery.
require __DIR__ . '/../../autoload.php';

use Ivandzb\UiKit\Component\Menu;
use Ivandzb\UiKit\Component\MenuItem;
use Ivandzb\UiKit\Component\Tabs;
use Ivandzb\UiKit\Html;
use Ivandzb\UiKit\Render\Renderer;
use Ivandzb\UiKit\Theme\CorporateTheme;
use Ivandzb\UiKit\UiKit;

echo CorporateTheme::make()
  ->brand('Intranet', 'index.php')
  ->menu(Menu::make()->items(
    MenuItem::make('Inicio', 'index.php')->icon('home'),
    MenuItem::make('Logística')->icon('local_shipping')->items(MenuItem::make('Picking', 'picking.php'))
  )->searchable('Buscar opción'))
  ->content(Tabs::make()->id('t')->tab('uno', 'Uno', Html::p('Panel uno'))->tab('dos', 'Dos', Html::p('Panel dos')))
  ->page(UiKit::make('../../assets', Renderer::JQUERY, '../node_modules/jquery/dist/jquery.min.js'), 'Prueba jQuery')
  ->getHtml();
