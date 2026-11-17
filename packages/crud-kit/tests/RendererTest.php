<?php

namespace Ivandzb\CrudKit\Tests;

use Ivandzb\CrudKit\CrudKit;
use Ivandzb\CrudKit\Definition\Crud;
use Ivandzb\CrudKit\Definition\Field;
use Ivandzb\CrudKit\Ports\FileTranslator;
use Ivandzb\CrudKit\Ports\Permissions;
use Ivandzb\CrudKit\Render\JsFunction;

final class RendererTest extends TestCase
{
  private function crud()
  {
    return Crud::make('sectors')
      ->title("Sectores D'Angelo")
      ->table('maestros.sectordespacho')
      ->fields(
        Field::text('idsector', 'Id')->key()->onlyOnCreate()->filterable()->rules(array('required' => true, 'maxLength' => 2)),
        Field::text('Descripcion', 'Título')->width('60%')->filterable(Field::FILTER_LIKE),
        Field::select('Activo', 'Estado', array(1 => 'Activo', 0 => 'Inactivo'))
      )
      ->messages(array('loadingMessage' => 'Cargando sectores...'))
      ->on('recordsLoaded', 'console.log(data.records.length);')
      ->jtable(array('pageSizes' => array(10, 50)));
  }

  private function kit(?Permissions $permissions = null)
  {
    return new CrudKit(new FakeConnection(), $permissions, new FileTranslator('es'), 'packages/crud-kit/assets');
  }

  public function testConfiguration()
  {
    $config = $this->kit()->jtableConfiguration($this->crud(), 'index.php?modulo=x');

    $this->assertSame("Sectores D'Angelo", $config['title']);
    $this->assertSame('index.php?modulo=x&crud=sectors&action=list', $config['actions']['listAction']);
    $this->assertSame('index.php?modulo=x&crud=sectors&action=delete', $config['actions']['deleteAction']);
    $this->assertSame('Cargando sectores...', $config['messages']['loadingMessage']);
    $this->assertSame('Ir a página', $config['messages']['gotoPageLabel']);
    $this->assertSame(array(10, 50), $config['pageSizes']);
    $this->assertTrue($config['recordsLoaded'] instanceof JsFunction);
    $this->assertSame(false, $config['showCloseButton'], 'the page table has no close button');

    $key = $config['fields']['idsector'];
    $this->assertSame(array(true, true, false, 'ck-required'), array($key['key'], $key['create'], $key['edit'], $key['inputClass']));
    $this->assertSame(
      array(array('Value' => 1, 'DisplayText' => 'Activo'), array('Value' => 0, 'DisplayText' => 'Inactivo')),
      $config['fields']['Activo']['options'],
      'select options keep the declared order'
    );
  }

  public function testPermissionsHideActions()
  {
    $denyDelete = new class implements Permissions {
      public function allows(Crud $crud, $operation, $code)
      {
        return $operation !== Crud::DELETE;
      }
    };
    $config = $this->kit($denyDelete)->jtableConfiguration($this->crud(), 'p.php');
    $this->assertTrue(!isset($config['actions']['deleteAction']), 'delete action must be hidden');
    $this->assertTrue(isset($config['actions']['createAction']));

    $config = $this->kit()->jtableConfiguration($this->crud()->readOnly(), 'p.php');
    $this->assertSame(array('listAction'), array_keys($config['actions']));
  }

  public function testHtmlIsPrefixedAndValidJavascript()
  {
    $html = $this->kit()->render($this->crud()->loadOnFilterOnly(), 'p.php');

    $this->assertContains('id="ck-sectors"', $html);
    $this->assertContains('id="ck-sectors-filter-idsector"', $html);
    $this->assertContains('class="ck-filter-button">Filtrar</button>', $html);
    $this->assertContains('id="ck-sectors-table" style="display:none"', $html);
    $this->assertNotContains('LoadRecordsButton', $html);
    $this->assertContains('"loadOnStart": false', $html);

    if (preg_match('/<script type="text\/javascript">(.*)<\/script>/s', $html, $match) && self::nodeAvailable()) {
      $file = tempnam(sys_get_temp_dir(), 'ck') . '.js';
      file_put_contents($file, $match[1]);
      exec('node --check ' . escapeshellarg($file) . ' 2>&1', $output, $code);
      unlink($file);
      $this->assertSame(0, $code, 'generated JavaScript: ' . implode("\n", $output));
    }
  }

  private static function nodeAvailable()
  {
    exec('node --version 2>&1', $output, $code);
    return $code === 0;
  }
}
