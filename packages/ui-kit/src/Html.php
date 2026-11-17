<?php

namespace Ivandzb\UiKit;

use Ivandzb\UiKit\Node\Element;
use Ivandzb\UiKit\Node\Fragment;
use Ivandzb\UiKit\Node\Raw;
use Ivandzb\UiKit\Node\Text;

/**
 * Shortcuts for the basic elements. Every one returns an Element, so it can be chained:
 *
 *   Html::div()->addClass('box')->add(Html::a('/x', 'Ver'), Html::p('Texto'));
 *
 * Strings given as content are text (escaped); use Html::raw() for trusted HTML.
 */
final class Html
{
  /**
   * @param mixed ...$content
   * @return Element
   */
  public static function element($tag, ...$content)
  {
    return Element::make($tag)->add(...$content);
  }

  /** @return Element */
  public static function div(...$content)
  {
    return self::element('div', ...$content);
  }

  /** @return Element */
  public static function span(...$content)
  {
    return self::element('span', ...$content);
  }

  /** @return Element */
  public static function p(...$content)
  {
    return self::element('p', ...$content);
  }

  /** @return Element */
  public static function strong(...$content)
  {
    return self::element('strong', ...$content);
  }

  /**
   * @param int $level 1 to 6
   * @return Element
   */
  public static function h($level, ...$content)
  {
    return self::element('h' . max(1, min(6, (int) $level)), ...$content);
  }

  /** @return Element */
  public static function a($href, ...$content)
  {
    return self::element('a', ...$content)->attr('href', $href);
  }

  /** @return Element */
  public static function img($src, $alt = '')
  {
    return Element::make('img')->attr('src', $src)->attr('alt', (string) $alt);
  }

  /** @return Element */
  public static function br()
  {
    return Element::make('br');
  }

  /** @return Element */
  public static function hr()
  {
    return Element::make('hr');
  }

  /**
   * ul() with one <li> per item; items may be nodes or text.
   *
   * @return Element
   */
  public static function ul(array $items = array())
  {
    return self::listOf('ul', $items);
  }

  /** @return Element */
  public static function ol(array $items = array())
  {
    return self::listOf('ol', $items);
  }

  /** @return Element */
  public static function li(...$content)
  {
    return self::element('li', ...$content);
  }

  /**
   * A table from rows of cells: table([['a', 'b'], ['c', 'd']], ['Col 1', 'Col 2']).
   *
   * @param array $rows each row is an array of cells (nodes or text)
   * @param array|null $headers optional header cells
   * @return Element
   */
  public static function table(array $rows = array(), ?array $headers = null)
  {
    $table = Element::make('table');
    if ($headers !== null) {
      $tr = Element::make('tr');
      foreach ($headers as $header) {
        $tr->add(self::th($header));
      }
      $table->add(Element::make('thead')->add($tr));
    }
    if ($rows) {
      $body = Element::make('tbody');
      foreach ($rows as $row) {
        $tr = Element::make('tr');
        foreach ((array) $row as $cell) {
          $tr->add(self::td($cell));
        }
        $body->add($tr);
      }
      $table->add($body);
    }
    return $table;
  }

  /** @return Element */
  public static function tr(...$cells)
  {
    return self::element('tr', ...$cells);
  }

  /** @return Element */
  public static function td(...$content)
  {
    return self::element('td', ...$content);
  }

  /** @return Element */
  public static function th(...$content)
  {
    return self::element('th', ...$content);
  }

  /** @return Element */
  public static function form($action = '', $method = 'post', ...$content)
  {
    return self::element('form', ...$content)->attr('action', $action)->attr('method', strtolower($method));
  }

  /** @return Element */
  public static function label($text, $for = null)
  {
    return self::element('label', $text)->attr('for', $for);
  }

  /** @return Element */
  public static function input($type, $name, $value = null)
  {
    return Element::make('input')->attr('type', $type)->attr('name', $name)->attr('value', $value === null ? null : (string) $value);
  }

  /** @return Element */
  public static function textarea($name, $value = '')
  {
    return self::element('textarea', (string) $value)->attr('name', $name);
  }

  /**
   * @param array $options value => text, in order
   * @param string|int|null $selected
   * @return Element
   */
  public static function select($name, array $options, $selected = null)
  {
    $select = Element::make('select')->attr('name', $name);
    foreach ($options as $value => $text) {
      $option = self::element('option', $text)->attr('value', (string) $value);
      if ($selected !== null && (string) $selected === (string) $value) {
        $option->attr('selected');
      }
      $select->add($option);
    }
    return $select;
  }

  /** @return Element */
  public static function button($text, $type = 'button')
  {
    return self::element('button', $text)->attr('type', $type);
  }

  /** @return Text */
  public static function text($text)
  {
    return new Text($text);
  }

  /**
   * Trusted HTML (or a legacy object with getHtml(), or a callable).
   *
   * @param string|object|callable $html
   * @return Raw
   */
  public static function raw($html)
  {
    return new Raw($html);
  }

  /** @return Fragment */
  public static function fragment(...$content)
  {
    return Fragment::of(...$content);
  }

  private static function listOf($tag, array $items)
  {
    $list = Element::make($tag);
    foreach ($items as $item) {
      $list->add($item instanceof Element && $item->tag() === 'li' ? $item : self::li($item));
    }
    return $list;
  }
}
