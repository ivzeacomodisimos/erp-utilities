<?php

namespace Ivandzb\CrudKit\Tests;

use Ivandzb\CrudKit\CrudKit;
use Ivandzb\CrudKit\Data\ListQuery;
use Ivandzb\CrudKit\Data\ReadOnlyDataSource;
use Ivandzb\CrudKit\Definition\Crud;
use Ivandzb\CrudKit\Definition\Field;
use Ivandzb\CrudKit\Ports\Connection;
use Ivandzb\CrudKit\Ports\FileTranslator;
use Ivandzb\CrudKit\Ports\Permissions;
use Ivandzb\CrudKit\Server\ValidationException;

final class DispatcherTest extends TestCase
{
  private function crud()
  {
    return Crud::make('sectors')
      ->table('maestros.sectordespacho')
      ->fields(
        Field::text('idsector', 'Id')->key()->onlyOnCreate()->filterable()->rules(array('required' => true, 'maxLength' => 2)),
        Field::text('Descripcion', 'Título')->filterable(Field::FILTER_LIKE)->rules(array('required' => true)),
        Field::select('Activo', 'Estado', array(1 => 'Activo', 0 => 'Inactivo')),
        Field::text('nombre_ciudad', 'Ciudad')->computed()
      );
  }

  private function kit(FakeConnection $connection, ?Permissions $permissions = null)
  {
    return new CrudKit($connection, $permissions, new FileTranslator('es'), 'assets');
  }

  public function testListUsesBoundParametersAndDeclaredSorting()
  {
    $db = (new FakeConnection(Connection::SQLSRV))->willReturn(array(array('total' => 3)))->willReturn(array(array('idsector' => '01')));
    $payload = $this->kit($db)->handle($this->crud(), array(
      'crud' => 'sectors', 'action' => 'list',
      'idsector' => '01', 'Descripcion' => "MEDELLIN' OR 1=1 --", 'Activo' => '1',
      'jtStartIndex' => '10', 'jtPageSize' => '5', 'jtSorting' => 'Descripcion DESC, x; DROP TABLE y',
    ));

    $this->assertSame(array('Result' => 'OK', 'TotalRecordCount' => 3, 'Records' => array(array('idsector' => '01'))), $payload);
    $this->assertSame('SELECT COUNT(*) AS total FROM maestros.sectordespacho t WHERE t.idsector = ? AND t.Descripcion LIKE ?', $db->sql(0));
    $this->assertSame(array('01', "%MEDELLIN' OR 1=1 --%"), $db->params(0), 'Activo is not filterable, so it is ignored');
    $this->assertSame(
      'SELECT t.idsector, t.Descripcion, t.Activo FROM maestros.sectordespacho t WHERE t.idsector = ? AND t.Descripcion LIKE ? ORDER BY t.Descripcion DESC OFFSET 10 ROWS FETCH NEXT 5 ROWS ONLY',
      $db->sql(1)
    );
  }

  public function testMySqlPaging()
  {
    $db = (new FakeConnection(Connection::MYSQL))->willReturn(array(array('total' => 0)));
    $this->kit($db)->handle($this->crud(), array('action' => 'list', 'jtStartIndex' => 0, 'jtPageSize' => 10, 'jtSorting' => 'idsector ASC'));
    $this->assertSame('SELECT t.idsector, t.Descripcion, t.Activo FROM maestros.sectordespacho t ORDER BY t.idsector ASC LIMIT 10 OFFSET 0', $db->sql(1));
  }

  public function testCreateInsertsTypedKeyAndReadsBack()
  {
    $db = (new FakeConnection())->willReturn(array(array('idsector' => '99', 'Descripcion' => 'Nuevo', 'Activo' => 1)));
    $payload = $this->kit($db)->handle($this->crud(), array('action' => 'create', 'idsector' => '99', 'Descripcion' => 'Nuevo', 'Activo' => '1', 'nombre_ciudad' => 'x'));

    $this->assertSame('OK', $payload['Result']);
    $this->assertSame('INSERT INTO maestros.sectordespacho (idsector, Descripcion, Activo) VALUES (?, ?, ?)', $db->sql(0));
    $this->assertSame(array('99', 'Nuevo', '1'), $db->params(0));
    $this->assertSame(array('99'), $db->params(1), 'reads the record back by its key');
  }

