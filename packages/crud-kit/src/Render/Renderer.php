<?php

namespace Ivandzb\CrudKit\Render;

use Ivandzb\CrudKit\Definition\Crud;

/**
 * Paints a CRUD in the page. The server protocol is the same for every renderer,
 * so a definition can be shown with any of them (Crud::renderWith()).
 */
interface Renderer
{
  const JTABLE = 'jtable';
  const QUASAR = 'quasar';

  /**
   * @param string $actionUrl URL that serves this CRUD's requests (crud/action are appended)
   * @param callable $allowedFor function (Crud $crud): array operation => bool
   * @return string HTML + script
   */
  public function render(Crud $crud, $actionUrl, callable $allowedFor);
}
