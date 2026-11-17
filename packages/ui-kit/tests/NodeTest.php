<?php

namespace Ivandzb\UiKit\Tests;

use InvalidArgumentException;
use Ivandzb\UiKit\Component\Card;
use Ivandzb\UiKit\Html;
use Ivandzb\UiKit\Node\Element;
use Ivandzb\UiKit\Node\Fragment;

final class LegacyBlock
{
  public $html = '';

  public function getHtml()
  {
    return $this->html;
  }
}

final class NodeTest extends TestCase
{
  public function testStringsAreTextAndAddHtmlIsTrusted()
  {
    $div = Html::div('<b>a</b>')->addHtml('<i>b</i>');
    $this->assertSame('<div>&lt;b&gt;a&lt;/b&gt;<i>b</i></div>', $div->getHtml());
  }

  public function testTreeLikeTheDom()
  {
    $inner = Html::span('x')->id('inner');
    $root = Html::div(Html::p(Html::strong($inner)));
    $this->assertSame($inner, $root->find('inner'));
    $this->assertSame(null, $root->find('missing'));

    $other = Html::div();
    $other->add($inner);
    $this->assertSame($other, $inner->parent(), 'adding a node elsewhere moves it, like the DOM');
    $this->assertSame(null, $root->find('inner'));

    $other->remove($inner);
    $this->assertTrue($other->isEmpty());
  }

  public function testFindLooksInsideComponentSlots()
  {
    $button = Html::button('Ver')->id('ver');
    $card = Card::make('Título')->actions($button);
    $this->assertSame($button, Html::div($card)->find('ver'));
  }

  public function testComponentsRenderTheSameEveryTime()
  {
    $card = Card::make('A')->add(Html::p('cuerpo'))->actions(Html::button('Ok'));
    $first = $card->getHtml();
    $this->assertContains('cuerpo', $first);
    $this->assertSame($first, $card->getHtml());
    $this->assertSame(1, count($card->children()), 'build() does not take the children away');
  }

  public function testLegacyObjectsAreReadWhenRendering()
  {
    $legacy = new LegacyBlock();
    $div = Html::div()->add($legacy);
    $legacy->html = '<td>filled later</td>';
    $this->assertSame('<div><td>filled later</td></div>', $div->getHtml());
  }

  public function testAttributesClassesAndStyles()
  {
    $a = Html::a('/x?a=1&b="2"', 'Ir')->addClass('one two')->addClass('two', 'three')->style('color', 'red')
      ->attr('target', '_blank')->attr('download')->data('id', 7);
    $this->assertSame('<a href="/x?a=1&amp;b=&quot;2&quot;" target="_blank" download data-id="7" class="one two three" style="color: red">Ir</a>', $a->getHtml());
    $a->removeClass('two')->attr('download', null);
    $this->assertNotContains('download', $a->getHtml());
    $this->assertSame(array('one', 'three'), $a->getClasses());
  }

  public function testStyleValuesCannotBreakOut()
  {
    $html = Html::div()->style('color', 'red; background: url(x)')->getHtml();
    $this->assertSame('<div style="color: red background: url(x)"></div>', $html);
  }

  public function testInvalidNamesAreRejected()
  {
    $this->assertThrows(InvalidArgumentException::class, function () {
      new Element('div onclick=x');
    });
    $this->assertThrows(InvalidArgumentException::class, function () {
      Html::div()->attr('a b', '1');
    });
    $this->assertThrows(InvalidArgumentException::class, function () {
      Html::br()->add('text');
    });
  }

  public function testShortcuts()
  {
    $this->assertSame('<table><thead><tr><th>A</th></tr></thead><tbody><tr><td>1</td></tr></tbody></table>', Html::table(array(array(1)), array('A'))->getHtml());
    $this->assertSame('<select name="s"><option value="1">Uno</option><option value="2" selected>Dos</option></select>', Html::select('s', array(1 => 'Uno', 2 => 'Dos'), 2)->getHtml());
    $this->assertSame('<ul><li>a</li><li>b</li></ul>', Html::ul(array('a', 'b'))->getHtml());
    $this->assertSame('<img src="l.png" alt="">', Html::img('l.png')->getHtml());
    $this->assertSame('ab', Fragment::of('a', 'b')->getHtml());
  }
}
