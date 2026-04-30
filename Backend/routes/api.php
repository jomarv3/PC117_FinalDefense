<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\BookController;
use App\Http\Controllers\API\TransactionController;
use App\Http\Controllers\API\DashboardController;
use App\Http\Controllers\API\RecordController;


Route::post('/login', [AuthController::class, 'login'])->middleware('cache.headers')->name('login');
Route::post('/register', [AuthController::class, 'register'])->middleware('cache.headers');



Route::middleware(['auth:sanctum', 'cache.headers'])->group(function(){
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/dashboard/summary', [DashboardController::class, 'summary']);
    Route::get('/books', [BookController::class, 'index']);
    Route::get('/books/{id}', [BookController::class, 'show']);

    Route::middleware('role:admin')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::get('/users/{id}', [UserController::class, 'show']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);
    });

    // BOOKS
    Route::middleware('role:admin,librarian')->group(function () {
        Route::get('/export/{type}', [RecordController::class, 'export']);
        Route::post('/import/{type}', [RecordController::class, 'import']);
        Route::get('/reports/{type}', [RecordController::class, 'report']);
        Route::get('/transactions/{id}/receipt', [RecordController::class, 'receipt']);

        Route::get('/borrowers', [UserController::class, 'borrowers']);
        Route::get('/categories', [BookController::class, 'categories']);
        Route::post('/categories', [BookController::class, 'storeCategory']);
        Route::post('/books', [BookController::class, 'store']);
        Route::put('/books/{id}', [BookController::class, 'update']);
        Route::delete('/books/{id}', [BookController::class, 'destroy']);

        // TRANSACTIONS
        Route::post('/borrow',[TransactionController::class,'borrow']);
        Route::post('/return/{id}',[TransactionController::class,'returnBook']);
        Route::get('/transactions',[TransactionController::class,'index']);
        Route::post('/transactions', [TransactionController::class, 'store']);
        Route::delete('/transactions/{id}', [TransactionController::class, 'destroy']);
    });
});
