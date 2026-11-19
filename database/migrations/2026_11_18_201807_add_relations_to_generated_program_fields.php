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
            $table->foreignId('related_program_id')->nullable()->constrained('generated_programs')->restrictOnDelete();
            $table->foreignId('related_menu_id')->nullable()->constrained('menu_items')->restrictOnDelete();
            $table->string('related_label', 63)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('generated_program_fields', function (Blueprint $table): void {
            $table->dropForeign(['related_program_id']);
            $table->dropForeign(['related_menu_id']);
            $table->dropColumn(['related_program_id', 'related_menu_id', 'related_label']);
        });
    }
};
