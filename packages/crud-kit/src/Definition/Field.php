<?php

namespace Ivandzb\CrudKit\Definition;

use InvalidArgumentException;
use Ivandzb\CrudKit\Render\JsFunction;

/**
 * A column of a CRUD: how it is listed, edited, filtered and validated.
 *
 * Instances are built with the static factories (Field::text(), Field::select(), ...)
 * and configured fluently.
 */
final class Field
{
  const TEXT = 'text';
  const NUMBER = 'number';
  const TEXTAREA = 'textarea';
  const SELECT = 'select';
  const DATE = 'date';
  const DATETIME = 'datetime';
  const CHECKBOX = 'checkbox';
  const HIDDEN = 'hidden';
  const PASSWORD = 'password';
  const AUTOCOMPLETE = 'autocomplete';

  /** Suffix of the column that carries the text of a lookup field in the records ("city__text"). */
  const TEXT_SUFFIX = '__text';

  const FILTER_EQUALS = 'equals';
  const FILTER_LIKE = 'like';

  /** @var string */
  private $name;
  /** @var string */
  private $title;
  /** @var string */
  private $type;
  /** @var bool */
  private $key = false;
  /** @var bool */
  private $list = true;
  /** @var bool */
  private $create = true;
  /** @var bool */
  private $edit = true;
  /** @var bool column exists in the table (false for computed/display-only fields) */
  private $stored = true;
  /** @var string|null */
  private $filter = null;
  /** @var bool */
  private $suggestions = false;
  /** @var callable|null */
  private $suggestionDetails = null;
  /** @var callable|null */
  private $serverValue = null;
  /** @var string|null custom action that fills the form when the user leaves this field */
  private $fillAction = null;
  /** @var mixed what is stored when the field is left empty */
  private $emptyValue = null;
  /** @var string|null */
  private $width = null;
  /** @var mixed */
  private $default = null;
  /** @var array */
  private $rules = array();
  /** @var array|null value => text */
  private $options = null;
  /** @var string|null */
  private $displayFormat = null;
  /** @var JsFunction|null */
  private $display = null;
  /** @var JsFunction|null */
  private $input = null;
  /** @var array raw jTable field options */
  private $jtable = array();
  /** @var array [unchecked, checked] for checkbox fields */
  private $checkboxValues = array(0, 1);
  /** @var Lookup|null */
  private $lookup = null;
  /** @var bool the value is HTML built (and escaped) on the server */
  private $html = false;

  private function __construct($name, $title, $type)
  {
    if (!preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/', (string) $name)) {
      throw new InvalidArgumentException("Invalid field name: '$name'");
    }
    $this->name = $name;
    $this->title = $title === null ? $name : $title;
    $this->type = $type;
  }

  public static function text($name, $title = null)
  {
    return new self($name, $title, self::TEXT);
  }

  public static function number($name, $title = null)
  {
    return (new self($name, $title, self::NUMBER))->rules(array('numeric' => true));
  }

  public static function textarea($name, $title = null)
  {
    return new self($name, $title, self::TEXTAREA);
  }

  /**
   * @param array $options value => text, shown in this order
   */
  public static function select($name, $title = null, array $options = array())
  {
    return (new self($name, $title, self::SELECT))->options($options);
  }

  public static function date($name, $title = null, $displayFormat = 'yy-mm-dd')
  {
    $field = new self($name, $title, self::DATE);
    $field->displayFormat = $displayFormat;
    return $field;
  }

  public static function datetime($name, $title = null)
  {
    return new self($name, $title, self::DATETIME);
  }

  /**
   * Two-state field. Labels come from options() or, by default, from the translator (no / yes).
   */
  public static function checkbox($name, $title = null, $uncheckedValue = 0, $checkedValue = 1)
  {
    $field = new self($name, $title, self::CHECKBOX);
    $field->checkboxValues = array($uncheckedValue, $checkedValue);
    return $field;
  }

  /**
   * Stores a value (code) and shows/searches a text from a lookup. The list shows the
   * text, sorts by it and the form offers a search box. Records carry the text in
   * "<name>__text".
   */
  public static function autocomplete($name, $title, Lookup $lookup)
  {
    $field = new self($name, $title, self::AUTOCOMPLETE);
    $field->lookup = $lookup;
    return $field;
  }

  public static function hidden($name, $default = null)
  {
    $field = new self($name, $name, self::HIDDEN);
    $field->list = false;
    $field->default = $default;
    return $field;
  }

  public static function password($name, $title = null)
  {
    $field = new self($name, $title, self::PASSWORD);
    $field->list = false;
    return $field;
  }

  /**
   * Part of the primary key. Keys are not editable; they are not sent on create
   * unless onlyOnCreate() is used (non auto-increment keys typed by the user).
   */
  public function key()
  {
    $this->key = true;
    $this->create = false;
    $this->edit = false;
    return $this;
  }

  /**
   * Can be typed when creating, then it is read-only.
   */
  public function onlyOnCreate()
  {
    $this->create = true;
    $this->edit = false;
    return $this;
  }

  public function onlyOnEdit()
  {
    $this->create = false;
    $this->edit = true;
    return $this;
  }

  /**
   * Value set by the server on every create and update (e.g. a modification timestamp):
   * function (string $operation): mixed. The field is read-only in the forms; whatever the
   * browser sends for it is ignored.
   *
   * @return $this
   */
  public function serverValue(callable $value)
  {
    $this->serverValue = $value;
    return $this->readOnly();
  }

  /** @return callable|null */
  public function getServerValue()
  {
    return $this->serverValue;
  }

