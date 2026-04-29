<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class BookSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('books')->insert([
            [
                'title' => 'Clean Code',
                'author' => 'Robert C. Martin',
                'isbn' => '9780132350884',
                'quantity' => 5,
                'image' => null,
                'qr_code' => null,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'title' => 'Laravel Up & Running',
                'author' => 'Matt Stauffer',
                'isbn' => '9781492041214',
                'quantity' => 3,
                'image' => null,
                'qr_code' => null,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'title' => 'The Pragmatic Programmer',
                'author' => 'Andrew Hunt',
                'isbn' => '9780201616224',
                'quantity' => 4,
                'image' => null,
                'qr_code' => null,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ]);
    }
}