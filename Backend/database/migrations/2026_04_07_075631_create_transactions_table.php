<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
{
    Schema::create('transactions', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->foreignId('book_id')->constrained()->onDelete('cascade');
        $table->date('borrow_date');
        $table->date('return_date')->nullable();
        $table->string('status')->default('borrowed');
        $table->timestamps();
    });
}
    public function user(){
    return $this->belongsTo(User::class);
}

public function book(){
    return $this->belongsTo(Book::class);
}

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};