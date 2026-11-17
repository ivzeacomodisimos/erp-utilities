<?php

namespace Ivandzb\CrudKit\Server;

use Ivandzb\CrudKit\Definition\Field;
use Ivandzb\CrudKit\Ports\Translator;

/**
 * Applies Field::rules() on the server. The browser applies the same rules
 * (assets/crud-kit.js), but only the server is trusted.
 */
final class Validator
{
  /** @var Translator */
  private $translator;

  public function __construct(Translator $translator)
  {
    $this->translator = $translator;
  }

  /**
   * @param Field[] $fields fields present in the form
   * @param array $values field => value
   * @return array field => first error message
   */
  public function validate(array $fields, array $values)
  {
    $errors = array();
    foreach ($fields as $field) {
      $value = array_key_exists($field->name(), $values) ? $values[$field->name()] : null;
      $error = $this->firstError($field->getRules(), $value);
      if ($error !== null) {
        $errors[$field->name()] = $error;
      }
    }
    return $errors;
  }

  private function firstError(array $rules, $value)
  {
    $text = is_array($value) ? '' : trim((string) $value);
    if ($text === '') {
      return !empty($rules['required']) ? $this->message('required') : null;
    }
    foreach ($rules as $rule => $setting) {
      if (!$this->passes($rule, $setting, $text)) {
        return $this->message($rule, $setting);
      }
    }
    return null;
  }

  private function passes($rule, $setting, $text)
  {
    switch ($rule) {
      case 'minLength':
        return self::length($text) >= (int) $setting;
      case 'maxLength':
        return self::length($text) <= (int) $setting;
      case 'numeric':
        return !$setting || is_numeric($text);
      case 'integer':
        return !$setting || preg_match('/^-?\d+$/', $text) === 1;
      case 'min':
        return !is_numeric($text) || (float) $text >= (float) $setting;
      case 'max':
        return !is_numeric($text) || (float) $text <= (float) $setting;
      case 'pattern':
        return preg_match('/' . str_replace('/', '\/', (string) $setting) . '/u', $text) === 1;
      case 'in':
        return in_array($text, array_map('strval', (array) $setting), true);
      default:
        return true;
    }
  }

  private function message($rule, $setting = null)
  {
    return $this->translator->text('rule.' . $rule, array('value' => is_array($setting) ? implode(', ', $setting) : $setting));
  }

  private static function length($text)
  {
    return function_exists('mb_strlen') ? mb_strlen($text, 'UTF-8') : strlen($text);
  }
}
