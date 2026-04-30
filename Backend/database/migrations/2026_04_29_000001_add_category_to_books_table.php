<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('books', 'category')) {
            return;
        }

        Schema::table('books', function (Blueprint $table) {
            $table->string('category')->nullable()->after('author');
        });
    }

    public function down(): void
    {
        if (!Schema::hasColumn('books', 'category')) {
            return;
        }

        Schema::table('books', function (Blueprint $table) {
            $table->dropColumn('category');
        });
    }
};
