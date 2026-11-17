<?php
// Prints the Quasar schema of a sample CRUD (input of smoke.mjs).
require __DIR__ . '/../../autoload.php';
require __DIR__ . '/../../tests/FakeConnection.php';

use Ivandzb\CrudKit\CrudKit;
use Ivandzb\CrudKit\Definition\Crud;
use Ivandzb\CrudKit\Definition\Field;
use Ivandzb\CrudKit\Definition\Lookup;
use Ivandzb\CrudKit\Ports\FileTranslator;
use Ivandzb\CrudKit\Tests\FakeConnection;

$lists = Crud::make('trip-lists')->title('Listas')->readOnly()->fields(Field::number('list', 'Lista')->key(), Field::number('trip', 'Viaje'), Field::text('state', 'Estado'));
$crud = Crud::make('trips')->title('Viajes de prueba')->table('t')->fields(
  Field::number('id', 'Viaje')->key(),
  Field::text('name', 'Nombre')->filterable()->suggestions()->fillFrom('byName')->rules(array('required' => true, 'maxLength' => 10)),
  Field::autocomplete('city', 'Ciudad', Lookup::table('cities', 'id', 'name'))->filterable(),
  Field::select('leg', 'Tramo', array('T1' => 'Tramo 1', 'T2' => 'Tramo 2')),
  Field::text('detail', 'Detalle')->computed()->html()
)->selectable()->child('lists', 'Listas', $lists, array('trip' => 'id'), 'fas fa-list');
$kit = new CrudKit(new FakeConnection(), null, new FileTranslator('es'), 'assets');
echo json_encode($kit->quasarSchema($crud, 'api.php'));
