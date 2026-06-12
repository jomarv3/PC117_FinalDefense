<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;

class EmailVerificationController extends Controller
{
    public function verify(Request $request, string $id, string $hash)
    {
        $user = User::findOrFail($id);

        if (!hash_equals($hash, sha1($user->getEmailForVerification()))) {
            abort(403, 'Invalid verification link.');
        }

        $alreadyVerified = $user->hasVerifiedEmail();

        if (!$alreadyVerified && $user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return response()->view('auth.email-verified', [
            'alreadyVerified' => $alreadyVerified,
        ]);
    }
}
