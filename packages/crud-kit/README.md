# crud-kit

Declarative CRUD screens for PHP. Describe the fields once and get:

- a list with server-side paging, sorting and filters,
- create / edit / delete dialogs,
- the same validation rules in the browser and on the server,
- parameterized SQL (MySQL or SQL Server) or your own repository,
- translatable texts (English and Spanish included).

The first renderer uses [jTable 2.4](http://www.jtable.org); the definition and the server
protocol do not depend on it, so other renderers (Vue 3 is planned) can be added.

Requires PHP 7.2+ (also works on 8.x). No runtime dependencies.

## Example

```php
use Ivandzb\CrudKit\CrudKit;
use Ivandzb\CrudKit\Definition\Crud;
use Ivandzb\CrudKit\Definition\Field;
use Ivandzb\CrudKit\Ports\FileTranslator;
use Ivandzb\CrudKit\Ports\PdoConnection;

$crud = Crud::make('sectors')
  ->title('Delivery sectors')
  ->table('logistics.sectors')
  ->fields(
    Field::text('code', 'Code')->key()->onlyOnCreate()->filterable()
      ->rules(['required' => true, 'maxLength' => 2]),
    Field::text('name', 'Name')->filterable(Field::FILTER_LIKE)
      ->rules(['required' => true, 'maxLength' => 80]),
    Field::select('active', 'Status', [1 => 'Active', 0 => 'Inactive'])
  )
  ->permissions(['delete' => 'admin']);

$kit = new CrudKit(new PdoConnection($pdo), null, new FileTranslator('en'), '/vendor/ivandzb/crud-kit/assets');

if (CrudKit::isRequestFor($crud, $_REQUEST)) {
  header('Content-Type: application/json');
  echo json_encode($kit->handle($crud, $_REQUEST));
  exit;
}

echo $kit->render($crud, '/sectors.php');   // the page must load jQuery, jQuery UI and jTable
```

## Fields

| Factory | jTable input |
|---|---|
| `Field::text`, `Field::number` | text |
| `Field::textarea` | textarea |
| `Field::select($name, $title, [value => text])` | drop-down (keeps the declared order) |
| `Field::date($name, $title, $format)` | date picker |
| `Field::checkbox($name, $title, $off, $on)` | checkbox |
| `Field::autocomplete($name, $title, Lookup $lookup)` | search box; stores the value, shows and sorts by the text |
| `Field::hidden`, `Field::password` | hidden / password |

Modifiers: `key()`, `onlyOnCreate()`, `readOnly()`, `hideInList()`, `hideInForms()`,
`computed()` (shown, never saved), `emptyValue($v)` (stored when left empty; default null), `fillFrom($action)` (leaving the field in the form calls a custom action that fills other fields), `serverValue($fn)` (set by the server on every create/update, e.g. a timestamp), `filterable(Field::FILTER_EQUALS | FILTER_LIKE)`, `suggestions()`
(the filter box suggests the values already stored in the column, `action=suggest`), `width()`,
`defaultValue()`, `rules([...])`, `display($jsFunction)`, `input($jsFunction)` and
`jtable([...])` to pass any [jTable field option](http://www.jtable.org/ApiReference/FieldOptions).

Lookups for autocomplete fields:

```php
Lookup::table('crm.cities', 'code', 'name')
Lookup::query('SELECT code id, name text FROM crm.cities WHERE active = 1')   // columns id/text by default
```

The list joins the lookup, so records carry the text in `<field>__text`; the form and the
filter search every typed word (`action=autocomplete&field=<name>&term=...`).

Rules: `required`, `minLength`, `maxLength`, `numeric`, `integer`, `min`, `max`, `pattern`, `in`.

## CRUD options

`title()`, `table()`, `scope($sql, $params)` (limits the records listed, read, updated and deleted), `fields()`, `permissions([operation => code])`, `disable(...)`,
`readOnly()`, `messages([...])` (jTable texts for this screen), `pageSize()`, `defaultSorting()`,
`loadOnFilterOnly()`, `dataSource()` (your repository), `beforeSave()`, `afterSave()`,
`transform()`, `selectable($multiple)` (checkboxes + "delete selected"), `texts([...])`
(package texts for this CRUD, e.g. `duplicateKey`), `action($name, $callback)`, `on($jtableEvent, $jsBody)` and `jtable([...])` to
pass any [jTable general option](http://www.jtable.org/ApiReference/GeneralOptions).

## Renderers: jTable or Vue 3 + Quasar

The same definition can be painted with jTable 2.4 (default) or with Vue 3 + Quasar:

```php
$kit = new CrudKit($connection, $permissions, $translator, $assetsUrl, 'quasar'); // project default
Crud::make('trips')->renderWith('jtable');                                // per screen
```

- **jTable**: needs jQuery, jQuery UI and jTable in the page.
- **Quasar**: `assets/quasar/crud-kit-quasar.js` carries its own Vue 3 and Quasar and exposes only
  `CrudKitQuasar`, so it works next to Vue 2, jQuery or nothing. Its CSS is scoped to the CRUD and
  to the dialogs/menus Quasar opens.

Renderer-specific options are ignored by the other one: `jtable()`, `on()`, `display()` and
`input()` are jTable only; `html()` works in both.

The Quasar bundle is built from `quasar/` and committed, so projects need no Node:

```
cd quasar && npm install && npm run build && npm test
```

## Child tables

```php
$lists = Crud::make('trip-lists')->readOnly()->dataSource($repository)->fields(
  Field::number('list', 'List')->key(),
  Field::number('trip', 'Trip')
);

Crud::make('trips')
  ->fields(Field::number('id', 'Trip')->key(), ...)
  ->child('lists', 'Dispatch lists', $lists, ['trip' => 'id'], 'fas fa-clipboard-list');
```

The icon (last argument) can be a Quasar / Material Icons name (`'local_shipping'`, `'list_alt'`,
see https://fonts.google.com/icons), Font Awesome classes (`'fas fa-list'`, the page must load
Font Awesome) or an image URL. Material names work in both renderers: the font ships in
`assets/quasar/material-icons.woff2` and is downloaded only when a screen uses it.

Each row gets a button that opens the child table (jTable `openChildTable`). The child is
served by the same URL with `crud=<child id>`, its linked fields filter it and are hidden, and
children can have their own children. Use `jtable(['openChildAsAccordion' => true])` to keep one open.

## Extension points (ports)

| Interface | Default | Purpose |
|---|---|---|
| `Ports\Connection` | `PdoConnection` | Run parameterized SQL |
| `Ports\Permissions` | `AllowAll` | Who can list / create / update / delete |
| `Ports\Translator` | `FileTranslator` (`lang/*.php`) | Texts; copy `lang/en.php` to add a language |
| `Data\DataSource` | `TableDataSource` | Read/write somewhere else (`ReadOnlyDataSource` helps) |

## Protocol

Requests go to the URL given to `render()` with `crud=<id>&action=<list|create|update|delete|autocomplete|suggest|custom>`.
Responses follow jTable: `{Result, Records, TotalRecordCount}`, `{Result, Record}`,
`{Result: "ERROR", Message, Errors: {field: message}}`.

## Selection toolbar actions (Quasar)

Use `selectable()->disable(Crud::DELETE)` to select records without enabling deletion.
Register a server callback with `action('processRows', $callback)`, then add
`selectionAction('processRows', 'Process selected', ['_csrf' => $token])`.
The callback must check authentication, operation permissions and CSRF itself.
The renderer sends one POST per selected row, with `selected` containing a JSON
array of its key fields. A summary reports partial success; failed operations
are never automatically retried. Additional parameters stay in the POST body.

## Tests

Quasar supports optional `requestParams(['_csrf' => $token])` for parameters sent
with list, save, delete and selection requests. `createFromFilters()` initializes
new forms from the last applied filters. Both are disabled by default.
`Field::onlyOnEdit()` exposes a field only in update forms.
The optional fourth argument of `selectionAction()` adds a confirmation dialog
before submitting selected rows. These client options never replace server
authentication, authorization, CSRF validation or business validation.

Quasar exposes `CrudKitQuasar.filter(selector, values)` to replace filters and
explicitly request the first page, and `reload(selector)` to refresh the current
page. These calls do nothing until invoked. Lookup requests retain `requestParams`.
The component emits bubbling DOM events `crud-kit:filtered` (`detail.crud`,
`detail.filters`) and `crud-kit:changed` (`detail.crud`) for explicit filters and
completed selection/deletion actions. Consumers can synchronize an external
capture form or refresh a parent after deleting a child; no listener is installed
by default and events never repeat writes.

`refreshEvery(5)` enables an optional read refresh and an Update toolbar button
in Quasar. It is disabled by default. The timer skips hidden tabs, pending requests,
open forms, selected rows and running actions; it stops when the component closes.
Reads retain the active filters, sorting and page and never repeat writes.

`createSequence($options)` optionally keeps create dialogs open across several records.
Configure `totalField`, `incrementField`, `nowField`, `commonFields`, `resetValues`,
`timeZone` and `maxValue`. The client counts only successful create responses;
common values and the target count lock after the first success, while per-record
fields reset and the business clock updates. Errors preserve the current values.
Updates and CRUDs without this option retain their previous behavior. Field and
range validation must also be enforced by the domain on the server.
With `totalIsLastNumber: true`, the total field specifies the inclusive final
number instead of the number of new records. This supports resuming a sequence:
total 14 and initial number 12 creates 12, 13 and 14, then closes the dialog.

```
php tests/run.php
```

## License

MIT
