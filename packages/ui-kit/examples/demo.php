<?php

/*
 * Demo of ui-kit written only with the package's own syntax (no legacy objects, no raw HTML).
 *
 *   cd packages/ui-kit
 *   php -S localhost:8000
 *   open http://localhost:8000/examples/demo.php            (Vue 3 + Quasar)
 *        http://localhost:8000/examples/demo.php?render=jquery
 *
 * The data is made up for the example.
 */

require __DIR__ . '/../autoload.php';

use Ivandzb\UiKit\Component\Alert;
use Ivandzb\UiKit\Component\Badge;
use Ivandzb\UiKit\Component\Button;
use Ivandzb\UiKit\Component\Card;
use Ivandzb\UiKit\Component\Component;
use Ivandzb\UiKit\Component\Icon;
use Ivandzb\UiKit\Component\Menu;
use Ivandzb\UiKit\Component\MenuItem;
use Ivandzb\UiKit\Component\Tabs;
use Ivandzb\UiKit\Html;
use Ivandzb\UiKit\Render\Renderer;
use Ivandzb\UiKit\Theme\CorporateTheme;
use Ivandzb\UiKit\UiKit;

/**
 * A component of this demo, made only of simpler nodes: it works with both renderers.
 */
final class Indicator extends Component
{
  private $label;
  private $value;
  private $icon;

  public function __construct($label, $value, $icon)
  {
    $this->label = $label;
    $this->value = $value;
    $this->icon = $icon;
  }

  public function build()
  {
    return Card::make()->addClass('demo-indicator')->add(
      Html::div(
        Icon::make($this->icon)->size('32px')->addClass('demo-indicator-icon'),
        Html::div(
          Html::div($this->value)->addClass('demo-indicator-value'),
          Html::div($this->label)->addClass('demo-indicator-label')
        )
      )->addClass('demo-indicator-row')
    );
  }
}

$renderer = isset($_GET['render']) && $_GET['render'] === Renderer::JQUERY ? Renderer::JQUERY : Renderer::QUASAR;
$self = basename(__FILE__);
$ui = UiKit::make('../assets', $renderer, 'https://code.jquery.com/jquery-3.7.1.min.js');

// --- Sample data ----------------------------------------------------------------------
$trips = array(
  array(61084, '2026-10-06', 'WLP438', 'Medellín - Bogotá', 'En tránsito'),
  array(61083, '2026-10-06', 'QTY512', 'Medellín - Cali', 'En tránsito'),
  array(61082, '2026-10-05', 'BGU771', 'Rionegro - Bello', 'Entregado'),
  array(61081, '2026-10-05', 'BGU771', 'Medellín - Pereira', 'Por recibir'),
  array(61080, '2026-10-04', 'STY638', 'Itagüí - Envigado', 'Entregado'),
);
$stateColors = array('En tránsito' => 'info', 'Entregado' => 'positive', 'Por recibir' => 'warning');

// --- Screen ---------------------------------------------------------------------------
$rows = array();
foreach ($trips as $trip) {
  list($id, $date, $plate, $route, $state) = $trip;
  $rows[] = array(
    Html::strong((string) $id),
    $date,
    $plate,
    $route,
    Badge::make($state)->color($stateColors[$state]),
    Button::make()->icon('visibility')->href("$self?render=$renderer&viaje=$id")->flat()->attr('aria-label', "Ver viaje $id"),
  );
}
$tripsTable = Html::table($rows, array('Viaje', 'Fecha', 'Placa', 'Ruta', 'Estado', ''))->addClass('demo-table');

$form = Html::form("$self?render=$renderer", 'get')->addClass('demo-form')->add(
  Html::input('hidden', 'render', $renderer),
  Html::div(Html::label('Placa', 'placa'), Html::input('text', 'placa')->id('placa')->attr('placeholder', 'ABC123')->attr('maxlength', 6))->addClass('demo-field'),
  Html::div(Html::label('Tramo', 'tramo'), Html::select('tramo', array('' => 'Todos', 'T1' => 'T1', 'T2' => 'T2'))->id('tramo'))->addClass('demo-field'),
  Html::div(Html::label('Observaciones', 'obs'), Html::textarea('obs')->id('obs')->attr('rows', 3))->addClass('demo-field demo-field-wide'),
  Html::div(Button::make('Buscar')->icon('search')->type('submit'), Button::make('Limpiar')->href("$self?render=$renderer")->outline())->addClass('demo-actions')
);