  public function testCreateWithAutoIncrementKeyUsesLastInsertId()
  {
    $crud = Crud::make('items')->table('items')->fields(Field::number('id')->key(), Field::text('name'));
    $db = (new FakeConnection())->willReturn(array(array('id' => 7, 'name' => 'a')));
    $db->lastId = '7';
    $this->kit($db)->handle($crud, array('action' => 'create', 'id' => '', 'name' => 'a'));
    $this->assertSame('INSERT INTO items (name) VALUES (?)', $db->sql(0));
    $this->assertSame(array('7'), $db->params(1));
  }

  public function testServerValueIsWrittenOnCreateAndUpdate()
  {
    $operations = array();
    $crud = Crud::make('items')->table('items')->fields(
      Field::number('id')->key(),
      Field::text('name'),
      Field::text('ts', 'Modificado')->serverValue(function ($operation) use (&$operations) {
        $operations[] = $operation;
        return '2026-10-15 12:00:00';
      })
    );
    $this->assertTrue(!$crud->field('ts')->inCreate() && !$crud->field('ts')->inEdit(), 'read-only in the forms');

    $db = (new FakeConnection())->willReturn(array(array('id' => 7)))->willReturn(array(array('id' => 7)));
    $db->lastId = '7';
    $kit = $this->kit($db);
    $kit->handle($crud, array('action' => 'create', 'name' => 'a', 'ts' => 'sent by the browser'));
    $this->assertSame('INSERT INTO items (name, ts) VALUES (?, ?)', $db->sql(0));
    $this->assertSame(array('a', '2026-10-15 12:00:00'), $db->params(0));

    $kit->handle($crud, array('action' => 'update', 'id' => '7', 'name' => 'b'));
    $this->assertSame('UPDATE items SET name = ?, ts = ? WHERE id = ?', $db->sql(2));
    $this->assertSame(array('create', 'update'), $operations);
  }

  public function testScopeLimitsListReadUpdateAndDelete()
  {
    $crud = Crud::make('people')->table('people')->scope('unit IN (?, ?)', array(3, 7))->fields(
      Field::number('id')->key(),
      Field::text('name')->filterable(Field::FILTER_LIKE)
    );
    $db = (new FakeConnection())->willReturn(array(array('total' => 0)))->willReturn(array())->willReturn(array(array('id' => 5)));
    $kit = $this->kit($db);

    $kit->handle($crud, array('action' => 'list', 'name' => 'ana'));
    $this->assertSame('SELECT COUNT(*) AS total FROM people t WHERE t.name LIKE ? AND (unit IN (?, ?))', $db->sql(0));
    $this->assertSame(array('%ana%', 3, 7), $db->params(0));

    $kit->handle($crud, array('action' => 'update', 'id' => '5', 'name' => 'b'));
    $this->assertSame('UPDATE people SET name = ? WHERE id = ? AND (unit IN (?, ?))', $db->sql(2));
    $this->assertSame(array('b', '5', 3, 7), $db->params(2));
    $this->assertSame('SELECT t.id, t.name FROM people t WHERE t.id = ? AND (unit IN (?, ?))', $db->sql(3), 'the record is read back inside the scope');

    $kit->handle($crud, array('action' => 'delete', 'id' => '5'));
    $this->assertSame('DELETE FROM people WHERE id = ? AND (unit IN (?, ?))', $db->sql(4));

    $this->assertThrows(\InvalidArgumentException::class, function () use ($crud) {
      $crud->scope('1 = 1; DROP TABLE people');
    });
  }

