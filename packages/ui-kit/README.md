# ui-kit

Build pages in PHP as a tree of components, like the browser DOM, and paint the whole
tree at the end with `getHtml()`, as **HTML + jQuery** or as **Vue 3 + Quasar**.

- Basic elements (`div`, `a`, `table`, `form`...) and components made of them
  (`Layout`, `Toolbar`, `Menu`, `Card`, `Tabs`, `Button`, `Alert`, `Badge`, `Icon`).
- Themes build the page around your content: header, left panel, center, right panel, footer.
- Legacy HTML (old screens, jTable, other libraries) can be placed anywhere and keeps
  working, scripts and event handlers included, with both renderers.
- Text is always escaped; trusted HTML has to be asked for (`Html::raw()`).

Requires PHP 7.2+ (also works on 8.x). No runtime dependencies. The Quasar bundle is built
and committed, so projects need no Node.

## Example

```php
use Ivandzb\UiKit\Component\Button;
use Ivandzb\UiKit\Component\Card;
use Ivandzb\UiKit\Component\Menu;
use Ivandzb\UiKit\Component\MenuItem;
use Ivandzb\UiKit\Html;
use Ivandzb\UiKit\Theme\CorporateTheme;
use Ivandzb\UiKit\UiKit;

$ui = UiKit::make('/vendor/ivandzb/ui-kit/assets', 'quasar');   // or 'jquery'

$menu = Menu::make()->items(
  MenuItem::make('Home', '/')->icon('home'),
  MenuItem::make('Logistics')->icon('local_shipping')->items(
    MenuItem::make('Trips', '/trips')->active()
  )
);

$card = Card::make('Trips today')
  ->add(Html::table([[61084, 'In transit'], [61083, 'Delivered']], ['Trip', 'State']))
  ->actions(Button::make('See all')->href('/trips')->icon('list'));

echo CorporateTheme::make()
  ->brand('Intranet', '/', '/img/logo.png')
  ->link('Support', '/support', 'support_agent')
  ->user('Ivan Zea', '/logout')
  ->menu($menu)
  ->content($card)
  ->footer('Espumas Plásticas')
  ->page($ui, 'Trips')
  ->getHtml();
```

## Demo

`examples/demo.php` is a small application written only with the package syntax
(theme, menu, indicators made with a custom component, a table, tabs, a form, alerts):

```
php -S localhost:8000          # from packages/ui-kit
http://localhost:8000/examples/demo.php              (Vue 3 + Quasar)
http://localhost:8000/examples/demo.php?render=jquery
```

## Page CSS

Styles for your own classes go in `$page->css('...')`: written as is with jQuery, and
prefixed with the app id (`#uk-app#uk-app .your-class`) with Quasar, so they win over
Quasar's CSS and over the reset that keeps the host page's global CSS away.

## The tree

```php
$root = Html::div()->id('box')->addClass('panel');
$root->add('text is escaped', Html::strong('bold'), Html::a('/x', 'link'));
$root->addHtml('<em>trusted HTML</em>');        // like the legacy addHtml()
$root->add($legacyObject);                      // anything with getHtml(), read when rendering
$root->find('box');  $node->parent();  $root->remove($node);  $root->children();
```

Nodes: `Element` (any tag), `Text`, `Raw` (trusted HTML, a callable or an object with
`getHtml()`), `Fragment` (several nodes, no wrapper) and `Component`.

Attributes: `id()`, `addClass()`, `removeClass()`, `style('color', 'red')`, `attr()`,
`attrs()`, `data('id', 7)`. Shortcuts in `Html`: `div`, `span`, `p`, `strong`, `h($level)`,
`a`, `img`, `br`, `hr`, `ul`, `ol`, `li`, `table($rows, $headers)`, `tr`, `td`, `th`,
`form`, `label`, `input`, `textarea`, `select($name, $options, $selected)`, `button`,
`text`, `raw`, `fragment`.

## Components

| Component | Content |
|---|---|
| `Layout` | `header()`, `left()`, children = center, `right()`, `footer()`; side panels become drawers on narrow screens; `floatingLeft()` keeps the left one hidden until the menu button opens it over the content, as tall as the window |
| `Toolbar` | brand (`logo()`, `home()`, title); children go on the right |
| `Menu` / `MenuItem` | links and groups that open; `activeHref($url)` or `->active()`; `Menu::fromArray()`; `searchable($placeholder)` adds a search box that ignores case and accents, matches the start of the words and also finds options inside groups |
| `Card` | `title`, `subtitle()`, children = body, `actions(...)` |
| `Tabs` | `tab($name, $label, ...$content)`, `icon()`, `active($name)` |
| `Button` | `href()` makes it a link; `icon()`, `color()`, `flat()`, `outline()`, `type()` |
| `Alert` | `Alert::info/success/warning/error(...)`, `title()` |
| `Badge`, `Icon` | Icons are Material Icons names (`'local_shipping'`, shipped) or Font Awesome classes |

