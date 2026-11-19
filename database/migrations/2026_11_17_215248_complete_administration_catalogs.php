<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('menu_items', function (Blueprint $t): void {
            $t->string('icon', 60)->default('');
            $t->boolean('append_legacy_id')->default(true);
            $t->boolean('archived')->default(false);
        });
        Schema::create('employee_groups', function (Blueprint $t): void {
            $t->unsignedBigInteger('id')->primary();
            $t->string('name', 100);
            $t->unsignedBigInteger('parent_id')->nullable();
        });
        Schema::create('employees', function (Blueprint $t): void {
            $t->id();
            $t->unsignedInteger('legacy_id')->nullable()->unique();
            $t->foreignId('management_id')->nullable()->constrained('employee_groups');
            $t->string('identity_number', 25)->nullable()->unique();
            $t->string('first_name', 50);
            $t->string('last_name', 50)->default('');
            $t->string('email', 100)->default('');
            $t->string('status', 1)->default('A');
            $t->string('internal_code', 4)->nullable()->unique();
            $t->date('joined_at')->nullable();
            $t->date('retired_at')->nullable();
            $t->boolean('imported')->default(false);
            $t->unsignedInteger('revision')->default(1);
            $t->timestamps();
        });
        Schema::create('system_objects', function (Blueprint $t): void {
            $t->id();
            $t->unsignedInteger('legacy_id')->nullable()->unique();
            $t->unsignedBigInteger('parent_id')->default(0)->index();
            $t->string('name', 60);
            $t->text('description')->nullable();
            $t->string('sort_order', 200)->default('');
            $t->longText('default_value');
            $t->boolean('imported')->default(false);
            $t->unsignedInteger('revision')->default(1);
            $t->timestamps();
        });
        Schema::create('system_object_values', function (Blueprint $t): void {
            $t->id();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->foreignId('object_id')->constrained('system_objects');
            $t->longText('value');
            $t->boolean('imported')->default(false);
            $t->unsignedInteger('revision')->default(1);
            $t->timestamps();
            $t->unique(['user_id', 'object_id']);
        });
        Schema::create('document_types', function (Blueprint $t): void {
            $t->string('code', 4)->primary();
            $t->text('description');
        });
        Schema::create('user_document_defaults', function (Blueprint $t): void {
            $t->id();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->string('module', 60);
            $t->string('file', 60);
            $t->string('document_type', 4);
            $t->boolean('imported')->default(false);
            $t->unsignedInteger('revision')->default(1);
            $t->timestamps();
            $t->unique(['user_id', 'module', 'file']);
        });
        Schema::create('systems_import_runs', function (Blueprint $t): void {
            $t->id();
            $t->json('summary');
            $t->timestamp('created_at');
        });
        Schema::table('users', function (Blueprint $t): void {
            $t->foreignId('employee_id')->nullable()->constrained('employees');
            $t->string('corporate_email', 100)->default('');
            $t->string('siesa_username', 8)->default('');
            $t->boolean('profile_imported')->default(true);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $t): void {
            $t->dropConstrainedForeignId('employee_id');
            $t->dropColumn(['corporate_email', 'siesa_username', 'profile_imported']);
        });
        foreach (['systems_import_runs', 'user_document_defaults', 'document_types', 'system_object_values', 'system_objects', 'employees', 'employee_groups'] as $table) {
            Schema::dropIfExists($table);
        } Schema::table('menu_items', fn (Blueprint $t) => $t->dropColumn(['icon', 'append_legacy_id', 'archived']));
    }
};
