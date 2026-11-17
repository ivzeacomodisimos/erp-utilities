<?php

namespace Ivandzb\CrudKit\Data;

use Ivandzb\CrudKit\Server\CrudException;

/**
 * Base for custom repositories that only list. Override the writes you support.
 */
abstract class ReadOnlyDataSource implements DataSource
{
  public function create(array $values)
  {
    throw new CrudException('operationDisabled', array('operation' => 'create'));
  }

  public function update(array $values)
  {
    throw new CrudException('operationDisabled', array('operation' => 'update'));
  }

  public function delete(array $keys)
  {
    throw new CrudException('operationDisabled', array('operation' => 'delete'));
  }
}
