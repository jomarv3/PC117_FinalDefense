@php
    $book = $transaction->book;
    $user = $transaction->user;
@endphp

<p>Hello {{ $user->name ?? 'Borrower' }},</p>

@if ($type === 'borrowed')
    <p>Your borrowing transaction for <strong>{{ $book->title ?? 'a catalog record' }}</strong> has been recorded.</p>
    <p>Due date: {{ $transaction->due_date ?? 'Not set' }}</p>
@elseif ($type === 'returned')
    <p>This confirms that <strong>{{ $book->title ?? 'your borrowed item' }}</strong> has been returned.</p>
@elseif ($type === 'due')
    <p><strong>{{ $book->title ?? 'Your borrowed item' }}</strong> is due today.</p>
@else
    <p><strong>{{ $book->title ?? 'Your borrowed item' }}</strong> is overdue. Please return it as soon as possible.</p>
@endif

<p>Thank you,<br>Library Management System</p>
