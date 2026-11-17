<?php

namespace Ivandzb\CrudKit\Tests;

use Ivandzb\CrudKit\Ports\Connection;

/**
 * Records every statement and returns queued results.
 */
final class FakeConnection implements Connection
{
  /** @var array[] [sql, params] */
  public $statements = array();
  /** @var array[] results returned by select(), in order */
  private $results = array();
  /** @var string */
  private $driver;
  /** @var string|null */
  public $lastId = null;

  public function __construct($driver = self::MYSQL)
  {
    $this->driver = $driver;
  }

  public function willReturn(array $rows)
  {
    $this->results[] = $rows;
    return $this;
  }

  public function driver()
  {
    return $this->driver;
  }

  public function select($sql, array $params = array())
  {
    $this->statements[] = array($sql, $params);
    return count($this->results) > 0 ? array_shift($this->results) : array();
  }

  /** @var \Exception|null thrown by the next execute() */
  public $failWith = null;

  public function execute($sql, array $params = array())
  {
    $this->statements[] = array($sql, $params);
    if ($this->failWith !== null) {
      $error = $this->failWith;
      $this->failWith = null;
      throw $error;
    }
    return 1;
  }

  public function lastInsertId()
  {
    return $this->lastId;
  }

  public function sql($index)
  {
    return $this->statements[$index][0];
  }

  public function params($index)
  {
    return $this->statements[$index][1];
  }
}
