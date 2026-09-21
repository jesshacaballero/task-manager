<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->renameColumn('title', 'task_name');
            $table->dropColumn('priority');
        });

        DB::table('tasks')->where('status', 'active')->update(['status' => 'Pending']);
        DB::table('tasks')->where('status', 'done')->update(['status' => 'Completed']);
    }

    public function down(): void
    {
        DB::table('tasks')->where('status', 'Pending')->update(['status' => 'active']);
        DB::table('tasks')->where('status', 'Completed')->update(['status' => 'done']);

        Schema::table('tasks', function (Blueprint $table) {
            $table->renameColumn('task_name', 'title');
            $table->string('priority', 10)->default('medium');
        });
    }
};