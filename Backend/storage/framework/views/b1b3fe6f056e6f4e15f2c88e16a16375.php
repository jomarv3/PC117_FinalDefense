<?php
    $book = $transaction->book;
    $user = $transaction->user;
?>

<p>Hello <?php echo e($user->name ?? 'Borrower'); ?>,</p>

<?php if($type === 'borrowed'): ?>
    <p>Your borrowing transaction for <strong><?php echo e($book->title ?? 'a catalog record'); ?></strong> has been recorded.</p>
    <p>Due date: <?php echo e($transaction->due_date ?? 'Not set'); ?></p>
<?php elseif($type === 'returned'): ?>
    <p>This confirms that <strong><?php echo e($book->title ?? 'your borrowed item'); ?></strong> has been returned.</p>
<?php elseif($type === 'due'): ?>
    <p><strong><?php echo e($book->title ?? 'Your borrowed item'); ?></strong> is due today.</p>
<?php else: ?>
    <p><strong><?php echo e($book->title ?? 'Your borrowed item'); ?></strong> is overdue. Please return it as soon as possible.</p>
<?php endif; ?>

<p>Thank you,<br>Library Management System</p>
<?php /**PATH C:\Users\ordnr\Herd\library-management\Backend\resources\views/emails/transaction.blade.php ENDPATH**/ ?>