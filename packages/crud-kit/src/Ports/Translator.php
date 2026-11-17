<?php

namespace Ivandzb\CrudKit\Ports;

/**
 * Texts shown by the package: jTable messages, buttons and validation errors.
 */
interface Translator
{
  /**
   * @param string $key
   * @param array $params replaces {name} placeholders
   * @return string
   */
  public function text($key, array $params = array());

  /**
   * jTable "messages" option for this language.
   *
   * @return array
   */
  public function jtableMessages();
}
