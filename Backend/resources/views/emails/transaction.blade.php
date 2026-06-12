@php
    $book = $transaction->book;
    $user = $transaction->user;
    $messageLines = $messageLines ?? [];
@endphp

<p>Hello {{ $user->name ?? 'Borrower' }},</p>

@if (!empty($messageLines))
    @foreach ($messageLines as $line)
        <p>{{ $line }}</p>
    @endforeach
@elseif ($type === 'borrowed')
    <p>Your borrowing transaction for {{ $book->title ?? 'a catalog record' }} has been recorded.</p>
    <p>Due date: {{ $transaction->due_date ?? 'Not set' }}</p>
@elseif ($type === 'returned')
    <p>This confirms that {{ $book->title ?? 'your borrowed item' }} has been returned.</p>
@elseif ($type === 'due')
    <p>{{ $book->title ?? 'Your borrowed item' }} is due today.</p>
@else
    <p>{{ $book->title ?? 'Your borrowed item' }} is overdue. Please return it as soon as possible.</p>
@endif

<p>Thank you,<br>Library Management System</p>
