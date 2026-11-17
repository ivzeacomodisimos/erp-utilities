<?php

use App\Http\Controllers\AccessManagementController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PortalController;
use Illuminate\Support\Facades\Route;

Route::get('/login', [AuthController::class, 'form'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:corporate-login')->name('login.submit');
Route::get('/desarrollo/assets/{package}/quasar/{asset}', [PortalController::class, 'asset'])->name('development.assets');
Route::middleware(['erp.jwt', 'erp.menu'])->group(function (): void {
    Route::get('/', [PortalController::class, 'home'])->name('dashboard');
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::post('/auth/refresh', [AuthController::class, 'refresh'])->name('auth.refresh');
    Route::get('/menu/{item}', [PortalController::class, 'option'])->whereNumber('item')->name('menu.option');
    Route::get('/menu/{item}/abrir', [PortalController::class, 'open'])->whereNumber('item')->name('menu.open');
    Route::get('/api/menu/{item}/permisos', [PortalController::class, 'permissions'])->whereNumber('item')->name('menu.permissions');
    Route::match(['GET', 'POST'], '/administracion/opciones', [AccessManagementController::class, 'index'])
        ->defaults('section', 'opciones')->middleware('erp.permission:option-permissions.manage')->name('access.options');
    Route::match(['GET', 'POST'], '/administracion/{section}', [AccessManagementController::class, 'index'])
        ->whereIn('section', ['menu', 'permisos', 'usuarios'])->middleware('erp.permission:menu.manage')->name('access.manage');
});
