<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $table = 'transactions';

    protected $fillable = [
        'user_id',
        'book_id',
        'borrow_date',
        'due_date',
        'return_date',
        'status',
        'due_notified_at',
        'overdue_notified_at',
    ];


public function user() {
    return $this->belongsTo(User::class);
}

public function book() {
    return $this->belongsTo(Book::class);
}

   
}
