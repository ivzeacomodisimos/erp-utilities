<?php

namespace Ivandzb\CrudKit\Definition;

use InvalidArgumentException;
use Ivandzb\CrudKit\Data\DataSource;
use Ivandzb\CrudKit\Render\JsFunction;

/**
 * Declarative definition of a CRUD screen.
 *
 *   Crud::make('sectors')
 *     ->title('Sectors')
 *     ->table('maestros.sectordespacho')
 *     ->fields(
 *       Field::text('id', 'Id')->key()->onlyOnCreate(),
 *       Field::text('name', 'Name')->rules(['required' => true])
 *     );
 */
final class Crud
{
  const LIST = 'list';
  const CREATE = 'create';
  const UPDATE = 'update';
  const DELETE = 'delete';

  /** jTable events that can receive JavaScript (http://www.jtable.org/ApiReference/Events). */
  const EVENTS = array(
    'closeRequested', 'formClosed', 'formCreated', 'formSubmitting', 'loadingRecords',
    'recordAdded', 'recordDeleted', 'recordsLoaded', 'recordUpdated', 'rowInserted',
    'rowsRemoved', 'rowUpdated', 'selectionChanged',
  );

  /** @var string */
  private $id;
  /** @var string */
  private $title = '';
  /** @var string|null */
  private $table = null;
  /** @var Field[] name => field, in display order */
  private $fields = array();
  /** @var array operation => permission code */
  private $permissions = array();
  /** @var array operation => true */
  private $disabled = array();
  /** @var array jTable message key => text */
  private $messages = array();
  /** @var int */
  private $pageSize = 10;
  /** @var string|null "field ASC|DESC" */
  private $defaultSorting = null;
  /** @var bool */
  private $loadOnStart = true;
  /** @var DataSource|null */
  private $dataSource = null;
  /** @var callable[] */
  private $beforeSave = array();
  /** @var callable[] */
  private $afterSave = array();
  /** @var callable[] */
  private $transformers = array();
  /** @var callable[] name => callable */
  private $actions = array();
  /** @var array toolbar actions receiving selected record keys, without enabling delete */
  private $selectionActions = array();
  /** @var array|null opt-in sequence of create forms; no effect on update */
  private $createSequence = null;
  /** @var int automatic read refresh; disabled unless requested */
  private $refreshSeconds = 0;
  private $requestParams = array();
  private $createFromFilters = false;
  /** @var array raw jTable options */
  private $jtable = array();
  /** @var array event => JsFunction */
  private $events = array();
  /** @var string|null null, 'single' or 'multiple' */
  private $selection = null;
  /** @var array translator key => text, for this CRUD */
  private $texts = array();
  /** @var Child[] name => child */
  private $children = array();
  /** @var array child field => parent field, when this CRUD is a child */
  private $parentLinks = array();
  /** @var string|null renderer name (Renderer::JTABLE, Renderer::QUASAR); null = CrudKit default */
  private $renderer = null;
  /** @var array|null [condition, params] limiting the records of the table */
  private $scope = null;

  private function __construct($id)
  {
    if (!preg_match('/^[a-z][a-z0-9_-]*$/', (string) $id)) {
      throw new InvalidArgumentException("Invalid CRUD id '$id': use lowercase letters, digits, '-' or '_'");
    }
    $this->id = $id;
  }

  /**
   * @param string $id unique in the page; used in URLs and DOM ids
   */
  public static function make($id)
  {
    return new self($id);
  }

  public function title($title)
  {
    $this->title = (string) $title;
    return $this;
  }

  /**
   * Table (or view) the default data source reads and writes. May include schema/database.
   */
  public function table($table)
  {
    if (!preg_match('/^[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z_][A-Za-z0-9_]*){0,2}$/', (string) $table)) {
      throw new InvalidArgumentException("Invalid table name: '$table'");
    }
    $this->table = $table;
    return $this;
  }

