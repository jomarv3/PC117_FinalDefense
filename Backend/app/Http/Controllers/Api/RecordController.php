<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Transaction;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ToArray;
use Maatwebsite\Excel\Facades\Excel;

class RecordController extends Controller
{
    public function export(string $type)
    {
        $rows = match ($type) {
            'users' => $this->userRows(),
            'books' => $this->bookRows(),
            'transactions' => $this->transactionRows(),
            default => abort(404),
        };

        return Excel::download(new class($rows) implements FromArray {
            public function __construct(private array $rows) {}

            public function array(): array
            {
                return $this->rows;
            }
        }, "{$type}-records.xlsx");
    }

    public function import(Request $request, string $type)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv'
        ]);

        $import = new class implements ToArray {
            private array $rows = [];

            public function array(array $array): void
            {
                $this->rows = $array;
            }

            public function rows(): array
            {
                return $this->rows;
            }
        };
        Excel::import($import, $request->file('file'));

        $rows = $import->rows();
        $header = array_map(fn ($value) => strtolower(trim((string) $value)), array_shift($rows) ?? []);

        foreach ($rows as $row) {
            $data = array_combine($header, $row);

            if ($type === 'books') {
                $this->importBook($data);
            } elseif ($type === 'users') {
                $this->importUser($data);
            } elseif ($type === 'transactions') {
                $this->importTransaction($data);
            } else {
                abort(404);
            }
        }

        return response()->json(['message' => ucfirst($type) . ' records imported successfully.']);
    }

    public function report(string $type)
    {
        $data = match ($type) {
            'users' => ['title' => 'Member Account Report', 'headers' => ['ID', 'Name', 'Email Address', 'Phone Number', 'System Role'], 'rows' => array_slice($this->userRows(), 1)],
            'books' => ['title' => 'Catalog Inventory Report', 'headers' => ['ID', 'Book Title', 'Author', 'Category', 'Library Ref. No.', 'ISBN', 'Total Copies'], 'rows' => array_slice($this->bookRows(), 1)],
            'transactions' => ['title' => 'Borrowing Transaction Report', 'headers' => ['ID', 'Member', 'Book Title', 'Library Ref. No.', 'Borrow Date', 'Due Date', 'Return Date', 'Status'], 'rows' => array_slice($this->transactionRows(), 1)],
            default => abort(404),
        };

        return Pdf::loadView('reports.table', $data)->stream("{$type}-report.pdf");
    }

    public function receipt(int $id)
    {
        $transaction = Transaction::with(['user', 'book'])->findOrFail($id);

        return Pdf::loadView('reports.receipt', [
            'transaction' => $transaction
        ])->stream("transaction-{$id}-receipt.pdf");
    }

    private function userRows(): array
    {
        $rows = [['ID', 'Name', 'Email Address', 'Phone Number', 'System Role']];

        User::latest()->get()->each(function ($user) use (&$rows) {
            $rows[] = [$user->id, $user->name, $user->email, $user->phone, $user->role];
        });

        return $rows;
    }

    private function bookRows(): array
    {
        $rows = [['ID', 'Book Title', 'Author', 'Category', 'Library Ref. No.', 'ISBN', 'Total Copies']];

        Book::latest()->get()->each(function ($book) use (&$rows) {
            $rows[] = [$book->id, $book->title, $book->author, $book->category, $book->isbn, $book->book_isbn, $book->quantity];
        });

        return $rows;
    }

    private function transactionRows(): array
    {
        $rows = [['ID', 'Member', 'Book Title', 'Library Ref. No.', 'Borrow Date', 'Due Date', 'Return Date', 'Status']];

        Transaction::with(['user', 'book'])->latest()->get()->each(function ($transaction) use (&$rows) {
            $rows[] = [
                $transaction->id,
                $transaction->user?->name,
                $transaction->book?->title,
                $transaction->book?->isbn,
                $transaction->borrow_date,
                $transaction->due_date,
                $transaction->return_date,
                str($transaction->status)->replace('_', ' ')->title()->toString(),
            ];
        });

        return $rows;
    }

    private function importBook(array $data): void
    {
        if (empty($data['title'])) {
            return;
        }

        Book::updateOrCreate(
            ['isbn' => $data['isbn'] ?? 'LIB-' . now()->format('Ymd') . '-' . random_int(100000, 999999)],
            [
                'title' => $data['title'],
                'author' => $data['author'] ?? '',
                'category' => $data['category'] ?? null,
                'book_isbn' => $data['book_isbn'] ?? null,
                'quantity' => $data['quantity'] ?? 1,
            ]
        );
    }

    private function importUser(array $data): void
    {
        if (empty($data['email'])) {
            return;
        }

        User::updateOrCreate(
            ['email' => $data['email']],
            [
                'name' => $data['name'] ?? 'Borrower',
                'phone' => $data['phone'] ?? null,
                'role' => $data['role'] ?? 'borrower',
                'password' => Hash::make($data['password'] ?? 'password123'),
            ]
        );
    }

    private function importTransaction(array $data): void
    {
        if (empty($data['user_id']) || empty($data['book_id'])) {
            return;
        }

        Transaction::create([
            'user_id' => $data['user_id'],
            'book_id' => $data['book_id'],
            'borrow_date' => $data['borrow_date'] ?? now(),
            'due_date' => $data['due_date'] ?? now()->addDays(7),
            'return_date' => $data['return_date'] ?? null,
            'status' => $data['status'] ?? 'borrowed',
        ]);
    }
}
