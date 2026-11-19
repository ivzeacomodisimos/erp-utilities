<style>
.erp-wizard{max-width:1100px;margin:16px 0;padding:24px;background:white;border:1px solid #dce3e6;border-radius:8px}
.erp-wizard [hidden]{display:none!important}.erp-wizard fieldset{border:0;padding:0;margin:0;min-width:0}.erp-wizard label{display:block;margin:12px 0 6px;font-weight:600}.erp-wizard input:not([type=checkbox]),.erp-wizard select{width:100%;padding:10px;border:1px solid #aebbc3;border-radius:5px;font:inherit}.erp-wizard input[readonly]{background:#f1f4f6}.erp-wizard button,.erp-wizard .wizard-link{padding:9px 16px;margin:5px 8px 5px 0;border:1px solid #316b9c;border-radius:4px;background:white;color:#24577f;font:inherit;cursor:pointer}.erp-wizard button:disabled{opacity:.5;cursor:wait}.erp-wizard button.primary{background:#316b9c;color:white}.erp-wizard .wizard-steps{display:flex;flex-wrap:wrap;gap:22px;padding-left:22px;margin-bottom:26px}.erp-wizard .wizard-steps [aria-current=step]{font-weight:bold;color:#24577f}.erp-wizard .wizard-note{padding:12px;background:#e8f3fb;border-radius:5px;margin:12px 0}.erp-wizard .wizard-error{padding:12px;background:#fff0f0;color:#a31515;border-left:4px solid #c62828;margin:12px 0}.erp-wizard .wizard-success{padding:18px;background:#e9f6ec;border-left:4px solid #278039}.erp-wizard table{width:100%;border-collapse:collapse;margin:12px 0}.erp-wizard th,.erp-wizard td{text-align:left;padding:10px;border-bottom:1px solid #dde3e8}.erp-wizard .wizard-scroll{overflow-x:auto}.erp-wizard .wizard-actions{margin-top:24px;border-top:1px solid #dde3e8;padding-top:16px}.erp-wizard input[type=checkbox]{width:20px;height:20px;cursor:pointer}.erp-wizard .wizard-muted{color:#64727c}
</style>
<div id="program-wizard" class="erp-wizard">
    <p>Completa el alta de un programa CRUD existente en esta pantalla. Puedes retomar las rutas, menús y permisos que ya tenga configurados.</p>
    <ol class="wizard-steps" aria-label="Pasos del alta"><li data-step-label="0">Preparar</li><li data-step-label="1">Ruta y menú</li><li data-step-label="2">Usuarios</li><li data-step-label="3">Confirmar</li></ol>
    <div id="wizard-errors" class="wizard-error" role="alert" tabindex="-1" hidden></div>
    <p id="wizard-progress" role="status" aria-live="polite"></p>
    <form id="wizard-form" novalidate>
      <fieldset id="wizard-controls">
        <section data-step="0">
            <h2>1. Seleccionar y preparar el programa</h2>
            <label for="wizard-program">Programa CRUD</label>
            <select id="wizard-program"><option value="">Seleccione un programa</option></select>
            <button type="button" id="wizard-reload">Recargar programa</button>
            <a class="wizard-link" href="{{ $config['create_url'] }}">Crear programa o definir campos</a>
            <div id="wizard-program-info" class="wizard-note" hidden></div>
            <div id="wizard-fields" class="wizard-scroll"></div>
            <div id="wizard-pending" class="wizard-note" hidden></div>
            <a id="wizard-fields-link" hidden>Revisar configuración de campos</a>
            <div><button type="button" id="wizard-discover" hidden>Detectar campos y relaciones</button><button type="button" id="wizard-prepare" class="primary" disabled>Preparar / validar CRUD</button></div>
        </section>
        <section data-step="1" hidden>
            <h2>2. Configurar la ruta y la opción del menú</h2>
            <p>Se habilitarán GET y POST para este programa. La opción del menú quedará activa y habilitada en ERP al confirmar el alta.</p>
            <label for="wizard-route">Ruta existente</label><select id="wizard-route"></select>
            <div class="erp-grid">
                <div><label for="wizard-route-name">Nombre de ruta</label><input id="wizard-route-name" maxlength="200" placeholder="prueba.index" required></div>
                <div><label for="wizard-uri">Dirección URL</label><input id="wizard-uri" maxlength="200" placeholder="/aplicaciones/prueba" required></div>
            </div>
            <label for="wizard-menu">Opción existente del menú</label><select id="wizard-menu"></select>
            <div class="erp-grid">
                <div><label for="wizard-label">Nombre en el menú</label><input id="wizard-label" maxlength="200" required></div>
                <div><label for="wizard-parent">Opción padre</label><input id="wizard-parent" list="wizard-parents" autocomplete="off" placeholder="Busque el grupo por su nombre o ruta" required><datalist id="wizard-parents"></datalist></div>
            </div>
            <label for="wizard-public">Acceso público</label><select id="wizard-public"><option value="0">No · Acceso según permisos por usuario</option><option value="1">Sí · Usuarios autenticados según las reglas de menú</option></select>
        </section>
        <section data-step="2" hidden>
            <h2>3. Asignar permisos por usuario</h2>
            <p>Se conservan los permisos de los usuarios que no modifiques. Retirar un acceso existente requiere pulsar «Retirar acceso» en su fila.</p>
            <label for="wizard-user">Usuario corporativo activo</label><select id="wizard-user"><option value="">Seleccione un usuario</option></select>
            <button type="button" id="wizard-add-user">Agregar usuario</button>
            <div class="wizard-scroll"><table id="wizard-grants"><thead><tr><th>Usuario</th><th>Consultar</th><th>Crear</th><th>Modificar</th><th>Eliminar</th><th>Acción</th></tr></thead><tbody></tbody></table></div>
            <div id="wizard-related" class="wizard-note" hidden><p id="wizard-related-names"></p><label><input type="checkbox" id="wizard-related-view"> Conceder también consulta a los catálogos relacionados que hagan falta. Se conservarán sus otros permisos.</label></div>
            <p id="wizard-revoked" class="wizard-muted"></p>
        </section>
        <section data-step="3" hidden>
            <h2>4. Revisar y dar de alta</h2>
            <div id="wizard-review"></div>
            <p>Al confirmar se activará el programa y se guardarán juntos la ruta, el menú y los permisos seleccionados.</p>
        </section>
        <div class="wizard-actions"><button type="button" id="wizard-back" hidden>Anterior</button><button type="button" id="wizard-next" class="primary" disabled>Siguiente</button><button type="submit" id="wizard-publish" class="primary" hidden>Dar de alta el programa</button></div>
      </fieldset>
    </form>
    <div id="wizard-complete" class="wizard-success" role="status" hidden><h2>Programa habilitado</h2><p>La ruta, el menú y los permisos quedaron configurados. Puedes abrir el programa para comprobar su funcionamiento.</p><a id="wizard-open" class="wizard-link">Abrir programa</a><button type="button" id="wizard-again">Revisar configuración</button></div>
    <script type="application/json" id="wizard-config">{!! json_encode($config, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_THROW_ON_ERROR) !!}</script>
</div>
