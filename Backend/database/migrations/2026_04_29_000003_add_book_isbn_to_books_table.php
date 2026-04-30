<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('books', 'book_isbn')) {
            return;
        }

        Schema::table('books', function (Blueprint $table) {
            $table->string('book_isbn')->nullable()->after('isbn');
        });
    }

    public function down(): void
    {
        if (!Schema::hasColumn('books', 'book_isbn')) {
            return;
        }

        Schema::table('books', function (Blueprint $table) {
            $table->dropColumn('book_isbn');
        });
    }
};
