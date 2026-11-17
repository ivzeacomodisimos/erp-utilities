<?php

namespace Ivandzb\CrudKit\Tests;

use InvalidArgumentException;
use Ivandzb\CrudKit\CrudKit;
use Ivandzb\CrudKit\Definition\Crud;
use Ivandzb\CrudKit\Definition\Field;
use Ivandzb\CrudKit\Definition\Lookup;
use Ivandzb\CrudKit\Ports\Connection;
use Ivandzb\CrudKit\Ports\FileTranslator;
use Ivandzb\CrudKit\Render\JsFunction;

final class LookupTest extends TestCase
{
  private function crud()
  {
    return Crud::make('city-sector')
      ->table('logistica.ciudad_sector')
      ->fields(
        Field::number('rowid')->key()->hideInList(),
        Field::autocomplete('city', 'Municipio', Lookup::query('SELECT code id, name text FROM cities'))
          ->filterable()->rules(array('required' => true)),
        Field::autocomplete('sector', 'Sector', Lookup::table('maestros.sectordespacho', 'idsector', 'Descripcion'))->filterable()
      )
      ->selectable()
      ->texts(array('duplicateKey' => 'Ese municipio ya tiene un sector asignado.'));
  }

  private function kit(FakeConnection $db)
  {
    return new CrudKit($db, null, new FileTranslator('es'), 'assets');
  }

  public function testInvalidLookups()
  {
    $this->assertThrows(InvalidArgumentException::class, function () {
      Lookup::query('DELETE FROM x');
    });
    $this->assertThrows(InvalidArgumentException::class, function () {
      Lookup::table('t', 'id; DROP', 'name');
    });
  }

  public function testListJoinsLookupsAndSortsByText()
  {
    $db = (new FakeConnection(Connection::SQLSRV))->willReturn(array(array('total' => 1)));
    $this->kit($db)->handle($this->crud(), array('action' => 'list', 'city' => '05001', 'jtStartIndex' => 0, 'jtPageSize' => 10, 'jtSorting' => 'city ASC'));

    $from = 'FROM logistica.ciudad_sector t'
      . ' LEFT JOIN (SELECT code id, name text FROM cities) lk0 ON lk0.id = t.city'
      . ' LEFT JOIN maestros.sectordespacho lk1 ON lk1.idsector = t.sector';
    $this->assertSame('SELECT COUNT(*) AS total ' . $from . ' WHERE t.city = ?', $db->sql(0));
    $this->assertSame(
      'SELECT t.rowid, t.city, t.sector, lk0.text AS city__text, lk1.Descripcion AS sector__text ' . $from
        . ' WHERE t.city = ? ORDER BY lk0.text ASC OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY',
      $db->sql(1)
    );
  }

  public function testAutocompleteSearchesEveryWord()
  {
    $db = (new FakeConnection(Connection::MYSQL))->willReturn(array(array('id' => '05001', 'text' => 'Antioquia Medellín ')));
    $items = $this->kit($db)->handle($this->crud(), array('action' => 'autocomplete', 'field' => 'city', 'term' => ' ant  med '));

    $this->assertSame(array(array('id' => '05001', 'value' => 'Antioquia Medellín', 'label' => 'Antioquia Medellín')), $items);
    $this->assertSame(
      'SELECT lk.id AS id, lk.text AS text FROM (SELECT code id, name text FROM cities) lk WHERE lk.text LIKE ? AND lk.text LIKE ? ORDER BY lk.text ASC LIMIT 20 OFFSET 0',
      $db->sql(0)
    );
    $this->assertSame(array('%ant%', '%med%'), $db->params(0));

    $error = $this->kit($db)->handle($this->crud(), array('action' => 'autocomplete', 'field' => 'rowid', 'term' => 'x'));
    $this->assertSame('ERROR', $error['Result'], 'only lookup fields can be searched');
  }

