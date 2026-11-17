<?php

namespace Ivandzb\CrudKit\Data;

/**
 * Page requested by the list: filter values, sorting and paging.
 * Field names are already checked against the definition.
 */
final class ListQuery
{
  /** @var array field => value (only non-empty filters) */
  private $filters;
  /** @var array [field, 'ASC'|'DESC'] pairs */
  private $sorting;
  /** @var int|null */
  private $offset;
  /** @var int|null */
  private $limit;
  /** @var array all request parameters, for custom data sources */
  private $params;

  public function __construct(array $filters, array $sorting, $offset, $limit, array $params = array())
  {
    $this->filters = $filters;
    $this->sorting = $sorting;
    $this->offset = $offset === null ? null : max(0, (int) $offset);
    $this->limit = $limit === null ? null : max(1, (int) $limit);
    $this->params = $params;
  }

  public function filters()
  {
    return $this->filters;
  }

  /** @return string|null */
  public function filter($field)
  {
    return isset($this->filters[$field]) ? $this->filters[$field] : null;
  }

  /** @return array[] [field, direction] pairs */
  public function sorting()
  {
    return $this->sorting;
  }

  /** @return int|null */
  public function offset()
  {
    return $this->offset;
  }

  /** @return int|null */
  public function limit()
  {
    return $this->limit;
  }

  public function isPaged()
  {
    return $this->limit !== null;
  }

  /** @return array every request parameter (for repositories that read their own filters) */
  public function params()
  {
    return $this->params;
  }

  /** @return mixed */
  public function param($name, $default = null)
  {
    return array_key_exists($name, $this->params) ? $this->params[$name] : $default;
  }
}
