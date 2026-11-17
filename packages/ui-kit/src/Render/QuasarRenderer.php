<?php

namespace Ivandzb\UiKit\Render;

use InvalidArgumentException;
use Ivandzb\UiKit\Component\Alert;
use Ivandzb\UiKit\Component\Badge;
use Ivandzb\UiKit\Component\Button;
use Ivandzb\UiKit\Component\Card;
use Ivandzb\UiKit\Component\Component;
use Ivandzb\UiKit\Component\Icon;
use Ivandzb\UiKit\Component\Input;
use Ivandzb\UiKit\Component\Layout;
use Ivandzb\UiKit\Component\Menu;
use Ivandzb\UiKit\Component\MenuItem;
use Ivandzb\UiKit\Component\Tabs;
use Ivandzb\UiKit\Component\Toolbar;
use Ivandzb\UiKit\Node\Container;
use Ivandzb\UiKit\Node\Element;
use Ivandzb\UiKit\Node\Node;
use Ivandzb\UiKit\Node\Raw;
use Ivandzb\UiKit\Node\Ref;
use Ivandzb\UiKit\Node\Text;
use Ivandzb\UiKit\Page;

/**
 * Vue 3 + Quasar. The tree is turned into a description the bundle paints with
 * render functions (no template compiler, nothing is evaluated):
 *
 *   {"t": "q-btn", "p": {"label": "Guardar", "color": "primary"}, "c": [...], "s": {"slot": [...]}}
 *
 * t is an HTML tag, a Quasar component (q-*) or a ui-kit component (uk-*); a plain string is
 * a text. Components without a Quasar view are painted from build().
 *
 * Raw HTML is not given to Vue: it is written in the page as is, hidden, and the uk-raw
 * component moves those nodes into place when the app mounts, so their scripts run and
 * their event handlers survive.
 *
 * A view registered with view() replaces the default one for a component class:
 * function (Component $component, QuasarRenderer $renderer): array (one vnode).
 */
class QuasarRenderer implements Renderer
{
  const BODY_CSS = ':where(body.uk-page) { margin: 0; background: #f3f6fa; color: #1d2733; font-family: Roboto, "Segoe UI", Arial, sans-serif; font-size: 14px; }';

  /** @var Assets */
  private $assets;
  /** @var callable[] class => view */
  private $views = array();
  /** @var string[] id => html of the raw blocks of the current render */
  private $stash = array();
  /** @var int */
  private $stashCounter = 0;
  /** @var int */
  private $mountCounter = 0;
  /** @var bool */
  private $assetsWritten = false;

  /**
   * @param string|null $assetsUrl public URL of packages/ui-kit/assets
   */
  public function __construct($assetsUrl = null)
  {
    $this->assets = new Assets($assetsUrl);
    $this->views = array(
      Icon::class => array($this, 'icon'),
      Input::class => array($this, 'input'),
      Button::class => array($this, 'button'),
      Badge::class => array($this, 'badge'),
      Alert::class => array($this, 'alert'),
      Card::class => array($this, 'card'),
      Tabs::class => array($this, 'tabs'),
      Menu::class => array($this, 'menu'),
      Toolbar::class => array($this, 'toolbar'),
      Layout::class => array($this, 'layout'),
    );
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
    $this->stash = array();
    $tree = $this->nodes($page->children());

    $head = '<meta charset="utf-8">' . "\n"
      . '<meta name="viewport" content="width=device-width, initial-scale=1">' . "\n"
      . '<title>' . HtmlRenderer::escape($page->getTitle()) . "</title>\n"
      // Base of the document with zero specificity: any body rule of the host CSS wins.
      . HtmlRenderer::styleTag(self::BODY_CSS);
    foreach ($page->getHeadHtml() as $raw) {
      $head .= $raw->html() . "\n";
    }
    if ($this->assets->enabled()) {
      $head .= '<link rel="stylesheet" href="' . HtmlRenderer::escape($this->assets->url('quasar/ui-kit-quasar.css')) . '">' . "\n";
    }
    foreach ($page->getStylesheets() as $url) {
      $head .= '<link rel="stylesheet" href="' . HtmlRenderer::escape($url) . '">' . "\n";
    }
    if ($page->getCss()) {
      // After the bundle CSS, prefixed with the app id twice: two ids outweigh every scoped
      // Quasar rule (one id), so the page's own CSS always wins, reset included.
      $head .= HtmlRenderer::styleTag(CssScope::apply(implode("\n", $page->getCss()), '#uk-app#uk-app'));
    }
    foreach ($page->getHeadScripts() as $url) {
      $head .= '<script src="' . HtmlRenderer::escape($url) . '"></script>' . "\n";
    }

    $style = $page->getPrimaryColor() !== null ? ' style="--q-primary: ' . HtmlRenderer::escape($page->getPrimaryColor()) . '"' : '';
    $body = '<div id="uk-app" class="uk-quasar"' . $style . '></div>' . "\n"
      . $this->stashHtml()
      . $this->bundleTag()
      . '<script>UiKitQuasar.mount("#uk-app", ' . self::json($tree) . ");</script>\n";
    foreach ($page->getBodyScripts() as $url) {
      $body .= '<script src="' . HtmlRenderer::escape($url) . '"></script>' . "\n";
    }
    foreach ($page->getInlineScripts() as $code) {
      $body .= HtmlRenderer::scriptTag($code);
    }
    foreach ($page->getBodyEndHtml() as $raw) {
      $body .= $raw->html() . "\n";
    }

    return "<!doctype html>\n<html lang=\"" . HtmlRenderer::escape($page->getLang()) . "\">\n<head>\n" . $head
      . "</head>\n<body class=\"uk-page\">\n" . $body . "</body>\n</html>\n";
  }