  public function testFilterSuggestionsListStoredValues()
  {
    $crud = Crud::make('menu')->table('aplicacion.menu')->fields(
      Field::number('id')->key(),
      Field::text('title', 'Título')->suggestions(),
      Field::text('url', 'URL')
    );
    $this->assertSame(Field::FILTER_LIKE, $crud->field('title')->filterMode(), 'suggestions make the field filterable');

    $db = (new FakeConnection(Connection::MYSQL))->willReturn(array(array('text' => 'Objetos '), array('text' => '')));
    $items = $this->kit($db)->handle($crud, array('action' => 'suggest', 'field' => 'title', 'term' => ' ob  sis '));
    $this->assertSame(array(array('value' => 'Objetos', 'label' => 'Objetos')), $items);
    $this->assertSame(
      'SELECT DISTINCT title AS text FROM aplicacion.menu WHERE title IS NOT NULL AND title LIKE ? AND title LIKE ? ORDER BY text ASC LIMIT 20 OFFSET 0',
      $db->sql(0)
    );
    $this->assertSame(array('%ob%', '%sis%'), $db->params(0));

    $sqlsrv = new FakeConnection(Connection::SQLSRV);
    $this->kit($sqlsrv)->handle($crud, array('action' => 'suggest', 'field' => 'title', 'term' => 'x'));
    $this->assertSame('SELECT DISTINCT title AS text FROM aplicacion.menu WHERE title IS NOT NULL AND title LIKE ? ORDER BY text ASC OFFSET 0 ROWS FETCH NEXT 20 ROWS ONLY', $sqlsrv->sql(0));

    $error = $this->kit($db)->handle($crud, array('action' => 'suggest', 'field' => 'url', 'term' => 'x'));
    $this->assertSame('ERROR', $error['Result'], 'only fields with suggestions()');
    $this->assertThrows(InvalidArgumentException::class, function () use ($crud) {
      $crud->action('suggest', function () {
      });
    });

    $html = $this->kit($db)->render($crud, 'p.php');
    $this->assertContains('class="ck-suggest" autocomplete="off" data-source="p.php?crud=menu&amp;action=suggest&amp;field=title"', $html);
    $schema = $this->kit($db)->quasarSchema($crud, 'p.php');
    $titles = array_values(array_filter($schema['fields'], function ($field) {
      return $field['name'] === 'title';
    }));
    $this->assertSame('p.php?crud=menu&action=suggest&field=title', $titles[0]['suggestUrl']);
  }

  public function testSuggestionDetailsTellApartRecordsWithTheSameValue()
  {
    $received = null;
    $crud = Crud::make('menu')->table('aplicacion.menu')->fields(
      Field::number('id')->key(),
      Field::text('title', 'Título')->suggestions(function (array $rows) use (&$received) {
        $received = $rows;
        return array('Sistemas', null);
      })
    );
    $db = (new FakeConnection(Connection::MYSQL))->willReturn(array(array('id' => 4, 'text' => 'Empleados'), array('id' => 9, 'text' => 'Empleados')));
    $items = $this->kit($db)->handle($crud, array('action' => 'suggest', 'field' => 'title', 'term' => 'empl'));

    $this->assertSame(
      'SELECT id, title AS text FROM aplicacion.menu WHERE title IS NOT NULL AND title LIKE ? ORDER BY text ASC LIMIT 20 OFFSET 0',
      $db->sql(0),
      'one row per record (no DISTINCT) with the keys'
    );
    $this->assertSame(array(array('id' => 4, 'text' => 'Empleados'), array('id' => 9, 'text' => 'Empleados')), $received);
    $this->assertSame(array(
      array('value' => 'Empleados', 'label' => 'Empleados', 'caption' => 'Sistemas'),
      array('value' => 'Empleados', 'label' => 'Empleados'),
    ), $items);
  }

