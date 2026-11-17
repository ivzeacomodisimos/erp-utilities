<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('option_grants', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('module', 60);
            $table->string('file', 60)->default('');
            $table->unsignedInteger('option_id');
            foreach (['read', 'insert', 'write', 'delete'] as $operation) {
                $table->boolean('can_'.$operation)->default(false);
            }
            $table->boolean('imported')->default(false);
            $table->unsignedInteger('revision')->default(1);
            $table->timestamps();
            $table->unique(['user_id', 'module', 'file', 'option_id'], 'option_grants_identity_unique');
        });
        Schema::create('option_permission_import_runs', function (Blueprint $table): void {
            $table->id();
            $table->json('summary');
            $table->timestamp('created_at');
        });
    }
    public function down(): void {
        Schema::dropIfExists('option_permission_import_runs');
        Schema::dropIfExists('option_grants');
    }
};
