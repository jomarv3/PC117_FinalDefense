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
        'isbn',
        'quantity',
        'image',
        'qr_code'
    ];


    protected $appends = ['image_url'];

public function getImageUrlAttribute()
{
    return $this->image 
        ? asset('storage/' . $this->image) 
        : null;
}

public function borrows()
{
    return $this->hasMany(Borrow::class);
}
}