$menu = Menu::make()->items(
  MenuItem::make('Inicio', "$self?render=$renderer")->icon('home'),
  MenuItem::make('Logística')->icon('local_shipping')->items(
    MenuItem::make('Viajes', "$self?render=$renderer&s=viajes")->active(),
    MenuItem::make('Listas de despacho', "$self?render=$renderer&s=listas")->badge('3'),
    MenuItem::make('Sectores', "$self?render=$renderer&s=sectores")
  ),
  MenuItem::make('Producción')->icon('factory')->items(
    MenuItem::make('Órdenes', "$self?render=$renderer&s=ordenes"),
    MenuItem::make('Fichos', "$self?render=$renderer&s=fichos")
  ),
  MenuItem::make('Informes', "$self?render=$renderer&s=informes")->icon('bar_chart')
);

$other = $renderer === Renderer::QUASAR ? Renderer::JQUERY : Renderer::QUASAR;

$page = CorporateTheme::make()
  ->brand('ui-kit demo', $self)
  ->link('Ver en ' . ($other === Renderer::QUASAR ? 'Quasar' : 'jQuery'), "$self?render=$other", 'swap_horiz')
  ->user('Usuario de ejemplo', "$self?render=$renderer&salir=1")
  ->menu($menu)
  ->content(
    Html::h(1, 'Viajes')->addClass('demo-title'),
    Alert::info('Esta página está hecha solo con componentes de ui-kit; los datos son de ejemplo.')->title('Demo.'),
    Html::div(
      new Indicator('Viajes en tránsito', '2', 'local_shipping'),
      new Indicator('Entregados esta semana', '2', 'task_alt'),
      new Indicator('Por recibir', '1', 'pending_actions')
    )->addClass('demo-indicators'),
    Card::make('Viajes recientes')->subtitle('Últimos 5 viajes')->add(
      Tabs::make()
        ->tab('lista', 'Lista', $tripsTable)->icon('list')
        ->tab('buscar', 'Buscar', $form)->icon('search')
        ->tab('ayuda', 'Ayuda', Html::p('Cada pestaña es un panel; el contenido puede ser cualquier nodo.'), Html::ul(array('Lista: tabla con estados', 'Buscar: formulario', 'Ayuda: texto')))->icon('help')
    )->actions(Button::make('Exportar')->icon('download')->outline(), Button::make('Nuevo viaje')->icon('add'))
  )
  ->right(
    Html::h(2, 'Resumen')->addClass('demo-side-title'),
    Html::p('Tecnología: ', Html::strong($renderer === Renderer::QUASAR ? 'Vue 3 + Quasar' : 'HTML + jQuery')),
    Alert::warning('El vehículo BGU771 tiene dos viajes seguidos.')
  )
  ->footer('ui-kit · ejemplo')
  ->page($ui, 'Viajes · ui-kit demo');

// Styles of this demo's own classes: css() makes them work with both renderers.
$page->css('
  .demo-title { margin: 0 0 12px; font-size: 24px; line-height: 1.25; font-weight: 600; letter-spacing: normal; }
  .demo-indicators { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 4px; }
  .demo-indicator-row { display: flex; align-items: center; gap: 14px; }
  .demo-indicator-icon { color: #3d6ea6; }
  .demo-indicator-value { font-size: 26px; font-weight: 700; line-height: 1.1; }
  .demo-indicator-label { color: #5b6878; font-size: 13px; }
  .demo-table { width: 100%; border-collapse: collapse; font-size: 14px; }
  .demo-table th { text-align: left; color: #5b6878; font-weight: 600; padding: 8px; border-bottom: 2px solid #d9e1ea; }
  .demo-table td { padding: 8px; border-bottom: 1px solid #e6ecf2; vertical-align: middle; }
  .demo-form { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
  .demo-field { display: flex; flex-direction: column; gap: 4px; font-size: 14px; }
  .demo-field-wide { grid-column: 1 / -1; }
  .demo-field input, .demo-field select, .demo-field textarea { padding: 7px 9px; border: 1px solid #c8d3df; border-radius: 6px; font: inherit; background: #fff; }
  .demo-actions { display: flex; gap: 8px; grid-column: 1 / -1; }
  .demo-side-title { font-size: 16px; line-height: 1.3; font-weight: 600; margin: 0 0 8px; letter-spacing: normal; }
');

echo $page->getHtml();
