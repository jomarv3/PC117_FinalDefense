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
    <div class="line"><span class="label">Transaction ID:</span> <?php echo e($transaction->id); ?></div>
    <div class="line"><span class="label">Member:</span> <?php echo e($transaction->user?->name); ?></div>
    <div class="line"><span class="label">Book Title:</span> <?php echo e($transaction->book?->title); ?></div>
    <div class="line"><span class="label">Library Ref. No.:</span> <?php echo e($transaction->book?->isbn); ?></div>
    <div class="line"><span class="label">Borrow Date:</span> <?php echo e($transaction->borrow_date); ?></div>
    <div class="line"><span class="label">Due Date:</span> <?php echo e($transaction->due_date); ?></div>
    <div class="line"><span class="label">Return Date:</span> <?php echo e($transaction->return_date ?? '-'); ?></div>
    <div class="line"><span class="label">Status:</span> <?php echo e($transaction->status); ?></div>
</body>
</html>
<?php /**PATH C:\Users\jomar_gl4ale8\Herd\library-management\Backend\resources\views/reports/receipt.blade.php ENDPATH**/ ?>