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
        Schema::table('document_types', function (Blueprint $table): void {
            $table->string('code', 100)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::table('document_types')->whereRaw('LENGTH(code) > 4')->exists()) {
            throw new RuntimeException('El catálogo contiene claves largas. No se reducirá su longitud para evitar pérdida de datos.');
        }
        Schema::table('document_types', function (Blueprint $table): void {
            $table->string('code', 4)->change();
        });
    }
};
