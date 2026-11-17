<?php

namespace Ivandzb\CrudKit\Data\Sql;

/**
 * SQL Server 2012 or later (OFFSET ... FETCH).
 */
final class SqlServerDialect implements SqlDialect
{
  public function page($sql, $orderBy, $offset, $limit)
  {
    if ($limit === null) {
      return $orderBy === '' ? $sql : $sql . ' ORDER BY ' . $orderBy;
    }
    // OFFSET/FETCH requires an ORDER BY.
    $sql .= ' ORDER BY ' . ($orderBy === '' ? '(SELECT NULL)' : $orderBy);
    return $sql . ' OFFSET ' . (int) $offset . ' ROWS FETCH NEXT ' . (int) $limit . ' ROWS ONLY';
  }
}
