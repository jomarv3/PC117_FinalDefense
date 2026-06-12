<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    public function index()
    {
        return response()->json(User::latest()->get());
    }

    public function borrowers()
    {
        return response()->json(
            User::where('role', 'borrower')->latest()->get()
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'phone' => 'nullable',
            'password' => 'required|min:6',
            'role' => 'required',
            'profile_image' => 'nullable|image|mimes:jpg,jpeg,png'
        ]);

        $path = null;

        if ($request->hasFile('profile_image')) {
            $path = $request->file('profile_image')->store('users', 'public');
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'profile_image' => $path
        ]);

        $user->sendEmailVerificationNotification();

        return response()->json([
            'message' => 'Member account created successfully. A verification email has been sent.',
            'user' => $user
        ]);
    }

    public function show($id)
    {
        return response()->json(User::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $emailChanged = $request->filled('email') && $request->email !== $user->email;

        $request->validate([
            'name' => 'nullable',
            'email' => "nullable|email|unique:users,email,$id",
            'phone' => 'nullable',
            'password' => 'nullable|min:6',
            'role' => 'nullable',
            'profile_image' => 'nullable|image|mimes:jpg,jpeg,png'
        ]);

        if ($request->hasFile('profile_image')) {
            if ($user->profile_image) {
                Storage::disk('public')->delete($user->profile_image);
            }

            $user->profile_image = $request->file('profile_image')->store('users', 'public');
        }

        $user->update([
            'name' => $request->name ?? $user->name,
            'email' => $request->email ?? $user->email,
            'phone' => $request->phone ?? $user->phone,
            'role' => $request->role ?? $user->role,
            'password' => $request->password
                ? Hash::make($request->password)
                : $user->password,
            'email_verified_at' => $emailChanged ? null : $user->email_verified_at,
            'profile_image' => $user->profile_image
        ]);

        if ($emailChanged) {
            $user->sendEmailVerificationNotification();
        }

        return response()->json([
            'message' => $emailChanged
                ? 'Member account updated successfully. A verification email has been sent to the new address.'
                : 'Member account updated successfully.',
            'user' => $user
        ]);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);

        if ($user->profile_image) {
            Storage::disk('public')->delete($user->profile_image);
        }

        $user->delete();

        return response()->json([
            'message' => 'Member account deleted successfully.'
        ]);
    }
}
