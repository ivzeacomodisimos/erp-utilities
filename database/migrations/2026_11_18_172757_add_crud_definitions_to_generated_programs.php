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
            $table->string('program_type', 10)->default('page');
            $table->string('table_mode', 10)->nullable();
            $table->string('table_name', 63)->nullable()->unique();
            $table->boolean('crud_ready')->default(false);
            $table->boolean('crud_building')->default(false);
            $table->string('crud_schema_hash', 64)->nullable();
        });
        Schema::create('generated_program_fields', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('program_id')->constrained('generated_programs')->restrictOnDelete();
            $table->string('column_name', 63);
            $table->string('label', 100);
            $table->string('field_type', 15);
            $table->boolean('required')->default(false);
            $table->unsignedInteger('max_length')->default(150);
            $table->unsignedInteger('position')->default(0);
            $table->unsignedInteger('revision')->default(1);
            $table->timestamps();
            $table->unique(['program_id', 'column_name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('generated_program_fields');
        Schema::table('generated_programs', function (Blueprint $table): void {
            $table->dropUnique(['table_name']);
            $table->dropColumn(['program_type', 'table_mode', 'table_name', 'crud_ready', 'crud_building', 'crud_schema_hash']);
        });
    }
};
