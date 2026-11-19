<?php

namespace App\Support\Ui;

use Illuminate\Support\Str;
use Ivandzb\CrudKit\Definition\Crud;

class CrudLabels
{
    public static function apply(Crud $crud, string $singular, string $plural, bool $feminine = false): Crud
    {
        return $crud->messages([
            'addNewRecord' => 'Adicionar '.($feminine ? 'nueva ' : 'nuevo ').$singular,
            'editRecord' => 'Editar '.$singular,
            'save' => 'Grabar '.$singular,
            'saving' => 'Grabando '.$singular.'...',
            'deleteText' => 'Eliminar '.$singular,
            'deleting' => 'Eliminando '.$singular.'...',
            'areYouSure' => 'Confirmar eliminación de '.$singular,
            'deleteConfirmation' => 'Se eliminará '.($feminine ? 'la ' : 'el ').$singular.'. ¿Desea continuar?',
            'loadingMessage' => 'Cargando '.$plural.'...',
            'noDataAvailable' => 'No hay '.$plural.' para mostrar.',
            'pageSizeChangeLabel' => Str::ucfirst($plural).' por página',
            'pagingInfo' => Str::ucfirst($plural).' {0} a {1} de {2}',
            'canNotDeletedRecords' => 'No fue posible eliminar {0} de {1} '.$plural.'.',
            'deleteProggress' => 'Eliminando {0} de {1} '.$plural.'...',
        ])->texts([
            'deleteSelected' => 'Eliminar '.$plural.($feminine ? ' seleccionadas' : ' seleccionados'),
            'deleteSelectedConfirm' => 'Se eliminarán {count} '.$plural.'. ¿Desea continuar?',
            'noneSelected' => 'Seleccione al menos '.($feminine ? 'una ' : 'un ').$singular.'.',
            'validationFailed' => 'Revise los campos '.($feminine ? 'de la ' : 'del ').$singular.'.',
            'operationNotAllowed' => 'No tiene permitido {operation} '.$plural.'.',
            'duplicateKey' => 'Ya existe '.($feminine ? 'una ' : 'un ').$singular.' con esa clave.',
            'recordInUse' => 'No se puede eliminar '.($feminine ? 'la ' : 'el ').$singular.': tiene información relacionada.',
        ]);
    }
}
