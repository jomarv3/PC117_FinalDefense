<?php

namespace App\Console\Commands;

use App\Models\Transaction;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

#[Signature('app:check-overdue')]
#[Description('Check due and overdue borrowed books')]
class CheckOverdue extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        Transaction::whereNull('due_date')
            ->whereNotNull('borrow_date')
            ->update([
                'due_date' => DB::raw('DATE_ADD(borrow_date, INTERVAL 7 DAY)')
            ]);

        $dueTransactions = Transaction::with(['user', 'book'])
            ->where('status', 'borrowed')
            ->whereDate('due_date', now())
            ->whereNull('due_notified_at')
            ->get();

        foreach ($dueTransactions as $transaction) {
            $this->notify($transaction, 'due');
            $transaction->update(['due_notified_at' => now()]);
        }

        $overdueTransactions = Transaction::with(['user', 'book'])
            ->whereIn('status', ['borrowed', 'overdue'])
            ->whereDate('due_date', '<', now())
            ->whereNull('overdue_notified_at')
            ->get();

        foreach ($overdueTransactions as $transaction) {
            $transaction->update(['status' => 'overdue']);
            $this->notify($transaction, 'overdue');
            $transaction->update(['overdue_notified_at' => now()]);
        }

        $this->info('Due and overdue books checked.');
    }

    private function notify(Transaction $transaction, string $type): void
    {
        try {
            if ($transaction->user?->email) {
                Mail::send('emails.transaction', [
                    'transaction' => $transaction,
                    'type' => $type,
                ], function ($message) use ($transaction, $type) {
                    $message
                        ->to($transaction->user->email)
                        ->subject($this->mailSubject($type));
                });
            }
        } catch (\Throwable $e) {
            report($e);
        }

        $message = $type === 'due'
            ? "{$transaction->book?->title} is due today."
            : "{$transaction->book?->title} is overdue.";

        $this->sendSms($transaction->user?->phone, $message);
    }

    private function sendSms(?string $phone, string $message): void
    {
        if (!$phone) {
            return;
        }

        Log::info('SMS notification', [
            'to' => $phone,
            'message' => $message,
        ]);
    }

    private function mailSubject(string $type): string
    {
        return match ($type) {
            'returned' => 'Book Return Confirmation',
            'due' => 'Borrowed Book Due Today',
            'overdue' => 'Overdue Borrowed Book Notice',
            default => 'Borrowing Transaction Confirmation',
        };
    }
}
