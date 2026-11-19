<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('menu_items', function (Blueprint $table): void {
            $table->string('route_name', 200)->nullable();
            $table->json('route_parameters')->nullable();
            $table->string('route_signature', 64)->nullable()->unique();
        });
        Schema::create('menu_route_actions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('menu_item_id')->constrained('menu_items')->restrictOnDelete();
            $table->string('route_name', 200)->unique();
            $table->string('operation', 20)->default('view');
            $table->unsignedInteger('revision')->default(1);
            $table->timestamps();
        });
        foreach (config('erp.migrated_menu_options', []) as $key => $option) {
            $parameters = array_map(strval(...), $option['parameters'] ?? []);
            ksort($parameters);
            DB::table('menu_items')->where('migration_key', $key)->update([
                'route_name' => $option['route'],
                'route_parameters' => json_encode($option['parameters'] ?? (object) []),
                'route_signature' => hash('sha256', $option['route'].'|'.json_encode($parameters)),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menu_route_actions');
        Schema::table('menu_items', function (Blueprint $table): void {
            $table->dropUnique(['route_signature']);
            $table->dropColumn(['route_name', 'route_parameters', 'route_signature']);
        });
    }
};
