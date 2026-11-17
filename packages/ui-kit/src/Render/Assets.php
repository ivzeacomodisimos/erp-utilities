<?php

namespace Ivandzb\UiKit\Render;

/**
 * URLs of the package's own CSS and JS, versioned with the file date so a new build
 * reaches browsers that cached the old one.
 */
final class Assets
{
  /** @var string|null public URL of the assets folder */
  private $baseUrl;
  /** @var string */
  private $basePath;

  public function __construct($baseUrl = null)
  {
    $this->baseUrl = $baseUrl === null ? null : rtrim((string) $baseUrl, '/');
    $this->basePath = dirname(__DIR__, 2) . '/assets';
  }

  public function enabled()
  {
    return $this->baseUrl !== null;
  }

  public function url($file)
  {
    $path = $this->basePath . '/' . $file;
    return $this->baseUrl . '/' . $file . (is_file($path) ? '?v=' . filemtime($path) : '');
  }
}
