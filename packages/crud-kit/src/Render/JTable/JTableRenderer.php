<?php

namespace Ivandzb\CrudKit\Render\JTable;

use Ivandzb\CrudKit\Definition\Crud;
use Ivandzb\CrudKit\Definition\Field;
use Ivandzb\CrudKit\Ports\OverriddenTranslator;
use Ivandzb\CrudKit\Ports\Translator;
use Ivandzb\CrudKit\Render\JsEncoder;
use Ivandzb\CrudKit\Render\JsFunction;
use Ivandzb\CrudKit\Render\Renderer;

/**
 * Renders a CRUD with jTable 2.4 (http://www.jtable.org).
 *
 * The jTable configuration is built as a PHP array and serialized with JsEncoder,
 * so texts are always escaped and any documented jTable option can be added
 * with Crud::jtable() / Field::jtable(). DOM ids are prefixed with the CRUD id
 * ("ck-<id>-...") so several CRUDs can live in the same page.
 *
 * Requires jQuery, jQuery UI (dialog, autocomplete) and jTable already loaded in the page.
 */
final class JTableRenderer implements Renderer
{
  /** @var Translator */
  private $translator;
  /** @var string public URL of the package assets folder */
  private $assetsUrl;
  /** @var string filesystem path of the assets folder (for cache-busting) */
  private $assetsPath;
  /** @var bool assets already written in this page */
  private static $assetsWritten = false;

  public function __construct(Translator $translator, $assetsUrl)
  {
    $this->translator = $translator;
    $this->assetsUrl = rtrim((string) $assetsUrl, '/');
    $this->assetsPath = dirname(__DIR__, 3) . '/assets';
  }

  /**
   * @param Crud $crud
   * @param string $actionUrl URL that serves this CRUD's requests (crud/action are appended)
   * @param callable $allowedFor function (Crud $crud): array operation => bool (Dispatcher::allowedOperations)
   * @return string HTML + script
   */
  public function render(Crud $crud, $actionUrl, callable $allowedFor)
  {
    $id = 'ck-' . $crud->id();

    $html = $this->assets()
      . '<div class="ck-crud" id="' . $id . '">'
      . $this->filtersHtml($crud, $id, $actionUrl, $this->translatorFor($crud))
      . '<div class="ck-table" id="' . $id . '-table"' . ($crud->loadsOnStart() ? '' : ' style="display:none"') . '></div>'
      . '</div>';

    $setup = $this->setup($crud, $actionUrl, $allowedFor);
    $setup['root'] = '#' . $id;
    $setup['loadOnStart'] = $crud->loadsOnStart();
    $script = 'jQuery(function ($) {'
      . "\n  var config = " . JsEncoder::encode($this->configuration($crud, $actionUrl, $allowedFor)) . ';'
      . "\n  CrudKit.jtable(" . JsEncoder::encode($setup) . ', config);'
      . "\n});";

    return $html . "\n<script type=\"text/javascript\">\n" . $script . "\n</script>\n";
  }

  /**
   * What crud-kit.js needs besides the jTable options: validation rules, texts and
   * the child tables (each with its own configuration and setup).
   */
  private function setup(Crud $crud, $actionUrl, callable $allowedFor)
  {
    $allowed = call_user_func($allowedFor, $crud);
    $children = array();
    foreach ($crud->getChildren() as $child) {
      $configuration = $this->configuration($child->crud(), $actionUrl, $allowedFor);
      $configuration['showCloseButton'] = true;
      $children[$child->name()] = array(
        'title' => $child->title(),
        'icon' => $child->icon(),
        'links' => (object) $child->links(),
        'config' => $configuration,
        'setup' => $this->setup($child->crud(), $actionUrl, $allowedFor),
      );
    }
    return array(
      'id' => $crud->id(),
      'bulkDelete' => $crud->getSelection() === 'multiple' && !empty($allowed[Crud::DELETE]),
      'rules' => $this->clientRules($crud),
      'texts' => $this->clientTexts($crud, $this->translatorFor($crud)),
      'children' => (object) $children,
    );
  }

