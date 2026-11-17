<?php

namespace Ivandzb\UiKit\Render;

use InvalidArgumentException;
use Ivandzb\UiKit\Component\Component;
use Ivandzb\UiKit\Node\Container;
use Ivandzb\UiKit\Node\Element;
use Ivandzb\UiKit\Node\Node;
use Ivandzb\UiKit\Node\Raw;
use Ivandzb\UiKit\Node\Ref;
use Ivandzb\UiKit\Node\Text;
use Ivandzb\UiKit\Page;

/**
 * HTML + jQuery: each component is painted from its build(); assets/ui-kit.js (jQuery)
 * adds the behavior (side panels, menu groups, tabs) and assets/ui-kit.css the look.
 *
 * A view registered with view() replaces build() for a component class (and its
 * subclasses): function (Component $component, HtmlRenderer $renderer): string.
 */
class HtmlRenderer implements Renderer
{
  /** @var Assets */
  private $assets;
  /** @var string|null */
  private $jqueryUrl;
  /** @var callable[] class => view */
  private $views = array();

  /**
   * @param string|null $assetsUrl public URL of packages/ui-kit/assets (null: no package CSS/JS)
   * @param string|null $jqueryUrl jQuery to load when the page does not have it already
   */
  public function __construct($assetsUrl = null, $jqueryUrl = null)
  {
    $this->assets = new Assets($assetsUrl);
    $this->jqueryUrl = $jqueryUrl;
  }

  /**
   * @return $this
   */
  public function view($componentClass, callable $view)
  {
    $this->views[$componentClass] = $view;
    return $this;
  }

  public function page(Page $page)
  {
    $head = '<meta charset="utf-8">' . "\n"
      . '<meta name="viewport" content="width=device-width, initial-scale=1">' . "\n"
      . '<title>' . self::escape($page->getTitle()) . "</title>\n";
    foreach ($page->getHeadHtml() as $raw) {
      $head .= $raw->html() . "\n";
    }
    if ($this->assets->enabled()) {
      $head .= '<link rel="stylesheet" href="' . self::escape($this->assets->url('ui-kit.css')) . '">' . "\n";
    }
    foreach ($page->getStylesheets() as $url) {
      $head .= '<link rel="stylesheet" href="' . self::escape($url) . '">' . "\n";
    }
    if ($page->getCss()) {
      $head .= self::styleTag(implode("\n", $page->getCss()));
    }
    if ($this->jqueryUrl !== null) {
      $head .= '<script src="' . self::escape($this->jqueryUrl) . '"></script>' . "\n";
    }
    foreach ($page->getHeadScripts() as $url) {
      $head .= '<script src="' . self::escape($url) . '"></script>' . "\n";
    }

    $style = $page->getPrimaryColor() !== null ? ' style="--uk-primary: ' . self::escape($page->getPrimaryColor()) . '"' : '';
    $body = '<div class="uk-root"' . $style . '>' . $this->nodes($page->children()) . "</div>\n";
    if ($this->assets->enabled()) {
      $body .= '<script src="' . self::escape($this->assets->url('ui-kit.js')) . '"></script>' . "\n";
    }
    foreach ($page->getBodyScripts() as $url) {
      $body .= '<script src="' . self::escape($url) . '"></script>' . "\n";
    }
    foreach ($page->getInlineScripts() as $code) {
      $body .= self::scriptTag($code);
    }
    foreach ($page->getBodyEndHtml() as $raw) {
      $body .= $raw->html() . "\n";
    }

    return "<!doctype html>\n<html lang=\"" . self::escape($page->getLang()) . "\">\n<head>\n" . $head
      . "</head>\n<body class=\"uk-page\">\n" . $body . "</body>\n</html>\n";
  }

  public function fragment(Node $node)
  {
    return $this->node($node);
  }

  /**
   * Link and script tags of the package, for a fragment embedded in a page that does not
   * load them (call once per page).
   */
  public function assetTags()
  {
    if (!$this->assets->enabled()) {
      return '';
    }
    return '<link rel="stylesheet" href="' . self::escape($this->assets->url('ui-kit.css')) . '">'
      . '<script src="' . self::escape($this->assets->url('ui-kit.js')) . '"></script>';
  }

  public function node(Node $node)
  {
    if ($node instanceof Text) {
      return self::escape($node->text());
    }
    if ($node instanceof Raw) {
      return $node->html();
    }
    if ($node instanceof Ref) {
      return $this->nodes($node->nodes());
    }
    if ($node instanceof Component) {
      $view = $this->viewFor($node);
      return $view !== null ? (string) call_user_func($view, $node, $this) : $this->node($node->build());
    }
    if ($node instanceof Element) {
      $html = '<' . $node->tag() . self::attributes($node) . '>';
      if ($node->isVoid()) {
        return $html;
      }
      return $html . $this->nodes($node->children()) . '</' . $node->tag() . '>';
    }
    if ($node instanceof Container) {
      return $this->nodes($node->children());
    }
    throw new InvalidArgumentException('Unknown node: ' . get_class($node));
  }

  /**
   * @param Node[] $nodes
   */
  public function nodes(array $nodes)
  {
    $html = '';
    foreach ($nodes as $node) {
      $html .= $this->node($node);
    }
    return $html;
  }

  public static function escape($text)
  {
    return htmlspecialchars((string) $text, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
  }

  /**
   * @param Element|Component $node
   */
  public static function attributes($node)
  {
    $html = '';
    foreach ($node->getAttributes() as $name => $value) {
      $html .= $value === true ? ' ' . $name : ' ' . $name . '="' . self::escape($value) . '"';
    }
    if ($node->getClasses()) {
      $html .= ' class="' . self::escape(implode(' ', $node->getClasses())) . '"';
    }
    $style = self::styleText($node->getStyles());
    if ($style !== '') {
      $html .= ' style="' . self::escape($style) . '"';
    }
    return $html;
  }

  /**
   * A <style> block whose content cannot close the tag.
   */
  public static function styleTag($css)
  {
    return '<style>' . str_ireplace('</style', '<\/style', (string) $css) . "</style>\n";
  }

  /**
   * A <script> block whose code cannot close the tag.
   */
  public static function scriptTag($code)
  {
    return '<script>' . str_ireplace('</script', '<\/script', (string) $code) . "</script>\n";
  }

  public static function styleText(array $styles)
  {
    $parts = array();
    foreach ($styles as $property => $value) {
      // A value cannot close the declaration or open another one.
      $parts[] = $property . ': ' . str_replace(array(';', '{', '}'), '', $value);
    }
    return implode('; ', $parts);
  }

  /**
   * @return callable|null
   */
  private function viewFor(Component $component)
  {
    for ($class = get_class($component); $class !== false; $class = get_parent_class($class)) {
      if (isset($this->views[$class])) {
        return $this->views[$class];
      }
    }
    return null;
  }
}
