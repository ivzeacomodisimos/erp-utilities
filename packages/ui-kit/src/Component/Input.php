<?php

namespace Ivandzb\UiKit\Component;

use Ivandzb\UiKit\Html;

/** Labeled form field, rendered as a Quasar field or an accessible native input. */
class Input extends Component
{
    private $name;
    private $label;
    private $type;
    private $value = '';
    private $hint = '';

    public function __construct($name, $label, $type = 'text')
    {
        if (!in_array($type, array('text', 'file'), true)) {
            throw new \InvalidArgumentException('Unsupported input type.');
        }
        $this->name = (string) $name;
        $this->label = (string) $label;
        $this->type = $type;
    }

    public static function text($name, $label)
    {
        return new static($name, $label);
    }
    public static function file($name, $label)
    {
        return new static($name, $label, 'file');
    }
    public function value($value)
    {
        $this->value = (string) $value;
        return $this;
    }
    public function hint($hint)
    {
        $this->hint = (string) $hint;
        return $this;
    }
    public function name()
    {
        return $this->name;
    }
    public function label()
    {
        return $this->label;
    }
    public function type()
    {
        return $this->type;
    }
    public function getValue()
    {
        return $this->value;
    }
    public function getHint()
    {
        return $this->hint;
    }

    public function build()
    {
        $attributes = $this->getAttributes();
        $id = $this->getId() ?: 'uk-input-' . $this->name;
        $attributes['id'] = $id;
        $input = Html::input($this->type, $this->name, $this->type === 'file' ? null : $this->value)
            ->attrs($attributes)->addClass('uk-input-control');
        return Html::div(
            Html::label($this->label, $id),
            $input,
            $this->hint !== '' ? Html::element('small', $this->hint) : null
        )
            ->addClass('uk-input', ...$this->getClasses())->style($this->getStyles());
    }
}
