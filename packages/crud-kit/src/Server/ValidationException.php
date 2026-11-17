<?php

namespace Ivandzb\CrudKit\Server;

/**
 * One or more fields are invalid. Thrown by the validator or by a beforeSave hook:
 *
 *   throw new ValidationException(['amount' => 'Must be positive']);
 */
class ValidationException extends \RuntimeException
{
  /** @var array field => message */
  private $errors;

  public function __construct(array $errors, $message = '')
  {
    parent::__construct($message !== '' ? $message : implode(' ', $errors));
    $this->errors = $errors;
  }

  public function errors()
  {
    return $this->errors;
  }
}
