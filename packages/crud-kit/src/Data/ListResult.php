<?php

namespace Ivandzb\CrudKit\Data;

/**
 * One page of records plus the total that matches the filters.
 */
final class ListResult
{
  /** @var int */
  private $total;
  /** @var array[] */
  private $records;

  public function __construct($total, array $records)
  {
    $this->total = (int) $total;
    $this->records = array_values($records);
  }

  /**
   * Accepts what repositories usually return: ['total' => n, 'records' => [...]].
   */
  public static function fromArray(array $data)
  {
    $records = isset($data['records']) ? $data['records'] : array();
    return new self(isset($data['total']) ? $data['total'] : count($records), $records);
  }

  public function total()
  {
    return $this->total;
  }

  public function records()
  {
    return $this->records;
  }

  public function map(callable $transform)
  {
    return new self($this->total, array_map($transform, $this->records));
  }
}
