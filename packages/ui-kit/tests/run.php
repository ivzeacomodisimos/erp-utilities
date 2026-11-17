<?php

/*
 * Minimal test runner (no dependencies, PHP 7.2+): php tests/run.php
 * Every public method named test* of the *Test classes in this folder is a test.
 */

error_reporting(E_ALL);
ini_set('display_errors', '1');
set_error_handler(function ($severity, $message, $file, $line) {
  throw new ErrorException($message, 0, $severity, $file, $line);
});

require __DIR__ . '/../autoload.php';
spl_autoload_register(function ($class) {
  $prefix = 'Ivandzb\\UiKit\\Tests\\';
  if (strncmp($class, $prefix, strlen($prefix)) === 0) {
    require __DIR__ . '/' . str_replace('\\', '/', substr($class, strlen($prefix))) . '.php';
  }
});

$passed = 0;
$failed = array();
foreach (glob(__DIR__ . '/*Test.php') as $file) {
  $class = 'Ivandzb\\UiKit\\Tests\\' . basename($file, '.php');
  foreach (get_class_methods($class) as $method) {
    if (strpos($method, 'test') !== 0) {
      continue;
    }
    try {
      (new $class())->$method();
      $passed++;
      echo '.';
    } catch (Throwable $e) {
      $failed[] = basename($file, '.php') . "::$method\n    " . get_class($e) . ': ' . $e->getMessage()
        . "\n    " . $e->getFile() . ':' . $e->getLine();
      echo 'F';
    }
  }
}

echo "\n\n" . $passed . ' passed, ' . count($failed) . " failed\n";
foreach ($failed as $failure) {
  echo "\n  FAIL " . $failure . "\n";
}
exit(count($failed) > 0 ? 1 : 0);
