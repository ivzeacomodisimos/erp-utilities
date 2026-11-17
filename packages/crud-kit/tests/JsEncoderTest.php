<?php

namespace Ivandzb\CrudKit\Tests;

use Ivandzb\CrudKit\Render\JsEncoder;
use Ivandzb\CrudKit\Render\JsFunction;

final class JsEncoderTest extends TestCase
{
  public function testFunctionsAreWrittenAsCode()
  {
    $js = JsEncoder::encode(array('display' => new JsFunction('function (data) { return data.record.x; }')));
    $this->assertContains('"display": function (data) { return data.record.x; }', $js);
  }

  public function testFunctionsInsideObjects()
  {
    // The children map is a stdClass: a child's display function must stay code, not "{}".
    $js = JsEncoder::encode(array('children' => (object) array('trips' => array('display' => new JsFunction('function () { return 1; }')))));
    $this->assertContains('"display": function () { return 1; }', $js);
    $this->assertNotContains('"display": {}', $js);
  }

  public function testStringsAreEscaped()
  {
    $js = JsEncoder::encode(array('title' => "D'Angelo \"x\"\n</script><b>"));
    $this->assertNotContains('</script>', $js);
    $this->assertNotContains('<b>', $js);
    $this->assertSame(array('title' => "D'Angelo \"x\"\n</script><b>"), json_decode($js, true));
  }

  public function testBodyHelper()
  {
    $this->assertSame("function (a, b) {\nreturn a + b;\n}", JsFunction::body('a', 'b', 'return a + b;')->code());
  }
}
