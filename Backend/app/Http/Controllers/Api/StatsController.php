<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;

class StatsController extends Controller
{
    public function index()
    {
        return [
            'users'=>User::count(),
            'books'=>0,
            'transactions'=>0
        ];
    }
}