  public function testFillFromSendsTheActionUrlToTheForm()
  {
    $crud = Crud::make('people')->table('people')->fields(
      Field::number('id')->key(),
      Field::text('document')->fillFrom('byDocument'),
      Field::text('name')
    )->action('byDocument', function (array $params) {
      return array('Result' => 'OK', 'Record' => array('name' => 'Ana ' . $params['document']));
    });
    $kit = $this->kit(new FakeConnection());
    $fields = array_column($kit->quasarSchema($crud, 'p.php')['fields'], null, 'name');
    $this->assertSame('p.php?crud=people&action=byDocument', $fields['document']['fillUrl']);
    $this->assertTrue(!isset($fields['name']['fillUrl']));
    $this->assertSame(array('Result' => 'OK', 'Record' => array('name' => 'Ana 123')), $kit->handle($crud, array('action' => 'byDocument', 'document' => '123')));
  }

  public function testEmptyValue()
  {
    $crud = Crud::make('items')->table('items')->fields(
      Field::number('id')->key(),
      Field::text('file')->emptyValue(''),
      Field::text('note')
    );
    $db = (new FakeConnection())->willReturn(array(array('id' => 1)));
    $db->lastId = '1';
    $this->kit($db)->handle($crud, array('action' => 'create', 'file' => '  ', 'note' => ''));
    $this->assertSame(array('', null), $db->params(0), 'emptyValue for "file", null for the others');
  }

  public function testTextIsStoredAsValidated()
  {
    $crud = Crud::make('items')->table('items')->fields(
      Field::number('id')->key(),
      Field::text('file')->rules(array('pattern' => '^\S*$')),
      Field::password('secret')
    );
    $db = (new FakeConnection())->willReturn(array(array('id' => 1)));
    $db->lastId = '1';
    $this->kit($db)->handle($crud, array('action' => 'create', 'file' => "domicilios\t", 'secret' => ' x '));
    $this->assertSame(array('domicilios', ' x '), $db->params(0), 'trimmed like the validator sees it; passwords as typed');
  }

  public function testValidationErrorsPerField()
  {
    $db = new FakeConnection();
    $payload = $this->kit($db)->handle($this->crud(), array('action' => 'create', 'idsector' => '123', 'Descripcion' => '  '));

    $this->assertSame('ERROR', $payload['Result']);
    $this->assertSame(array('idsector' => 'Escriba máximo 2 caracteres.', 'Descripcion' => 'Este campo es obligatorio.'), $payload['Errors']);
    $this->assertSame(0, count($db->statements), 'nothing is written');
  }

  public function testUpdateDoesNotChangeKeyNorComputedFields()
  {
    $db = (new FakeConnection())->willReturn(array(array('idsector' => '01')));
    $this->kit($db)->handle($this->crud(), array('action' => 'update', 'idsector' => '01', 'Descripcion' => 'X', 'Activo' => '0', 'nombre_ciudad' => 'y'));
    $this->assertSame('UPDATE maestros.sectordespacho SET Descripcion = ?, Activo = ? WHERE idsector = ?', $db->sql(0));
    $this->assertSame(array('X', '0', '01'), $db->params(0));
  }

  public function testDeleteRequiresKey()
  {
    $db = new FakeConnection();
    $payload = $this->kit($db)->handle($this->crud(), array('action' => 'delete'));
    $this->assertSame(array('Result' => 'ERROR', 'Message' => 'Falta la clave del registro.'), $payload);

    $this->kit($db)->handle($this->crud(), array('action' => 'delete', 'idsector' => '05'));
    $this->assertSame('DELETE FROM maestros.sectordespacho WHERE idsector = ?', $db->sql(0));
  }