  /**
   * A mount point plus its script; the bundle tags are written the first time.
   */
  public function fragment(Node $node)
  {
    $this->stash = array();
    $tree = $this->node($node);
    $id = 'uk-mount-' . (++$this->mountCounter) . '-' . substr(md5(uniqid('', true)), 0, 6);
    $html = '';
    if (!$this->assetsWritten && $this->assets->enabled()) {
      $html .= '<link rel="stylesheet" href="' . HtmlRenderer::escape($this->assets->url('quasar/ui-kit-quasar.css')) . '">';
    }
    return $html . '<div id="' . $id . '" class="uk-quasar"></div>' . $this->stashHtml() . $this->bundleTag()
      . '<script>UiKitQuasar.mount("#' . $id . '", ' . self::json($tree) . ");</script>\n";
  }

  /**
   * The description of a node (without page assets), for tests and custom mounts.
   *
   * @return array|string|null
   */
  public function describe(Node $node)
  {
    $this->stash = array();
    return $this->node($node);
  }

  /**
   * @return array|string|null one vnode (a Fragment or Ref becomes a fragment vnode)
   */
  public function node(Node $node)
  {
    if ($node instanceof Text) {
      return $node->text();
    }
    if ($node instanceof Raw) {
      $id = 'uk-raw-' . (++$this->stashCounter);
      $this->stash[$id] = $node->html();
      return array('t' => 'uk-raw', 'p' => array('source' => $id));
    }
    if ($node instanceof Ref) {
      return array('t' => '#', 'c' => $this->nodes($node->nodes()));
    }
    if ($node instanceof Component) {
      $view = $this->viewFor($node);
      return $view !== null ? call_user_func($view, $node, $this) : $this->node($node->build());
    }
    if ($node instanceof Element) {
      return self::vnode($node->tag(), self::props($node), $node->isVoid() ? array() : $this->nodes($node->children()));
    }
    if ($node instanceof Container) {
      return array('t' => '#', 'c' => $this->nodes($node->children()));
    }
    throw new InvalidArgumentException('Unknown node: ' . get_class($node));
  }

  /**
   * @param Node[] $nodes
   * @return array
   */
  public function nodes(array $nodes)
  {
    $list = array();
    foreach ($nodes as $node) {
      $vnode = $this->node($node);
      if (is_array($vnode) && $vnode['t'] === '#') {
        $list = array_merge($list, $vnode['c']);
      } elseif ($vnode !== null) {
        $list[] = $vnode;
      }
    }
    return $list;
  }

  // --- Default views -------------------------------------------------------------

  public function icon(Icon $icon)
  {
    return self::vnode('q-icon', array_merge(self::props($icon), self::compact(array(
      'name' => $icon->name(),
      'size' => $icon->getSize(),
    ))));
  }

  public function input(Input $input)
  {
    return self::vnode('uk-input', array_merge(self::props($input), array(
      'name' => $input->name(), 'label' => $input->label(), 'type' => $input->type(),
      'value' => $input->getValue(), 'hint' => $input->getHint(),
    )));
  }

