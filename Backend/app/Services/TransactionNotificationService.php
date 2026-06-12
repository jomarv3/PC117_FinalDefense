<?php

namespace App\Services;

use App\Models\Transaction;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use RuntimeException;

class TransactionNotificationService
{
    public function send(Transaction $transaction, string $type): void
    {
        $transaction->loadMissing(['user', 'book']);

        $this->sendEmail($transaction, $type);
        $this->sendSms($transaction, $type);
    }

    private function sendEmail(Transaction $transaction, string $type): void
    {
        try {
            if ($transaction->user?->email) {
                Mail::send('emails.transaction', [
                    'transaction' => $transaction,
                    'type' => $type,
                    'messageLines' => $this->messageLines($transaction, $type),
                ], function ($message) use ($transaction, $type) {
                    $message
                        ->to($transaction->user->email)
                        ->subject($this->subject($type));
                });
            }
        } catch (\Throwable $e) {
            report($e);
        }
    }

    private function sendSms(Transaction $transaction, string $type): void
    {
        $phone = $transaction->user?->phone;

        if (!$phone) {
            return;
        }

        $accountSid = config('services.twilio.account_sid');
        $authToken = config('services.twilio.auth_token');
        $from = config('services.twilio.from');

        if (!$accountSid || !$authToken || !$from) {
            Log::warning('SMS notification skipped because Twilio is not configured.', [
                'to' => $phone,
                'type' => $type,
            ]);

            return;
        }

        try {
            $response = Http::asForm()
                ->withBasicAuth($accountSid, $authToken)
                ->post("https://api.twilio.com/2010-04-01/Accounts/{$accountSid}/Messages.json", [
                    'From' => $from,
                    'To' => $phone,
                    'Body' => $this->smsBody($transaction, $type),
                ]);

            if ($response->failed()) {
                throw new RuntimeException("Twilio SMS failed with status {$response->status()}: {$response->body()}");
            }

            Log::info('Twilio SMS sent.', [
                'to' => $phone,
                'type' => $type,
                'sid' => $response->json('sid'),
            ]);
        } catch (\Throwable $e) {
            report($e);
        }
    }

    private function smsBody(Transaction $transaction, string $type): string
    {
        $name = $transaction->user?->name ?? 'Borrower';
        $lines = implode("\n", $this->messageLines($transaction, $type));

        return "Hello {$name},\n\n{$lines}\n\nThank you,\nLibrary Management System";
    }

    private function messageLines(Transaction $transaction, string $type): array
    {
        $bookTitle = $transaction->book?->title ?? match ($type) {
            'borrowed' => 'a catalog record',
            default => 'your borrowed item',
        };

        return match ($type) {
            'borrowed' => [
                "Your borrowing transaction for {$bookTitle} has been recorded.",
                'Due date: ' . ($transaction->due_date ?? 'Not set'),
            ],
            'returned' => [
                "This confirms that {$bookTitle} has been returned.",
            ],
            'due' => [
                "{$bookTitle} is due today.",
            ],
            'overdue' => [
                "{$bookTitle} is overdue. Please return it as soon as possible.",
            ],
            default => [
                "Your borrowing transaction for {$bookTitle} has been recorded.",
            ],
        };
    }

    private function subject(string $type): string
    {
        return match ($type) {
            'returned' => 'Book Return Confirmation',
            'due' => 'Borrowed Book Due Today',
            'overdue' => 'Overdue Borrowed Book Notice',
            default => 'Borrowing Transaction Confirmation',
        };
    }
}
