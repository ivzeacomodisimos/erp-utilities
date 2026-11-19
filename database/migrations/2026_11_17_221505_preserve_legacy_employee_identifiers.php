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
        if (DB::connection()->getDriverName() !== 'mysql') {
            return;
        }
        Schema::table('employees', function (Blueprint $table): void {
            $table->string('identity_number', 25)->nullable()->collation('utf8mb4_bin')->change();
            $table->string('internal_code', 4)->nullable()->collation('utf8mb4_bin')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::connection()->getDriverName() !== 'mysql') {
            return;
        }
        foreach (['identity_number', 'internal_code'] as $field) {
            if (DB::table('employees')->selectRaw('COUNT(*) AS total')->whereNotNull($field)->groupByRaw($field.' COLLATE utf8mb4_unicode_ci')->havingRaw('COUNT(*) > 1')->exists()) {
                throw new RuntimeException('La comparación anterior uniría identificadores distintos. No se modificará para evitar pérdida de identidad.');
            }
        }
        Schema::table('employees', function (Blueprint $table): void {
            $table->string('identity_number', 25)->nullable()->collation('utf8mb4_unicode_ci')->change();
            $table->string('internal_code', 4)->nullable()->collation('utf8mb4_unicode_ci')->change();
        });
    }
};
