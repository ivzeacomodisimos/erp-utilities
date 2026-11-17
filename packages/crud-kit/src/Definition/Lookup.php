<?php

namespace Ivandzb\CrudKit\Definition;

use InvalidArgumentException;

/**
 * Where an autocomplete field finds its values and the text it shows.
 *
 *   Lookup::table('maestros.sectordespacho', 'idsector', 'Descripcion')
 *   Lookup::query("SELECT idsector id, Descripcion text FROM maestros.sectordespacho WHERE Activo = 1")
 *
 * The SQL of query() is written by the developer (never built from user input);
 * column names are validated.
 */
final class Lookup
{
  /** @var string SQL usable after FROM: a table name or "(SELECT ...)" */
  private $source;
  /** @var string */
  private $valueColumn;
  /** @var string */
  private $textColumn;
  /** @var string|null SQL condition applied only to suggestions */
  private $suggestionCondition = null;
  /** @var callable|null second line of each suggestion */
  private $details = null;

  private function __construct($source, $valueColumn, $textColumn)
  {
    foreach (array($valueColumn, $textColumn) as $column) {
      if (!preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/', (string) $column)) {
        throw new InvalidArgumentException("Invalid lookup column: '$column'");
      }
    }
    $this->source = $source;
    $this->valueColumn = $valueColumn;
    $this->textColumn = $textColumn;
  }

  /**
   * @param string $table table or view (may include schema/database)
   */
  public static function table($table, $valueColumn, $textColumn)
  {
    if (!preg_match('/^[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z_][A-Za-z0-9_]*){0,2}$/', (string) $table)) {
      throw new InvalidArgumentException("Invalid lookup table: '$table'");
    }
    return new self($table, $valueColumn, $textColumn);
  }

  /**
   * @param string $sql SELECT that returns at least the value and text columns
   */
  public static function query($sql, $valueColumn = 'id', $textColumn = 'text')
  {
    $sql = trim((string) $sql);
    if (stripos($sql, 'select') !== 0) {
      throw new InvalidArgumentException('Lookup::query() needs a SELECT');
    }
    return new self('(' . $sql . ')', $valueColumn, $textColumn);
  }

  /**
   * Limits what the search box offers while the list still shows the text of every value
   * (e.g. records pointing to an inactive sector keep showing its name):
   *
   *   Lookup::table('maestros.sectordespacho', 'idsector', 'Descripcion')->suggestOnly('Activo = 1')
   *
   * The condition is SQL written by the developer over the lookup's columns.
   */
  public function suggestOnly($condition)
  {
    $condition = trim((string) $condition);
    if ($condition === '' || preg_match('/;|--|\/\*/', $condition)) {
      throw new InvalidArgumentException('Invalid suggestion condition');
    }
    $this->suggestionCondition = $condition;
    return $this;
  }

  /**
   * A second line for each suggestion of the search box, to tell apart values with the same
   * text (e.g. where an option of a tree hangs from): function (array $rows): array, where
   * each row has "id" and "text" and the result has one string (or null) per row, in order.
   *
   * @return $this
   */
  public function details(callable $details)
  {
    $this->details = $details;
    return $this;
  }

  /** @return callable|null */
  public function getDetails()
  {
    return $this->details;
  }

  /** @return string|null */
  public function suggestionCondition()
  {
    return $this->suggestionCondition;
  }

  public function source()
  {
    return $this->source;
  }

  public function valueColumn()
  {
    return $this->valueColumn;
  }

  public function textColumn()
  {
    return $this->textColumn;
  }
}
