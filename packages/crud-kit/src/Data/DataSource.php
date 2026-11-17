<?php

namespace Ivandzb\CrudKit\Data;

/**
 * Where a CRUD reads and writes its records. The default is TableDataSource;
 * any repository can implement this interface (or extend ReadOnlyDataSource).
 */
interface DataSource
{
  /**
   * @return ListResult
   */
  public function list(ListQuery $query);

  /**
   * @param array $values field => value, already validated
   * @return array the stored record
   */
  public function create(array $values);

  /**
   * @param array $values field => value, keys included
   * @return array the stored record
   */
  public function update(array $values);

  /**
   * @param array $keys key field => value
   * @return void
   */
  public function delete(array $keys);
}
