<?php

namespace Ivandzb\UiKit\Node;

use InvalidArgumentException;

/**
 * id, classes, inline styles and attributes, shared by elements and components.
 * Values are stored as given and escaped by the renderer.
 */
trait HasAttributes
{
  /** @var array name => string|true */
  private $attributes = array();
  /** @var string[] */
  private $classes = array();
  /** @var array property => value */
  private $styles = array();

  /**
   * @return $this
   */
  public function id($id)
  {
    return $this->attr('id', (string) $id);
  }

  /**
   * @return string|null
   */
  public function getId()
  {
    return isset($this->attributes['id']) ? $this->attributes['id'] : null;
  }

  /**
   * Adds one or more classes; each argument may hold several separated by spaces.
   *
   * @return $this
   */
  public function addClass(...$names)
  {
    foreach ($names as $name) {
      foreach (preg_split('/\s+/', trim((string) $name)) as $class) {
        if ($class !== '' && !in_array($class, $this->classes, true)) {
          $this->classes[] = $class;
        }
      }
    }
    return $this;
  }

  /**
   * @return $this
   */
  public function removeClass($name)
  {
    $this->classes = array_values(array_diff($this->classes, array((string) $name)));
    return $this;
  }

  public function hasClass($name)
  {
    return in_array((string) $name, $this->classes, true);
  }

  /**
   * @return string[]
   */
  public function getClasses()
  {
    return $this->classes;
  }

  /**
   * style('color', 'red') or style(['color' => 'red', 'margin-top' => '4px']).
   *
   * @param string|array $property
   * @return $this
   */
  public function style($property, $value = null)
  {
    $styles = is_array($property) ? $property : array($property => $value);
    foreach ($styles as $name => $styleValue) {
      $name = trim((string) $name);
      if (!preg_match('/^(--)?[a-zA-Z][a-zA-Z0-9-]*$/', $name)) {
        throw new InvalidArgumentException("Invalid CSS property: '$name'");
      }
      if ($styleValue === null) {
        unset($this->styles[$name]);
      } else {
        $this->styles[$name] = (string) $styleValue;
      }
    }
    return $this;
  }

  /**
   * @return array property => value
   */
  public function getStyles()
  {
    return $this->styles;
  }

  /**
   * attr('href', '/x'), attr('disabled') for a boolean attribute, attr('title', null) removes it.
   *
   * @param string|bool|int|float|null $value
   * @return $this
   */
  public function attr($name, $value = true)
  {
    $name = (string) $name;
    if (!preg_match('/^[a-zA-Z_:@][a-zA-Z0-9_:.@-]*$/', $name)) {
      throw new InvalidArgumentException("Invalid attribute name: '$name'");
    }
    if ($name === 'class') {
      return $this->addClass($value);
    }
    if ($value === null || $value === false) {
      unset($this->attributes[$name]);
    } else {
      $this->attributes[$name] = $value === true ? true : (string) $value;
    }
    return $this;
  }

  /**
   * @return $this
   */
  public function attrs(array $attributes)
  {
    foreach ($attributes as $name => $value) {
      $this->attr($name, $value);
    }
    return $this;
  }

  /**
   * data('id', 7) sets data-id="7".
   *
   * @return $this
   */
  public function data($name, $value)
  {
    return $this->attr('data-' . $name, $value);
  }

  /**
   * @return string|true|null
   */
  public function getAttr($name)
  {
    return isset($this->attributes[$name]) ? $this->attributes[$name] : null;
  }

  /**
   * @return array name => string|true (without class and style)
   */
  public function getAttributes()
  {
    return $this->attributes;
  }
}
