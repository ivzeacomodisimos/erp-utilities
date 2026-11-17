<?php

namespace Ivandzb\CrudKit\Ports;

use PDO;

/**
 * Connection over PDO (MySQL or SQL Server). Projects without their own DB layer
 * can use it directly: new PdoConnection(new PDO($dsn, $user, $password)).
 */
final class PdoConnection implements Connection
{
  /** @var PDO */
  private $pdo;

  public function __construct(PDO $pdo)
  {
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $this->pdo = $pdo;
  }

  public function driver()
  {
    return $this->pdo->getAttribute(PDO::ATTR_DRIVER_NAME) === 'sqlsrv' ? self::SQLSRV : self::MYSQL;
  }

  public function select($sql, array $params = array())
  {
    $statement = $this->pdo->prepare($sql);
    $statement->execute(array_values($params));
    return $statement->fetchAll(PDO::FETCH_ASSOC);
  }

  public function execute($sql, array $params = array())
  {
    $statement = $this->pdo->prepare($sql);
    $statement->execute(array_values($params));
    return $statement->rowCount();
  }

  public function lastInsertId()
  {
    $id = $this->pdo->lastInsertId();
    return $id === false || $id === '' ? null : $id;
  }
}
