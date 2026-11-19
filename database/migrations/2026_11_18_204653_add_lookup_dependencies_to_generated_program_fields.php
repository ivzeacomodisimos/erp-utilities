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
        Schema::table('generated_program_fields', function (Blueprint $table): void {
            $table->string('depends_on', 63)->nullable();
            $table->string('related_filter', 63)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('generated_program_fields', function (Blueprint $table): void {
            $table->dropColumn(['depends_on', 'related_filter']);
        });
    }
};
