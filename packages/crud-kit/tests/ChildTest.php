<?php

namespace Ivandzb\CrudKit\Tests;

use InvalidArgumentException;
use Ivandzb\CrudKit\CrudKit;
use Ivandzb\CrudKit\Data\ListQuery;
use Ivandzb\CrudKit\Data\ReadOnlyDataSource;
use Ivandzb\CrudKit\Definition\Crud;
use Ivandzb\CrudKit\Definition\Field;
use Ivandzb\CrudKit\Ports\FileTranslator;
use Ivandzb\CrudKit\Render\JsFunction;

final class ChildTest extends TestCase
{
  /** @var array[] queries received by the child repository */
  private $childQueries = array();

  private function trips()
  {
    $test = $this;
    $lists = Crud::make('trip-lists')
      ->title('Listas de despacho')
      ->readOnly()
      ->dataSource(new class ($test) extends ReadOnlyDataSource {
        private $test;

        public function __construct($test)
        {
          $this->test = $test;
        }

        public function list(ListQuery $query)
        {
          $this->test->record($query->filters());
          return array('total' => 1, 'records' => array(array('list' => 9, 'trip' => (int) $query->filter('trip'))));
        }
      })
      ->fields(Field::number('list', 'Lista')->key(), Field::number('trip', 'Viaje'));

    return Crud::make('trips')
      ->table('logistica.viajes')
      ->readOnly()
      ->fields(Field::number('id', 'Viaje')->key(), Field::text('plate', 'Placa'))
      ->child('lists', 'Listas de despacho', $lists, array('trip' => 'id'), 'fas fa-clipboard-list');
  }

  public function record(array $filters)
  {
    $this->childQueries[] = $filters;
  }

  public function testChildRequestsAreRoutedAndFilteredByTheLink()
  {
    $kit = new CrudKit(new FakeConnection(), null, new FileTranslator('es'), 'assets');
    $payload = $kit->handle($this->trips(), array('crud' => 'trip-lists', 'action' => 'list', 'trip' => '15', 'plate' => 'ABC123'));

    $this->assertSame(array('Result' => 'OK', 'TotalRecordCount' => 1, 'Records' => array(array('list' => 9, 'trip' => 15))), $payload);
    $this->assertSame(array(array('trip' => '15')), $this->childQueries, 'only the linked field filters the child');
    $this->assertTrue(CrudKit::isRequestFor($this->trips(), array('crud' => 'trip-lists')));
    $this->assertTrue(!CrudKit::isRequestFor($this->trips(), array('crud' => 'otro')));
  }

  public function testRenderingAddsButtonColumnAndChildSetup()
  {
    $kit = new CrudKit(new FakeConnection(), null, new FileTranslator('es'), 'assets');
    $config = $kit->jtableConfiguration($this->trips(), 'p.php');
    $column = $config['fields']['lists'];
    $this->assertSame(array(false, false, false), array($column['sorting'], $column['edit'], $column['create']));
    $this->assertTrue($column['display'] instanceof JsFunction);
    $this->assertContains('CrudKit.childButton(data, "trips", "lists")', $column['display']->code());
    $names = array_keys($config['fields']);
    $this->assertSame('lists', $names[0], 'the child button columns come first');

    $html = $kit->render($this->trips(), 'p.php');
    $this->assertContains('"listAction": "p.php?crud=trip-lists' . '\\' . 'u0026action=list"', $html);
    $this->assertContains('"showCloseButton": true', $html);
    $this->assertContains('"icon": "fas fa-clipboard-list"', $html);

    $childConfig = $kit->jtableConfiguration($this->trips()->find('trip-lists'), 'p.php');
    $this->assertSame(array(false, 'hidden'), array($childConfig['fields']['trip']['list'], $childConfig['fields']['trip']['type']), 'the link column is hidden in the child');
  }

  public function testInvalidChildren()
  {
    $child = Crud::make('c')->fields(Field::text('a'));
    $this->assertThrows(InvalidArgumentException::class, function () use ($child) {
      Crud::make('p')->fields(Field::text('x'))->child('kids', 'Hijos', $child, array('missing' => 'x'));
    });
    $this->assertThrows(InvalidArgumentException::class, function () use ($child) {
      Crud::make('p')->fields(Field::text('x'))->child('x', 'Hijos', $child, array('a' => 'x'));
    });
    $this->assertThrows(InvalidArgumentException::class, function () use ($child) {
      Crud::make('p')->child('kids', 'Hijos', $child, array());
    });
  }
}
