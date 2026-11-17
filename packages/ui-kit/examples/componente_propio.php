<?php

/*
 * Ejemplo de componentes propios con ui-kit:
 *
 *   1. Indicador: un componente que solo implementa build() y funciona con los dos renderizadores.
 *   2. Seccion: un componente con hijos y un slot con nombre ("pie"), pintados con Ref::to().
 *   3. Una vista propia para Quasar (view()) que pinta el Indicador como un q-chip.
 *
 *   cd packages/ui-kit
 *   php -S localhost:8000
 *   abrir http://localhost:8000/examples/componente_propio.php                 (Vue 3 + Quasar)
 *         http://localhost:8000/examples/componente_propio.php?render=jquery
 *         http://localhost:8000/examples/componente_propio.php?vista=chip      (vista propia de Quasar)
 *
 * Los datos son de ejemplo.
 */

require __DIR__ . '/../autoload.php';

use Ivandzb\UiKit\Component\Alert;
use Ivandzb\UiKit\Component\Button;
use Ivandzb\UiKit\Component\Card;
use Ivandzb\UiKit\Component\Component;
use Ivandzb\UiKit\Component\Icon;
use Ivandzb\UiKit\Html;
use Ivandzb\UiKit\Node\Ref;
use Ivandzb\UiKit\Render\QuasarRenderer;
use Ivandzb\UiKit\Render\Renderer;
use Ivandzb\UiKit\UiKit;

/**
 * Un valor con su etiqueta y un icono. Solo implementa build(), armado con nodos más
 * simples, así que se pinta igual con Quasar y con jQuery.
 */
final class Indicador extends Component
{
  private $etiqueta;
  private $valor;
  private $icono;

  public function __construct($etiqueta, $valor, $icono)
  {
    $this->etiqueta = (string) $etiqueta;
    $this->valor = (string) $valor;
    $this->icono = (string) $icono;
  }

  public function etiqueta()
  {
    return $this->etiqueta;
  }

  public function valor()
  {
    return $this->valor;
  }

  public function icono()
  {
    return $this->icono;
  }

  public function build()
  {
    // Los atributos, clases y estilos que el usuario le ponga al componente (id(), addClass(),
    // style()...) se copian al nodo raíz; si no, se perderían.
    return Card::make()->attrs($this->getAttributes())->style($this->getStyles())
      ->addClass('indicador', ...$this->getClasses())
      ->add(
        Html::div(
          Icon::make($this->icono)->size('32px')->addClass('indicador-icono'),
          Html::div(
            Html::div($this->valor)->addClass('indicador-valor'),
            Html::div($this->etiqueta)->addClass('indicador-etiqueta')
          )
        )->addClass('indicador-fila')
      );
  }
}

/**
 * Una sección con título. Sus hijos (add()) son el contenido y pie() llena el slot "pie".
 * Ref::to() pinta los hijos sin adoptarlos, así el componente se puede pintar varias veces.
 */
final class Seccion extends Component
{
  private $titulo;

  public function __construct($titulo)
  {
    $this->titulo = (string) $titulo;
  }

  /**
   * @return $this
   */
  public function pie(...$contenido)
  {
    $this->slot('pie')->add(...$contenido);
    return $this;
  }

  public function build()
  {
    $seccion = Html::element(
      'section',
      Html::h(2, $this->titulo)->addClass('seccion-titulo'),
      Html::div(Ref::to($this->children()))->addClass('seccion-cuerpo')
    )->attrs($this->getAttributes())->style($this->getStyles())->addClass('seccion', ...$this->getClasses());

    if ($this->hasSlot('pie')) {
      $seccion->add(Html::div(Ref::to($this->slot('pie')->children()))->addClass('seccion-pie'));
    }
    return $seccion;
  }
}

$renderer = isset($_GET['render']) && $_GET['render'] === Renderer::JQUERY ? Renderer::JQUERY : Renderer::QUASAR;
$conChip = $renderer === Renderer::QUASAR && isset($_GET['vista']) && $_GET['vista'] === 'chip';
$self = basename(__FILE__);

// La URL de los recursos es relativa a esta página (examples/).
$ui = UiKit::make('../assets', $renderer, 'https://code.jquery.com/jquery-3.7.1.min.js');
$pintor = $ui->renderer();

if ($conChip) {
  // Vista propia: este renderizador pinta el Indicador como un q-chip en vez de usar build().
  // view() es de QuasarRenderer (no de la interfaz Renderer) y se registra en esta instancia,
  // así que la página se pinta con ella (getHtml($pintor)).
  $pintor = new QuasarRenderer('../assets');
  $pintor->view(Indicador::class, function (Indicador $indicador) {
    // props() trae id, clases, estilos y atributos del componente, igual que build().
    return QuasarRenderer::vnode('q-chip', array_merge(QuasarRenderer::props($indicador), array(
      'label' => $indicador->etiqueta() . ': ' . $indicador->valor(),
      'icon' => $indicador->icono(),
      'color' => 'primary',
      'textColor' => 'white',
    )));
  });
}

// --- Uso ------------------------------------------------------------------------------
$indicadores = Html::div(
  new Indicador('Viajes en tránsito', 2, 'local_shipping'),
  new Indicador('Entregados esta semana', 12, 'task_alt'),
  (new Indicador('Por recibir', 1, 'pending_actions'))->id('por-recibir')->addClass('indicador--alerta')
)->addClass('indicadores');

$seccion = (new Seccion('Resumen de logística'))
  ->add(
    Alert::info('Indicador y Seccion son componentes de este ejemplo, hechos solo con build().'),
    $indicadores
  )
  ->pie(Button::make('Ver viajes')->icon('list')->href("$self?render=$renderer")->outline());

$otro = $renderer === Renderer::QUASAR ? Renderer::JQUERY : Renderer::QUASAR;
$enlaces = Html::p(
  Html::a("$self?render=$otro", 'Ver con ' . ($otro === Renderer::QUASAR ? 'Vue 3 + Quasar' : 'HTML + jQuery')),
  ' · ',
  $conChip
    ? Html::a("$self?render=quasar", 'Ver indicadores con build()')
    : Html::a("$self?render=quasar&vista=chip", 'Ver indicadores con la vista propia de Quasar (q-chip)')
);

$page = $ui->page('Componente propio · ui-kit')->add(
  Html::div(Html::h(1, 'Componentes propios')->addClass('mi-titulo'), $seccion, $enlaces)->addClass('mi-pagina')
);

// Estilos de las clases propias: css() funciona con los dos renderizadores.
$page->css('
  .mi-pagina { max-width: 900px; margin: 0 auto; padding: 16px; }
  .mi-titulo { margin: 0 0 12px; font-size: 24px; font-weight: 600; }
  .seccion { background: #fff; border: 1px solid #d9e1ea; border-radius: 8px; padding: 16px; }
  .seccion-titulo { margin: 0 0 12px; font-size: 18px; font-weight: 600; }
  .seccion-cuerpo { display: flex; flex-direction: column; gap: 12px; }
  .seccion-pie { margin-top: 16px; display: flex; justify-content: flex-end; }
  .indicadores { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
  .indicador-fila { display: flex; align-items: center; gap: 14px; }
  .indicador-icono { color: #3d6ea6; }
  .indicador--alerta .indicador-icono { color: #b22400; }
  .indicador-valor { font-size: 26px; font-weight: 700; line-height: 1.1; }
  .indicador-etiqueta { color: #5b6878; font-size: 13px; }
');

echo $page->getHtml($pintor);
