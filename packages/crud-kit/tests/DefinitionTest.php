<?php

namespace Ivandzb\CrudKit\Tests;

use InvalidArgumentException;
use Ivandzb\CrudKit\Definition\Crud;
use Ivandzb\CrudKit\Definition\Field;

final class DefinitionTest extends TestCase
{
  public function testInvalidNamesAreRejected()
  {
    $this->assertThrows(InvalidArgumentException::class, function () {
      Field::text('name; DROP TABLE x');
    });
    $this->assertThrows(InvalidArgumentException::class, function () {
      Crud::make('Sectors!');
    });
    $this->assertThrows(InvalidArgumentException::class, function () {
      Crud::make('sectors')->table('t; DELETE FROM x');
    });
    $this->assertThrows(InvalidArgumentException::class, function () {
      Field::text('a')->rules(array('requird' => true));
    });
    $this->assertThrows(InvalidArgumentException::class, function () {
      Crud::make('a')->on('clicked', 'x');
    });
  }

  public function testDuplicatedFieldIsRejected()
  {
    $this->assertThrows(InvalidArgumentException::class, function () {
      Crud::make('a')->fields(Field::text('x'), Field::text('x'));
    });
  }

  public function testKeyFlags()
  {
    $auto = Field::number('id')->key();
    $this->assertSame(array(true, false, false), array($auto->isKey(), $auto->inCreate(), $auto->inEdit()));
    $typed = Field::text('code')->key()->onlyOnCreate();
    $this->assertSame(array(true, true, false), array($typed->isKey(), $typed->inCreate(), $typed->inEdit()));
  }

  public function testDefaultSortingIsFirstListedField()
  {
    $crud = Crud::make('a')->fields(Field::hidden('h'), Field::text('name'));
    $this->assertSame('name ASC', $crud->getDefaultSorting());
    $this->assertSame('h DESC', $crud->defaultSorting('h', 'desc')->getDefaultSorting());
  }

  public function testReadOnlyDisablesWrites()
  {
    $crud = Crud::make('a')->readOnly();
    $this->assertSame(array(true, false, false, false), array(
      $crud->isEnabled(Crud::LIST),
      $crud->isEnabled(Crud::CREATE),
      $crud->isEnabled(Crud::UPDATE),
      $crud->isEnabled(Crud::DELETE),
    ));
  }
}
