<?php

namespace Ivandzb\UiKit\Render;

/**
 * Prefixes every selector of a stylesheet with a scope ("#uk-app .x"), keeping @media,
 * @supports and @container blocks and leaving @font-face, @keyframes and @import as they are.
 * Used by the Quasar renderer for Page::css(); it is a small parser, not a full CSS one:
 * comments are dropped and strings with braces inside are not supported.
 */
final class CssScope
{
  const GROUPING = array('media', 'supports', 'container', 'layer', 'document');

  public static function apply($css, $scope)
  {
    $css = preg_replace('#/\*.*?\*/#s', '', (string) $css);
    $position = 0;
    return trim(self::block($css, $position, $scope));
  }

  private static function block($css, &$position, $scope)
  {
    $out = '';
    $length = strlen($css);
    while ($position < $length) {
      $open = strpos($css, '{', $position);
      $close = strpos($css, '}', $position);
      if ($close !== false && ($open === false || $close < $open)) {
        // End of the enclosing block.
        $position = $close + 1;
        return $out;
      }
      if ($open === false) {
        // Statements without a block (@import ...;) or leftovers.
        $out .= trim(substr($css, $position));
        break;
      }
      $prelude = trim(substr($css, $position, $open - $position));
      $position = $open + 1;
      if ($prelude !== '' && $prelude[0] === '@') {
        $name = strtolower(preg_replace('/^@([a-zA-Z-]+).*$/s', '$1', $prelude));
        if (in_array($name, self::GROUPING, true)) {
          $out .= $prelude . ' {' . self::block($css, $position, $scope) . "}\n";
        } else {
          $out .= $prelude . ' {' . self::raw($css, $position) . "}\n";
        }
        continue;
      }
      $body = self::raw($css, $position);
      $selectors = array();
      foreach (explode(',', $prelude) as $selector) {
        $selector = trim($selector);
        if ($selector !== '') {
          $selectors[] = preg_match('/^(html|body|:root)$/i', $selector) ? $scope : $scope . ' ' . $selector;
        }
      }
      if ($selectors) {
        $out .= implode(', ', $selectors) . ' {' . $body . "}\n";
      }
    }
    return $out;
  }

  /**
   * Content of a block as is, up to its matching closing brace.
   */
  private static function raw($css, &$position)
  {
    $depth = 1;
    $start = $position;
    $length = strlen($css);
    while ($position < $length && $depth > 0) {
      if ($css[$position] === '{') {
        $depth++;
      } elseif ($css[$position] === '}') {
        $depth--;
      }
      $position++;
    }
    return trim(substr($css, $start, $position - $start - 1));
  }
}
