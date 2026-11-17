<?php

namespace Ivandzb\CrudKit\Data;

use Ivandzb\CrudKit\Data\Sql\MySqlDialect;
use Ivandzb\CrudKit\Data\Sql\SqlDialect;
use Ivandzb\CrudKit\Data\Sql\SqlServerDialect;
use Ivandzb\CrudKit\Definition\Crud;
use Ivandzb\CrudKit\Definition\Field;
use Ivandzb\CrudKit\Ports\Connection;
use Ivandzb\CrudKit\Server\CrudException;

/**
 * Default data source: the table declared in the CRUD.
 *
 * Reads use the alias "t" for the table and a LEFT JOIN per autocomplete field to
 * bring its text ("<field>__text"). Identifiers come from the definition (validated
 * when declared) and every value travels as a bound parameter.
 */
final class TableDataSource implements DataSource
{
  const ALIAS = 't';

  /** @var Crud */
  private $crud;
  /** @var Connection */
  private $connection;
  /** @var SqlDialect */
  private $dialect;

  public function __construct(Crud $crud, Connection $connection)
  {
    if ($crud->getTable() === null) {
      throw new \LogicException("CRUD '{$crud->id()}' has no table() and no dataSource()");
    }
    $this->crud = $crud;
    $this->connection = $connection;
    $this->dialect = self::dialectFor($connection);
  }

  /**
   * @return SqlDialect
   */
  public static function dialectFor(Connection $connection)
  {
    return $connection->driver() === Connection::SQLSRV ? new SqlServerDialect() : new MySqlDialect();
  }

  public function list(ListQuery $query)
  {
    $params = array();
    $from = $this->from();
    $where = $this->where($query->filters(), $params);

    $count = $this->connection->select('SELECT COUNT(*) AS total FROM ' . $from . $where, $params);
    $total = isset($count[0]['total']) ? $count[0]['total'] : 0;

    $sql = $this->dialect->page(
      'SELECT ' . $this->columns() . ' FROM ' . $from . $where,
      $this->orderBy($query->sorting()),
      $query->offset(),
      $query->limit()
    );
    return new ListResult($total, $this->connection->select($sql, $params));
  }

  public function create(array $values)
  {
    $columns = array();
    $params = array();
    foreach ($this->crud->getFields() as $field) {
      // An auto-increment key (key() alone) is not in the create form, so it is not sent;
      // a key typed by the user (key()->onlyOnCreate()) is.
      $written = $field->inCreate() || $field->getServerValue() !== null;
      if (!$field->isStored() || !$written || !array_key_exists($field->name(), $values)) {
        continue;
      }
      $columns[] = $field->name();
      $params[] = $values[$field->name()];
    }

    $this->write(
      'INSERT INTO ' . $this->crud->getTable() . ' (' . implode(', ', $columns) . ') VALUES (' . implode(', ', array_fill(0, count($columns), '?')) . ')',
      $params
    );

    $keys = $this->keyValues($values, false);
    $keyFields = $this->crud->keyFields();
    if (count($keyFields) === 1) {
      $keyName = key($keyFields);
      if (!isset($keys[$keyName]) || $keys[$keyName] === '' || $keys[$keyName] === null) {
        $keys[$keyName] = $this->connection->lastInsertId();
      }
    }
    return $this->find($keys);
  }

  public function update(array $values)
  {
    $keys = $this->keyValues($values, true);
    $sets = array();
    $params = array();
    foreach ($this->crud->getFields() as $field) {
      $written = $field->inEdit() || $field->getServerValue() !== null;
      if ($field->isStored() && !$field->isKey() && $written && array_key_exists($field->name(), $values)) {
        $sets[] = $field->name() . ' = ?';
        $params[] = $values[$field->name()];
      }
    }
    if (count($sets) > 0) {
      $where = $this->keyWhere($keys, $params, false);
      $this->write('UPDATE ' . $this->crud->getTable() . ' SET ' . implode(', ', $sets) . $where, $params);
    }
    return $this->find($keys);
  }

  public function delete(array $keys)
  {
    $keys = $this->keyValues($keys, true);
    $params = array();
    $where = $this->keyWhere($keys, $params, false);
    $this->write('DELETE FROM ' . $this->crud->getTable() . $where, $params);
  }

  /**
   * @return array the record with these key values
   */
  public function find(array $keys)
  {
    $params = array();
    $where = $this->keyWhere($keys, $params, true);
    $rows = $this->connection->select('SELECT ' . $this->columns() . ' FROM ' . $this->from() . $where, $params);
    if (count($rows) === 0) {
      throw new CrudException('recordNotFound');
    }
    return $rows[0];
  }

