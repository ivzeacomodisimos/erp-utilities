<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('password')->nullable()->change();
            $table->string('ldap_username', 100)->nullable()->unique();
            $table->string('ldap_guid', 64)->nullable()->unique();
            $table->json('erp_roles')->nullable();
            $table->boolean('erp_active')->default(false);
            $table->unsignedInteger('token_version')->default(0);
            $table->timestamp('last_login_at')->nullable();
        });

        Schema::create('erp_auth_tokens', function (Blueprint $table): void {
            $table->string('id', 64)->primary();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamp('expires_at')->index();
            $table->timestamp('session_expires_at');
            $table->timestamp('revoked_at')->nullable();
            $table->timestamp('created_at');
        });

        Schema::create('erp_access_events', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('event', 50);
            $table->string('actor', 30);
            $table->json('details')->nullable();
            $table->timestamp('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('erp_access_events');
        Schema::dropIfExists('erp_auth_tokens');
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn(['ldap_username', 'ldap_guid', 'erp_roles', 'erp_active', 'token_version', 'last_login_at']);
        });
    }
};