  public function fields(Field ...$fields)
  {
    foreach ($fields as $field) {
      if (isset($this->fields[$field->name()])) {
        throw new InvalidArgumentException("Duplicated field '{$field->name()}' in CRUD '{$this->id}'");
      }
      $this->fields[$field->name()] = $field;
    }
    return $this;
  }

  /**
   * Permission code required for each operation, resolved by the Permissions port.
   * Example: ['create' => 'I', 'update' => 'M', 'delete' => 'E'].
   */
  public function permissions(array $codes)
  {
    foreach (array_keys($codes) as $operation) {
      $this->assertOperation($operation);
    }
    $this->permissions = array_merge($this->permissions, $codes);
    return $this;
  }

  /**
   * Turns an operation off: no button in the screen and rejected by the server.
   */
  public function disable(...$operations)
  {
    foreach ($operations as $operation) {
      $this->assertOperation($operation);
      $this->disabled[$operation] = true;
    }
    return $this;
  }

  /**
   * Limits the records this CRUD lists, reads, updates and deletes: SQL written by the
   * developer over the table columns (unqualified; they must not clash with lookup columns),
   * with ? placeholders for $params. Creating outside the scope must be rejected in
   * beforeSave, since the new record would not be readable.
   *
   *   ->scope('Empl_Gestion_idGestion IN (?, ?)', [3, 7])
   *
   * @return $this
   */
  public function scope($condition, array $params = array())
  {
    $condition = trim((string) $condition);
    if ($condition === '' || preg_match('/;|--|\/\*/', $condition)) {
      throw new InvalidArgumentException('Invalid scope condition');
    }
    $this->scope = array($condition, array_values($params));
    return $this;
  }

  /** @return array|null [condition, params] */
  public function getScope()
  {
    return $this->scope;
  }

  public function readOnly()
  {
    return $this->disable(self::CREATE, self::UPDATE, self::DELETE);
  }

  /**
   * jTable texts for this screen only, e.g. ['loadingMessage' => 'Loading sectors...'].
   */
  public function messages(array $messages)
  {
    $this->messages = array_merge($this->messages, $messages);
    return $this;
  }

  /**
   * Package texts for this CRUD only (keys of lang/*.php "texts"), e.g.
   * ['duplicateKey' => 'That city already has a sector.'].
   */
  public function texts(array $texts)
  {
    $this->texts = array_merge($this->texts, $texts);
    return $this;
  }

  /**
   * Rows can be selected with checkboxes. With $multiple and the delete operation
   * allowed, a "delete selected" button is added to the toolbar.
   */
  public function selectable($multiple = true)
  {
    $this->selection = $multiple ? 'multiple' : 'single';
    return $this;
  }

  /**
   * Child table opened from a button column of each row.
   *
   * @param string $name column name in this CRUD
   * @param Crud $child the child CRUD (served by the same URL with its own id)
   * @param array $links child field => parent field; the child list is filtered by them
   * @param string|null $icon Font Awesome classes ("fas fa-list") or image URL
   */
  public function child($name, $title, Crud $child, array $links, $icon = null)
  {
    if (isset($this->children[$name]) || isset($this->fields[$name])) {
      throw new InvalidArgumentException("Duplicated column '$name' in CRUD '{$this->id}'");
    }
    if ($child->id() === $this->id) {
      throw new InvalidArgumentException('A CRUD cannot be its own child');
    }
    $this->children[$name] = new Child($name, $title, $child, $links, $icon);
    $child->parentLinks = $links;
    return $this;
  }

  /**
   * Technology that paints this CRUD: 'jtable' or 'quasar' (Vue 3 + Quasar).
   * Without it, the CrudKit default is used. Child tables follow their parent.
   */
  public function renderWith($renderer)
  {
    if (!in_array($renderer, array('jtable', 'quasar'), true)) {
      throw new InvalidArgumentException("Unknown renderer: '$renderer' (use 'jtable' or 'quasar')");
    }
    $this->renderer = $renderer;
    return $this;
  }