  public function button(Button $button)
  {
    $props = array_merge(self::props($button), self::compact(array(
      'label' => $button->label() !== '' ? $button->label() : null,
      'icon' => $button->getIcon(),
      'color' => $button->getColor(),
      'href' => $button->getHref(),
      'type' => $button->getHref() === null ? $button->getType() : null,
      'flat' => $button->look() === 'flat' ? true : null,
      'outline' => $button->look() === 'outline' ? true : null,
      'unelevated' => $button->look() === 'filled' ? true : null,
      'noCaps' => true,
    )));
    return self::vnode('q-btn', $props, $this->nodes($button->children()));
  }

  public function badge(Badge $badge)
  {
    return self::vnode('q-badge', array_merge(self::props($badge), array('color' => $badge->getColor(), 'label' => $badge->label())));
  }

  public function alert(Alert $alert)
  {
    $colors = array('info' => 'bg-blue-1 text-blue-10', 'success' => 'bg-green-1 text-green-10', 'warning' => 'bg-amber-1 text-brown-10', 'error' => 'bg-red-1 text-red-10');
    $props = self::props($alert);
    $props['class'] = trim((isset($props['class']) ? $props['class'] . ' ' : '') . 'uk-alert uk-alert--' . $alert->type() . ' ' . $colors[$alert->type()]);
    $props['rounded'] = true;
    $message = array();
    if ($alert->getTitle() !== null) {
      $message[] = self::vnode('strong', array(), array($alert->getTitle()));
      $message[] = ' ';
    }
    $vnode = self::vnode('q-banner', $props, array_merge($message, $this->nodes($alert->children())));
    $vnode['s'] = array('avatar' => array(self::vnode('q-icon', array('name' => $alert->iconName(), 'size' => '24px'))));
    return $vnode;
  }

  public function card(Card $card)
  {
    $props = self::props($card);
    $props['flat'] = true;
    $props['bordered'] = true;
    $props['class'] = trim((isset($props['class']) ? $props['class'] . ' ' : '') . 'uk-card');
    $sections = array();
    if ($card->getTitle() !== null || $card->getSubtitle() !== null || $card->hasSlot('headerActions')) {
      $header = array();
      if ($card->getTitle() !== null) {
        $header[] = self::vnode('div', array('class' => 'text-h6 uk-card-title'), array($card->getTitle()));
      }
      if ($card->getSubtitle() !== null) {
        $header[] = self::vnode('div', array('class' => 'text-subtitle2 text-grey-7'), array($card->getSubtitle()));
      }
      if ($card->hasSlot('headerActions')) {
        $header = array(self::vnode('div', array('style' => 'flex:1;min-width:0'), $header),
          self::vnode('div', array('class' => 'uk-card-header-actions'), $this->nodes($card->slot('headerActions')->children())));
        $sections[] = self::vnode('q-card-section', array('class' => 'uk-card-header', 'style' => 'display:flex;align-items:center;gap:12px'), $header);
      } else {
        $sections[] = self::vnode('q-card-section', array('class' => 'uk-card-header'), $header);
      }
    }
    $sections[] = self::vnode('q-card-section', array('class' => 'uk-card-body'), $this->nodes($card->children()));
    if ($card->hasSlot('actions')) {
      $sections[] = self::vnode('q-separator');
      $sections[] = self::vnode('q-card-actions', array('align' => 'right'), $this->nodes($card->slot('actions')->children()));
    }
    return self::vnode('q-card', $props, $sections);
  }

  public function tabs(Tabs $tabs)
  {
    $list = array();
    $panels = array();
    foreach ($tabs->tabs() as $name => $tab) {
      $list[] = self::compact(array('name' => $name, 'label' => $tab['label'], 'icon' => $tab['icon']));
      $panels[$name] = $this->nodes($tabs->panel($name)->children());
    }
    $props = array_merge(self::props($tabs), array('tabs' => $list, 'active' => $tabs->getActive()));
    if ($tabs->keepsPanelsMounted()) {
      $props['keepPanelsMounted'] = true;
    }
    $vnode = self::vnode('uk-tabs', $props);
    $vnode['s'] = (object) $panels;
    return $vnode;
  }

