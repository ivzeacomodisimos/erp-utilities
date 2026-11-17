<?php

/*
 * Ejemplo de pantalla de listado con filtros: tema corporativo, menú, una Card con pestañas
 * (Lista y Buscar), filtros que se aplican por GET y un detalle del registro elegido.
 *
 *   cd packages/ui-kit
 *   php -S localhost:8000
 *   abrir http://localhost:8000/examples/pantallaListadoFiltros.php            (Vue 3 + Quasar)
 *         http://localhost:8000/examples/pantallaListadoFiltros.php?render=jquery
 *
 * Los datos son de ejemplo.
 */

require __DIR__ . '/../autoload.php';

use Ivandzb\UiKit\Component\Alert;
use Ivandzb\UiKit\Component\Badge;
use Ivandzb\UiKit\Component\Button;
use Ivandzb\UiKit\Component\Card;
use Ivandzb\UiKit\Component\Menu;
use Ivandzb\UiKit\Component\MenuItem;
use Ivandzb\UiKit\Component\Tabs;
use Ivandzb\UiKit\Html;
use Ivandzb\UiKit\Render\Renderer;
use Ivandzb\UiKit\Theme\CorporateTheme;
use Ivandzb\UiKit\UiKit;

$renderer = isset($_GET['render']) && $_GET['render'] === Renderer::JQUERY ? Renderer::JQUERY : Renderer::QUASAR;
$self = basename(__FILE__);

/**
 * URL de esta pantalla conservando el renderizador elegido.
 */
$url = function (array $parametros = array()) use ($self, $renderer) {
  return $self . '?' . http_build_query(array_merge(array('render' => $renderer), $parametros));
};

// La URL de los recursos es relativa a esta página (examples/).
$ui = UiKit::make('../assets', $renderer, 'https://code.jquery.com/jquery-3.7.1.min.js');

// --- Datos de ejemplo -----------------------------------------------------------------
$viajes = array(
  array('id' => 61084, 'fecha' => '2026-10-06', 'ruta' => 'Medellín - Bogotá', 'estado' => 'En tránsito'),
  array('id' => 61083, 'fecha' => '2026-10-06', 'ruta' => 'Medellín - Cali', 'estado' => 'En tránsito'),
  array('id' => 61082, 'fecha' => '2026-10-05', 'ruta' => 'Rionegro - Bello', 'estado' => 'Entregado'),
  array('id' => 61081, 'fecha' => '2026-10-05', 'ruta' => 'Medellín - Pereira', 'estado' => 'Por recibir'),
  array('id' => 61080, 'fecha' => '2026-10-04', 'ruta' => 'Itagüí - Envigado', 'estado' => 'Entregado'),
  array('id' => 61079, 'fecha' => '2026-10-03', 'ruta' => 'Medellín - Barranquilla', 'estado' => 'Entregado'),
);
$estados = array('En tránsito' => 'info', 'Entregado' => 'positive', 'Por recibir' => 'warning');

// --- Filtros (llegan por GET; se escapan solos al pintarlos) --------------------------
$filtroRuta = isset($_GET['ruta']) ? trim((string) $_GET['ruta']) : '';
$filtroEstado = isset($_GET['estado']) && isset($estados[$_GET['estado']]) ? $_GET['estado'] : '';
$filtroDesde = isset($_GET['desde']) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $_GET['desde']) ? $_GET['desde'] : '';
$hayFiltros = $filtroRuta !== '' || $filtroEstado !== '' || $filtroDesde !== '';

$normalizar = function ($texto) {
  $texto = mb_strtolower((string) $texto, 'UTF-8');
  return strtr($texto, array('á' => 'a', 'é' => 'e', 'í' => 'i', 'ó' => 'o', 'ú' => 'u', 'ü' => 'u', 'ñ' => 'n'));
};

$encontrados = array_values(array_filter($viajes, function ($v) use ($filtroRuta, $filtroEstado, $filtroDesde, $normalizar) {
  if ($filtroRuta !== '' && strpos($normalizar($v['ruta']), $normalizar($filtroRuta)) === false) {
    return false;
  }
  if ($filtroEstado !== '' && $v['estado'] !== $filtroEstado) {
    return false;
  }
  return $filtroDesde === '' || $v['fecha'] >= $filtroDesde;
}));

// --- Detalle del viaje elegido (?id=) -------------------------------------------------
$detalle = null;
if (isset($_GET['id'])) {
  foreach ($viajes as $v) {
    if ((string) $v['id'] === (string) $_GET['id']) {
      $detalle = $v;
    }
  }
}

// --- Lista ----------------------------------------------------------------------------
$filas = array();
foreach ($encontrados as $v) {
  $filas[] = array(
    Html::strong((string) $v['id']),
    $v['fecha'],
    $v['ruta'],
    Badge::make($v['estado'])->color($estados[$v['estado']]),
    Button::make()->icon('visibility')->flat()
      ->href($url(array_filter(array('ruta' => $filtroRuta, 'estado' => $filtroEstado, 'desde' => $filtroDesde, 'id' => $v['id']))))
      ->attr('aria-label', 'Ver viaje ' . $v['id']),
  );
}