  /** @return string|null */
  public function getRenderer()
  {
    return $this->renderer;
  }

  public function pageSize($size)
  {
    $this->pageSize = max(1, (int) $size);
    return $this;
  }

  /**
   * @param string $field
   * @param string $direction ASC or DESC
   */
  public function defaultSorting($field, $direction = 'ASC')
  {
    $direction = strtoupper($direction);
    if (!in_array($direction, array('ASC', 'DESC'), true)) {
      throw new InvalidArgumentException("Invalid sorting direction: '$direction'");
    }
    $this->defaultSorting = $field . ' ' . $direction;
    return $this;
  }

  /**
   * The table stays hidden and empty until the user applies the filters.
   */
  public function loadOnFilterOnly()
  {
    $this->loadOnStart = false;
    return $this;
  }

  /**
   * Custom repository instead of the table.
   */
  public function dataSource(DataSource $dataSource)
  {
    $this->dataSource = $dataSource;
    return $this;
  }

  /**
   * Called before create/update/delete with (array $record, string $operation).
   * Throw a ValidationException or any exception to cancel; its message reaches the user.
   */
  public function beforeSave(callable $callback)
  {
    $this->beforeSave[] = $callback;
    return $this;
  }

  /**
   * Called after create/update/delete with (array $record, string $operation).
   */
  public function afterSave(callable $callback)
  {
    $this->afterSave[] = $callback;
    return $this;
  }

  /**
   * Transforms every record sent to the browser: function (array $record): array.
   */
  public function transform(callable $callback)
  {
    $this->transformers[] = $callback;
    return $this;
  }

  /**
   * Custom server action, called with "&action=$name": function (array $params, Crud $crud): array|null.
   */
  public function action($name, callable $callback)
  {
    if (!preg_match('/^[A-Za-z][A-Za-z0-9_]*$/', (string) $name) || in_array($name, array('list', 'create', 'update', 'delete', 'options', 'autocomplete', 'suggest'), true)) {
      throw new InvalidArgumentException("Invalid action name: '$name'");
    }
    $this->actions[$name] = $callback;
    return $this;
  }

  /** Toolbar action; the action() callback must enforce its own business permissions. */
  public function selectionAction($name, $label, array $params = array(), $confirmation = null)
  {
    if ($this->getAction($name) === null) {
      throw new InvalidArgumentException('Register the action before adding its selection button.');
    }
    $this->selectionActions[] = array('name' => $name, 'label' => $label, 'params' => $params, 'confirmation' => $confirmation);
    return $this;
  }

  public function getSelectionActions()
  {
    return $this->selectionActions;
  }

  /** Keep the create dialog open for a count, preserving common data between records. */
  public function createSequence(array $options)
  {
    foreach (array('totalField', 'incrementField', 'nowField') as $key) {
      if (!isset($options[$key]) || $this->field($options[$key]) === null) {
        throw new InvalidArgumentException('Unknown create sequence field: ' . $key);
      }
    }
    foreach (array_merge(isset($options['commonFields']) ? $options['commonFields'] : array(),
        array_keys(isset($options['resetValues']) ? $options['resetValues'] : array())) as $name) {
      if ($this->field($name) === null) {
        throw new InvalidArgumentException('Unknown create sequence field: ' . $name);
      }
    }
    new \DateTimeZone(isset($options['timeZone']) ? $options['timeZone'] : 'UTC');
    $this->createSequence = $options;
    return $this;
  }

  public function getCreateSequence()
  {
    return $this->createSequence;
  }

  /** Refresh reads while visible and idle; never automatically resubmits writes. */
  public function refreshEvery($seconds)
  {
    if (!is_int($seconds) || ($seconds !== 0 && ($seconds < 5 || $seconds > 3600))) {
      throw new InvalidArgumentException('Refresh interval must be 0 or between 5 and 3600 seconds.');
    }
    $this->refreshSeconds = $seconds;
    return $this;
  }

