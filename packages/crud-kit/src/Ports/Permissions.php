<?php

namespace Ivandzb\CrudKit\Ports;

use Ivandzb\CrudKit\Definition\Crud;

/**
 * Decides whether the current user may run an operation of a CRUD.
 */
interface Permissions
{
  /**
   * @param Crud $crud
   * @param string $operation Crud::LIST, CREATE, UPDATE or DELETE
   * @param string|null $code permission code declared with Crud::permissions(), if any
   * @return bool
   */
  public function allows(Crud $crud, $operation, $code);
}
