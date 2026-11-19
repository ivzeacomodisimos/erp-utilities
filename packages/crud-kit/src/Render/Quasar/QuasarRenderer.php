<?php

namespace Ivandzb\CrudKit\Render\Quasar;

use Ivandzb\CrudKit\Definition\Crud;
use Ivandzb\CrudKit\Definition\Field;
use Ivandzb\CrudKit\Ports\OverriddenTranslator;
use Ivandzb\CrudKit\Ports\Translator;
use Ivandzb\CrudKit\Render\JsEncoder;
use Ivandzb\CrudKit\Render\Renderer;

/**
 * Renders a CRUD with Vue 3 + Quasar (assets/quasar/crud-kit-quasar.js).
 *
 * The bundle carries its own Vue 3 and Quasar and does not touch window.Vue, so it
 * works in pages that use Vue 2, jQuery or nothing. The CRUD is sent as a JSON
 * schema; requests follow the same protocol as the jTable renderer.
 *
 * jTable-only options (Crud::jtable(), Crud::on(), Field::display(), Field::input(),
 * Field::jtable()) are ignored here.
 */
final class QuasarRenderer implements Renderer
{
  /** @var Translator */
  private $translator;
  /** @var string */
  private $assetsUrl;
  /** @var string */
  private $assetsPath;
  /** @var bool */
  private static $assetsWritten = false;

  public function __construct(Translator $translator, $assetsUrl)
  {
    $this->translator = $translator;
    $this->assetsUrl = rtrim((string) $assetsUrl, '/');
    $this->assetsPath = dirname(__DIR__, 3) . '/assets';
  }

  public function render(Crud $crud, $actionUrl, callable $allowedFor)
  {
    $id = 'ck-' . $crud->id();
    return $this->assets()
      . '<div class="ck-quasar" id="' . $id . '"></div>'
      . "\n<script type=\"text/javascript\">\nCrudKitQuasar.mount(" . JsEncoder::encode('#' . $id) . ', '
      . JsEncoder::encode($this->schema($crud, $actionUrl, $allowedFor)) . ");\n</script>\n";
  }

  /**
   * Everything the Vue component needs to paint and operate the CRUD.
   *
   * @return array
   */
  public function schema(Crud $crud, $actionUrl, callable $allowedFor)
  {
    $allowed = call_user_func($allowedFor, $crud);
    $translator = $this->translatorFor($crud);

    $fields = array();
    foreach ($crud->getFields() as $field) {
      $fields[] = $this->fieldSchema($crud, $field, $actionUrl, $translator);
    }

    $children = array();
    foreach ($crud->getChildren() as $child) {
      $children[] = array(
        'name' => $child->name(),
        'title' => $child->title(),
        'icon' => $child->icon(),
        'links' => (object) $child->links(),
        'schema' => $this->schema($child->crud(), $actionUrl, $allowedFor),
      );
    }

    $urls = array('list' => self::url($actionUrl, $crud, Crud::LIST));
    foreach (array(Crud::CREATE, Crud::UPDATE, Crud::DELETE) as $operation) {
      if (!empty($allowed[$operation])) {
        $urls[$operation] = self::url($actionUrl, $crud, $operation);
      }
    }

    $sorting = explode(' ', (string) $crud->getDefaultSorting());
    $selectionActions = array();
    foreach ($crud->getSelectionActions() as $action) {
      $action['url'] = self::url($actionUrl, $crud, $action['name']);
      $selectionActions[] = $action;
    }
    return array(
      'id' => $crud->id(),
      'title' => $crud->getTitle(),
      'pageSize' => $crud->getPageSize(),
      'sortBy' => $sorting[0],
      'descending' => isset($sorting[1]) && $sorting[1] === 'DESC',
      'loadOnStart' => $crud->loadsOnStart(),
      'selection' => $crud->getSelection(),
      'selectionActions' => $selectionActions,
      'createSequence' => $crud->getCreateSequence(),
      'refreshSeconds' => $crud->getRefreshSeconds(),
      'requestParams' => (object) $crud->getRequestParams(),
      'createFromFilters' => $crud->createsFromFilters(),
      'urls' => $urls,
      'fields' => $fields,
      'children' => $children,
      'texts' => $this->texts($crud, $translator),
    );
  }

