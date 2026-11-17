<?php

namespace Ivandzb\CrudKit\Server;

/**
 * Error with a translatable message (key in lang/*.php) that is shown to the user.
 */
class CrudException extends \RuntimeException
{
  /** @var string */
  private $key;
  /** @var array */
  private $params;

  public function __construct($key, array $params = array())
  {
    parent::__construct($key);
    $this->key = $key;
    $this->params = $params;
  }

  public function key()
  {
    return $this->key;
  }

  public function params()
  {
    return $this->params;
  }
}