$lista = array(
  Html::p(count($encontrados) . ' de ' . count($viajes) . ' viajes', $hayFiltros ? ' (con filtros)' : '')->addClass('lf-conteo'),
);
if ($filas) {
  $lista[] = Html::table($filas, array('Viaje', 'Fecha', 'Ruta', 'Estado', ''))->addClass('lf-tabla');
} else {
  $lista[] = Alert::warning('Ningún viaje cumple los filtros.')->title('Sin resultados.');
}

// --- Formulario de búsqueda -----------------------------------------------------------
$form = Html::form($self, 'get')->addClass('lf-form')->add(
  Html::input('hidden', 'render', $renderer),
  Html::div(
    Html::label('Ruta', 'ruta'),
    Html::input('text', 'ruta', $filtroRuta)->id('ruta')->attr('placeholder', 'Medellín')
  )->addClass('lf-campo'),
  Html::div(
    Html::label('Estado', 'estado'),
    Html::select('estado', array('' => 'Todos') + array_combine(array_keys($estados), array_keys($estados)), $filtroEstado)->id('estado')
  )->addClass('lf-campo'),
  Html::div(
    Html::label('Desde', 'desde'),
    Html::input('date', 'desde', $filtroDesde)->id('desde')
  )->addClass('lf-campo'),
  Html::div(
    Button::make('Buscar')->icon('search')->type('submit'),
    Button::make('Limpiar')->icon('clear')->href($url())->outline()
  )->addClass('lf-acciones')
);

$tabs = Tabs::make()
  ->tab('lista', 'Lista', $lista)->icon('list')
  ->tab('buscar', 'Buscar', $form)->icon('search');

$contenido = Card::make('Viajes')
  ->subtitle($hayFiltros ? 'Resultados de la búsqueda' : 'Todos los viajes')
  ->add($tabs)
  ->actions(Button::make('Nuevo')->icon('add')->href($url(array('nuevo' => 1))));

// --- Menú -----------------------------------------------------------------------------
$menu = Menu::make()->items(
  MenuItem::make('Inicio', $url())->icon('home'),
  MenuItem::make('Logística')->icon('local_shipping')->items(
    MenuItem::make('Viajes', $url())->active(),
    MenuItem::make('Listas de despacho', $url(array('s' => 'listas')))->badge('3')
  ),
  MenuItem::make('Informes', $url(array('s' => 'informes')))->icon('bar_chart')
)->searchable('Buscar opción');

// --- Panel derecho: detalle o ayuda ---------------------------------------------------
if ($detalle !== null) {
  $derecho = Card::make('Viaje ' . $detalle['id'])->add(
    Html::p('Fecha: ', Html::strong($detalle['fecha'])),
    Html::p('Ruta: ', Html::strong($detalle['ruta'])),
    Html::p('Estado: ', Badge::make($detalle['estado'])->color($estados[$detalle['estado']]))
  );
} else {
  $derecho = Alert::info('Usa el botón ', Html::strong('ver'), ' de una fila para mostrar su detalle aquí.');
}

$avisos = array();
if (isset($_GET['nuevo'])) {
  $avisos[] = Alert::success('Aquí iría el formulario de un viaje nuevo.')->title('Ejemplo.');
}

$otro = $renderer === Renderer::QUASAR ? Renderer::JQUERY : Renderer::QUASAR;

echo CorporateTheme::make()
  ->brand('Intranet', $url())
  ->link('Ver en ' . ($otro === Renderer::QUASAR ? 'Quasar' : 'jQuery'), $self . '?render=' . $otro, 'swap_horiz')
  ->user('Usuario de ejemplo', $url(array('salir' => 1)))
  ->menu($menu)
  ->floatingMenu()
  ->content(Html::h(1, 'Viajes')->addClass('lf-titulo'), $avisos, $contenido)
  ->right($derecho)
  ->footer('ui-kit · ejemplo')
  ->page($ui, 'Viajes · ui-kit')
  // css() con clases propias: funciona igual con los dos renderizadores.
  ->css('
    .lf-titulo { margin: 0 0 12px; font-size: 24px; font-weight: 600; }
    .lf-conteo { margin: 0 0 8px; color: #5b6878; font-size: 13px; }
    .lf-tabla { width: 100%; border-collapse: collapse; font-size: 14px; }
    .lf-tabla th { text-align: left; color: #5b6878; font-weight: 600; padding: 6px 8px; border-bottom: 2px solid #d9e1ea; }
    .lf-tabla td { padding: 6px 8px; border-bottom: 1px solid #e6ecf2; vertical-align: middle; }
    .lf-form { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
    .lf-campo { display: flex; flex-direction: column; gap: 4px; font-size: 14px; }
    .lf-campo input, .lf-campo select { padding: 7px 9px; border: 1px solid #c8d3df; border-radius: 6px; font: inherit; background: #fff; }
    .lf-acciones { display: flex; gap: 8px; grid-column: 1 / -1; }
  ')
  ->getHtml();
