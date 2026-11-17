<?php

namespace Ivandzb\CrudKit\Render;

/**
 * json_encode() that writes JsFunction values as raw JavaScript.
 *
 * Everything else is encoded by json_encode, so strings are always escaped
 * correctly (quotes, line breaks, "</script>").
 */
final class JsEncoder
{
  public static function encode($value)
  {
    $functions = array();
    $value = self::replaceFunctions($value, $functions);
    $json = json_encode($value, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_PRETTY_PRINT);
    if ($json === false) {
      throw new \RuntimeException('Cannot encode configuration: ' . json_last_error_msg());
    }
    foreach ($functions as $token => $code) {
      $json = str_replace('"' . $token . '"', $code, $json);
    }
    return $json;
  }

  private static function replaceFunctions($value, array &$functions)
  {
    if ($value instanceof JsFunction) {
      $token = '__ck_js_' . count($functions) . '_' . bin2hex(random_bytes(4)) . '__';
      $functions[$token] = $value->code();
      return $token;
    }
    if (is_array($value)) {
      foreach ($value as $key => $item) {
        $value[$key] = self::replaceFunctions($item, $functions);
      }
    }
    // Plain objects too (e.g. the children map, cast to object so it encodes as {}):
    // otherwise the functions inside them are encoded as "{}".
    if ($value instanceof \stdClass) {
      $copy = new \stdClass();
      foreach (get_object_vars($value) as $key => $item) {
        $copy->$key = self::replaceFunctions($item, $functions);
      }
      return $copy;
    }
    return $value;
  }
}
