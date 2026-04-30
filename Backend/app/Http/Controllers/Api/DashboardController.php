<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Transaction;
use App\Models\User;

class DashboardController extends Controller
{
    public function index()
    {
        $user = request()->user();

        return response()->json([
            'message' => 'Library dashboard loaded successfully.',
            'role' => $user->role,
            'allowed_pages' => $this->allowedPages($user->role),
        ]);
    }

    public function summary()
    {
        $user = request()->user();
        $transactions = Transaction::with(['user', 'book'])
            ->when($user->role === 'borrower', fn ($query) => $query->where('user_id', $user->id));

        return response()->json([
            'stats' => $this->stats($user->role, clone $transactions),
            'recent_transactions' => $transactions
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn ($transaction) => [
                    'member' => $transaction->user?->name,
                    'book' => $transaction->book?->title,
                    'reference' => $transaction->book?->isbn,
                    'borrow_date' => $transaction->borrow_date,
                    'due_date' => $transaction->due_date,
                    'status' => $transaction->status,
                ]),
        ]);
    }

    private function stats(string $role, $transactions): array
    {
        if ($role === 'borrower') {
            return [
                ['label' => 'Available Catalog Records', 'value' => Book::where('quantity', '>', 0)->count()],
                ['label' => 'My Active Borrowings', 'value' => (clone $transactions)->where('status', 'borrowed')->count()],
                ['label' => 'My Overdue Books', 'value' => (clone $transactions)->where('status', 'overdue')->count()],
            ];
        }

        return [
            ['label' => 'Registered Members', 'value' => User::count()],
            ['label' => 'Catalog Records', 'value' => Book::count()],
            ['label' => 'Borrowed Books', 'value' => (clone $transactions)->where('status', 'borrowed')->count()],
            ['label' => 'Overdue Books', 'value' => (clone $transactions)->where('status', 'overdue')->count()],
        ];
    }

    private function allowedPages(string $role): array
    {
        return match ($role) {
            'admin' => ['dashboard', 'users', 'books', 'transactions'],
            'librarian' => ['dashboard', 'books', 'transactions'],
            'borrower' => ['dashboard', 'books'],
            default => [],
        };
    }
}
