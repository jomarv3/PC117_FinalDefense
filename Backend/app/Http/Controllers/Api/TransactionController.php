<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Transaction;
use App\Services\TransactionNotificationService;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function __construct(private TransactionNotificationService $notifications)
    {
    }

    public function borrow(Request $request)
    {
        $data = $request->validate([
            'user_id' => 'required|exists:users,id',
            'book_id' => 'required|exists:books,id',
        ]);

        $book = Book::findOrFail($data['book_id']);

        if ($book->available_quantity < 1) {
            return response()->json([
                'message' => 'This catalog record has no available copies.'
            ], 422);
        }

        $alreadyBorrowed = Transaction::where('user_id', $data['user_id'])
            ->where('book_id', $data['book_id'])
            ->where('status', 'borrowed')
            ->exists();

        if ($alreadyBorrowed) {
            return response()->json([
                'message' => 'This borrower already has an active borrowing transaction for this catalog record.'
            ], 422);
        }

        $transaction = Transaction::create([
            'user_id' => $data['user_id'],
            'book_id' => $data['book_id'],
            'borrow_date' => now(),
            'due_date' => now()->addDays(7),
            'status' => 'borrowed'
        ]);

        $transaction->load(['user', 'book']);
        $this->notifications->send($transaction, 'borrowed');

        return response()->json($transaction->load(['user', 'book']));
    }

    public function store(Request $request)
    {
        return $this->borrow($request);
    }

    public function returnBook($id)
    {
        $t = Transaction::findOrFail($id);

        if ($t->status === 'returned') {
            return response()->json([
                'message' => 'This borrowing transaction has already been marked as returned.'
            ], 422);
        }

        $t->update([
            'return_date' => now(),
            'status' => 'returned'
        ]);

        $this->notifications->send($t->load(['user', 'book']), 'returned');

        return response()->json($t->load(['user', 'book']));
    }

    public function index()
    {
        return Transaction::with(['user','book'])->latest()->get();
    }

    public function destroy($id)
    {
        $transaction = Transaction::findOrFail($id);
        $transaction->delete();

        return response()->json([
            'message' => 'Borrowing transaction deleted successfully.'
        ]);
    }

}   