  /**
   * jTable options for the CRUD.
   *
   * @param callable $allowedFor function (Crud $crud): array operation => bool
   * @return array
   */
  public function configuration(Crud $crud, $actionUrl, callable $allowedFor)
  {
    $allowed = call_user_func($allowedFor, $crud);
    $actions = array('listAction' => self::url($actionUrl, $crud, Crud::LIST));
    if (!empty($allowed[Crud::CREATE])) {
      $actions['createAction'] = self::url($actionUrl, $crud, Crud::CREATE);
    }
    if (!empty($allowed[Crud::UPDATE])) {
      $actions['updateAction'] = self::url($actionUrl, $crud, Crud::UPDATE);
    }
    if (!empty($allowed[Crud::DELETE])) {
      $actions['deleteAction'] = self::url($actionUrl, $crud, Crud::DELETE);
    }

    $childColumns = array();
    foreach ($crud->getChildren() as $child) {
      // Button column that opens the child table (CrudKit.childButton).
      $childColumns[$child->name()] = array(
        'title' => '',
        'width' => '1%',
        'sorting' => false,
        'edit' => false,
        'create' => false,
        'columnResizable' => false,
        'listClass' => 'ck-child-column',
        'display' => new JsFunction('function (data) { return CrudKit.childButton(data, '
          . JsEncoder::encode($crud->id()) . ', ' . JsEncoder::encode($child->name()) . '); }'),
      );
    }
    $fields = array();
    foreach ($crud->getFields() as $field) {
      $fields[$field->name()] = $this->fieldConfiguration($crud, $field, $actionUrl);
    }
    // jTable draws the columns in this order: the child buttons go first, so they are
    // visible in wide tables without scrolling sideways (same as the Quasar renderer).
    // On a name clash the child column wins, as before.
    $fields = $childColumns + $fields;
    // A child table never shows the columns that link it to its parent.
    foreach (array_keys($crud->getParentLinks()) as $linked) {
      if (isset($fields[$linked])) {
        $fields[$linked]['list'] = false;
        $fields[$linked]['type'] = 'hidden';
      }
    }

    $configuration = array(
      'title' => $crud->getTitle(),
      'paging' => true,
      'pageSize' => $crud->getPageSize(),
      'sorting' => true,
      'defaultSorting' => (string) $crud->getDefaultSorting(),
      'actions' => $actions,
      'messages' => $this->jtableMessages($crud),
      'fields' => $fields,
      // Explicit: some copies of jTable change the default to true. Child tables set it to true.
      'showCloseButton' => false,
    );
    if ($crud->getSelection() !== null) {
      $configuration['selecting'] = true;
      $configuration['multiselect'] = $crud->getSelection() === 'multiple';
      $configuration['selectingCheckboxes'] = true;
    }
    foreach ($crud->getEvents() as $event => $function) {
      $configuration[$event] = $function;
    }
    return array_merge($configuration, $crud->getJtable());
  }

  private function fieldConfiguration(Crud $crud, Field $field, $actionUrl)
  {
    $configuration = array(
      'title' => $field->title(),
      'list' => $field->inList(),
      'create' => $field->inCreate(),
      'edit' => $field->inEdit(),
    );
    if ($field->isKey()) {
      $configuration['key'] = true;
    }
    if ($field->getWidth() !== null) {
      $configuration['width'] = $field->getWidth();
    }
    if ($field->getDefault() !== null) {
      $configuration['defaultValue'] = $field->getDefault();
    }

    switch ($field->type()) {
      case Field::TEXTAREA:
      case Field::PASSWORD:
      case Field::HIDDEN:
        $configuration['type'] = $field->type();
        break;
      case Field::DATE:
        $configuration['type'] = 'date';
        $configuration['displayFormat'] = $field->getDisplayFormat();
        break;
      case Field::CHECKBOX:
        $configuration['type'] = 'checkbox';
        $configuration['values'] = $this->checkboxLabels($field, $this->translatorFor($crud));
        $configuration['formText'] = '';
        break;
      case Field::AUTOCOMPLETE:
        $name = JsEncoder::encode($field->name());
        $url = JsEncoder::encode(self::autocompleteUrl($actionUrl, $crud, $field));
        $configuration['input'] = new JsFunction("function (data) { return CrudKit.autocompleteInput(data, $name, $url); }");
        $configuration['display'] = new JsFunction("function (data) { return CrudKit.lookupText(data.record, $name); }");
        break;
    }

    if ($field->type() === Field::SELECT && $field->getOptions() !== null) {
      // An array of {Value, DisplayText} keeps the declared order (object keys would be re-sorted).
      $options = array();
      foreach ($field->getOptions() as $value => $text) {
        $options[] = array('Value' => $value, 'DisplayText' => $text);
      }
      $configuration['options'] = $options;
    }
    if ($field->isHtml()) {
      $configuration['display'] = new JsFunction('function (data) { return data.record[' . JsEncoder::encode($field->name()) . ']; }');
    }
    if ($field->getDisplay() !== null) {
      $configuration['display'] = $field->getDisplay();
    }
    if ($field->getInput() !== null) {
      $configuration['input'] = $field->getInput();
    }
    if (!empty($field->getRules()['required'])) {
      $configuration['inputClass'] = 'ck-required';
    }
    return array_merge($configuration, $field->getJtable());
  }