  public function testLookupDetailsAddASecondLine()
  {
    $received = null;
    $crud = Crud::make('menu')->table('menu')->fields(
      Field::number('id')->key(),
      Field::autocomplete('parent', 'Padre', Lookup::table('menu', 'id', 'title')->details(function (array $rows) use (&$received) {
        $received = $rows;
        return array('Inicio › Sistemas', '');
      }))
    );
    $db = (new FakeConnection(Connection::MYSQL))->willReturn(array(array('id' => 4, 'text' => 'Empleados'), array('id' => 9, 'text' => 'Empleados')));
    $items = $this->kit($db)->handle($crud, array('action' => 'autocomplete', 'field' => 'parent', 'term' => 'empl'));

    $this->assertSame(array(array('id' => 4, 'text' => 'Empleados'), array('id' => 9, 'text' => 'Empleados')), $received);
    $this->assertSame(array(
      array('id' => 4, 'value' => 'Empleados', 'label' => 'Empleados', 'caption' => 'Inicio › Sistemas'),
      array('id' => 9, 'value' => 'Empleados', 'label' => 'Empleados'),
    ), $items);
  }

  public function testSuggestionConditionOnlyAffectsTheSearch()
  {
    $crud = Crud::make('cs')->table('cs')->fields(
      Field::number('rowid')->key(),
      Field::autocomplete('sector', 'Sector', Lookup::table('sectors', 'id', 'name')->suggestOnly('active = 1'))
    );
    $db = (new FakeConnection())->willReturn(array())->willReturn(array(array('total' => 0)));
    $kit = $this->kit($db);
    $kit->handle($crud, array('action' => 'autocomplete', 'field' => 'sector', 'term' => 'nor'));
    $this->assertSame('SELECT lk.id AS id, lk.name AS text FROM sectors lk WHERE (active = 1) AND lk.name LIKE ? ORDER BY lk.name ASC LIMIT 20 OFFSET 0', $db->sql(0));

    $kit->handle($crud, array('action' => 'list'));
    $this->assertNotContains('active = 1', $db->sql(1), 'the list joins every sector');

    $this->assertThrows(InvalidArgumentException::class, function () {
      Lookup::table('t', 'a', 'b')->suggestOnly('1=1; DROP TABLE x');
    });
  }

  public function testCrudTextsOverrideTheTranslator()
  {
    $db = new FakeConnection();
    $db->failWith = new \RuntimeException("Violation of PRIMARY KEY constraint. Cannot insert duplicate key in object 'x'.");
    $payload = $this->kit($db)->handle($this->crud(), array('action' => 'create', 'city' => '05001', 'sector' => '14'));
    $this->assertSame('Ese municipio ya tiene un sector asignado.', $payload['Message']);
  }

  public function testRenderingOfLookupsAndSelection()
  {
    $kit = $this->kit(new FakeConnection());
    $config = $kit->jtableConfiguration($this->crud(), 'p.php');
    $this->assertTrue($config['selecting'] && $config['multiselect'] && $config['selectingCheckboxes']);
    $this->assertTrue($config['fields']['city']['input'] instanceof JsFunction);
    $this->assertContains('CrudKit.autocompleteInput(data, "city", "p.php?crud=city-sector\u0026action=autocomplete\u0026field=city")', $config['fields']['city']['input']->code());
    $this->assertContains('CrudKit.lookupText(data.record, "city")', $config['fields']['city']['display']->code());

    $html = $kit->render($this->crud(), 'p.php');
    $this->assertContains('class="ck-autocomplete"', $html);
    $this->assertContains('data-source="p.php?crud=city-sector&amp;action=autocomplete&amp;field=sector"', $html);
    $this->assertContains('"bulkDelete": true', $html);
    $this->assertContains('"deleteSelected": "Borrar selección"', $html);

    $readOnly = $kit->render($this->crud()->disable(Crud::DELETE), 'p.php');
    $this->assertContains('"bulkDelete": false', $readOnly);
  }
}
