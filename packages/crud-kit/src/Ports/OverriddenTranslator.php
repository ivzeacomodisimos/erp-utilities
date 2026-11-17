<?php

namespace Ivandzb\CrudKit\Ports;

/**
 * Decorator: texts of one CRUD (Crud::texts()) take precedence over the translator.
 */
final class OverriddenTranslator implements Translator
{
  /** @var Translator */
  private $translator;
  /** @var array */
  private $texts;

  public function __construct(Translator $translator, array $texts)
  {
    $this->translator = $translator;
    $this->texts = $texts;
  }

  public function text($key, array $params = array())
  {
    if (!isset($this->texts[$key])) {
      return $this->translator->text($key, $params);
    }
    $text = $this->texts[$key];
    foreach ($params as $name => $value) {
      $text = str_replace('{' . $name . '}', (string) $value, $text);
    }
    return $text;
  }

  public function jtableMessages()
  {
    return $this->translator->jtableMessages();
  }
}