  private function filtersHtml(Crud $crud, $id, $actionUrl, Translator $translator)
  {
    $items = '';
    foreach ($crud->getFields() as $field) {
      if ($field->filterMode() === null) {
        continue;
      }
      $inputId = $id . '-filter-' . $field->name();
      $items .= '<div class="ck-filter"><label for="' . $inputId . '">' . self::escape($field->title()) . '</label>'
        . $this->filterInput($crud, $field, $inputId, $actionUrl, $translator) . '</div>';
    }
    if ($items === '') {
      return '';
    }
    return '<form class="ck-filters" id="' . $id . '-filters">' . $items
      . '<div class="ck-filter"><button type="submit" class="ck-filter-button">' . self::escape($translator->text('filter')) . '</button></div>'
      . '</form>';
  }

  private function filterInput(Crud $crud, Field $field, $inputId, $actionUrl, Translator $translator)
  {
    $name = self::escape($field->name());
    if ($field->type() === Field::AUTOCOMPLETE) {
      return '<input type="hidden" name="' . $name . '" id="' . $inputId . '-value">'
        . '<input type="text" id="' . $inputId . '" class="ck-autocomplete" autocomplete="off"'
        . ' data-target="#' . $inputId . '-value" data-source="' . self::escape(self::autocompleteUrl($actionUrl, $crud, $field)) . '">';
    }
    if ($field->getOptions() !== null || $field->type() === Field::CHECKBOX) {
      $options = $field->type() === Field::CHECKBOX ? $this->checkboxLabels($field, $translator) : $field->getOptions();
      $html = '<select id="' . $inputId . '" name="' . $name . '"><option value=""></option>';
      foreach ($options as $value => $text) {
        $html .= '<option value="' . self::escape($value) . '">' . self::escape($text) . '</option>';
      }
      return $html . '</select>';
    }
    if ($field->hasSuggestions()) {
      return '<input type="text" id="' . $inputId . '" name="' . $name . '" class="ck-suggest" autocomplete="off"'
        . ' data-source="' . self::escape(self::url($actionUrl, $crud, 'suggest') . '&field=' . rawurlencode($field->name())) . '">';
    }
    return '<input type="text" id="' . $inputId . '" name="' . $name . '">';
  }

  private function checkboxLabels(Field $field, Translator $translator)
  {
    if ($field->getOptions() !== null) {
      return $field->getOptions();
    }
    list($unchecked, $checked) = $field->getCheckboxValues();
    return array($unchecked => $translator->text('no'), $checked => $translator->text('yes'));
  }

  private function clientRules(Crud $crud)
  {
    $rules = array();
    foreach ($crud->getFields() as $field) {
      if (count($field->getRules()) > 0) {
        $rules[$field->name()] = $field->getRules();
      }
    }
    return (object) $rules;
  }

  private function clientTexts(Crud $crud, Translator $translator)
  {
    $texts = array();
    $keys = array('validationFailed', 'deleteSelected', 'deleteSelectedConfirm', 'noneSelected');
    foreach (array('required', 'minLength', 'maxLength', 'numeric', 'integer', 'min', 'max', 'pattern', 'in') as $rule) {
      $keys[] = 'rule.' . $rule;
    }
    foreach ($keys as $key) {
      $texts[$key] = $translator->text($key);
    }
    // Dialog buttons reuse jTable's texts.
    $messages = $this->jtableMessages($crud);
    foreach (array('areYouSure', 'cancel', 'deleteText') as $key) {
      $texts[$key] = isset($messages[$key]) ? $messages[$key] : $key;
    }
    return $texts;
  }

  private function jtableMessages(Crud $crud)
  {
    return array_merge($this->translator->jtableMessages(), $crud->getMessages());
  }

  private function translatorFor(Crud $crud)
  {
    return count($crud->getTexts()) > 0 ? new OverriddenTranslator($this->translator, $crud->getTexts()) : $this->translator;
  }

  /**
   * The package CSS/JS, once per page.
   */
  private function assets()
  {
    if (self::$assetsWritten) {
      return '';
    }
    self::$assetsWritten = true;
    return '<link rel="stylesheet" type="text/css" href="' . $this->assetUrl('crud-kit.css') . '">'
      . '<script type="text/javascript" src="' . $this->assetUrl('crud-kit.js') . '"></script>';
  }

  private function assetUrl($file)
  {
    $path = $this->assetsPath . '/' . $file;
    return self::escape($this->assetsUrl . '/' . $file . (is_file($path) ? '?v=' . filemtime($path) : ''));
  }

  private static function url($actionUrl, Crud $crud, $action)
  {
    return $actionUrl . (strpos($actionUrl, '?') === false ? '?' : '&')
      . 'crud=' . rawurlencode($crud->id()) . '&action=' . rawurlencode($action);
  }

  private static function autocompleteUrl($actionUrl, Crud $crud, Field $field)
  {
    return self::url($actionUrl, $crud, 'autocomplete') . '&field=' . rawurlencode($field->name());
  }

  private static function escape($text)
  {
    return htmlspecialchars((string) $text, ENT_QUOTES, 'UTF-8');
  }
}
