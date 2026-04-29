<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\BookController;
use App\Http\Controllers\API\TransactionController;
use App\Http\Controllers\API\DashboardController;


Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/register', [AuthController::class, 'register']);



Route::middleware('auth:sanctum')->group(function(){
    
    

    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/dashboard/summary', [DashboardController::class, 'summary']);

    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);

    // BOOKS
    
    Route::get('/books', [BookController::class, 'index']);
    Route::post('/books', [BookController::class, 'store']);
    Route::get('/books/{id}', [BookController::class, 'show']);
    Route::put('/books/{id}', [BookController::class, 'update']);
    Route::delete('/books/{id}', [BookController::class, 'destroy']);

    // TRANSACTIONS
    Route::post('/borrow',[TransactionController::class,'borrow']);
    Route::post('/return/{id}',[TransactionController::class,'returnBook']);
    Route::get('/transactions',[TransactionController::class,'index']);
    Route::post('/transactions', [TransactionController::class, 'store']);

    
});