<?php

namespace Ivandzb\CrudKit\Tests;

use Ivandzb\CrudKit\Definition\Field;
use Ivandzb\CrudKit\Ports\FileTranslator;
use Ivandzb\CrudKit\Server\Validator;

final class ValidatorTest extends TestCase
{
  private function errors(Field $field, $value)
  {
    return (new Validator(new FileTranslator('en')))->validate(array($field), array($field->name() => $value));
  }

  public function testRules()
  {
    $this->assertSame(array(), $this->errors(Field::text('a'), ''), 'empty and not required is valid');
    $this->assertSame(array('a' => 'This field is required.'), $this->errors(Field::text('a')->rules(array('required' => true)), ' '));
    $this->assertSame(array('a' => 'Enter at most 2 characters.'), $this->errors(Field::text('a')->rules(array('maxLength' => 2)), 'ñññ'));
    $this->assertSame(array(), $this->errors(Field::text('a')->rules(array('maxLength' => 2)), 'ññ'), 'length counts characters, not bytes');
    $this->assertSame(array('a' => 'Enter a number.'), $this->errors(Field::number('a'), '12x'));
    $this->assertSame(array('a' => 'The minimum value is 0.'), $this->errors(Field::number('a')->rules(array('min' => 0)), '-1'));
    $this->assertSame(array('a' => 'Enter a whole number.'), $this->errors(Field::text('a')->rules(array('integer' => true)), '1.5'));
    $this->assertSame(array('a' => 'The format is not valid.'), $this->errors(Field::text('a')->rules(array('pattern' => '^[A-Z]{3}$')), 'AB1'));
    $this->assertSame(array(), $this->errors(Field::text('a')->rules(array('pattern' => '^\d+/\d+$')), '1/2'), 'slashes in patterns');
    $this->assertSame(array('a' => 'Choose one of the allowed values.'), $this->errors(Field::text('a')->rules(array('in' => array(1, 2))), '3'));
  }

  public function testUnknownLanguageFallsBackToEnglish()
  {
    $this->assertSame('Filter', (new FileTranslator('fr'))->text('filter'));
    $this->assertSame('Filtrar', (new FileTranslator('es'))->text('filter'));
    $this->assertSame('Buscar', (new FileTranslator('es', array('texts' => array('filter' => 'Buscar'))))->text('filter'));
  }
}
