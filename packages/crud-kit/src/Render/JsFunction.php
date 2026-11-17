<?php

namespace Ivandzb\CrudKit\Render;

/**
 * JavaScript code that must be written as code, not as a string, when a
 * configuration is serialized (display/input functions, event handlers...).
 */
final class JsFunction
{
  /** @var string */
  private $code;

  /**
   * @param string $code a complete function expression, e.g. "function (data) { return data.record.x; }"
   */
  public function __construct($code)
  {
    $this->code = (string) $code;
  }

  /**
   * Wraps a function body: JsFunction::body('a', 'b', 'return a + b;').
   */
  public static function body(...$argumentsAndBody)
  {
    $body = array_pop($argumentsAndBody);
    return new self('function (' . implode(', ', $argumentsAndBody) . ') {' . "\n" . $body . "\n" . '}');
  }

  public function code()
  {
    return $this->code;
  }
}
