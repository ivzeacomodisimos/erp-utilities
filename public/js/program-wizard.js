(() => {
  function initialize() {
    const root = document.querySelector('#program-wizard');
    if (!root || !root.closest('.q-layout')) return false;
    if (root.dataset.initialized) return true;
    root.dataset.initialized = 'true';
    const config = JSON.parse(root.querySelector('#wizard-config').textContent);
    const $ = id => root.querySelector('#wizard-' + id);
    const flags = ['can_view', 'can_create', 'can_update', 'can_delete'];
    const flagLabels = ['Consultar', 'Crear', 'Modificar', 'Eliminar'];
    const enabled = value => value === true || Number(value) === 1;
    let state = null, step = 0, grants = [], revoked = new Set(), busy = false;
    const option = (value, label) => { const item = document.createElement('option'); item.value = value; item.textContent = label; return item; };
    function error(message) { $('errors').textContent = message; $('errors').hidden = !message; if (message) $('errors').focus(); }
    function setBusy(value, message = '') { busy = value; $('controls').disabled = value; $('progress').textContent = message; root.setAttribute('aria-busy', String(value)); }
    async function api(action, values = {}) {
      const url = new URL(config.url, location.href);
      const options = { headers: { Accept: 'application/json' }, credentials: 'same-origin' };
      if (action === 'state') url.searchParams.set('program_id', values.program_id);
      else { options.method = 'POST'; options.headers['Content-Type'] = 'application/json'; options.headers['X-CSRF-TOKEN'] = config.token; options.body = JSON.stringify({ ...values, action, _token: config.token }); }
      const response = await fetch(url, options);
      const body = await response.json();
      if (!response.ok || !body.State) {
        if (response.status === 401 || response.status === 419) throw new Error('La sesión venció. Vuelva a ingresar y abra el asistente nuevamente.');
        throw new Error(body.errors ? Object.values(body.errors).flat().join(' ') : (body.message || 'No se pudo completar la operación.'));
      }
      return body.State;
    }
    function table(container, headers, rows) {
      container.replaceChildren(); const element = document.createElement('table'), head = element.createTHead().insertRow();
      headers.forEach(text => { const th = document.createElement('th'); th.textContent = text; head.append(th); });
      const body = element.createTBody(); rows.forEach(values => { const row = body.insertRow(); values.forEach(value => { row.insertCell().textContent = value; }); }); container.append(element);
    }
    function renderStep() {
      root.querySelectorAll('[data-step]').forEach(node => { node.hidden = Number(node.dataset.step) !== step; });
      root.querySelectorAll('[data-step-label]').forEach(node => { if (Number(node.dataset.stepLabel) === step) node.setAttribute('aria-current', 'step'); else node.removeAttribute('aria-current'); });
      $('back').hidden = step === 0; $('next').hidden = step === 3; $('publish').hidden = step !== 3;
      $('next').disabled = !state || (step === 0 && !state.program.ready);
      if (step === 3) review();
    }
    function selectedMenu() { return state?.bindings.menus.find(item => String(item.id) === $('menu').value); }
    function renderGrants() {
      const body = $('grants').querySelector('tbody'); body.replaceChildren();
      grants.forEach(grant => {
        const row = body.insertRow(); row.insertCell().textContent = grant.label + (grant.active ? '' : ' · Inactivo; se conserva');
        flags.forEach((flag, index) => {
          const input = document.createElement('input'); input.type = 'checkbox'; input.checked = grant[flag]; input.disabled = !grant.active;
          input.setAttribute('aria-label', flagLabels[index] + ' · ' + grant.label);
          input.addEventListener('change', () => { grant[flag] = input.checked; if (index > 0 && input.checked) grant.can_view = true; if (index === 0 && !input.checked) flags.slice(1).forEach(key => { grant[key] = false; }); renderGrants(); });
          row.insertCell().append(input);
        });
        const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = grant.existing ? 'Retirar acceso' : 'Quitar selección';
        remove.addEventListener('click', () => { if (grant.existing) revoked.add(grant.user_id); grants = grants.filter(item => item !== grant); renderGrants(); }); row.insertCell().append(remove);
      });
      $('revoked').textContent = revoked.size ? `Se retirarán ${revoked.size} accesos existentes al confirmar.` : 'No se retirarán otros accesos existentes.';
    }
    function loadMenu() {
      const menu = selectedMenu();
      $('label').value = menu?.label || state.defaults.menu_label;
      const parent = config.parents.find(item => Number(item.id) === Number(menu?.parent_id ?? 50));
      $('parent').value = parent?.label || (menu ? menu.parent_id + ' · Grupo no disponible: seleccione un grupo activo' : config.parents[0]?.label || '');
      $('public').value = enabled(menu?.is_public) ? '1' : '0';
      grants = state.bindings.grants.filter(item => Number(item.menu_item_id) === Number(menu?.id)).map(item => ({
        user_id: Number(item.user_id), label: item.user_label, active: item.user_active, existing: true,
        ...Object.fromEntries(flags.map(flag => [flag, enabled(item[flag])])),
      })); revoked = new Set(); renderGrants();
    }
    function loadRoute() {
      const route = state.bindings.routes.find(item => String(item.id) === $('route').value);
      $('route-name').value = route?.name || state.defaults.route_name; $('route-name').readOnly = !!route;
      $('uri').value = route?.uri || state.defaults.route_uri;
      $('menu').replaceChildren(option('', 'Crear nueva opción'));
      const menus = state.bindings.menus.filter(item => item.route_name === route?.name);
      menus.forEach(item => $('menu').append(option(item.id, item.id + ' · ' + item.label)));
      if (menus.length === 1) $('menu').value = menus[0].id;
      loadMenu();
    }
    function applyState(value) {
      state = value; $('program').value = value.program.id;
      $('program-info').hidden = false;
      $('program-info').textContent = `${value.program.title} · ${value.program.table_connection} · ${value.program.table_name} · ${value.program.ready ? 'CRUD preparado' : 'Pendiente de preparación'} · ${value.program.active ? 'Programa activo' : 'Programa inactivo'}`;
      table($('fields'), ['Campo', 'Etiqueta', 'Tipo'], value.fields.map(field => [field.name, field.label, field.type]));
      const pending = Object.values(value.report?.pending || {});
      $('related').hidden = !value.related_menus.length;
      $('related-names').textContent = 'Este programa utiliza los catálogos: ' + value.related_menus.map(item => item.label).join(', ');
      $('related-view').checked = false;
      $('pending').hidden = !pending.length; $('pending').textContent = pending.join(' ');
      $('fields-link').href = value.fields_url; $('fields-link').hidden = false;
      $('prepare').disabled = false; $('discover').hidden = value.program.table_mode !== 'existing' || value.program.ready || value.program.active;
      $('route').replaceChildren(option('', 'Crear nueva ruta')); value.bindings.routes.forEach(item => $('route').append(option(item.id, item.name + ' · ' + item.uri)));
      if (value.bindings.routes.length === 1) $('route').value = value.bindings.routes[0].id;
      loadRoute(); renderStep();
    }
    async function load() {
      if (busy) return; error(''); state = null; step = 0; $('form').hidden = false; $('complete').hidden = true;
      const id = Number($('program').value);
      $('program-info').hidden = true; $('fields').replaceChildren(); $('pending').hidden = true; $('fields-link').hidden = true; $('prepare').disabled = true; $('discover').hidden = true; renderStep();
      if (!id) return;
      setBusy(true, 'Consultando el programa y su configuración…');
      try { applyState(await api('state', { program_id: id })); } catch (e) { error(e.message); } finally { setBusy(false); }
    }
    async function prepare(discover) {
      if (busy || !state) return; error(''); setBusy(true, discover ? 'Detectando campos y relaciones…' : 'Preparando y validando el CRUD…');
      try { applyState(await api(discover ? 'discover' : 'prepare', { program_id: state.program.id, snapshot: state.snapshot })); }
      catch (e) { error(e.message); } finally { setBusy(false); }
    }
    function values() {
      const parent = config.parents.find(item => item.label === $('parent').value || String(item.id) === $('parent').value);
      if (!$('route-name').value.trim() || !$('uri').value.trim() || !$('label').value.trim() || !parent) throw new Error('Complete la ruta, la URL y el nombre del menú, y seleccione una opción padre de las sugerencias.');
      return { program_id: state.program.id, snapshot: state.snapshot,
        route_id: Number($('route').value) || null, menu_id: Number($('menu').value) || null,
        route_name: $('route-name').value.trim(), route_uri: $('uri').value.trim(), menu_label: $('label').value.trim(), parent_id: Number(parent.id), is_public: $('public').value === '1',
        grants: grants.filter(item => item.active).map(item => ({ user_id: item.user_id, ...Object.fromEntries(flags.map(flag => [flag, item[flag]])) })), revoked_user_ids: [...revoked], grant_related_view: $('related-view').checked };
    }
    function review() {
      const data = values();
      table($('review'), ['Elemento', 'Configuración'], [
        ['Programa', state.program.title], ['Tabla', state.program.table_name], ['Ruta', data.route_name], ['URL', data.route_uri], ['Métodos', 'GET y POST'],
        ['Menú', data.menu_label], ['Opción padre', $('parent').value], ['Acceso público', data.is_public ? 'Sí, según las reglas de menú para usuarios autenticados' : 'No, según permisos por usuario'],
        ['Usuarios seleccionados', data.grants.length], ['Accesos que se retirarán', data.revoked_user_ids.length],
        ['Catálogos relacionados', data.grant_related_view ? 'Se concederá consulta donde haga falta: ' + state.related_menus.map(item => item.label).join(', ') : 'Se conservarán los permisos actuales'],
      ]);
      const detail = document.createElement('div');
      table(detail, ['Usuario', 'Permisos al confirmar'], grants.map(item => [item.label, item.active ? flags.filter(flag => item[flag]).map(flag => flagLabels[flags.indexOf(flag)]).join(', ') || 'Sin acceso' : 'Usuario inactivo: se conserva la configuración existente']));
      $('review').append(detail);
    }
    $('program').append(...config.programs.map(item => option(item.id, item.title)));
    $('user').append(...config.users.map(item => option(item.id, item.name + ' · ' + item.ldap_username)));
    $('parents').append(...config.parents.map(item => option(item.label, item.label)));
    $('program').addEventListener('change', load); $('reload').addEventListener('click', load);
    $('route').addEventListener('change', loadRoute); $('menu').addEventListener('change', loadMenu);
    $('prepare').addEventListener('click', () => prepare(false)); $('discover').addEventListener('click', () => prepare(true));
    $('add-user').addEventListener('click', () => {
      error(''); const user = config.users.find(item => String(item.id) === $('user').value);
      if (!user) return error('Seleccione un usuario activo.');
      if (grants.some(item => item.user_id === Number(user.id))) return error('El usuario ya está incluido. Modifique los permisos en su fila.');
      const existing = state.bindings.grants.some(item => Number(item.menu_item_id) === Number(selectedMenu()?.id) && Number(item.user_id) === Number(user.id));
      revoked.delete(Number(user.id)); grants.push({ user_id: Number(user.id), label: user.name + ' · ' + user.ldap_username, active: true, existing, can_view: true, can_create: false, can_update: false, can_delete: false }); renderGrants();
    });
    $('next').addEventListener('click', () => { if (busy || !state) return; error(''); try { if (step === 1) values(); if (step < 3) step++; renderStep(); } catch (e) { error(e.message); } });
    $('back').addEventListener('click', () => { if (!busy && step > 0) { error(''); step--; renderStep(); } });
    $('form').addEventListener('submit', async event => {
      event.preventDefault(); if (busy || !state) return; if (step !== 3) { $('next').click(); return; }
      error(''); let data; try { data = values(); } catch (e) { return error(e.message); }
      setBusy(true, 'Habilitando el programa y guardando ruta, menú y permisos…');
      try {
        const result = await api('publish', data); applyState(result);
        const route = result.bindings.routes.find(item => item.name === data.route_name);
        $('open').href = new URL(route.uri, location.origin).href; $('form').hidden = true; $('complete').hidden = false;
      } catch (e) { error(e.message); } finally { setBusy(false); }
    });
    $('again').addEventListener('click', () => { $('form').hidden = false; $('complete').hidden = true; step = 0; renderStep(); });
    if (config.program_id) $('program').value = config.program_id;
    renderStep(); if ($('program').value) load();
    return true;
  }
  const observer = new MutationObserver(() => { if (initialize()) observer.disconnect(); });
  if (!initialize()) observer.observe(document.documentElement, { childList: true, subtree: true });
})();
