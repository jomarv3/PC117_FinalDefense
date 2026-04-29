<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function borrow(Request $request)
    {
        return Transaction::create([
            'user_id'=>$request->user_id,
            'book_id'=>$request->book_id,
            'borrow_date'=>now(),
            'status'=>'borrowed'
        ]);
    }

    public function returnBook($id)
    {
        $t = Transaction::findOrFail($id);
        $t->update([
            'return_date'=>now(),
            'status'=>'returned'
        ]);

        return $t;
    }

    public function index()
    {
        return Transaction::with(['user','book'])->get();
    }
}   