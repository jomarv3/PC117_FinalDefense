<?php

use App\Models\Book;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Carbon;

uses(RefreshDatabase::class);

afterEach(function () {
    Carbon::setTestNow();
});

function configureTwilioSms(): void
{
    Config::set('services.twilio.account_sid', 'AC123456789');
    Config::set('services.twilio.auth_token', 'test-auth-token');
    Config::set('services.twilio.from', '+15551234567');

    Http::fake([
        'api.twilio.com/*' => Http::response(['sid' => 'SM123456789'], 201),
    ]);
}

function notificationUser(string $role, array $overrides = []): User
{
    return User::create(array_merge([
        'name' => ucfirst($role) . ' User',
        'email' => $role . '.notification@example.com',
        'email_verified_at' => now(),
        'phone' => '+15557654321',
        'password' => Hash::make('password123'),
        'role' => $role,
    ], $overrides));
}

function notificationBook(array $overrides = []): Book
{
    return Book::create(array_merge([
        'title' => 'Clean Code',
        'author' => 'Robert C. Martin',
        'category' => 'Programming',
        'isbn' => 'LIB-20260530-100001',
        'book_isbn' => '9780132350884',
        'quantity' => 1,
    ], $overrides));
}

it('sends borrowed SMS notifications through Twilio when configured', function () {
    Carbon::setTestNow(Carbon::parse('2026-05-30 10:00:00'));
    Mail::fake();
    configureTwilioSms();

    $admin = notificationUser('admin', [
        'phone' => null,
    ]);
    $borrower = notificationUser('borrower');
    $book = notificationBook();

    $this->actingAs($admin, 'sanctum')
        ->postJson('/api/borrow', [
            'user_id' => $borrower->id,
            'book_id' => $book->id,
        ])
        ->assertOk();

    Http::assertSent(fn ($request) => $request->url() === 'https://api.twilio.com/2010-04-01/Accounts/AC123456789/Messages.json'
        && $request['From'] === '+15551234567'
        && $request['To'] === '+15557654321'
        && $request['Body'] === "Hello Borrower User,\n\nYour borrowing transaction for Clean Code has been recorded.\nDue date: 2026-06-06 10:00:00\n\nThank you,\nLibrary Management System");
});

it('sends returned SMS notifications through Twilio when configured', function () {
    Mail::fake();
    configureTwilioSms();

    $admin = notificationUser('admin', [
        'phone' => null,
    ]);
    $borrower = notificationUser('borrower');
    $book = notificationBook();
    $transaction = Transaction::create([
        'user_id' => $borrower->id,
        'book_id' => $book->id,
        'borrow_date' => now()->subDay()->toDateString(),
        'due_date' => now()->addDays(6)->toDateString(),
        'status' => 'borrowed',
    ]);

    $this->actingAs($admin, 'sanctum')
        ->postJson("/api/return/{$transaction->id}")
        ->assertOk();

    Http::assertSent(fn ($request) => $request->url() === 'https://api.twilio.com/2010-04-01/Accounts/AC123456789/Messages.json'
        && $request['From'] === '+15551234567'
        && $request['To'] === '+15557654321'
        && $request['Body'] === "Hello Borrower User,\n\nThis confirms that Clean Code has been returned.\n\nThank you,\nLibrary Management System");
});

it('sends due SMS notifications through Twilio when configured', function () {
    Mail::fake();
    configureTwilioSms();

    $user = notificationUser('borrower');
    $book = notificationBook();

    Transaction::create([
        'user_id' => $user->id,
        'book_id' => $book->id,
        'borrow_date' => now()->subDays(7)->toDateString(),
        'due_date' => now()->toDateString(),
        'status' => 'borrowed',
    ]);

    $this->artisan('app:check-overdue')
        ->expectsOutput('Due and overdue books checked.')
        ->assertExitCode(0);

    Http::assertSent(fn ($request) => $request->url() === 'https://api.twilio.com/2010-04-01/Accounts/AC123456789/Messages.json'
        && $request['From'] === '+15551234567'
        && $request['To'] === '+15557654321'
        && $request['Body'] === "Hello Borrower User,\n\nClean Code is due today.\n\nThank you,\nLibrary Management System");

    expect(Transaction::first()->fresh()->due_notified_at)->not->toBeNull();
});

it('sends overdue SMS notifications through Twilio when configured', function () {
    Mail::fake();
    configureTwilioSms();

    $user = notificationUser('borrower');
    $book = notificationBook();

    Transaction::create([
        'user_id' => $user->id,
        'book_id' => $book->id,
        'borrow_date' => now()->subDays(8)->toDateString(),
        'due_date' => now()->subDay()->toDateString(),
        'status' => 'borrowed',
    ]);

    $this->artisan('app:check-overdue')
        ->expectsOutput('Due and overdue books checked.')
        ->assertExitCode(0);

    Http::assertSent(fn ($request) => $request->url() === 'https://api.twilio.com/2010-04-01/Accounts/AC123456789/Messages.json'
        && $request['From'] === '+15551234567'
        && $request['To'] === '+15557654321'
        && $request['Body'] === "Hello Borrower User,\n\nClean Code is overdue. Please return it as soon as possible.\n\nThank you,\nLibrary Management System");

    expect(Transaction::first()->fresh()->status)->toBe('overdue');
});
