<?php

use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;

uses(RefreshDatabase::class);

beforeEach(function () {
    Config::set('services.mobile.api_key', 'test-mobile-key');
});

function unverifiedUser(array $overrides = []): User
{
    return User::create(array_merge([
        'name' => 'Unverified User',
        'email' => 'unverified@example.com',
        'email_verified_at' => null,
        'password' => Hash::make('password123'),
        'role' => 'borrower',
    ], $overrides));
}

it('sends a verification email when a web borrower account is created', function () {
    Notification::fake();

    $response = $this->postJson('/api/register', [
        'name' => 'New Borrower',
        'email' => 'new.borrower@example.com',
        'password' => 'password123',
    ]);

    $response->assertCreated()
        ->assertJson([
            'message' => 'Account created successfully. Please check your email to verify your account before signing in.',
        ]);

    $user = User::where('email', 'new.borrower@example.com')->firstOrFail();

    expect($user->email_verified_at)->toBeNull();
    Notification::assertSentTo($user, VerifyEmail::class);
});

it('sends a verification email when a mobile borrower account is created', function () {
    Notification::fake();

    $response = $this->withHeaders([
        'Accept' => 'application/json',
        'x-api-key' => 'test-mobile-key',
    ])->postJson('/api/mobile/register', [
        'name' => 'Mobile Borrower',
        'email' => 'mobile.borrower@example.com',
        'password' => 'password123',
    ]);

    $response->assertCreated()
        ->assertJson([
            'message' => 'Borrower account created successfully. Please check your email to verify your account before signing in.',
        ]);

    $user = User::where('email', 'mobile.borrower@example.com')->firstOrFail();

    expect($user->email_verified_at)->toBeNull();
    Notification::assertSentTo($user, VerifyEmail::class);
});

it('blocks login until the email address is verified', function () {
    unverifiedUser();

    $this->postJson('/api/login', [
        'email' => 'unverified@example.com',
        'password' => 'password123',
    ])->assertForbidden()
        ->assertJson([
            'message' => 'Please verify your email address before signing in.',
        ]);

    $this->withHeaders([
        'Accept' => 'application/json',
        'x-api-key' => 'test-mobile-key',
    ])->postJson('/api/mobile/login', [
        'email' => 'unverified@example.com',
        'password' => 'password123',
    ])->assertForbidden()
        ->assertJson([
            'message' => 'Please verify your email address before signing in.',
        ]);
});

it('marks an email address as verified from a signed verification link', function () {
    $user = unverifiedUser();

    $url = URL::temporarySignedRoute('verification.verify', now()->addMinutes(60), [
        'id' => $user->id,
        'hash' => sha1($user->email),
    ]);

    $this->get($url)
        ->assertOk()
        ->assertSee('Email verified');

    expect($user->fresh()->hasVerifiedEmail())->toBeTrue();
});
