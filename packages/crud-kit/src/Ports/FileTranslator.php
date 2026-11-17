<?php

namespace Ivandzb\CrudKit\Ports;

use InvalidArgumentException;

/**
 * Translator backed by lang/<code>.php files that return ['texts' => [...], 'jtable' => [...]].
 *
 * Add a language by copying lang/en.php to lang/<code>.php. Missing keys fall back to English.
 */
final class FileTranslator implements Translator
{
  /** @var array */
  private $texts;
  /** @var array */
  private $jtable;

  /**
   * @param string $language e.g. 'es', 'en'
   * @param array $overrides ['texts' => [...], 'jtable' => [...]] project-wide changes
   */
  public function __construct($language = 'en', array $overrides = array())
  {
    if (!preg_match('/^[a-z]{2}(-[A-Za-z]{2})?$/', (string) $language)) {
      throw new InvalidArgumentException("Invalid language code: '$language'");
    }
    $english = self::load('en');
    $selected = is_file(self::path($language)) ? self::load($language) : $english;
    $this->texts = array_merge($english['texts'], $selected['texts'], isset($overrides['texts']) ? $overrides['texts'] : array());
    $this->jtable = array_merge($english['jtable'], $selected['jtable'], isset($overrides['jtable']) ? $overrides['jtable'] : array());
  }

  public function text($key, array $params = array())
  {
    $text = isset($this->texts[$key]) ? $this->texts[$key] : $key;
    foreach ($params as $name => $value) {
      $text = str_replace('{' . $name . '}', (string) $value, $text);
    }
    return $text;
  }

  public function jtableMessages()
  {
    return $this->jtable;
  }

  private static function path($language)
  {
    return dirname(__DIR__, 2) . '/lang/' . $language . '.php';
  }

  private static function load($language)
  {
    $data = require self::path($language);
    return array(
      'texts' => isset($data['texts']) ? $data['texts'] : array(),
      'jtable' => isset($data['jtable']) ? $data['jtable'] : array(),
    );
  }
}