  public function menu(Menu $menu)
  {
    $props = array_merge(self::props($menu), array('items' => self::menuItems($menu->menuItems())));
    if ($menu->usesMobileDropdown()) {
      $props['mobileDropdown'] = true;
    }
    if ($menu->searchPlaceholder() !== null) {
      $props['search'] = $menu->searchPlaceholder();
      $props['noResults'] = $menu->noResultsText();
    }
    return self::vnode('uk-menu', $props);
  }

  public function toolbar(Toolbar $toolbar)
  {
    $brand = array();
    if ($toolbar->getLogo() !== null) {
      $brand[] = self::vnode('img', array('src' => $toolbar->getLogo(), 'alt' => '', 'class' => 'uk-brand-logo'));
    }
    if ($toolbar->getTitle() !== '') {
      $brand[] = self::vnode('q-toolbar-title', array('shrink' => true, 'class' => 'uk-brand-title'), array($toolbar->getTitle()));
    }
    $brandNode = $toolbar->getHome() !== null
      ? self::vnode('a', array('href' => $toolbar->getHome(), 'class' => 'uk-brand'), $brand)
      : self::vnode('div', array('class' => 'uk-brand'), $brand);
    $props = self::props($toolbar);
    $props['class'] = trim((isset($props['class']) ? $props['class'] . ' ' : '') . 'uk-toolbar');
    return self::vnode('q-toolbar', $props, array_merge(array($brandNode, self::vnode('q-space')), $this->nodes($toolbar->children())));
  }

  public function layout(Layout $layout)
  {
    $slots = array('main' => $this->nodes($layout->children()));
    foreach (array('header', 'left', 'right', 'footer') as $name) {
      if ($layout->hasSlot($name)) {
        $slots[$name] = $this->nodes($layout->slot($name)->children());
      }
    }
    $props = array_merge(self::props($layout), array('leftWidth' => $layout->getLeftWidth(), 'rightWidth' => $layout->getRightWidth()));
    if ($layout->isLeftFloating()) {
      $props['leftFloating'] = true;
    }
    $vnode = self::vnode('uk-layout', $props);
    $vnode['s'] = $slots;
    return $vnode;
  }

  // --- Helpers -------------------------------------------------------------------

  /**
   * @return array
   */
  public static function vnode($type, array $props = array(), array $children = array())
  {
    $vnode = array('t' => $type);
    if ($props) {
      $vnode['p'] = $props;
    }
    if ($children) {
      $vnode['c'] = $children;
    }
    return $vnode;
  }

  /**
   * id, class, style and attributes of an element or component, as Vue props.
   *
   * @param Element|Component $node
   */
  public static function props($node)
  {
    $props = array();
    foreach ($node->getAttributes() as $name => $value) {
      $props[$name] = $value === true ? '' : $value;
    }
    if ($node->getClasses()) {
      $props['class'] = implode(' ', $node->getClasses());
    }
    $style = HtmlRenderer::styleText($node->getStyles());
    if ($style !== '') {
      $props['style'] = $style;
    }
    return $props;
  }

  /**
   * JSON that is safe inside a <script> block.
   */
  public static function json($value)
  {
    return json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP | JSON_INVALID_UTF8_SUBSTITUTE);
  }

  /**
   * @param MenuItem[] $items
   */
  private static function menuItems(array $items)
  {
    $list = array();
    foreach ($items as $item) {
      $list[] = self::compact(array(
        'label' => $item->label(),
        'href' => $item->href(),
        'icon' => $item->getIcon(),
        'badge' => $item->getBadge(),
        'active' => $item->isActive() ? true : null,
        'open' => $item->isGroup() && $item->containsActive() ? true : null,
        'items' => $item->isGroup() ? self::menuItems($item->children()) : null,
      ));
    }
    return $list;
  }

  private function stashHtml()
  {
    $html = '';
    foreach ($this->stash as $id => $content) {
      $html .= '<div id="' . $id . '" class="uk-raw-stash" hidden>' . $content . "</div>\n";
    }
    return $html;
  }

  private function bundleTag()
  {
    if ($this->assetsWritten || !$this->assets->enabled()) {
      return '';
    }
    $this->assetsWritten = true;
    return '<script src="' . HtmlRenderer::escape($this->assets->url('quasar/ui-kit-quasar.js')) . '"></script>' . "\n";
  }

  /**
   * The array without its null values.
   */
  private static function compact(array $values)
  {
    foreach ($values as $key => $value) {
      if ($value === null) {
        unset($values[$key]);
      }
    }
    return $values;
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
