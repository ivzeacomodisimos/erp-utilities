<?php

use App\Http\Controllers\AccessManagementController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GeneratedProgramWizardController;
use App\Http\Controllers\PortalController;
use App\Http\Controllers\SystemsManagementController;
use Illuminate\Support\Facades\Route;

Route::get('/login', [AuthController::class, 'form'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:corporate-login')->name('login.submit');
Route::get('/desarrollo/assets/{package}/quasar/{asset}', [PortalController::class, 'asset'])->name('development.assets');
Route::middleware(['erp.jwt', 'erp.menu'])->group(function (): void {
    Route::get('/administracion/asistente-programas', [GeneratedProgramWizardController::class, 'index'])->middleware('erp.permission:menu.manage')->name('access.generator.wizard');
    Route::post('/administracion/asistente-programas', [GeneratedProgramWizardController::class, 'run'])->middleware('erp.permission:menu.manage')->name('access.generator.wizard.run');
    Route::match(['GET', 'POST'], '/administracion/campos-programa', [AccessManagementController::class, 'index'])
        ->defaults('section', 'campos')->middleware('erp.permission:menu.manage')->name('access.generator.fields');
    Route::post('/administracion/programas/preparar', [AccessManagementController::class, 'prepareCrud'])
        ->middleware('erp.permission:menu.manage')->name('access.generator.prepare');
    Route::post('/administracion/programas/detectar', [AccessManagementController::class, 'discoverCrud'])
        ->middleware('erp.permission:menu.manage')->name('access.generator.discover');
    Route::match(['GET', 'POST'], '/administracion/programas', [AccessManagementController::class, 'index'])
        ->defaults('section', 'generador')->middleware('erp.permission:menu.manage')->name('access.generator');
    Route::match(['GET', 'POST'], '/administracion/registro-rutas', [AccessManagementController::class, 'index'])
        ->defaults('section', 'programas')->middleware('erp.permission:menu.manage')->name('access.programs');
    Route::match(['GET', 'POST'], '/administracion/rutas-menu', [AccessManagementController::class, 'index'])
        ->defaults('section', 'rutas')->middleware('erp.permission:menu.manage')->name('access.routes');
    foreach (array_keys(SystemsManagementController::TITLES) as $section) {
        Route::match(['GET', 'POST'], '/administracion/'.$section, [SystemsManagementController::class, 'index'])
            ->defaults('section', $section)->name('systems.'.$section);
    }
    Route::post('/administracion/objetos/ordenar', [SystemsManagementController::class, 'order'])
        ->middleware('erp.option:systems.objetos,menuaplic,objetos,7')->name('systems.order');
    Route::post('/administracion/menu/ordenar', [AccessManagementController::class, 'order'])
        ->middleware('erp.permission:menu.manage')->name('access.order');
    Route::get('/', [PortalController::class, 'home'])->name('dashboard');
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::post('/auth/refresh', [AuthController::class, 'refresh'])->name('auth.refresh');
    Route::get('/menu/{item}', [PortalController::class, 'option'])->whereNumber('item')->name('menu.option');
    Route::get('/menu/{item}/abrir', [PortalController::class, 'open'])->whereNumber('item')->name('menu.open');
    Route::get('/api/menu/{item}/permisos', [PortalController::class, 'permissions'])->whereNumber('item')->name('menu.permissions');
    Route::match(['GET', 'POST'], '/administracion/opciones', [AccessManagementController::class, 'index'])
        ->defaults('section', 'opciones')->middleware('erp.permission:option-permissions.manage')->name('access.options');
    Route::match(['GET', 'POST'], '/administracion/{section}', [AccessManagementController::class, 'index'])
        ->whereIn('section', ['menu', 'permisos', 'usuarios'])->name('access.manage');
});
