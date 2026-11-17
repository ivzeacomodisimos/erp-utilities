<?php

namespace Ivandzb\CrudKit\Tests;

use InvalidArgumentException;
use Ivandzb\CrudKit\CrudKit;
use Ivandzb\CrudKit\Definition\Crud;
use Ivandzb\CrudKit\Definition\Field;
use Ivandzb\CrudKit\Definition\Lookup;
use Ivandzb\CrudKit\Ports\FileTranslator;
use Ivandzb\CrudKit\Ports\Permissions;

final class QuasarRendererTest extends TestCase
{
  public function testOptionalRequestDefaultsAndConfirmation()
  {
    $crud=$this->crud();
    $schema=$this->kit()->quasarSchema($crud,'p.php');
    $this->assertSame(false,$schema['createFromFilters']);
    $this->assertSame(array(),(array)$schema['requestParams']);
    $crud->requestParams(array('_csrf'=>'token'))->createFromFilters()
      ->fields(Field::text('note','Nota')->onlyOnEdit())
      ->action('print',function () { return array('Result'=>'OK'); })
      ->selectionAction('print','Imprimir',array(),'Confirmar envio');
    $schema=$this->kit()->quasarSchema($crud,'p.php');
    $this->assertSame(true,$schema['createFromFilters']);
    $this->assertSame('token',$schema['requestParams']->_csrf);
    $this->assertSame('Confirmar envio',$schema['selectionActions'][0]['confirmation']);
    $fields=array_column($schema['fields'],null,'name');
    $this->assertSame(array(false,true),array($fields['note']['create'],$fields['note']['edit']));
  }

  private function crud()
  {
    $lists = Crud::make('trip-lists')->readOnly()->fields(Field::number('list', 'Lista')->key(), Field::number('trip', 'Viaje'));
    return Crud::make('trips')
      ->title('Viajes')
      ->table('logistica.viajes')
      ->fields(
        Field::number('id', 'Viaje')->key()->filterable(),
        Field::autocomplete('state', 'Estado', Lookup::table('estados', 'id', 'titulo'))->filterable(),
        Field::select('leg', 'Tramo', array('T1' => 'T1', 'T2' => 'T2'))->rules(array('required' => true)),
        Field::checkbox('active', 'Activo'),
        Field::text('detail', 'Detalle')->computed()->html()
      )
      ->defaultSorting('id', 'DESC')
      ->selectable()
      ->child('lists', 'Listas', $lists, array('trip' => 'id'), 'fas fa-list');
  }

  private function kit(?Permissions $permissions = null, $default = 'jtable')
  {
    return new CrudKit(new FakeConnection(), $permissions, new FileTranslator('es'), 'assets', $default);
  }

  public function testSchema()
  {
    $schema = $this->kit()->quasarSchema($this->crud(), 'p.php');

    $this->assertSame(array('trips', 'Viajes', 'id', true, 'multiple'), array($schema['id'], $schema['title'], $schema['sortBy'], $schema['descending'], $schema['selection']));
    $this->assertSame('p.php?crud=trips&action=list', $schema['urls']['list']);
    $this->assertSame('p.php?crud=trips&action=delete', $schema['urls']['delete']);

    $fields = array();
    foreach ($schema['fields'] as $field) {
      $fields[$field['name']] = $field;
    }
    $this->assertSame('p.php?crud=trips&action=autocomplete&field=state', $fields['state']['autocompleteUrl']);
    $this->assertSame('state__text', $fields['state']['textField']);
    $this->assertSame(array(array('value' => 'T1', 'label' => 'T1'), array('value' => 'T2', 'label' => 'T2')), $fields['leg']['options']);
    $this->assertSame(array(array('value' => 0, 'label' => 'No'), array('value' => 1, 'label' => 'Sí')), $fields['active']['options']);
    $this->assertSame(array(true, false), array($fields['detail']['html'], $fields['detail']['sortable']));
    $this->assertSame('Filtrar', $schema['texts']['filter']);
    $this->assertSame('Adicionar nuevo registro', $schema['texts']['addNewRecord']);

    $child = $schema['children'][0];
    $this->assertSame(array('lists', 'fas fa-list'), array($child['name'], $child['icon']));
    $this->assertSame('p.php?crud=trip-lists&action=list', $child['schema']['urls']['list']);
    $this->assertSame(array('list'), array_keys($child['schema']['urls']), 'the child is read-only');
    $childFields = array_column($child['schema']['fields'], 'list', 'name');
    $this->assertSame(false, $childFields['trip'], 'the link column is hidden in the child');
  }

