<?php

namespace Ivandzb\CrudKit\Definition;

use InvalidArgumentException;

/**
 * A child table opened from a column of each parent row (jTable openChildTable).
 */
final class Child
{
  /** @var string column name in the parent */
  private $name;
  /** @var string */
  private $title;
  /** @var Crud */
  private $crud;
  /** @var array child field => parent field */
  private $links;
  /** @var string|null Font Awesome classes ("fas fa-list") or image URL */
  private $icon;

  public function __construct($name, $title, Crud $crud, array $links, $icon = null)
  {
    if (!preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/', (string) $name)) {
      throw new InvalidArgumentException("Invalid child name: '$name'");
    }
    if (count($links) === 0) {
      throw new InvalidArgumentException("Child '$name' needs at least one link [childField => parentField]");
    }
    foreach ($links as $childField => $parentField) {
      if ($crud->field($childField) === null) {
        throw new InvalidArgumentException("Child '$name': field '$childField' is not declared in CRUD '{$crud->id()}'");
      }
    }
    $this->name = $name;
    $this->title = (string) $title;
    $this->crud = $crud;
    $this->links = $links;
    $this->icon = $icon;
  }

  public function name()
  {
    return $this->name;
  }

  public function title()
  {
    return $this->title;
  }

  public function crud()
  {
    return $this->crud;
  }

  /** @return array child field => parent field */
  public function links()
  {
    return $this->links;
  }

  /** @return string|null */
  public function icon()
  {
    return $this->icon;
  }
}
