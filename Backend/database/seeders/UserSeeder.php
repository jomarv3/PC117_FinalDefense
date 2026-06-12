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
            'email_verified_at' => now(),
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);

        // LIBRARIAN
        User::create([
            'name' => 'Librarian User',
            'email' => 'librarian@library.com',
            'email_verified_at' => now(),
            'password' => Hash::make('password123'),
            'role' => 'librarian',
        ]);

        // BORROWER
        User::create([
            'name' => 'Borrower User',
            'email' => 'borrower@library.com',
            'email_verified_at' => now(),
            'phone' => '+639854520196',
            'password' => Hash::make('password123'),
            'role' => 'borrower',
        ]);
    }
}
