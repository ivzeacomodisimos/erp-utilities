<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->name('api.')->group(function (): void {
    Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:corporate-login')->name('login');
    Route::middleware(['erp.jwt:api', 'erp.menu'])->group(function (): void {
        Route::get('/me', [AuthController::class, 'me'])->name('me');
        Route::post('/auth/refresh', [AuthController::class, 'refresh'])->name('refresh');
        Route::post('/auth/logout', [AuthController::class, 'logout'])->name('logout');
    });
});
