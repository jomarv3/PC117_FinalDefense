<?php

use App\Models\Book;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

beforeEach(function () {
    Config::set('services.mobile.api_key', 'test-mobile-key');
});

function mobileHeaders(): array
{
    return [
        'Accept' => 'application/json',
        'x-api-key' => 'test-mobile-key',
    ];
}

function createRoleUser(string $role, array $overrides = []): User
{
    return User::create(array_merge([
        'name' => ucfirst($role) . ' User',
        'email' => $role . '@example.com',
        'password' => Hash::make('password123'),
        'role' => $role,
    ], $overrides));
}

it('rejects requests without an api key', function () {
    $response = $this->getJson('/api/mobile/me');

    $response->assertStatus(401)
        ->assertJson([
            'message' => 'Invalid mobile API key.',
        ]);
});

it('rejects requests with the wrong api key', function () {
    $admin = createRoleUser('admin');

    $response = $this->withHeader('x-api-key', 'wrong-key')
        ->actingAs($admin, 'sanctum')
        ->getJson('/api/mobile/me');

    $response->assertStatus(401)
        ->assertJson([
            'message' => 'Invalid mobile API key.',
        ]);
});

it('allows mobile login with a valid api key', function () {
    createRoleUser('borrower', [
        'email' => 'borrower@library.com',
    ]);

    $response = $this->withHeaders(mobileHeaders())
        ->postJson('/api/mobile/login', [
            'email' => 'borrower@library.com',
            'password' => 'password123',
        ]);

    $response->assertOk()
        ->assertJsonStructure([
            'user',
            'token',
            'expires_at',
            'role',
            'role_label',
            'mobile_features',
        ])
        ->assertJson([
            'role' => 'borrower',
            'role_label' => 'User',
        ]);
});

it('creates a borrower account through mobile register', function () {
    $response = $this->withHeaders(mobileHeaders())
        ->postJson('/api/mobile/register', [
            'name' => 'New Borrower',
            'email' => 'new.borrower@example.com',
            'password' => 'password123',
        ]);

    $response->assertCreated()
        ->assertJson([
            'message' => 'Borrower account created successfully.',
            'role' => 'borrower',
            'role_label' => 'User',
        ]);

    $this->assertDatabaseHas('users', [
        'email' => 'new.borrower@example.com',
        'role' => 'borrower',
    ]);
});

it('rejects protected mobile routes without a bearer token', function () {
    $response = $this->withHeaders(mobileHeaders())
        ->getJson('/api/mobile/me');

    $response->assertUnauthorized();
});

it('returns the current user profile for mobile me', function () {
    $borrower = createRoleUser('borrower', [
        'email' => 'borrower@library.com',
    ]);

    $response = $this->withHeaders(mobileHeaders())
        ->actingAs($borrower, 'sanctum')
        ->getJson('/api/mobile/me');

    $response->assertOk()
        ->assertJson([
            'role' => 'borrower',
            'role_label' => 'User',
        ])
        ->assertJsonStructure([
            'user',
            'role',
            'role_label',
            'mobile_features',
        ]);
});

it('returns book details for a valid qr code', function () {
    $admin = createRoleUser('admin');
    $book = Book::create([
        'title' => 'Clean Code',
        'author' => 'Robert C. Martin',
        'category' => 'Programming',
        'isbn' => 'LIB-20260516-100001',
        'book_isbn' => '9780132350884',
        'quantity' => 3,
        'image' => null,
    ]);

    Transaction::create([
        'user_id' => $admin->id,
        'book_id' => $book->id,
        'borrow_date' => now()->subDays(1),
        'due_date' => now()->addDays(6),
        'status' => 'borrowed',
    ]);

    $response = $this->withHeaders(mobileHeaders())
        ->actingAs($admin, 'sanctum')
        ->getJson('/api/mobile/books/lookup?code=' . urlencode($book->isbn));

    $response->assertOk()
        ->assertJson([
            'id' => $book->id,
            'library_reference' => $book->isbn,
            'isbn' => $book->book_isbn,
            'status' => 'available',
        ])
        ->assertJsonStructure([
            'id',
            'title',
            'author',
            'category',
            'library_reference',
            'isbn',
            'book_isbn',
            'quantity',
            'available_quantity',
            'status',
            'image_url',
            'qr_url',
            'recent_transactions',
        ]);
});

it('returns 422 when qr code lookup code is missing', function () {
    $admin = createRoleUser('admin');

    $response = $this->withHeaders(mobileHeaders())
        ->actingAs($admin, 'sanctum')
        ->getJson('/api/mobile/books/lookup');

    $response->assertStatus(422);
});

it('returns 404 when qr code does not match a book', function () {
    $admin = createRoleUser('admin');

    $response = $this->withHeaders(mobileHeaders())
        ->actingAs($admin, 'sanctum')
        ->getJson('/api/mobile/books/lookup?code=UNKNOWN-CODE');

    $response->assertStatus(404)
        ->assertJson([
            'message' => 'Book not found for this QR code.',
        ]);
});

it('hides recent transactions from borrower qr lookups', function () {
    $borrower = createRoleUser('borrower');
    $book = Book::create([
        'title' => 'The Pragmatic Programmer',
        'author' => 'Andrew Hunt',
        'category' => 'Software Engineering',
        'isbn' => 'LIB-20260516-100002',
        'book_isbn' => '9780201616224',
        'quantity' => 2,
        'image' => null,
    ]);

    $response = $this->withHeaders(mobileHeaders())
        ->actingAs($borrower, 'sanctum')
        ->getJson('/api/mobile/books/lookup?code=' . urlencode($book->isbn));

    $response->assertOk()
        ->assertJsonMissingPath('recent_transactions');
});