  public function testPermissionsRemoveUrls()
  {
    $noDelete = new class implements Permissions {
      public function allows(Crud $crud, $operation, $code)
      {
        return $operation !== Crud::DELETE;
      }
    };
    $schema = $this->kit($noDelete)->quasarSchema($this->crud(), 'p.php');
    $this->assertTrue(!isset($schema['urls']['delete']));
  }

  public function testChoosingTheRenderer()
  {
    $jtable = $this->kit()->render($this->crud(), 'p.php');
    $this->assertContains('CrudKit.jtable(', $jtable);

    $quasar = $this->kit()->render($this->crud()->renderWith('quasar'), 'p.php');
    $this->assertContains('CrudKitQuasar.mount("#ck-trips"', $quasar);
    $this->assertContains('quasar/crud-kit-quasar.js', $quasar);
    $this->assertNotContains('CrudKit.jtable(', $quasar);

    $byDefault = $this->kit(null, 'quasar')->render($this->crud(), 'p.php');
    $this->assertContains('CrudKitQuasar.mount(', $byDefault);

    $this->assertThrows(InvalidArgumentException::class, function () {
      Crud::make('a')->renderWith('react');
    });
  }

  public function testSelectionActionWithoutDelete()
  {
    $crud = $this->crud()->disable(Crud::DELETE)->action('processRows', function () {
      return array('Result' => 'OK');
    })->selectionAction('processRows', 'Procesar', array('_csrf' => 'session-token'));
    $schema = $this->kit()->quasarSchema($crud, 'p.php');
    $this->assertTrue(!isset($schema['urls']['delete']));
    $this->assertSame('multiple', $schema['selection']);
    $this->assertSame('Procesar', $schema['selectionActions'][0]['label']);
    $this->assertContains('action=processRows', $schema['selectionActions'][0]['url']);
    $this->assertSame(array('_csrf' => 'session-token'), $schema['selectionActions'][0]['params']);
  }

  public function testCreateSequenceIsOptInAndValidatesFields()
  {
    $crud = $this->crud();
    $this->assertSame(null, $this->kit()->quasarSchema($crud, 'p.php')['createSequence']);
    $crud->fields(Field::number('total'), Field::number('sequence'), Field::datetime('date'));
    $options = array('totalField'=>'total','incrementField'=>'sequence','nowField'=>'date',
      'commonFields'=>array('state'),'resetValues'=>array('leg'=>''),'timeZone'=>'America/Bogota');
    $crud->createSequence($options);
    $this->assertSame($options, $this->kit()->quasarSchema($crud, 'p.php')['createSequence']);
    $this->assertThrows(InvalidArgumentException::class, function () use ($crud) {
      $crud->createSequence(array('totalField'=>'missing','incrementField'=>'id','nowField'=>'name'));
    });
  }

  public function testRefreshMustBeEnabledExplicitly()
  {
    $crud = $this->crud();
    $this->assertSame(0, $this->kit()->quasarSchema($crud,'p.php')['refreshSeconds']);
    $this->assertSame(5, $this->kit()->quasarSchema($crud->refreshEvery(5),'p.php')['refreshSeconds']);
    $this->assertSame(0, $crud->refreshEvery(0)->getRefreshSeconds());
    $this->assertThrows(InvalidArgumentException::class, function () use ($crud) { $crud->refreshEvery(1); });
  }
}
