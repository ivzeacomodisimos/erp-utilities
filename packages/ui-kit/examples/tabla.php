<?php

require __DIR__ . '/../autoload.php';

use Ivandzb\UiKit\Component\Badge;
use Ivandzb\UiKit\Html;
use Ivandzb\UiKit\UiKit;



$tabla = Html::table(
  [
    [61084, 'Medellín - Bogotá', Badge::make('En tránsito')->color('info')],
    [61083, 'Medellín - Cali',   Badge::make('Entregado')->color('positive')],
  ],
  ['Viaje', 'Ruta', 'Estado']
)->addClass('mi-tabla');
echo $tabla->getHtml();


$ui = UiKit::make('packages/ui-kit/assets', 'quasar');

$page = $ui->page('Inicio')
  ->add(Html::h(1, 'Hola'), Html::p('Mi primera página con ui-kit.'), $tabla);

echo $page->getHtml();
