<?php

namespace Ivandzb\CrudKit\Data;

use Ivandzb\CrudKit\Definition\Lookup;
use Ivandzb\CrudKit\Ports\Connection;

/**
 * Suggestions for an autocomplete field (search) or for the filter of a field with
 * suggestions (values): every word typed must appear in the text.
 */
final class LookupSearch
{
  const LIMIT = 20;

  /** @var Connection */
  private $connection;

  public function __construct(Connection $connection)
  {
    $this->connection = $connection;
  }

  /**
   * @param string $term
   * @return array[] jQuery UI items: [{id, value, label}]
   */
  public function search(Lookup $lookup, $term)
  {
    $value = 'lk.' . $lookup->valueColumn();
    $text = 'lk.' . $lookup->textColumn();
    $conditions = array();
    $params = array();
    if ($lookup->suggestionCondition() !== null) {
      $conditions[] = '(' . $lookup->suggestionCondition() . ')';
    }
    foreach (preg_split('/\s+/', trim((string) $term)) as $word) {
      if ($word !== '') {
        $conditions[] = $text . ' LIKE ?';
        $params[] = '%' . $word . '%';
      }
    }
    $sql = TableDataSource::dialectFor($this->connection)->page(
      'SELECT ' . $value . ' AS id, ' . $text . ' AS text FROM ' . $lookup->source() . ' lk'
        . (count($conditions) > 0 ? ' WHERE ' . implode(' AND ', $conditions) : ''),
      $text . ' ASC',
      0,
      self::LIMIT
    );

    $rows = $this->connection->select($sql, $params);
    $captions = $lookup->getDetails() !== null && count($rows) > 0 ? array_values((array) call_user_func($lookup->getDetails(), $rows)) : array();

    $items = array();
    foreach ($rows as $index => $row) {
      $label = trim((string) $row['text']);
      $item = array('id' => $row['id'], 'value' => $label, 'label' => $label);
      if (isset($captions[$index]) && (string) $captions[$index] !== '') {
        $item['caption'] = (string) $captions[$index];
      }
      $items[] = $item;
    }
    return $items;
  }

  /**
   * Values of a column of the CRUD table: the distinct ones, or one per record with a
   * second line (caption) when there is a $details callback (Field::suggestions()).
   *
   * @param string $table already validated by Crud::table()
   * @param string $column already validated by Field
   * @param string $term
   * @param string[] $keys key columns, sent to $details with each row
   * @return array[] jQuery UI items: [{value, label}] (+ caption)
   */
  public function values($table, $column, $term, array $keys = array(), ?callable $details = null)
  {
    $conditions = array($column . ' IS NOT NULL');
    $params = array();
    foreach (preg_split('/\s+/', trim((string) $term)) as $word) {
      if ($word !== '') {
        $conditions[] = $column . ' LIKE ?';
        $params[] = '%' . $word . '%';
      }
    }
    $select = $details === null ? 'SELECT DISTINCT ' : 'SELECT ' . (count($keys) > 0 ? implode(', ', $keys) . ', ' : '');
    $sql = TableDataSource::dialectFor($this->connection)->page(
      $select . $column . ' AS text FROM ' . $table . ' WHERE ' . implode(' AND ', $conditions),
      'text ASC',
      0,
      self::LIMIT
    );

    $rows = array_values(array_filter($this->connection->select($sql, $params), function ($row) {
      return trim((string) $row['text']) !== '';
    }));
    $captions = $details !== null && count($rows) > 0 ? array_values((array) call_user_func($details, $rows)) : array();

    $items = array();
    foreach ($rows as $index => $row) {
      $text = trim((string) $row['text']);
      $item = array('value' => $text, 'label' => $text);
      if (isset($captions[$index]) && (string) $captions[$index] !== '') {
        $item['caption'] = (string) $captions[$index];
      }
      $items[] = $item;
    }
    return $items;
  }
}
