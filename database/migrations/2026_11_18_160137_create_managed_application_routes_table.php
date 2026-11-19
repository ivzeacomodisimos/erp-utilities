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
        Schema::create('managed_application_routes', function (Blueprint $table): void {
            $table->id();
            $table->string('label', 200);
            $table->string('name', 200)->unique();
            $table->string('uri', 200);
            $table->string('http_method', 10)->default('GET');
            $table->string('program', 250);
            $table->json('program_parameters')->nullable();
            $table->boolean('active')->default(false);
            $table->unsignedInteger('revision')->default(1);
            $table->unique(['uri', 'http_method']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('managed_application_routes');
    }
};