A new component only needs `build()`, made of simpler nodes; it then works with every
renderer. A renderer can paint it its own way with `view()`:

```php
class Kpi extends Component
{
  private $label;
  private $value;

  public function __construct($label, $value)
  {
    $this->label = $label;
    $this->value = $value;
  }

  public function label() { return $this->label; }
  public function value() { return $this->value; }

  public function build()
  {
    return Html::div(Html::strong($this->value), ' ', $this->label)->addClass('kpi');
  }
}

// Optional: paint it as a Quasar chip instead of build().
$quasar->view(Kpi::class, function (Kpi $kpi, QuasarRenderer $renderer) {
  return QuasarRenderer::vnode('q-chip', array('label' => $kpi->label() . ': ' . $kpi->value(), 'color' => 'primary'));
});
```

Elements whose tag is a Quasar component (`Element::make('q-chip')`) become that component
with the Quasar renderer.

## Renderers

| | HTML + jQuery (`'jquery'`) | Vue 3 + Quasar (`'quasar'`) |
|---|---|---|
| Output | plain HTML, `assets/ui-kit.css`, `assets/ui-kit.js` (needs jQuery) | a JSON description painted by `assets/quasar/ui-kit-quasar.js` |
| Vue | none | Vue 3 and Quasar inside the bundle; only `UiKitQuasar` on `window`, so it lives next to Vue 2, jQuery or another Quasar app |
| CSS | `uk-*` classes only | scoped to the app; the host page's global CSS does not reach Quasar's markup |
| Raw HTML | written in place | written hidden and moved into place on mount (scripts run, handlers survive) |

`$page->getHtml()` paints the whole document; `$renderer->fragment($node)` paints a part to
embed in another page.

## Themes

`Theme` builds the page around the content; `CorporateTheme` is the included one
(brand bar, links, user, left menu, center, right panel, footer, `primaryColor()`,
`floatingMenu()` for a menu that floats over the content instead of taking a column).

## Building the Quasar bundle

After mounting a Quasar page, domain scripts can call
`UiKitQuasar.notify(message, type)`, `confirm(message, title)` and
`alert(message, title)` for themed feedback. `confirm` resolves a boolean and
`alert` resolves on dismissal. Messages are plain text; HTML is disabled.

`Input::text('serial', 'Serial')` and `Input::file('archivo', 'Archivo Excel')`
provide labeled fields with `id()`, `hint()`, attributes and native HTML fallback.
Quasar renders them with QInput/QFile. External domain scripts can use
`UiKitQuasar.setFieldValue(id, value)`, `getFieldValue(id)` and
`setFieldDisabled(id, disabled)` to keep component state synchronized.
For a file field, `getFieldValue` returns the selected File; clearing uses an empty
value. QFile clears its native file input after selection, so read the File through
this API. Validate required files and business constraints before submitting and
again on the server. The package does not upload files automatically.

`Card::headerActions(Button::make('Info')->icon('info_outline'))` places optional
buttons next to the card title. Cards without header actions retain their layout.

`Tabs::keepPanelsMounted()` optionally keeps inactive panels in the DOM and hides
them, preserving file selections and access by external form controllers. The
default tab lifecycle remains unchanged. Give the Tabs an `id()` for accessible
tab/panel identifiers.

In Quasar, `Menu` options inside the page content (`.uk-main`) automatically use a
full-width dropdown at viewport widths up to 900px. Its button shows the active
section; the popup preserves the supplied items, links, icons and active state,
and closes when navigating. Desktop keeps the vertical list. This is the common
behavior for application option menus, without screen-specific JavaScript.
`mobileDropdown(false)` explicitly opts out. `CorporateTheme::menu()` opts the
primary navigation out because its mobile drawer already handles navigation.
The HTML renderer retains its existing menu. Permission filtering remains the
responsibility of the application before supplying the items.

```
cd quasar && npm install && npm run build && npm test
```

`npm test` runs both JS smoke tests in jsdom (Quasar page and jQuery behavior).

## Tests

```
php tests/run.php
```

## License

MIT. Material Icons font: Apache 2.0 (`assets/MATERIAL-ICONS-LICENSE`).
