<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class BookController extends Controller
{
    public function index()
    {
        return response()->json(Book::latest()->get());
    }

    public function store(Request $request)
{
    $request->validate([
        'title' => 'required',
        'author' => 'required',
        'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
    ]);

    $imagePath = null;

    if ($request->hasFile('image')) {
        $file = $request->file('image');
        $filename = time() . '_' . $file->getClientOriginalName();

        $file->storeAs('public/books', $filename);

        $imagePath = 'storage/books/' . $filename;
    }

    $book = Book::create([
        'title' => $request->title,
        'author' => $request->author,
        'image' => $imagePath,
    ]);

    return response()->json([
        'message' => 'Book created successfully',
        'book' => $book
    ]);
}

    public function show($id)
    {
        $book = Book::find($id);

        if (!$book) {
            return response()->json(['message' => 'Book not found'], 404);
        }

        return response()->json($book);
    }

    public function update(Request $request, $id)
    {
        try {
            $book = Book::find($id);

            if (!$book) {
                return response()->json(['message' => 'Book not found'], 404);
            }

            $request->validate([
                'title' => 'required',
                'author' => 'required',
                'isbn' => "required|unique:books,isbn,$id",
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
                'isbn' => $request->isbn,
                'quantity' => $request->quantity,
                'image' => $imagePath
            ]);

            $this->generateQr($book);

            return response()->json($book);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Update failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        $book = Book::find($id);

        if (!$book) {
            return response()->json(['message' => 'Book not found'], 404);
        }

        if ($book->image) {
            Storage::disk('public')->delete($book->image);
        }

        if ($book->qr_code) {
            File::delete(public_path('storage/' . $book->qr_code));
        }

        $book->delete();

        return response()->json(['message' => 'Book deleted successfully']);
    }

    private function generateQr(Book $book)
    {
        try {
            $qrName = 'qr_' . $book->id . '.png';
            $folder = public_path('storage/qrcodes');

            if (!File::exists($folder)) {
                File::makeDirectory($folder, 0755, true);
            }

            $qrFullPath = $folder . '/' . $qrName;

            QrCode::format('png')
                ->size(200)
                ->generate($book->isbn, $qrFullPath);

            $book->updateQuietly([
                'qr_code' => 'qrcodes/' . $qrName
            ]);

        } catch (\Exception $e) {
            // prevent crash if QR fails
        }
    }
}