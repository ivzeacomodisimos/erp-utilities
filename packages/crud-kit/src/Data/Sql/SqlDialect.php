<?php

namespace Ivandzb\CrudKit\Data\Sql;

/**
 * Syntax that differs between database engines.
 */
interface SqlDialect
{
  /**
   * Adds ORDER BY and paging to a SELECT.
   *
   * @param string $sql
   * @param string $orderBy "col ASC, col2 DESC" or '' (identifiers already validated)
   * @param int|null $offset
   * @param int|null $limit null = no paging
   * @return string
   */
  public function page($sql, $orderBy, $offset, $limit);
}
