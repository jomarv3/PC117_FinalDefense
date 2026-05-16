<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Transaction;
use Illuminate\Http\Request;

class MobileBookController extends Controller
{
    public function lookup(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        $code = trim((string) $request->query('code', ''));

        if ($code === '') {
            return response()->json([
                'message' => 'The code field is required.',
            ], 422);
        }

        $book = Book::where('isbn', $code)->first();

        if (!$book) {
            return response()->json([
                'message' => 'Book not found for this QR code.',
            ], 404);
        }

        $payload = $this->bookPayload($book);
        $user = $request->user();

        if ($user && in_array($user->role, ['admin', 'librarian'], true)) {
            $payload['recent_transactions'] = $this->recentTransactions($book->id);
        }

        return response()->json($payload);
    }

    private function bookPayload(Book $book): array
    {
        return [
            'id' => $book->id,
            'title' => $book->title,
            'author' => $book->author,
            'category' => $book->category,
            'library_reference' => $book->isbn,
            'isbn' => $book->book_isbn,
            'book_isbn' => $book->book_isbn,
            'quantity' => $book->quantity,
            'available_quantity' => $book->available_quantity,
            'status' => $book->status,
            'image_url' => $book->image_url,
            'qr_url' => $book->qr_url,
        ];
    }

    private function recentTransactions(int $bookId): array
    {
        return Transaction::with(['user'])
            ->where('book_id', $bookId)
            ->latest()
            ->limit(5)
            ->get()
            ->map(function (Transaction $transaction) {
                return [
                    'id' => $transaction->id,
                    'borrower_name' => $transaction->user?->name,
                    'borrow_date' => $transaction->borrow_date,
                    'due_date' => $transaction->due_date,
                    'return_date' => $transaction->return_date,
                    'status' => $transaction->status,
                ];
            })
            ->values()
            ->all();
    }
}
