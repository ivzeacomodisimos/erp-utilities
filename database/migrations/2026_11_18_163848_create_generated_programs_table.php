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
        Schema::create('generated_programs', function (Blueprint $table): void {
            $table->id();
            $table->string('controller_name', 100)->unique();
            $table->string('controller_key', 100)->unique();
            $table->string('title', 200);
            $table->text('content');
            $table->boolean('active')->default(false);
            $table->unsignedInteger('revision')->default(1);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('generated_programs');
    }
};