  private function fieldSchema(Crud $crud, Field $field, $actionUrl, Translator $translator)
  {
    $schema = array(
      'name' => $field->name(),
      'title' => $field->title(),
      'type' => $field->type(),
      'key' => $field->isKey(),
      'list' => $field->inList() && !array_key_exists($field->name(), $crud->getParentLinks()),
      'create' => $field->inCreate(),
      'edit' => $field->inEdit(),
      'width' => $field->getWidth(),
      'default' => $field->getDefault(),
      'rules' => (object) $field->getRules(),
      'filter' => $field->filterMode(),
      'html' => $field->isHtml(),
      'sortable' => $field->isStored() || $field->getLookup() !== null,
    );

    $options = $field->getOptions();
    if ($field->type() === Field::CHECKBOX && $options === null) {
      list($unchecked, $checked) = $field->getCheckboxValues();
      $options = array($unchecked => $translator->text('no'), $checked => $translator->text('yes'));
    }
    if ($options !== null) {
      $schema['options'] = array();
      foreach ($options as $value => $label) {
        $schema['options'][] = array('value' => $value, 'label' => $label);
      }
    }
    if ($field->getFillAction() !== null) {
      $schema['fillUrl'] = self::url($actionUrl, $crud, $field->getFillAction());
    }
    if ($field->hasSuggestions()) {
      $schema['suggestUrl'] = self::url($actionUrl, $crud, 'suggest') . '&field=' . rawurlencode($field->name());
    }
    if ($field->type() === Field::AUTOCOMPLETE) {
      $schema['autocompleteUrl'] = self::url($actionUrl, $crud, 'autocomplete') . '&field=' . rawurlencode($field->name());
      $schema['textField'] = $field->textColumn();
      if ($field->getDependsOn() !== null) {
        $schema['dependsOn'] = $field->getDependsOn();
      }
    }
    return $schema;
  }

  private function texts(Crud $crud, Translator $translator)
  {
    $texts = array_merge($this->translator->jtableMessages(), $crud->getMessages());
    $keys = array('filter', 'yes', 'no', 'validationFailed', 'deleteSelected', 'deleteSelectedConfirm', 'noneSelected',
      'progressPending', 'progressRunning', 'progressSucceeded', 'progressDone', 'progressFailed');
    foreach (array('required', 'minLength', 'maxLength', 'numeric', 'integer', 'min', 'max', 'pattern', 'in') as $rule) {
      $keys[] = 'rule.' . $rule;
    }
    foreach ($keys as $key) {
      $texts[$key] = $translator->text($key);
    }
    return $texts;
  }

  private function translatorFor(Crud $crud)
  {
    return count($crud->getTexts()) > 0 ? new OverriddenTranslator($this->translator, $crud->getTexts()) : $this->translator;
  }

  private function assets()
  {
    if (self::$assetsWritten) {
      return '';
    }
    self::$assetsWritten = true;
    return '<link rel="stylesheet" type="text/css" href="' . $this->assetUrl('quasar/crud-kit-quasar.css') . '">'
      . '<script type="text/javascript" src="' . $this->assetUrl('quasar/crud-kit-quasar.js') . '"></script>';
  }

  private function assetUrl($file)
  {
    $path = $this->assetsPath . '/' . $file;
    return htmlspecialchars($this->assetsUrl . '/' . $file . (is_file($path) ? '?v=' . filemtime($path) : ''), ENT_QUOTES, 'UTF-8');
  }

  private static function url($actionUrl, Crud $crud, $action)
  {
    return $actionUrl . (strpos($actionUrl, '?') === false ? '?' : '&')
      . 'crud=' . rawurlencode($crud->id()) . '&action=' . rawurlencode($action);
  }
}
