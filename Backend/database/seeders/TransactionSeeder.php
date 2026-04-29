<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Book;

class TransactionSeeder extends Seeder
{
    public function run(): void
    {
        $borrower = User::where('role', 'borrower')->first();
        $books = Book::all();

        if (!$borrower || $books->count() === 0) return;

        Transaction::insert([
            [
                'user_id' => $borrower->id,
                'book_id' => $books[0]->id,
                'type' => 'borrow',
                'status' => 'returned',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $borrower->id,
                'book_id' => $books[1]->id,
                'type' => 'borrow',
                'status' => 'borrowed',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}