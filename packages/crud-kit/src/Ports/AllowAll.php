<?php

namespace Ivandzb\CrudKit\Ports;

use Ivandzb\CrudKit\Definition\Crud;

/**
 * Default permissions: everything that is enabled in the definition is allowed.
 */
final class AllowAll implements Permissions
{
  public function allows(Crud $crud, $operation, $code)
  {
    return true;
  }
}
