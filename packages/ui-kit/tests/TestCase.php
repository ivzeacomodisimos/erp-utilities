<?php

namespace Ivandzb\UiKit\Tests;

abstract class TestCase
{
  protected function assertSame($expected, $actual, $message = '')
  {
    if ($expected !== $actual) {
      throw new \RuntimeException(($message !== '' ? $message . ': ' : '') . 'expected ' . var_export($expected, true) . ', got ' . var_export($actual, true));
    }
  }

  protected function assertTrue($condition, $message = 'condition is false')
  {
    if ($condition !== true) {
      throw new \RuntimeException($message);
    }
  }

  protected function assertContains($needle, $haystack, $message = '')
  {
    if (strpos($haystack, $needle) === false) {
      throw new \RuntimeException(($message !== '' ? $message . ': ' : '') . "'$needle' not found in:\n" . substr($haystack, 0, 2000));
    }
  }

  protected function assertNotContains($needle, $haystack, $message = '')
  {
    if (strpos($haystack, $needle) !== false) {
      throw new \RuntimeException(($message !== '' ? $message . ': ' : '') . "'$needle' should not be in the output");
    }
  }

  protected function assertThrows($exceptionClass, callable $callback)
  {
    try {
      $callback();
    } catch (\Throwable $e) {
      if ($e instanceof $exceptionClass) {
        return $e;
      }
      throw new \RuntimeException("expected $exceptionClass, got " . get_class($e) . ': ' . $e->getMessage());
    }
    throw new \RuntimeException("expected $exceptionClass, nothing was thrown");
  }
}