  /**
   * Table with its alias plus one LEFT JOIN per lookup field.
   */
  private function from()
  {
    $from = $this->crud->getTable() . ' ' . self::ALIAS;
    foreach ($this->lookupFields() as $index => $field) {
      $lookup = $field->getLookup();
      $alias = 'lk' . $index;
      $from .= ' LEFT JOIN ' . $lookup->source() . ' ' . $alias
        . ' ON ' . $alias . '.' . $lookup->valueColumn() . ' = ' . self::ALIAS . '.' . $field->name();
    }
    return $from;
  }

  private function columns()
  {
    $columns = array();
    foreach ($this->crud->getFields() as $field) {
      if ($field->isStored()) {
        $columns[] = self::ALIAS . '.' . $field->name();
      }
    }
    foreach ($this->lookupFields() as $index => $field) {
      $columns[] = 'lk' . $index . '.' . $field->getLookup()->textColumn() . ' AS ' . $field->textColumn();
    }
    return implode(', ', $columns);
  }

  /**
   * @return Field[] stored autocomplete fields, numbered for their join alias
   */
  private function lookupFields()
  {
    $fields = array();
    foreach ($this->crud->getFields() as $field) {
      if ($field->isStored() && $field->getLookup() !== null) {
        $fields[] = $field;
      }
    }
    return $fields;
  }

  private function where(array $filters, array &$params)
  {
    $conditions = array();
    foreach ($filters as $name => $value) {
      $field = $this->crud->field($name);
      if ($field === null || !$field->isStored()) {
        continue;
      }
      if ($field->filterMode() === Field::FILTER_LIKE) {
        $conditions[] = self::ALIAS . '.' . $name . ' LIKE ?';
        $params[] = '%' . $value . '%';
      } else {
        $conditions[] = self::ALIAS . '.' . $name . ' = ?';
        $params[] = $value;
      }
    }
    $this->addScope($conditions, $params);
    return count($conditions) > 0 ? ' WHERE ' . implode(' AND ', $conditions) : '';
  }

  /**
   * Lookup fields sort by their text, the rest by their column.
   */
  private function orderBy(array $sorting)
  {
    $lookupAliases = array();
    foreach ($this->lookupFields() as $index => $field) {
      $lookupAliases[$field->name()] = 'lk' . $index . '.' . $field->getLookup()->textColumn();
    }

    $parts = array();
    foreach ($sorting as $pair) {
      $field = $this->crud->field($pair[0]);
      if ($field === null || !$field->isStored()) {
        continue;
      }
      $expression = isset($lookupAliases[$field->name()]) ? $lookupAliases[$field->name()] : self::ALIAS . '.' . $field->name();
      $parts[] = $expression . ' ' . ($pair[1] === 'DESC' ? 'DESC' : 'ASC');
    }
    return implode(', ', $parts);
  }

  /**
   * @param bool $required every key must have a value
   */
  private function keyValues(array $values, $required)
  {
    $keys = array();
    foreach (array_keys($this->crud->keyFields()) as $name) {
      $value = array_key_exists($name, $values) ? $values[$name] : null;
      if ($required && ($value === null || $value === '')) {
        throw new CrudException('keyRequired');
      }
      $keys[$name] = $value;
    }
    if ($required && count($keys) === 0) {
      throw new CrudException('keyRequired');
    }
    return $keys;
  }

  /**
   * @param bool $aliased qualify with the table alias (reads) or not (UPDATE/DELETE)
   */
  private function keyWhere(array $keys, array &$params, $aliased)
  {
    $conditions = array();
    foreach ($keys as $name => $value) {
      $conditions[] = ($aliased ? self::ALIAS . '.' : '') . $name . ' = ?';
      $params[] = $value;
    }
    $this->addScope($conditions, $params);
    return ' WHERE ' . implode(' AND ', $conditions);
  }

  /**
   * Crud::scope(): records outside it are neither listed nor read, updated or deleted.
   */
  private function addScope(array &$conditions, array &$params)
  {
    $scope = $this->crud->getScope();
    if ($scope === null) {
      return;
    }
    $conditions[] = '(' . $scope[0] . ')';
    foreach ($scope[1] as $value) {
      $params[] = $value;
    }
  }

  /**
   * Runs a write and turns the usual constraint errors into messages for the user.
   * Detection is by message text because drivers report them differently
   * (MySQL "Duplicate entry", SQL Server "duplicate key" / "REFERENCE constraint").
   */
  private function write($sql, array $params)
  {
    try {
      return $this->connection->execute($sql, $params);
    } catch (\Exception $e) {
      $message = $e->getMessage();
      if (preg_match('/duplicate (entry|key)/i', $message)) {
        throw new CrudException('duplicateKey');
      }
      if (preg_match('/REFERENCE constraint|foreign key constraint|Cannot delete or update a parent row/i', $message)) {
        throw new CrudException('recordInUse');
      }
      throw $e;
    }
  }
}
