<?php

/**
 * PSR-4 autoloader for projects that do not install the package with Composer.
 * With Composer, use vendor/autoload.php instead.
 */
spl_autoload_register(function ($class) {
  $prefix = 'Ivandzb\\UiKit\\';
  if (strncmp($class, $prefix, strlen($prefix)) !== 0) {
    return;
  }
  $file = __DIR__ . '/src/' . str_replace('\\', '/', substr($class, strlen($prefix))) . '.php';
  if (is_file($file)) {
    require $file;
  }
});
