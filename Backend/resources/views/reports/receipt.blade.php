<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 13px; color: #111827; }
        h1 { font-size: 20px; margin-bottom: 12px; }
        .line { margin-bottom: 8px; }
        .label { font-weight: bold; display: inline-block; width: 130px; }
    </style>
</head>
<body>
    <h1>Borrowing Transaction Receipt</h1>
    <div class="line"><span class="label">Transaction ID:</span> {{ $transaction->id }}</div>
    <div class="line"><span class="label">Member:</span> {{ $transaction->user?->name }}</div>
    <div class="line"><span class="label">Book Title:</span> {{ $transaction->book?->title }}</div>
    <div class="line"><span class="label">Library Ref. No.:</span> {{ $transaction->book?->isbn }}</div>
    <div class="line"><span class="label">Borrow Date:</span> {{ $transaction->borrow_date }}</div>
    <div class="line"><span class="label">Due Date:</span> {{ $transaction->due_date }}</div>
    <div class="line"><span class="label">Return Date:</span> {{ $transaction->return_date ?? '-' }}</div>
    <div class="line"><span class="label">Status:</span> {{ $transaction->status }}</div>
</body>
</html>
