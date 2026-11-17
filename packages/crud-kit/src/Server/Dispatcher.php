<?php

namespace Ivandzb\CrudKit\Server;

use Ivandzb\CrudKit\Data\DataSource;
use Ivandzb\CrudKit\Data\ListQuery;
use Ivandzb\CrudKit\Data\ListResult;
use Ivandzb\CrudKit\Data\LookupSearch;
use Ivandzb\CrudKit\Definition\Crud;
use Ivandzb\CrudKit\Definition\Field;
use Ivandzb\CrudKit\Ports\OverriddenTranslator;
use Ivandzb\CrudKit\Ports\Permissions;
use Ivandzb\CrudKit\Ports\Translator;

/**
 * Serves the requests of a CRUD (the "action" parameter) and returns the
 * response payload in jTable's format. It never prints: the caller sends it.
 */
final class Dispatcher
{
  /** @var Permissions */
  private $permissions;
  /** @var Translator */
  private $translator;
  /** @var LookupSearch|null */
  private $lookupSearch;

  /**
   * @param LookupSearch|null $lookupSearch needed by autocomplete fields
   */
  public function __construct(Permissions $permissions, Translator $translator, ?LookupSearch $lookupSearch = null)
  {
    $this->permissions = $permissions;
    $this->translator = $translator;
    $this->lookupSearch = $lookupSearch;
  }

  /**
   * @param array $params request parameters
   * @return array response payload
   */
  public function handle(Crud $crud, DataSource $dataSource, array $params)
  {
    $action = isset($params['action']) ? (string) $params['action'] : '';
    try {
      switch ($action) {
        case Crud::LIST:
          return $this->list($crud, $dataSource, $params);
        case Crud::CREATE:
        case Crud::UPDATE:
          return $this->save($crud, $dataSource, $action, $params);
        case Crud::DELETE:
          return $this->delete($crud, $dataSource, $params);
        case 'autocomplete':
          return $this->autocomplete($crud, $params);
        case 'suggest':
          return $this->suggest($crud, $params);
        default:
          return $this->custom($crud, $action, $params);
      }
    } catch (ValidationException $e) {
      return array(
        'Result' => 'ERROR',
        'Message' => $this->text($crud, 'validationFailed') . ' ' . implode(' ', $e->errors()),
        'Errors' => $e->errors(),
      );
    } catch (CrudException $e) {
      return self::error($this->text($crud, $e->key(), $this->translatedParams($crud, $e->params())));
    } catch (\Exception $e) {
      return self::error($e->getMessage());
    } catch (\Throwable $e) {
      error_log("crud-kit [{$crud->id()}] $action: $e");
      return self::error($e->getMessage());
    }
  }

  /**
   * Operations the user can see and run, for the renderer.
   *
   * @return array operation => bool
   */
  public function allowedOperations(Crud $crud)
  {
    $allowed = array();
    foreach (array(Crud::LIST, Crud::CREATE, Crud::UPDATE, Crud::DELETE) as $operation) {
      $allowed[$operation] = $crud->isEnabled($operation)
        && $this->permissions->allows($crud, $operation, $crud->permissionCode($operation));
    }
    return $allowed;
  }

  private function list(Crud $crud, DataSource $dataSource, array $params)
  {
    $this->assertAllowed($crud, Crud::LIST);
    $result = $dataSource->list($this->listQuery($crud, $params));
    if (!$result instanceof ListResult) {
      $result = ListResult::fromArray((array) $result);
    }
    $result = $result->map(function ($record) use ($crud) {
      return $this->transform($crud, $record);
    });
    return array('Result' => 'OK', 'TotalRecordCount' => $result->total(), 'Records' => $result->records());
  }

  private function save(Crud $crud, DataSource $dataSource, $operation, array $params)
  {
    $this->assertAllowed($crud, $operation);

    $formFields = array_filter($crud->getFields(), function (Field $field) use ($operation) {
      return $operation === Crud::CREATE ? $field->inCreate() : $field->inEdit();
    });
    $values = $this->values($crud, $params, $operation);
    $errors = (new Validator($this->translatorFor($crud)))->validate($formFields, $values);
    if (count($errors) > 0) {
      throw new ValidationException($errors);
    }

    $this->notify($crud->getBeforeSave(), $values, $operation);
    $record = $operation === Crud::CREATE ? $dataSource->create($values) : $dataSource->update($values);
    $this->notify($crud->getAfterSave(), $record, $operation);

    return array('Result' => 'OK', 'Record' => $this->transform($crud, $record));
  }

  private function delete(Crud $crud, DataSource $dataSource, array $params)
  {
    $this->assertAllowed($crud, Crud::DELETE);
    $keys = array();
    foreach ($crud->keyFields() as $name => $field) {
      $keys[$name] = isset($params[$name]) ? $params[$name] : null;
    }
    $this->notify($crud->getBeforeSave(), $keys, Crud::DELETE);
    $dataSource->delete($keys);
    $this->notify($crud->getAfterSave(), $keys, Crud::DELETE);
    return array('Result' => 'OK');
  }

  private function custom(Crud $crud, $action, array $params)
  {
    $callback = $crud->getAction($action);
    if ($callback === null) {
      throw new CrudException('unknownAction', array('action' => $action));
    }
    $payload = call_user_func($callback, $params, $crud);
    return is_array($payload) ? $payload : array('Result' => 'OK');
  }

