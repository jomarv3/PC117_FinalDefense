<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'phone')) {
                $table->string('phone')->nullable()->after('email');
            }
        });

        Schema::table('transactions', function (Blueprint $table) {
            if (!Schema::hasColumn('transactions', 'due_date')) {
                $table->date('due_date')->nullable()->after('borrow_date');
            }

            if (!Schema::hasColumn('transactions', 'due_notified_at')) {
                $table->timestamp('due_notified_at')->nullable()->after('status');
            }

            if (!Schema::hasColumn('transactions', 'overdue_notified_at')) {
                $table->timestamp('overdue_notified_at')->nullable()->after('due_notified_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            foreach (['due_date', 'due_notified_at', 'overdue_notified_at'] as $column) {
                if (Schema::hasColumn('transactions', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'phone')) {
                $table->dropColumn('phone');
            }
        });
    }
};
