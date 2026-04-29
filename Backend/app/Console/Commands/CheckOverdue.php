<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:check-overdue')]
#[Description('Command description')]
class CheckOverdue extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        Transaction::where('status','borrowed')
->whereDate('borrow_date','<=',now()->subDays(7))
->update(['status'=>'overdue']);
    }

    
}