  private function listQuery(Crud $crud, array $params)
  {
    $filters = array();
    foreach ($crud->getFields() as $field) {
      $name = $field->name();
      // Fields linked to the parent row always filter (child tables).
      $filtersBy = $field->filterMode() !== null || array_key_exists($name, $crud->getParentLinks());
      if ($filtersBy && isset($params[$name]) && !is_array($params[$name]) && trim($params[$name]) !== '') {
        $filters[$name] = trim($params[$name]);
      }
    }

    $offset = null;
    $limit = null;
    if (isset($params['jtStartIndex'], $params['jtPageSize'])) {
      $offset = (int) $params['jtStartIndex'];
      $limit = min(1000, max(1, (int) $params['jtPageSize']));
    }
    return new ListQuery($filters, $this->sorting($crud, isset($params['jtSorting']) ? $params['jtSorting'] : ''), $offset, $limit, $params);
  }

  /**
   * "name ASC, other DESC" → [[name, ASC], [other, DESC]], only declared fields.
   */
  private function sorting(Crud $crud, $expression)
  {
    $sorting = array();
    foreach (explode(',', (string) $expression) as $part) {
      $part = preg_split('/\s+/', trim($part));
      if ($part[0] === '' || $crud->field($part[0]) === null) {
        continue;
      }
      $direction = isset($part[1]) && strtoupper($part[1]) === 'DESC' ? 'DESC' : 'ASC';
      $sorting[] = array($part[0], $direction);
    }
    return $sorting;
  }

  /**
   * Values sent for the stored fields; empty strings become null.
   */
  private function values(Crud $crud, array $params, $operation)
  {
    $values = array();
    foreach ($crud->getFields() as $name => $field) {
      $sent = $field->isKey()
        || ($operation === Crud::CREATE ? $field->inCreate() : $field->inEdit());
      if (!$field->isStored() || !$sent || !array_key_exists($name, $params)) {
        continue;
      }
      $value = $params[$name];
      // The validator checks the trimmed text: the same text is stored (passwords are kept as typed).
      if (is_string($value) && $field->type() !== Field::PASSWORD) {
        $value = trim($value);
      }
      $values[$name] = $value === null || (is_string($value) && trim($value) === '') ? $field->getEmptyValue() : $value;
    }
    foreach ($crud->getFields() as $name => $field) {
      if ($field->isStored() && $field->getServerValue() !== null) {
        $values[$name] = call_user_func($field->getServerValue(), $operation);
      }
    }
    return $values;
  }

  private function transform(Crud $crud, $record)
  {
    foreach ($crud->getTransformers() as $transformer) {
      $record = call_user_func($transformer, $record);
    }
    return $record;
  }

  private function notify(array $callbacks, array $record, $operation)
  {
    foreach ($callbacks as $callback) {
      call_user_func($callback, $record, $operation);
    }
  }

  private function assertAllowed(Crud $crud, $operation)
  {
    if (!$crud->isEnabled($operation)) {
      throw new CrudException('operationDisabled', array('operation' => $operation));
    }
    if (!$this->permissions->allows($crud, $operation, $crud->permissionCode($operation))) {
      throw new CrudException('operationNotAllowed', array('operation' => $operation));
    }
  }

  private function translatedParams(Crud $crud, array $params)
  {
    if (isset($params['operation'])) {
      $params['operation'] = $this->text($crud, 'operation.' . $params['operation']);
    }
    return $params;
  }

  /**
   * Suggestions for an autocomplete field: field=<name>&term=<text>.
   */
  private function autocomplete(Crud $crud, array $params)
  {
    $this->assertAllowed($crud, Crud::LIST);
    $field = $crud->field(isset($params['field']) ? (string) $params['field'] : '');
    if ($field === null || $field->getLookup() === null) {
      throw new CrudException('unknownAction', array('action' => 'autocomplete'));
    }
    if ($this->lookupSearch === null) {
      throw new \LogicException("Autocomplete field '{$field->name()}' needs a Connection in CrudKit");
    }
    return $this->lookupSearch->search($field->getLookup(), isset($params['term']) ? $params['term'] : '');
  }

  /**
   * Values already stored in a column, for the filter box of a field with suggestions():
   * field=<name>&term=<text>.
   */
  private function suggest(Crud $crud, array $params)
  {
    $this->assertAllowed($crud, Crud::LIST);
    $field = $crud->field(isset($params['field']) ? (string) $params['field'] : '');
    if ($field === null || !$field->hasSuggestions() || !$field->isStored() || $crud->getTable() === null) {
      throw new CrudException('unknownAction', array('action' => 'suggest'));
    }
    if ($this->lookupSearch === null) {
      throw new \LogicException("Field '{$field->name()}' with suggestions needs a Connection in CrudKit");
    }
    return $this->lookupSearch->values(
      $crud->getTable(),
      $field->name(),
      isset($params['term']) ? $params['term'] : '',
      array_keys($crud->keyFields()),
      $field->getSuggestionDetails()
    );
  }

  private function translatorFor(Crud $crud)
  {
    return count($crud->getTexts()) > 0 ? new OverriddenTranslator($this->translator, $crud->getTexts()) : $this->translator;
  }

  private function text(Crud $crud, $key, array $params = array())
  {
    return $this->translatorFor($crud)->text($key, $params);
  }

  private static function error($message)
  {
    return array('Result' => 'ERROR', 'Message' => $message);
  }
}
