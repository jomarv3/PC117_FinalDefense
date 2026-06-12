<?php
    $book = $transaction->book;
    $user = $transaction->user;
    $messageLines = $messageLines ?? [];
?>

<p>Hello <?php echo e($user->name ?? 'Borrower'); ?>,</p>

<?php if(!empty($messageLines)): ?>
    <?php $__currentLoopData = $messageLines; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $line): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
        <p><?php echo e($line); ?></p>
    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
<?php elseif($type === 'borrowed'): ?>
    <p>Your borrowing transaction for <?php echo e($book->title ?? 'a catalog record'); ?> has been recorded.</p>
    <p>Due date: <?php echo e($transaction->due_date ?? 'Not set'); ?></p>
<?php elseif($type === 'returned'): ?>
    <p>This confirms that <?php echo e($book->title ?? 'your borrowed item'); ?> has been returned.</p>
<?php elseif($type === 'due'): ?>
    <p><?php echo e($book->title ?? 'Your borrowed item'); ?> is due today.</p>
<?php else: ?>
    <p><?php echo e($book->title ?? 'Your borrowed item'); ?> is overdue. Please return it as soon as possible.</p>
<?php endif; ?>

<p>Thank you,<br>Library Management System</p>
<?php /**PATH C:\Users\jomar_gl4ale8\Herd\library-management\Backend\resources\views/emails/transaction.blade.php ENDPATH**/ ?>