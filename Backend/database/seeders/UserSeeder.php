<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // ADMIN
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@library.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);

        // LIBRARIAN
        User::create([
            'name' => 'Librarian User',
            'email' => 'librarian@library.com',
            'password' => Hash::make('password123'),
            'role' => 'librarian',
        ]);

        // BORROWER
        User::create([
            'name' => 'Borrower User',
            'email' => 'borrower@library.com',
            'password' => Hash::make('password123'),
            'role' => 'borrower',
        ]);
    }
}