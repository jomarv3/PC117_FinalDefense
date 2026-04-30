<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class BookSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('categories')->insertOrIgnore([
            ['name' => 'Programming', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['name' => 'Web Development', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['name' => 'Software Engineering', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
        ]);

        DB::table('books')->insert([
            [
                'title' => 'Clean Code',
                'author' => 'Robert C. Martin',
                'category' => 'Programming',
                'isbn' => 'LIB-20260429-100001',
                'book_isbn' => '9780132350884',
                'quantity' => 5,
                'image' => null,
                'qr_code' => null,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'title' => 'Laravel Up & Running',
                'author' => 'Matt Stauffer',
                'category' => 'Web Development',
                'isbn' => 'LIB-20260429-100002',
                'book_isbn' => '9781492041214',
                'quantity' => 3,
                'image' => null,
                'qr_code' => null,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'title' => 'The Pragmatic Programmer',
                'author' => 'Andrew Hunt',
                'category' => 'Software Engineering',
                'isbn' => 'LIB-20260429-100003',
                'book_isbn' => '9780201616224',
                'quantity' => 4,
                'image' => null,
                'qr_code' => null,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ]);
    }
}
