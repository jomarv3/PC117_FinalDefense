<?php

use App\Models\Book;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

afterEach(function () {
    File::delete(public_path('storage/qrcodes/qr_900001.svg'));
    File::delete(public_path('storage/qrcodes/qr_900002.svg'));
});

it('lets staff generate a qr code for an existing catalog record', function () {
    $admin = User::create([
        'name' => 'Admin User',
        'email' => 'admin@example.com',
        'password' => Hash::make('password123'),
        'role' => 'admin',
    ]);

    $book = new Book();
    $book->forceFill([
        'id' => 900001,
        'title' => 'Clean Code',
        'author' => 'Robert C. Martin',
        'category' => 'Programming',
        'isbn' => 'LIB-TEST-900001',
        'book_isbn' => '9780132350884',
        'quantity' => 3,
        'image' => null,
        'qr_code' => null,
    ])->save();

    $response = $this->actingAs($admin, 'sanctum')
        ->postJson("/api/books/{$book->id}/qr-code");

    $response->assertOk()
        ->assertJson([
            'message' => 'QR code generated successfully.',
        ])
        ->assertJsonPath('book.qr_code', 'qrcodes/qr_900001.svg');

    $this->assertDatabaseHas('books', [
        'id' => $book->id,
        'qr_code' => 'qrcodes/qr_900001.svg',
    ]);

    expect(File::exists(public_path('storage/qrcodes/qr_900001.svg')))->toBeTrue();
});

it('does not let borrowers generate catalog qr codes', function () {
    $borrower = User::create([
        'name' => 'Borrower User',
        'email' => 'borrower@example.com',
        'password' => Hash::make('password123'),
        'role' => 'borrower',
    ]);

    $book = new Book();
    $book->forceFill([
        'id' => 900002,
        'title' => 'The Pragmatic Programmer',
        'author' => 'Andrew Hunt',
        'category' => 'Software Engineering',
        'isbn' => 'LIB-TEST-900002',
        'book_isbn' => '9780201616224',
        'quantity' => 2,
        'image' => null,
        'qr_code' => null,
    ])->save();

    $response = $this->actingAs($borrower, 'sanctum')
        ->postJson("/api/books/{$book->id}/qr-code");

    $response->assertForbidden();

    $this->assertDatabaseHas('books', [
        'id' => $book->id,
        'qr_code' => null,
    ]);

    expect(File::exists(public_path('storage/qrcodes/qr_900002.svg')))->toBeFalse();
});
