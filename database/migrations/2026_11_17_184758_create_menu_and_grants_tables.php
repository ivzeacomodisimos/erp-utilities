<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->unsignedInteger('legacy_user_id')->nullable()->unique();
            $table->unsignedInteger('access_revision')->default(1);
        });
        Schema::create('menu_items', function (Blueprint $table): void {
            $table->id();
            $table->unsignedInteger('legacy_id')->nullable()->unique();
            $table->unsignedBigInteger('parent_id')->default(50)->index();
            $table->string('label', 200);
            $table->text('legacy_url');
            $table->string('sort_order', 200)->default('');
            $table->boolean('active')->default(true);
            $table->boolean('is_public')->default(false);
            $table->text('description')->nullable();
            $table->unsignedInteger('revision')->default(1);
            $table->timestamps();
        });
        Schema::create('menu_grants', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('menu_item_id')->constrained('menu_items')->cascadeOnDelete();
            foreach (['view', 'create', 'update', 'delete', 'approve'] as $operation) {
                $table->boolean('can_'.$operation)->default(false);
            }
            $table->boolean('imported')->default(false);
            $table->unsignedInteger('revision')->default(1);
            $table->timestamps();
            $table->unique(['user_id', 'menu_item_id']);
        });
        Schema::create('legacy_import_runs', function (Blueprint $table): void {
            $table->id();
            $table->json('summary');
            $table->timestamp('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('legacy_import_runs');
        Schema::dropIfExists('menu_grants');
        Schema::dropIfExists('menu_items');
        Schema::table('users', fn (Blueprint $table) => $table->dropColumn(['legacy_user_id', 'access_revision']));
    }
};