  public function testConstraintErrorsAreFriendly()
  {
    $cases = array(
      array('create', "SQLSTATE[23000]: [SQL Server]Violation of PRIMARY KEY constraint 'PK_x'. Cannot insert duplicate key in object 'maestros.sectordespacho'.", 'Ya existe un registro con esa clave.'),
      array('create', "MySQL: Duplicate entry '05' for key 'PRIMARY'", 'Ya existe un registro con esa clave.'),
      array('delete', 'SQLSTATE[23000]: The DELETE statement conflicted with the REFERENCE constraint "FK_x".', 'No se puede eliminar: otros registros lo están usando.'),
      array('delete', 'MySQL: Cannot delete or update a parent row: a foreign key constraint fails', 'No se puede eliminar: otros registros lo están usando.'),
      array('delete', 'Lock request time out period exceeded.', 'Lock request time out period exceeded.'),
    );
    foreach ($cases as $case) {
      $db = new FakeConnection();
      $db->failWith = new \RuntimeException($case[1]);
      $payload = $this->kit($db)->handle($this->crud(), array('action' => $case[0], 'idsector' => '05', 'Descripcion' => 'X'));
      $this->assertSame(array('Result' => 'ERROR', 'Message' => $case[2]), $payload, $case[1]);
    }
  }

  public function testDisabledAndForbiddenOperations()
  {
    $db = new FakeConnection();
    $payload = $this->kit($db)->handle($this->crud()->disable(Crud::DELETE), array('action' => 'delete', 'idsector' => '05'));
    $this->assertSame('Esta pantalla no permite: eliminar.', $payload['Message']);

    $onlyRead = new class implements Permissions {
      public function allows(Crud $crud, $operation, $code)
      {
        return $operation === Crud::LIST;
      }
    };
    $payload = $this->kit($db, $onlyRead)->handle($this->crud(), array('action' => 'update', 'idsector' => '05', 'Descripcion' => 'x'));
    $this->assertSame('No tiene permitido modificar registros.', $payload['Message']);
    $this->assertSame(0, count($db->statements));
  }

  public function testHooksTransformAndCustomActions()
  {
    $log = array();
    $crud = $this->crud()
      ->beforeSave(function (array $record, $operation) {
        if ($record['Descripcion'] === 'PROHIBIDO') {
          throw new ValidationException(array('Descripcion' => 'Nombre reservado'));
        }
      })
      ->afterSave(function (array $record, $operation) use (&$log) {
        $log[] = $operation;
      })
      ->transform(function (array $record) {
        $record['Descripcion'] = strtoupper($record['Descripcion']);
        return $record;
      })
      ->action('ping', function (array $params) {
        return array('Result' => 'OK', 'pong' => $params['x']);
      });

    $db = (new FakeConnection())->willReturn(array(array('idsector' => '02', 'Descripcion' => 'nuevo')));
    $payload = $this->kit($db)->handle($crud, array('action' => 'create', 'idsector' => '02', 'Descripcion' => 'nuevo'));
    $this->assertSame('NUEVO', $payload['Record']['Descripcion']);
    $this->assertSame(array('create'), $log);

    $payload = $this->kit(new FakeConnection())->handle($crud, array('action' => 'create', 'idsector' => '03', 'Descripcion' => 'PROHIBIDO'));
    $this->assertSame(array('Descripcion' => 'Nombre reservado'), $payload['Errors']);

    $this->assertSame(array('Result' => 'OK', 'pong' => 'y'), $this->kit($db)->handle($crud, array('action' => 'ping', 'x' => 'y')));
    $this->assertSame('Acción no válida: hack.', $this->kit($db)->handle($crud, array('action' => 'hack'))['Message']);
  }

  public function testCustomDataSource()
  {
    $repository = new class extends ReadOnlyDataSource {
      public function list(ListQuery $query)
      {
        return array('total' => 1, 'records' => array(array('viaje' => (int) $query->filter('viaje'))));
      }
    };
    $crud = Crud::make('trips')->readOnly()->dataSource($repository)->fields(Field::number('viaje')->key()->filterable());
    $kit = new CrudKit(null, null, new FileTranslator('es'), 'assets');
    $this->assertSame(
      array('Result' => 'OK', 'TotalRecordCount' => 1, 'Records' => array(array('viaje' => 15))),
      $kit->handle($crud, array('action' => 'list', 'viaje' => '15'))
    );
  }
}
