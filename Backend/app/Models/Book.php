<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    use HasFactory;

    protected $table = 'books';

    protected $fillable = [
        'title',
        'author',
        'category',
        'isbn',
        'book_isbn',
        'quantity',
        'image',
        'qr_code'
    ];

    protected $appends = ['image_url', 'qr_url', 'status', 'available_quantity'];

    public function getImageUrlAttribute()
    {
        return $this->image
            ? asset('storage/' . preg_replace('/^storage\//', '', $this->image))
            : null;
    }

    public function getQrUrlAttribute()
    {
        return $this->qr_code
            ? asset('storage/' . $this->qr_code)
            : null;
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function getStatusAttribute()
    {
        return $this->available_quantity > 0 ? 'available' : 'unavailable';
    }

    public function getAvailableQuantityAttribute()
    {
        $borrowedCount = $this->transactions()
            ->where('status', 'borrowed')
            ->count();

        return max(0, $this->quantity - $borrowedCount);
    }
}
