<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class MobileAuthController extends Controller
{
    private const SESSION_HOURS = 8;

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'The email address or password is incorrect.',
            ], 401);
        }

        if (!$user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Please verify your email address before signing in.',
            ], 403);
        }

        $expiresAt = now()->addHours(self::SESSION_HOURS);

        return response()->json([
            'user' => $this->userPayload($user),
            'token' => $user->createToken('mobile_auth_token', ['*'], $expiresAt)->plainTextToken,
            'expires_at' => $expiresAt->toISOString(),
            'role' => $user->role,
            'role_label' => $this->roleLabel($user->role),
            'mobile_features' => $this->mobileFeatures($user->role),
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'borrower',
        ]);

        $user->sendEmailVerificationNotification();

        return response()->json([
            'message' => 'Borrower account created successfully. Please check your email to verify your account before signing in.',
            'user' => $this->userPayload($user),
            'role' => $user->role,
            'role_label' => $this->roleLabel($user->role),
        ], 201);
    }

    public function logout(Request $request)
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Signed out successfully.',
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'user' => $this->userPayload($user),
            'role' => $user->role,
            'role_label' => $this->roleLabel($user->role),
            'mobile_features' => $this->mobileFeatures($user->role),
        ]);
    }

    private function userPayload(User $user): array
    {
        return $user->toArray();
    }

    private function roleLabel(string $role): string
    {
        return match ($role) {
            'admin' => 'Admin',
            'librarian' => 'Librarian',
            default => 'User',
        };
    }

    private function mobileFeatures(string $role): array
    {
        $features = [
            'scan_books',
            'view_book_details',
        ];

        if (in_array($role, ['admin', 'librarian'], true)) {
            $features[] = 'view_borrowing_history';
        }

        return $features;
    }
}