  public function getRefreshSeconds()
  {
    return $this->refreshSeconds;
  }

  public function requestParams(array $params) { $this->requestParams = $params; return $this; }
  public function getRequestParams() { return $this->requestParams; }
  public function createFromFilters() { $this->createFromFilters = true; return $this; }
  public function createsFromFilters() { return $this->createFromFilters; }

  /**
   * Any jTable general option, passed as is (http://www.jtable.org/ApiReference/GeneralOptions).
   */
  public function jtable(array $options)
  {
    $this->jtable = array_merge($this->jtable, $options);
    return $this;
  }

  /**
   * JavaScript body for a jTable event; receives (event, data).
   */
  public function on($event, $jsBody)
  {
    if (!in_array($event, self::EVENTS, true)) {
      throw new InvalidArgumentException("Unknown jTable event: '$event'");
    }
    $this->events[$event] = JsFunction::body('event', 'data', $jsBody);
    return $this;
  }

  // --- Getters -----------------------------------------------------------------

  public function id()
  {
    return $this->id;
  }

  public function getTitle()
  {
    return $this->title;
  }

  /** @return string|null */
  public function getTable()
  {
    return $this->table;
  }

  /** @return Field[] */
  public function getFields()
  {
    return $this->fields;
  }

  /** @return Field|null */
  public function field($name)
  {
    return isset($this->fields[$name]) ? $this->fields[$name] : null;
  }

  /** @return Field[] */
  public function keyFields()
  {
    return array_filter($this->fields, function (Field $field) {
      return $field->isKey();
    });
  }

  /** @return string|null */
  public function permissionCode($operation)
  {
    return isset($this->permissions[$operation]) ? $this->permissions[$operation] : null;
  }

  public function isEnabled($operation)
  {
    return !isset($this->disabled[$operation]);
  }

  public function getMessages()
  {
    return $this->messages;
  }

  public function getPageSize()
  {
    return $this->pageSize;
  }

  /** @return string|null */
  public function getDefaultSorting()
  {
    if ($this->defaultSorting !== null) {
      return $this->defaultSorting;
    }
    foreach ($this->fields as $field) {
      if ($field->inList()) {
        return $field->name() . ' ASC';
      }
    }
    return null;
  }

  public function loadsOnStart()
  {
    return $this->loadOnStart;
  }

  /** @return DataSource|null */
  public function getDataSource()
  {
    return $this->dataSource;
  }

  public function getBeforeSave()
  {
    return $this->beforeSave;
  }

  public function getAfterSave()
  {
    return $this->afterSave;
  }

  public function getTransformers()
  {
    return $this->transformers;
  }

  /** @return callable|null */
  public function getAction($name)
  {
    return isset($this->actions[$name]) ? $this->actions[$name] : null;
  }

  public function getJtable()
  {
    return $this->jtable;
  }

  public function getEvents()
  {
    return $this->events;
  }

  /** @return string|null null, 'single' or 'multiple' */
  public function getSelection()
  {
    return $this->selection;
  }

  public function getTexts()
  {
    return $this->texts;
  }

  /** @return Child[] */
  public function getChildren()
  {
    return $this->children;
  }

  /** @return array child field => parent field (empty when this CRUD is not a child) */
  public function getParentLinks()
  {
    return $this->parentLinks;
  }

  /**
   * This CRUD or any descendant with that id.
   *
   * @return Crud|null
   */
  public function find($id)
  {
    if ($this->id === $id) {
      return $this;
    }
    foreach ($this->children as $child) {
      $found = $child->crud()->find($id);
      if ($found !== null) {
        return $found;
      }
    }
    return null;
  }

  private function assertOperation($operation)
  {
    if (!in_array($operation, array(self::LIST, self::CREATE, self::UPDATE, self::DELETE), true)) {
      throw new InvalidArgumentException("Unknown operation: '$operation'");
    }
  }
}
