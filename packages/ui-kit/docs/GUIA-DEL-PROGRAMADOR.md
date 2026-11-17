# ui-kit · Guía del programador

Guía de uso de `ivandzb/ui-kit` para quien construye pantallas con el paquete. Explica los
conceptos, la API de cada pieza y trae ejemplos listos para copiar.

- Resumen corto en inglés: [`README.md`](../README.md).
- Decisiones de diseño: [`DISENO.md`](../DISENO.md).
- Aplicación de ejemplo completa: [`examples/demo.php`](../examples/demo.php).

## Contenido

1. [Qué es ui-kit](#1-qué-es-ui-kit)
2. [Instalación y primera página](#2-instalación-y-primera-página)
3. [Conceptos clave](#3-conceptos-clave)
4. [El árbol: nodos y atributos](#4-el-árbol-nodos-y-atributos)
5. [Elementos básicos (`Html`)](#5-elementos-básicos-html)
6. [Componentes incluidos](#6-componentes-incluidos)
7. [La página (`Page`)](#7-la-página-page)
8. [Temas](#8-temas)
9. [Renderizadores](#9-renderizadores)
10. [Crear componentes propios](#10-crear-componentes-propios)
11. [HTML heredado y seguridad](#11-html-heredado-y-seguridad)
12. [Recetas](#12-recetas)
13. [Errores frecuentes](#13-errores-frecuentes)
14. [Pruebas y bundle de Quasar](#14-pruebas-y-bundle-de-quasar)
15. [Anexo: ui-kit en la intranet](#15-anexo-ui-kit-en-la-intranet)

---

## 1. Qué es ui-kit

ui-kit construye páginas en PHP como un **árbol de componentes**, igual que el DOM del
navegador: se crean nodos, se meten unos dentro de otros y al final **una sola llamada**
(`getHtml()`) pinta todo.

El mismo árbol se puede pintar con dos tecnologías:

| Renderizador | Resultado |
|---|---|
| `quasar` | Vue 3 + Quasar (el árbol viaja como JSON y lo pinta el bundle incluido) |
| `jquery` | HTML plano + `ui-kit.css` + `ui-kit.js` (requiere jQuery) |

Características:

- El texto **siempre se escapa**. El HTML de confianza se pide explícitamente.
- El HTML heredado (pantallas viejas, jTable, otras librerías) se puede poner en cualquier
  parte y sigue funcionando, con sus scripts y manejadores de eventos.
- PHP 7.2+ (funciona en 8.x), sin dependencias en tiempo de ejecución. El bundle de Quasar
  ya viene compilado: el proyecto no necesita Node.

---

## 2. Instalación y primera página

### Cargar el paquete

Con Composer:

```php
require 'vendor/autoload.php';
```

Sin Composer (el paquete trae su propio autoloader PSR-4):

```php
require 'packages/ui-kit/autoload.php';
```

### Publicar los recursos

La carpeta `assets/` (CSS, JS, bundle de Quasar y fuente Material Icons) debe ser accesible
por URL. Esa URL pública es el primer parámetro de `UiKit::make()`.

### Hola mundo

```php
<?php
require 'packages/ui-kit/autoload.php';

use Ivandzb\UiKit\Html;
use Ivandzb\UiKit\UiKit;

$ui = UiKit::make('packages/ui-kit/assets', 'quasar');

$page = $ui->page('Inicio')
  ->add(Html::h(1, 'Hola'), Html::p('Mi primera página con ui-kit.'));

echo $page->getHtml();
```

`UiKit::make($assetsUrl, $renderer = 'quasar', $jqueryUrl = null)`:

| Parámetro | Uso |
|---|---|
| `$assetsUrl` | URL pública de `assets/`. Con `null` no se escriben las etiquetas de CSS/JS del paquete. |
| `$renderer` | `'quasar'` o `'jquery'` (constantes `Renderer::QUASAR` / `Renderer::JQUERY`). Cualquier otro valor lanza `InvalidArgumentException`. |
| `$jqueryUrl` | Solo para `jquery`, si la página no carga jQuery por su cuenta. |

---

## 3. Conceptos clave

```
UiKit ──► Page ──► árbol de nodos ──► Renderer ──► HTML
          (doc)    Element / Text /    quasar | jquery
                   Raw / Component
Theme ──► arma la Page alrededor de tu contenido (encabezado, menú, pie)
```

| Pieza | Qué es |
|---|---|
| **Nodo** (`Node`) | Cualquier cosa del árbol: elemento, texto, HTML de confianza, fragmento o componente. |
| **Elemento** (`Element`) | Una etiqueta HTML (`div`, `a`, `table`...). `Html` tiene atajos para crearlos. |
| **Componente** (`Component`) | Pieza compuesta (`Card`, `Menu`, `Tabs`...). Se arma con nodos más simples en `build()`. |
| **Slot** | Área con nombre de un componente (`header`, `left`, `actions`...). Los hijos normales van al área por defecto. |
| **Página** (`Page`) | El documento completo: título, CSS, scripts y el árbol del `<body>`. |
| **Tema** (`Theme`) | Construye la página alrededor del contenido. |
| **Renderizador** (`Renderer`) | Decide *cómo* se pinta el árbol. El árbol describe *qué* es. |

Casi todos los métodos devuelven `$this`, así que se encadenan:

```php
Html::div()->id('resumen')->addClass('panel')->style('padding', '8px')->add('Hola');
```

---

## 4. El árbol: nodos y atributos

### Tipos de nodo

| Clase | Para qué | Cómo se crea |
|---|---|---|
| `Element` | Una etiqueta HTML | `Html::div()`, `Element::make('section')` |
| `Text` | Texto (se escapa) | Un string en `add()`, o `Html::text('...')` |
| `Raw` | HTML de confianza, un objeto con `getHtml()` o un callable | `Html::raw(...)`, `addHtml(...)` |
| `Fragment` | Varios nodos sin elemento envolvente | `Html::fragment(...)` |
| `Component` | Pieza compuesta | `Card::make()`, `new MiComponente()` |

### Agregar y manipular hijos

```php
$caja = Html::div()->id('caja');

$caja->add('texto escapado', Html::strong('negrita'), 42);   // strings y números → Text
$caja->add([Html::p('uno'), Html::p('dos')]);               // los arreglos se aplanan
$caja->add(null, '');                                       // se ignoran (útil con condicionales)
$caja->addHtml('<em>HTML de confianza</em>');               // strings → Raw
$caja->add($objetoLegacy);                                  // objeto con getHtml() → Raw
$caja->prepend(Html::h(2, 'Título'));                       // al inicio

$nodo = $caja->find('caja');       // busca por id en todo el subárbol (incluye slots)
$nodo->parent();                   // contenedor al que se agregó
$caja->remove($nodo);              // quita un hijo
$caja->children();                 // Node[]
$caja->isEmpty();
$caja->clear();
```

> Un nodo tiene **un solo padre**: agregarlo a otro contenedor lo saca del anterior.

`add()` acepta: nodos, strings, enteros, floats, arreglos de cualquiera de ellos y objetos con
`getHtml()`. Cualquier otra cosa lanza `InvalidArgumentException`.

### Atributos (elementos y componentes)

```php
$enlace = Html::a('/viajes', 'Viajes')
  ->id('lnk-viajes')
  ->addClass('btn', 'btn-lg principal')   // varios argumentos o separados por espacio
  ->removeClass('btn-lg')
  ->style('color', 'red')
  ->style(['margin-top' => '4px', '--mi-variable' => '1'])
  ->style('color', null)                  // null quita la propiedad
  ->attr('target', '_blank')
  ->attr('download')                      // atributo booleano
  ->attr('title', null)                   // null o false lo quita
  ->attrs(['rel' => 'noopener', 'tabindex' => 0])
  ->data('id', 7);                        // data-id="7"

$enlace->hasClass('btn');   // true
$enlace->getAttr('target'); // '_blank'
```

Los nombres de etiquetas, atributos y propiedades CSS se validan; un nombre inválido lanza
`InvalidArgumentException`. Los **valores** se escapan al pintar.

Los elementos vacíos (`br`, `hr`, `img`, `input`, `meta`...) no aceptan hijos.

---

## 5. Elementos básicos (`Html`)

Todos devuelven un `Element` (salvo `text`, `raw` y `fragment`) y reciben el contenido como
argumentos variables.

| Atajo | Resultado |
|---|---|
| `Html::element($tag, ...$c)` | Cualquier etiqueta |
| `div`, `span`, `p`, `strong`, `li`, `tr`, `td`, `th` | `(...$c)` |
| `h($nivel, ...$c)` | `<h1>`…`<h6>` (el nivel se limita a 1–6) |
| `a($href, ...$c)` | Enlace |
| `img($src, $alt = '')` | Imagen |
| `br()`, `hr()` | Vacíos |
| `ul(array $items)`, `ol(array $items)` | Un `<li>` por ítem (si el ítem ya es `li`, se respeta) |
| `table(array $filas, array $encabezados = null)` | Tabla con `thead`/`tbody` |
| `form($action = '', $method = 'post', ...$c)` | Formulario |
| `label($texto, $for = null)` | Etiqueta |
| `input($type, $name, $value = null)` | Campo |
| `textarea($name, $value = '')` | Área de texto |
| `select($name, array $opciones, $seleccionado = null)` | `valor => texto`, en orden |
| `button($texto, $type = 'button')` | Botón HTML simple (ver también el componente `Button`) |
| `text($t)`, `raw($html)`, `fragment(...$c)` | Texto, HTML de confianza, fragmento |

### Ejemplo: tabla

```php
$tabla = Html::table(
  [
    [61084, 'Medellín - Bogotá', Badge::make('En tránsito')->color('info')],
    [61083, 'Medellín - Cali',   Badge::make('Entregado')->color('positive')],
  ],
  ['Viaje', 'Ruta', 'Estado']
)->addClass('mi-tabla');
```

Las celdas pueden ser texto o cualquier nodo (badges, botones, enlaces).

### Ejemplo: formulario

```php
$form = Html::form('buscar.php', 'get')->add(
  Html::label('Placa', 'placa'),
  Html::input('text', 'placa', $_GET['placa'] ?? '')->id('placa')->attr('maxlength', 6),
  Html::label('Tramo', 'tramo'),
  Html::select('tramo', ['' => 'Todos', 'T1' => 'Tramo 1', 'T2' => 'Tramo 2'], $_GET['tramo'] ?? '')->id('tramo'),
  Html::textarea('obs')->attr('rows', 3),
  Button::make('Buscar')->icon('search')->type('submit')
);
```

> El valor que viene de `$_GET` se escapa solo: no hace falta `htmlspecialchars()`.

---

## 6. Componentes incluidos

Todos están en `Ivandzb\UiKit\Component` y aceptan los mismos métodos de atributos de la
sección 4 (`id`, `addClass`, `style`, `attr`, `data`).

### `Button`

Botón; si tiene `href()` se pinta como enlace con aspecto de botón.

```php
Button::make('Guardar')->icon('save')->type('submit');
Button::make('Ver viajes')->href('viajes.php')->flat();
Button::make('Exportar')->icon('download')->outline()->color('secondary');
Button::make()->icon('delete')->color('negative')->flat()->attr('aria-label', 'Eliminar');
```

| Método | Valores |
|---|---|
| `icon($nombre)` | Material Icons o Font Awesome (ver `Icon`) |
| `href($url)` | Lo convierte en enlace |
| `type($t)` | `button` (defecto), `submit`, `reset` |
| `color($c)` | `primary` (defecto), `secondary`, `positive`, `negative`, `warning`, `info`, `dark`; `null` hereda el color del texto |
| `flat()` / `outline()` | Estilo (defecto: relleno) |

### `Icon`

```php
Icon::make('local_shipping');          // Material Icons (incluida en el paquete)
Icon::make('fas fa-truck');            // Font Awesome (la página debe cargarlo)
Icon::make('warning')->size('32px');
```

Los nombres de Material Icons están en <https://fonts.google.com/icons>.

### `Badge`

```php
Badge::make('3');
Badge::make('Entregado')->color('positive');   // mismos colores que Button
```

### `Alert`

Caja de mensaje; sus hijos son el mensaje.

```php
Alert::info('Los datos se actualizan cada 5 minutos.');
Alert::success('Viaje guardado.');
Alert::warning('Base de datos de pruebas')->title('Atención.');
Alert::error('No se pudo conectar con Siesa: ', Html::strong($mensaje));
```

### `Card`

Panel con título opcional. Los hijos son el cuerpo; los botones van en `actions()`.

```php
Card::make('Viajes recientes')
  ->subtitle('Últimos 5 viajes')
  ->add($tabla)
  ->actions(
    Button::make('Exportar')->icon('download')->outline(),
    Button::make('Nuevo viaje')->icon('add')
  );
```

### `Tabs`

Pestañas; cada una con su panel. `icon()` se aplica a **la última pestaña agregada**.

```php
Tabs::make()
  ->tab('lista', 'Lista', $tabla)->icon('list')
  ->tab('buscar', 'Buscar', $form)->icon('search')
  ->tab('ayuda', 'Ayuda', Html::p('Texto de ayuda.'))
  ->active('buscar');                       // por defecto, la primera
```

El nombre de la pestaña debe empezar en minúscula (`/^[a-z][a-zA-Z0-9_-]*$/`). Para
agregar contenido después: `$tabs->panel('lista')->add(...)`.

### `Menu` y `MenuItem`

Menú de navegación con grupos que se abren y cierran.

```php
$menu = Menu::make()->items(
  MenuItem::make('Inicio', 'index.php')->icon('home'),
  MenuItem::make('Logística')->icon('local_shipping')->items(
    MenuItem::make('Viajes', 'viajes.php'),
    MenuItem::make('Listas de despacho', 'listas.php')->badge('3')
  ),
  MenuItem::make('Informes', 'informes.php')->icon('bar_chart')
)
  ->activeHref($_SERVER['REQUEST_URI'])     // marca la opción actual y abre su grupo
  ->searchable('Buscar opción');            // caja de búsqueda
```

- `MenuItem::make($label, $href = null)`: con hijos (`items()`) es un grupo; `href` vacío o
  `'#'` equivale a sin enlace.
- `active()` marca una opción a mano; `activeHref($url)` compara ruta + query (sin host y sin
  importar el orden de los parámetros).
- `searchable($placeholder = 'Buscar', $sinResultados = 'Sin resultados')`: ignora
  mayúsculas y tildes, busca por inicio de palabra y también dentro de los grupos.

Desde datos (por ejemplo, una consulta):

```php
$menu = Menu::fromArray([
  ['label' => 'Inicio', 'href' => 'index.php', 'icon' => 'home'],
  ['label' => 'Logística', 'icon' => 'local_shipping', 'items' => [
    ['label' => 'Viajes', 'href' => 'viajes.php', 'active' => true],
    ['label' => 'Listas', 'href' => 'listas.php', 'badge' => 3],
  ]],
]);
```

### `Toolbar`

Barra con la marca (logo + título) a la izquierda; los hijos van a la derecha.

```php
Toolbar::make('Intranet')
  ->logo('img/logo.png')
  ->home('index.php')
  ->add(Button::make('Salir')->href('salir.php')->icon('logout')->flat()->color(null));
```

### `Layout`

Esqueleto de página: encabezado, panel izquierdo, centro, panel derecho y pie. Los hijos son
el centro.

```php
Layout::make()
  ->header(Toolbar::make('Intranet'))
  ->left($menu)
  ->add($contenido)               // centro
  ->right(Html::p('Resumen'))
  ->footer('Espumas Plásticas')
  ->leftWidth(260)                // px, mínimo 120 (defecto 270)
  ->rightWidth(300)               // px, mínimo 120 (defecto 280)
  ->floatingLeft();               // menú flotante (ver abajo)
```

- En pantallas angostas los paneles laterales se vuelven cajones que se abren desde el
  botón de menú del encabezado.
- `floatingLeft()`: el panel izquierdo siempre es cajón; oculto al cargar, se abre sobre el
  contenido (que no se mueve) y ocupa todo el alto de la ventana.

En la mayoría de los casos no se usa `Layout` directamente sino un tema (sección 8).

---

## 7. La página (`Page`)

`$ui->page($titulo)` crea la página con el renderizador por defecto. Sus hijos son el
`<body>`.

```php
$page = $ui->page('Lista de picking')
  ->lang('es')
  ->primaryColor('#3d6ea6')                 // color principal en ambos renderizadores
  ->stylesheet('css/propio.css')            // <link> (sin duplicados)
  ->script('js/libreria.js', true)          // true: en <head>
  ->script('js/pantalla.js')                // al final del body
  ->css('.mi-clase { color: #333; }')       // CSS de tus clases (ver nota)
  ->inlineScript('console.log("listo")')    // JS al final, después de pintar
  ->headHtml('<meta name="robots" content="noindex">')
  ->bodyEndHtml($pieLegacy)                 // HTML de confianza al final del body
  ->add($contenido);

echo $page->getHtml();
```

> **Usa `css()` para los estilos propios, no un `<style>` en `headHtml()`.** Con Quasar,
> `css()` antepone `#uk-app#uk-app` a cada selector para que tus reglas ganen sobre las de
> Quasar y sobre el reset que aísla el marcado. `@media`, `@supports` y `@container` se
> respetan; `@font-face` y `@keyframes` quedan igual. Limitación: no soporta llaves dentro
> de strings en el CSS.

`getHtml($renderer = null)` usa, en orden: el renderizador pasado, el de `renderer()` o HTML
plano.

---

## 8. Temas

Un tema construye la página alrededor del contenido. El incluido es `CorporateTheme`.

```php
use Ivandzb\UiKit\Theme\CorporateTheme;

echo CorporateTheme::make()
  ->brand('Intranet', 'index.php', 'img/logo.png')     // título, inicio, logo
  ->link('Soporte', 'soporte.php', 'support_agent')    // enlaces en la barra (0..n)
  ->user('Ivan Zea', 'salir.php', 'Salir')             // usuario y botón de salida
  ->menu($menu)                                        // panel izquierdo
  ->floatingMenu()                                     // opcional: menú flotante
  ->content($titulo, $alerta, $card)                   // centro (se puede llamar varias veces)
  ->right(Html::p('Panel derecho'))
  ->footer('Espumas Plásticas')
  ->primaryColor('#2e7d32')                            // defecto #3d6ea6
  ->page($ui, 'Viajes')                                // devuelve una Page
  ->css('.mi-titulo { font-size: 24px; }')             // se sigue configurando la Page
  ->getHtml();
```

`$tema->layout()` devuelve solo el `Layout`, para meterlo en una página armada en otro lado.

### Crear un tema

Implementa `Theme` y devuelve una `Page`; los componentes y renderizadores no cambian.

```php
use Ivandzb\UiKit\Component\Layout;
use Ivandzb\UiKit\Component\Toolbar;
use Ivandzb\UiKit\Node\Fragment;
use Ivandzb\UiKit\Theme\Theme;
use Ivandzb\UiKit\UiKit;

final class TemaKiosco implements Theme
{
  private $contenido;

  public function __construct()
  {
    $this->contenido = new Fragment();
  }

  public function content(...$c)
  {
    $this->contenido->add(...$c);
    return $this;
  }

  public function page(UiKit $ui, $title)
  {
    return $ui->page($title)->primaryColor('#00695c')->add(
      Layout::make()->header(Toolbar::make($title))->add($this->contenido)
    );
  }
}
```

---

## 9. Renderizadores

| | `jquery` (`HtmlRenderer`) | `quasar` (`QuasarRenderer`) |
|---|---|---|
| Salida | HTML plano + `assets/ui-kit.css` + `assets/ui-kit.js` | Un JSON que pinta `assets/quasar/ui-kit-quasar.js` |
| Vue | No | Vue 3 + Quasar dentro del bundle; solo expone `window.UiKitQuasar`, así convive con Vue 2, jQuery u otra app Quasar |
| CSS | Solo clases `uk-*` | Aislado en el app: el CSS global de la página no alcanza el marcado de Quasar |
| HTML de confianza | Se escribe en su lugar | Se escribe oculto y se mueve al montar (los scripts corren y los manejadores se conservan) |

### Elegir el renderizador

```php
$ui = UiKit::make('assets', 'quasar');
$ui->page('A');                  // quasar (defecto del kit)
$ui->page('B', 'jquery');        // otro para esta página
$ui->renderer('jquery');         // instancia suelta
```

### Pintar un pedazo dentro de otra página

```php
$renderer = $ui->renderer();
echo $renderer->fragment($card);   // punto de montaje + script; el CSS del bundle va la primera vez
```

También funciona `$nodo->getHtml($renderer)`. Sin renderizador, `$nodo->getHtml()` (o
`echo $nodo`) pinta HTML plano.

### Componentes de Quasar directos

Con el renderizador Quasar, un elemento cuya etiqueta es un componente de Quasar se pinta
como ese componente; los atributos pasan como props:

```php
Element::make('q-chip')->attr('label', 'Urgente')->attr('color', 'negative')->attr('icon', 'bolt');
```

Con `jquery` saldría como una etiqueta desconocida: úsalo solo en pantallas exclusivas de
Quasar o dentro de una vista propia (sección 10).

### Inspeccionar lo que se envía a Quasar

```php
print_r($ui->renderer('quasar')->describe($card));
// ['t' => 'q-card', 'p' => [...], 'c' => [...], 's' => [...]]
```

Útil en pruebas: `t` es la etiqueta, `p` las props, `c` los hijos y `s` los slots.

---

## 10. Crear componentes propios

Un componente nuevo solo necesita `build()`, armado con nodos más simples. Así funciona con
**todos** los renderizadores.

```php
use Ivandzb\UiKit\Component\Card;
use Ivandzb\UiKit\Component\Component;
use Ivandzb\UiKit\Component\Icon;
use Ivandzb\UiKit\Html;

final class Indicador extends Component
{
  private $etiqueta;
  private $valor;
  private $icono;

  public function __construct($etiqueta, $valor, $icono)
  {
    $this->etiqueta = $etiqueta;
    $this->valor = $valor;
    $this->icono = $icono;
  }

  public function etiqueta() { return $this->etiqueta; }
  public function valor() { return $this->valor; }

  public function build()
  {
    return Card::make()->addClass('indicador', ...$this->getClasses())->add(
      Html::div(
        Icon::make($this->icono)->size('32px'),
        Html::div(
          Html::div($this->valor)->addClass('indicador-valor'),
          Html::div($this->etiqueta)->addClass('indicador-etiqueta')
        )
      )->addClass('indicador-fila')
    );
  }
}

// Uso
Html::div(
  new Indicador('Viajes en tránsito', 2, 'local_shipping'),
  new Indicador('Por recibir', 1, 'pending_actions')
)->addClass('indicadores');
```

### Hijos y slots dentro de `build()`

Para pintar los hijos o un slot del componente usa `Ref::to(...)`: los muestra **sin
adoptarlos**, de modo que el componente se puede pintar varias veces.

```php
use Ivandzb\UiKit\Node\Ref;

final class Seccion extends Component
{
  private $titulo;

  public function __construct($titulo) { $this->titulo = $titulo; }

  public function pie(...$c)
  {
    $this->slot('pie')->add(...$c);
    return $this;
  }

  public function build()
  {
    $seccion = Html::element('section',
      Html::h(3, $this->titulo),
      Ref::to($this->children())                 // contenido por defecto
    )->attrs($this->getAttributes())->addClass('seccion', ...$this->getClasses());

    if ($this->hasSlot('pie')) {
      $seccion->add(Html::div(Ref::to($this->slot('pie')->children()))->addClass('seccion-pie'));
    }
    return $seccion;
  }
}
```

> Copia siempre `getAttributes()`, `getClasses()` y `getStyles()` al nodo raíz de `build()`;
> si no, el `id()`/`addClass()` que el usuario ponga al componente se pierde.

### Vista propia por renderizador (opcional)

Un renderizador puede pintar un componente a su manera con `view()`. La vista recibe el
componente y el renderizador:

```php
use Ivandzb\UiKit\Render\QuasarRenderer;

$quasar = $ui->renderer('quasar');
$quasar->view(Indicador::class, function (Indicador $i, QuasarRenderer $r) {
  return QuasarRenderer::vnode('q-chip', [
    'label' => $i->etiqueta() . ': ' . $i->valor(),
    'color' => 'primary',
    'icon'  => 'insights',
  ]);
});

echo $page->getHtml($quasar);
```

- `QuasarRenderer::vnode($tipo, $props, $hijos)` arma un nodo; `QuasarRenderer::props($c)`
  convierte los atributos del componente en props; `$r->nodes($c->children())` pinta hijos.
- La vista se registra **en esa instancia** del renderizador: pinta la página con ella.
- Si no hay vista, se usa `build()`.

---

## 11. HTML heredado y seguridad

### La regla

| Método | Strings se tratan como |
|---|---|
| `add('...')` | **Texto** (escapado) |
| `addHtml('...')`, `Html::raw('...')` | **HTML de confianza** (tal cual) |

```php
$nombre = '<script>alert(1)</script>';
Html::p('Hola ', $nombre);                 // seguro: se ve el texto literal
Html::p()->addHtml('<b>Hola</b>');         // HTML que escribiste tú
Html::p()->addHtml($nombre);               // ¡XSS! nunca con datos del usuario
```

Solo pasa por `raw`/`addHtml` HTML que generaste tú o una librería de confianza.

### Integrar pantallas viejas

`Raw` acepta un string, un objeto con `getHtml()` o un callable. Los objetos y callables se
leen **al pintar**, así que se pueden seguir llenando después de agregarlos:

```php
$divLegacy = new Div();                 // objeto de cHtml con getHtml()
$card = Card::make('Pantalla vieja')->add($divLegacy);
$divLegacy->addHtml($jtable->jTableHtml());   // todavía llega al resultado

$card->add(Html::raw(function () {
  ob_start();
  include 'pantalla_vieja.php';
  return ob_get_clean();
}));
```

Con Quasar ese HTML **no pasa por Vue**: se escribe oculto y el componente `uk-raw` mueve sus
nodos al montar. Por eso sus `<script>` se ejecutan y sus manejadores de eventos se
conservan. Si el bloque desaparece (por ejemplo al cambiar de pestaña), los nodos vuelven al
contenedor oculto y regresan al volver.

> No uses `v-html` ni plantillas de Vue con HTML heredado: se pierden scripts y manejadores.

---

## 12. Recetas

### Pantalla de listado con filtro, pestañas y acciones

```php
$ui = UiKit::make('packages/ui-kit/assets', 'quasar');

$filas = [];
foreach ($viajes as $v) {
  $filas[] = [
    Html::strong((string) $v['id']),
    $v['fecha'],
    $v['ruta'],
    Badge::make($v['estado'])->color($v['estado'] === 'Entregado' ? 'positive' : 'info'),
    Button::make()->icon('visibility')->href('viaje.php?id=' . urlencode($v['id']))->flat()
      ->attr('aria-label', 'Ver viaje ' . $v['id']),
  ];
}

$contenido = Card::make('Viajes')->add(
  Tabs::make()
    ->tab('lista', 'Lista', Html::table($filas, ['Viaje', 'Fecha', 'Ruta', 'Estado', '']))->icon('list')
    ->tab('buscar', 'Buscar', $form)->icon('search')
)->actions(Button::make('Nuevo')->icon('add')->href('viaje.php'));

echo CorporateTheme::make()
  ->brand('Intranet', 'index.php')
  ->menu($menu->activeHref($_SERVER['REQUEST_URI']))
  ->content(Html::h(1, 'Viajes'), $contenido)
  ->page($ui, 'Viajes')
  ->css('table { width: 100%; border-collapse: collapse; } td, th { padding: 6px; }')
  ->getHtml();
```

### Mensaje según el resultado de una acción

```php
$aviso = null;
if ($guardado) {
  $aviso = Alert::success('Cambios guardados.');
} elseif ($error !== null) {
  $aviso = Alert::error($error)->title('No se pudo guardar.');
}
$tema->content($aviso, $formulario);   // null se ignora
```

### JS propio sin jQuery

```php
$page->add(Button::make('Recargar')->id('btn-recargar')->icon('refresh'));
$js = <<<'JS'
document.getElementById('btn-recargar').addEventListener('click', function () {
  fetch('api.php?accion=recargar').then(function () { location.reload(); });
});
JS;
$page->inlineScript($js);
```

`inlineScript()` corre después de que la página está pintada (también con Quasar).

### Construir parte del árbol y modificarla después

```php
$panel = Html::div()->id('detalle');
$tema->content($panel);
// ...más adelante, en otra función:
$page->find('detalle')->add(Html::p('Cargado después'));
```

---

## 13. Errores frecuentes

| Síntoma | Causa | Solución |
|---|---|---|
| Se ve `<b>` literal en pantalla | Pasaste HTML a `add()` | `addHtml()` / `Html::raw()` (solo si es de confianza) |
| Mis estilos no se aplican con Quasar | `<style>` en `headHtml()` o en CSS global | `$page->css(...)` |
| La página sale sin estilos ni JS | `$assetsUrl` en `null` o URL equivocada | Pasar la URL pública de `assets/` a `UiKit::make()` |
| `Unknown renderer: '...'` | Nombre de renderizador inválido | `'quasar'` o `'jquery'` |
| `<input> cannot have children` | Se agregó contenido a un elemento vacío | Usar `label`/`div` alrededor |
| `Add a tab before setting its icon` | `Tabs::icon()` antes de `tab()` | Llamar `icon()` justo después de la pestaña |
| `Invalid tab name` / `Invalid slot name` | Nombre con mayúscula inicial, espacios o tildes | `/^[a-z][a-zA-Z0-9_-]*$/` |
| `id()` o clases de mi componente no salen | `build()` no copia los atributos | `->attrs($this->getAttributes())->addClass(...$this->getClasses())` |
| El nodo "desaparece" de un lugar | Se agregó a otro contenedor (un solo padre) | Crear otro nodo, o usar `Ref` dentro de `build()` |
| Una vista con `view()` no se usa | La página se pintó con otra instancia del renderizador | `$page->getHtml($rendererConVista)` |
| Icono de Font Awesome vacío | La página no carga Font Awesome | `$page->stylesheet(...)` con su CSS |

---

## 14. Pruebas y bundle de Quasar

Pruebas PHP del paquete:

```bash
php packages/ui-kit/tests/run.php
```

Bundle de Quasar (solo si cambias `quasar/src/`; el compilado ya está en `assets/quasar/`):

```bash
cd packages/ui-kit/quasar
npm install
npm run build
npm test        # pruebas de humo en jsdom (página Quasar y comportamiento jQuery)
```

Demo local:

```bash
cd packages/ui-kit
php -S localhost:8000
# http://localhost:8000/examples/demo.php              (Quasar)
# http://localhost:8000/examples/demo.php?render=jquery
```

---

## 15. Anexo: ui-kit en la intranet

El paquete no conoce la intranet. Lo propio de la intranet está en
`clases/Framework/UiKitIntranet/` y el tema en `cHtml/UiKit/`.

| Pieza | Uso |
|---|---|
| `UiKitIntranet::kit()` | `UiKit` con la URL de recursos (`packages/ui-kit/assets`) y el renderizador de la intranet |
| `UiKitIntranet::RENDERIZADOR` | **Quasar.** Es el único que se usa y mantiene; las funciones nuevas se hacen solo para Quasar |
| `UiKitIntranet::usarEnModulo()` | El módulo pide el tema UiKit (la URL `&tema=` manda) |
| `UiKitIntranetTema::menuDelModulo($titulo, Menu $menu)` | Menú lateral propio del módulo |
| `UiKitIntranetTema::agregarAlModulo(Node ...$nodos)` | Contenido del módulo con nodos de ui-kit |
| `UiKitIntranetTema::MODULOS_CLASICOS` / `&ig_clasico=1` | Volver al diseño clásico de Ig |

Módulo de ejemplo (ver `modulos/Menuaplic/MantMenu.php`):

```php
$conUiKit = UiKitIntranet::usarEnModulo();
require(rutaArchivoTema('head.php'));
if ($conUiKit) {
  UiKitIntranetTema::menuDelModulo('Sistemas', $menu);
  UiKitIntranetTema::agregarAlModulo(
    Html::h(1, 'Mi pantalla'),
    Card::make('Datos')->add($tabla)
  );
} else {
  $divModulo->addHtml($htmlClasico);
}
require(rutaArchivoTema('footer.php'));
```

Los módulos que no se migran siguen escribiendo en `$tdBloqueCentro`, `$tdBloqueIzquierdo`,
`$tdBloqueDerecho`, `$tdTab` y `$tdBuscador`: el tema Ig por defecto ya los pinta con ui-kit.
El CSS para contenido heredado de la intranet va dentro del bloque `raw` (ver
`UiKitIntranetTema::CSS`), porque el CSS global no alcanza el marcado de Quasar.
