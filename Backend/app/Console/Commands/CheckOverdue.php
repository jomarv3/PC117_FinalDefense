<?php

namespace App\Console\Commands;

use App\Models\Transaction;
use App\Services\TransactionNotificationService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

#[Signature('app:check-overdue')]
#[Description('Check due and overdue borrowed books')]
class CheckOverdue extends Command
{
    public function __construct(private TransactionNotificationService $notifications)
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        Transaction::whereNull('due_date')
            ->whereNotNull('borrow_date')
            ->each(function (Transaction $transaction) {
                $transaction->update([
                    'due_date' => Carbon::parse($transaction->borrow_date)->addDays(7)->toDateString(),
                ]);
            });

        $dueTransactions = Transaction::with(['user', 'book'])
            ->where('status', 'borrowed')
            ->whereDate('due_date', now())
            ->whereNull('due_notified_at')
            ->get();

        foreach ($dueTransactions as $transaction) {
            $this->notifications->send($transaction, 'due');
            $transaction->update(['due_notified_at' => now()]);
        }

        $overdueTransactions = Transaction::with(['user', 'book'])
            ->whereIn('status', ['borrowed', 'overdue'])
            ->whereDate('due_date', '<', now())
            ->whereNull('overdue_notified_at')
            ->get();

        foreach ($overdueTransactions as $transaction) {
            $transaction->update(['status' => 'overdue']);
            $this->notifications->send($transaction, 'overdue');
            $transaction->update(['overdue_notified_at' => now()]);
        }

        $this->info('Due and overdue books checked.');
    }
}
