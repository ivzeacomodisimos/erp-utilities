<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('generated_programs', function (Blueprint $table): void {
            $table->string('table_connection', 100)->default('');
            $table->string('table_name', 191)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('generated_programs', function (Blueprint $table): void {
            $table->dropColumn('table_connection');
        });
    }
};
