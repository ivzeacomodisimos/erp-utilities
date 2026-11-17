<?php

namespace Ivandzb\CrudKit\Data\Sql;

final class MySqlDialect implements SqlDialect
{
  public function page($sql, $orderBy, $offset, $limit)
  {
    if ($orderBy !== '') {
      $sql .= ' ORDER BY ' . $orderBy;
    }
    if ($limit !== null) {
      $sql .= ' LIMIT ' . (int) $limit . ' OFFSET ' . (int) $offset;
    }
    return $sql;
  }
}