  /**
   * When the user leaves this field in the form (with a value), the custom action $action
   * (Crud::action) receives the form values and its ['Record' => [field => value]] fills
   * the other form fields (e.g. a document number that brings the person's name).
   *
   * @return $this
   */
  public function fillFrom($action)
  {
    $this->fillAction = (string) $action;
    return $this;
  }

  /** @return string|null */
  public function getFillAction()
  {
    return $this->fillAction;
  }

  /**
   * What is stored when the field is left empty (default null), e.g. '' for columns where an
   * empty string means something.
   *
   * @return $this
   */
  public function emptyValue($value)
  {
    $this->emptyValue = $value;
    return $this;
  }

  public function getEmptyValue()
  {
    return $this->emptyValue;
  }

  public function readOnly()
  {
    $this->create = false;
    $this->edit = false;
    return $this;
  }

  public function hideInList()
  {
    $this->list = false;
    return $this;
  }

  public function hideInForms()
  {
    $this->create = false;
    $this->edit = false;
    return $this;
  }

  /**
   * Not a table column: shown in the list (e.g. from a join or a display function) but never saved.
   */
  public function computed()
  {
    $this->stored = false;
    return $this->readOnly();
  }

  /**
   * @param string $mode Field::FILTER_EQUALS or Field::FILTER_LIKE
   */
  public function filterable($mode = self::FILTER_EQUALS)
  {
    if (!in_array($mode, array(self::FILTER_EQUALS, self::FILTER_LIKE), true)) {
      throw new InvalidArgumentException("Invalid filter mode: '$mode'");
    }
    $this->filter = $mode;
    return $this;
  }

  /**
   * The filter box suggests the values already stored in this column while typing (it still
   * accepts any text). Makes the field filterable with FILTER_LIKE if it was not.
   *
   * Without $details the suggestions are the distinct values. With it there is one per
   * record, with a second line to tell apart records with the same value (e.g. where an
   * option of a tree hangs from): function (array $rows): array, where each row has the key
   * fields and "text", and the result has one string (or null) per row, in the same order.
   *
   * @return $this
   */
  public function suggestions(?callable $details = null)
  {
    if ($this->filter === null) {
      $this->filter = self::FILTER_LIKE;
    }
    $this->suggestions = true;
    $this->suggestionDetails = $details;
    return $this;
  }

  public function hasSuggestions()
  {
    return $this->suggestions;
  }

  /** @return callable|null */
  public function getSuggestionDetails()
  {
    return $this->suggestionDetails;
  }

  public function width($width)
  {
    $this->width = (string) $width;
    return $this;
  }

  public function defaultValue($value)
  {
    $this->default = $value;
    return $this;
  }

  /**
   * Validation applied in the browser and on the server.
   *
   * Supported: required, minLength, maxLength, numeric, integer, min, max, pattern (PCRE
   * without delimiters, also valid in JavaScript), in (array of allowed values).
   */
  public function rules(array $rules)
  {
    $known = array('required', 'minLength', 'maxLength', 'numeric', 'integer', 'min', 'max', 'pattern', 'in');
    $unknown = array_diff(array_keys($rules), $known);
    if (count($unknown) > 0) {
      throw new InvalidArgumentException("Unknown rules for '{$this->name}': " . implode(', ', $unknown));
    }
    $this->rules = array_merge($this->rules, $rules);
    return $this;
  }

  /**
   * @param array $options value => text
   */
  public function options(array $options)
  {
    $this->options = $options;
    return $this;
  }

  /**
   * The value is HTML built on the server and shown as is in the list (every renderer).
   * The server is responsible for escaping what goes inside.
   */
  public function html()
  {
    $this->html = true;
    return $this;
  }

  public function isHtml()
  {
    return $this->html;
  }

  /**
   * JavaScript function (data) => html for the list cell (jTable renderer only).
   */
  public function display($jsFunction)
  {
    $this->display = new JsFunction($jsFunction);
    return $this;
  }

  /**
   * JavaScript function (data) => html for the form input.
   */
  public function input($jsFunction)
  {
    $this->input = new JsFunction($jsFunction);
    return $this;
  }

  /**
   * Any jTable field option, passed as is (http://www.jtable.org/ApiReference/FieldOptions).
   * Use JsFunction for function values.
   */
  public function jtable(array $options)
  {
    $this->jtable = array_merge($this->jtable, $options);
    return $this;
  }

  public function name()
  {
    return $this->name;
  }

  public function title()
  {
    return $this->title;
  }

  public function type()
  {
    return $this->type;
  }

  public function isKey()
  {
    return $this->key;
  }

  public function inList()
  {
    return $this->list;
  }

  public function inCreate()
  {
    return $this->create;
  }

  public function inEdit()
  {
    return $this->edit;
  }

  public function isStored()
  {
    return $this->stored;
  }

  /** @return string|null */
  public function filterMode()
  {
    return $this->filter;
  }

  public function getWidth()
  {
    return $this->width;
  }

  public function getDefault()
  {
    return $this->default;
  }

  public function getRules()
  {
    return $this->rules;
  }

  /** @return array|null */
  public function getOptions()
  {
    return $this->options;
  }

  public function getDisplayFormat()
  {
    return $this->displayFormat;
  }

  /** @return JsFunction|null */
  public function getDisplay()
  {
    return $this->display;
  }

  /** @return JsFunction|null */
  public function getInput()
  {
    return $this->input;
  }

  public function getJtable()
  {
    return $this->jtable;
  }

  /** @return array [unchecked, checked] */
  public function getCheckboxValues()
  {
    return $this->checkboxValues;
  }

  /** @return Lookup|null */
  public function getLookup()
  {
    return $this->lookup;
  }

  public function textColumn()
  {
    return $this->name . self::TEXT_SUFFIX;
  }
}
