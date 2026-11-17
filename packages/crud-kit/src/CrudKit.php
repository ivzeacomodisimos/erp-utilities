<?php

namespace Ivandzb\CrudKit;

use Ivandzb\CrudKit\Data\DataSource;
use Ivandzb\CrudKit\Data\LookupSearch;
use Ivandzb\CrudKit\Data\TableDataSource;
use Ivandzb\CrudKit\Definition\Crud;
use Ivandzb\CrudKit\Ports\AllowAll;
use Ivandzb\CrudKit\Ports\Connection;
use Ivandzb\CrudKit\Ports\FileTranslator;
use Ivandzb\CrudKit\Ports\Permissions;
use Ivandzb\CrudKit\Ports\Translator;
use Ivandzb\CrudKit\Render\JTable\JTableRenderer;
use Ivandzb\CrudKit\Render\Quasar\QuasarRenderer;
use Ivandzb\CrudKit\Render\Renderer;
use Ivandzb\CrudKit\Server\Dispatcher;

/**
 * Entry point: renders CRUDs and serves their requests.
 *
 *   $kit = new CrudKit(new PdoConnection($pdo), null, new FileTranslator('es'), '/vendor/ivandzb/crud-kit/assets');
 *
 *   if (isset($_REQUEST['crud'])) {
 *     header('Content-Type: application/json');
 *     echo json_encode($kit->handle($crud, $_REQUEST));
 *     exit;
 *   }
 *   echo $kit->render($crud, '/sectors.php');
 */
final class CrudKit
{
  /** @var Connection|null */
  private $connection;
  /** @var Permissions */
  private $permissions;
  /** @var Translator */
  private $translator;
  /** @var Dispatcher */
  private $dispatcher;
  /** @var Renderer[] name => renderer */
  private $renderers;
  /** @var string */
  private $defaultRenderer;

  /**
   * @param Connection|null $connection required unless every CRUD has its own dataSource()
   * @param Permissions|null $permissions default: allow everything enabled in the definition
   * @param Translator|null $translator default: English
   * @param string $assetsUrl public URL of this package's assets/ folder
   * @param string $defaultRenderer Renderer::JTABLE or Renderer::QUASAR, for CRUDs without renderWith()
   */
  public function __construct(?Connection $connection = null, ?Permissions $permissions = null, ?Translator $translator = null, $assetsUrl = 'vendor/ivandzb/crud-kit/assets', $defaultRenderer = Renderer::JTABLE)
  {
    $this->connection = $connection;
    $this->permissions = $permissions !== null ? $permissions : new AllowAll();
    $this->translator = $translator !== null ? $translator : new FileTranslator('en');
    $this->dispatcher = new Dispatcher($this->permissions, $this->translator, $connection !== null ? new LookupSearch($connection) : null);
    $this->renderers = array(
      Renderer::JTABLE => new JTableRenderer($this->translator, $assetsUrl),
      Renderer::QUASAR => new QuasarRenderer($this->translator, $assetsUrl),
    );
    if (!isset($this->renderers[$defaultRenderer])) {
      throw new \InvalidArgumentException("Unknown renderer: '$defaultRenderer'");
    }
    $this->defaultRenderer = $defaultRenderer;
  }

  /**
   * HTML + script of the CRUD.
   *
   * @param string $actionUrl URL that routes back to handle() for this CRUD
   */
  public function render(Crud $crud, $actionUrl)
  {
    return $this->rendererFor($crud)->render($crud, $actionUrl, array($this->dispatcher, 'allowedOperations'));
  }

  /**
   * Serves a request of the CRUD.
   *
   * @param array $params request parameters (e.g. $_REQUEST)
   * @return array payload to send as JSON
   */
  public function handle(Crud $crud, array $params)
  {
    // Child tables are served by the same URL: crud=<child id>.
    $target = isset($params['crud']) ? $crud->find((string) $params['crud']) : null;
    if ($target === null) {
      $target = $crud;
    }
    return $this->dispatcher->handle($target, $this->dataSourceFor($target), $params);
  }

  /**
   * True when the request belongs to this CRUD or one of its child tables (crud=<id>).
   */
  public static function isRequestFor(Crud $crud, array $params)
  {
    return isset($params['crud']) && $crud->find((string) $params['crud']) !== null;
  }

  /**
   * jTable options generated for the CRUD (useful for tests and debugging).
   */
  public function jtableConfiguration(Crud $crud, $actionUrl)
  {
    return $this->renderers[Renderer::JTABLE]->configuration($crud, $actionUrl, array($this->dispatcher, 'allowedOperations'));
  }

  /**
   * @return DataSource
   */
  public function dataSourceFor(Crud $crud)
  {
    if ($crud->getDataSource() !== null) {
      return $crud->getDataSource();
    }
    if ($this->connection === null) {
      throw new \LogicException("CRUD '{$crud->id()}' needs a dataSource() or a Connection in CrudKit");
    }
    return new TableDataSource($crud, $this->connection);
  }

  /**
   * Schema sent to the Quasar renderer (useful for tests and debugging).
   */
  public function quasarSchema(Crud $crud, $actionUrl)
  {
    return $this->renderers[Renderer::QUASAR]->schema($crud, $actionUrl, array($this->dispatcher, 'allowedOperations'));
  }

  /**
   * @return Renderer
   */
  private function rendererFor(Crud $crud)
  {
    $name = $crud->getRenderer() !== null ? $crud->getRenderer() : $this->defaultRenderer;
    return $this->renderers[$name];
  }
}
