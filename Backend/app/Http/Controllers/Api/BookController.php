<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class BookController extends Controller
{
    public function index()
    {
        if (request()->user()?->role === 'borrower') {
            return response()->json(Book::latest()->get());
        }

        return response()->json(Book::with(['transactions.user'])->latest()->get());
    }

    public function categories()
    {
        $savedCategories = DB::table('categories')
            ->pluck('name');

        $bookCategories = Book::whereNotNull('category')
            ->where('category', '!=', '')
            ->pluck('category');

        return response()->json(
            $savedCategories
                ->merge($bookCategories)
                ->unique()
                ->sort()
                ->values()
        );
    }

    public function storeCategory(Request $request)
    {
        $request->validate([
            'name' => 'required|unique:categories,name'
        ]);

        DB::table('categories')->insert([
            'name' => $request->name,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'message' => 'Catalog category saved successfully.'
        ]);
    }

    public function store(Request $request)
{
    $request->validate([
        'title' => 'required',
        'author' => 'required',
        'category' => 'nullable',
        'isbn' => 'required|unique:books,isbn',
        'book_isbn' => 'nullable|digits_between:1,13',
        'quantity' => 'required|integer',
        'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
    ]);

    $imagePath = null;

    if ($request->hasFile('image')) {
        $file = $request->file('image');
        $filename = time() . '_' . $file->getClientOriginalName();

        $file->storeAs('books', $filename, 'public');

        $imagePath = 'books/' . $filename;
    }

    $book = Book::create([
        'title' => $request->title,
        'author' => $request->author,
        'category' => $request->category,
        'isbn' => $request->isbn,
        'book_isbn' => $request->book_isbn,
        'quantity' => $request->quantity,
        'image' => $imagePath,
    ]);

    $this->generateQr($book);

    return response()->json([
        'message' => 'Catalog record created successfully.',
        'book' => $book->fresh()
    ]);
}

    public function show($id)
    {
        $book = Book::find($id);

        if (!$book) {
            return response()->json(['message' => 'Catalog record not found.'], 404);
        }

        if (request()->user()?->role === 'borrower') {
            return response()->json($book);
        }

        return response()->json($book->load(['transactions.user']));
    }

    public function update(Request $request, $id)
    {
        try {
            $book = Book::find($id);

            if (!$book) {
                return response()->json(['message' => 'Catalog record not found.'], 404);
            }

            $request->validate([
                'title' => 'required',
                'author' => 'required',
                'category' => 'nullable',
                'isbn' => "required|unique:books,isbn,$id",
                'book_isbn' => 'nullable|digits_between:1,13',
                'quantity' => 'required|integer',
                'image' => 'nullable|image'
            ]);

            $imagePath = $book->image;

            if ($request->hasFile('image')) {
                if ($book->image) {
                    Storage::disk('public')->delete($book->image);
                }

                $imagePath = $request->file('image')->store('books', 'public');
            }

            $book->update([
                'title' => $request->title,
                'author' => $request->author,
                'category' => $request->category,
                'isbn' => $request->isbn,
                'book_isbn' => $request->book_isbn,
                'quantity' => $request->quantity,
                'image' => $imagePath
            ]);

            $this->generateQr($book);

            return response()->json($book);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Catalog record update failed.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        $book = Book::find($id);

        if (!$book) {
            return response()->json(['message' => 'Catalog record not found.'], 404);
        }

        if ($book->image) {
            Storage::disk('public')->delete($book->image);
        }

        if ($book->qr_code) {
            File::delete(public_path('storage/' . $book->qr_code));
        }

        $book->delete();

        return response()->json(['message' => 'Catalog record deleted successfully.']);
    }

    private function generateQr(Book $book)
    {
        try {
            $qrName = 'qr_' . $book->id . '.svg';
            $folder = public_path('storage/qrcodes');

            if (!File::exists($folder)) {
                File::makeDirectory($folder, 0755, true);
            }

            $qrFullPath = $folder . '/' . $qrName;

            $qr = QrCode::format('svg')
                ->size(200)
                ->generate($book->isbn);

            File::put($qrFullPath, $qr);

            $book->updateQuietly([
                'qr_code' => 'qrcodes/' . $qrName
            ]);

        } catch (\Exception $e) {
            // prevent crash if QR fails
        }
    }
}
