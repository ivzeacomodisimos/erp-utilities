import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM, VirtualConsole } from '../packages/ui-kit/quasar/node_modules/jsdom/lib/api.js';

const fixture = JSON.parse(await readFile(new URL('../.runtime/tests/access-ui.json', import.meta.url), 'utf8'));
try {
  Object.assign(fixture, JSON.parse(await readFile(new URL('../.runtime/tests/generated-crud-ui.json', import.meta.url), 'utf8')));
} catch (error) { if (error.code !== 'ENOENT') throw error; }
try {
  Object.assign(fixture, JSON.parse(await readFile(new URL('../.runtime/tests/generated-relations-ui.json', import.meta.url), 'utf8')));
} catch (error) { if (error.code !== 'ENOENT') throw error; }
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
try {
  Object.assign(fixture, JSON.parse(await readFile(new URL('../.runtime/tests/automatic-fields-ui.json', import.meta.url), 'utf8')));
} catch (error) { if (error.code !== 'ENOENT') throw error; }
try {
  Object.assign(fixture, JSON.parse(await readFile(new URL('../.runtime/tests/validation-ui.json', import.meta.url), 'utf8')));
} catch (error) { if (error.code !== 'ENOENT') throw error; }
try {
  Object.assign(fixture, JSON.parse(await readFile(new URL('../.runtime/tests/generated-dependencies-ui.json', import.meta.url), 'utf8')));
} catch (error) { if (error.code !== 'ENOENT') throw error; }
async function waitFor(check) {
  for (let i = 0; i < 140; i++) {
    const result = check();
    if (result) return result;
    await sleep(50);
  }
  throw new Error('La interfaz no alcanzó el estado esperado.');
}
async function mount(section) {
  const errors = [], calls = [], pending = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', error => { if (error.type !== 'css parsing') errors.push(error.message); });
  const dom = new JSDOM(fixture[section].replace(/http:\/\/localhost(?::\d+)?/g, 'http://web'), {
    url: 'http://web/administracion/' + section, runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true, virtualConsole,
    beforeParse(window) {
      window.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
      window.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
      window.scrollTo = () => {};
      window.Element.prototype.scrollTo = () => {};
      Object.defineProperty(window.screen, 'orientation', { value: { type: 'landscape-primary', angle: 0, addEventListener() {}, removeEventListener() {} } });
      window.fetch = async (url, options) => {
        const action = new URL(url, window.location.href).searchParams.get('action');
        calls.push({ action, options, field: new URL(url, window.location.href).searchParams.get('field') });
        assert.equal(options.method, 'POST');
        assert.ok(options.body.get('_token'));
        if (section.startsWith('dependent-') && action === 'autocomplete') {
          const context = JSON.parse(options.body.get('lookup_context'));
          const field = new URL(url, window.location.href).searchParams.get('field');
          const state = fixture.dependent_state;
          const items = field === 'departamento_id'
            ? [{ id: String(state.department_c), label: 'Departamento C' }]
            : [{ id: String(state.city_c), label: 'Ciudad C' }];
          assert.equal(String(context.pais_id), '1');
          if (field === 'ciudad_id' && options.body.get('term') !== 'lenta') assert.equal(String(context.departamento_id), String(state.department_c));
          if (options.body.get('term') === 'lenta') {
            await new Promise(resolve => pending.push(resolve));
            return { json: async () => [{ id: String(state.city_a), label: 'Respuesta obsoleta' }] };
          }
          return { json: async () => items };
        }
        return { json: async () => section === 'validation-fields' && action === 'create' ? fixture.validation_error
          : action === 'suggest' ? [{ value: 'Consulta pedidos', label: 'Consulta pedidos', caption: 'Aplicaciones › Ventas' }]
          : action === 'autocomplete' ? (section.startsWith('related-') ? fixture.related_options : [{ id: 100, label: '100 · Ventas', caption: 'Aplicaciones' }])
          : action === 'relationDefaults' ? { Result: 'OK', Record: { related_menu_id: '100', related_label: 'nombre' } }
          : action === 'programDefaults' ? { Result: 'OK', Record: { http_method: 'GET|POST', program_parameters: '{}' } }
          : action === 'list' ? fixture[section + '_list']
          : { Result: 'ERROR', Message: 'Actualice antes de guardar.', Errors: { label: 'El registro cambió.' } } };
      };
    },
  });
  if (dom.window.document.readyState !== 'complete') {
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(section + ': recursos sin terminar: ' + JSON.stringify(errors))), 30000);
      dom.window.addEventListener('load', () => { clearTimeout(timer); resolve(); }, { once: true });
    });
  }
  try { await waitFor(() => dom.window.document.querySelector('#uk-app .q-layout')); } catch (error) { throw new Error(section + ': ' + JSON.stringify(errors) + ' scripts=' + [...dom.window.document.scripts].map(s => s.src).join(',')); }
  if (section !== 'user') await waitFor(() => calls.some(call => call.action === 'list'));
  return { dom, errors, calls, pending };
}
const systemsSections = ['empleados', 'tipos-documento', 'objetos', 'objetos-usuarios'];
const createLabels = {
  menu: 'Adicionar nueva opción del menú', rutas: 'Adicionar nueva asociación de ruta al menú',
  programas: 'Adicionar nueva ruta de aplicación', generador: 'Adicionar nuevo programa y controlador',
  campos: 'Adicionar nuevo campo de programa CRUD', permisos: 'Adicionar nuevo permiso de menú por usuario',
  usuarios: 'Adicionar nuevo usuario corporativo', opciones: 'Adicionar nuevo permiso de opción o botón',
  empleados: 'Adicionar nuevo empleado', 'tipos-documento': 'Adicionar nuevo tipo de documento por defecto',
  objetos: 'Adicionar nuevo objeto del sistema', 'objetos-usuarios': 'Adicionar nuevo objeto por usuario',
};
const selectedSections = process.env.ERP_UI_SECTIONS?.split(',');
const availableSections = ['menu', 'permisos', 'usuarios', 'opciones', 'rutas', 'programas', 'generador', 'campos', ...systemsSections, 'user',
  ...(fixture['generated-admin'] ? ['generated-admin', 'generated-reader'] : []),
  ...(fixture['related-admin'] ? ['related-admin', 'related-reader'] : []),
  ...(fixture['dependent-admin'] ? ['dependent-admin', 'dependent-reader'] : []),
  ...(fixture['validation-fields'] ? ['validation-fields'] : []),
  ...(fixture['automatic-fields'] ? ['automatic-fields'] : [])];
assert.ok(!selectedSections || selectedSections.every(section => availableSections.includes(section)), 'Faltan capturas de las pantallas solicitadas');
const sections = availableSections
  .filter(section => !selectedSections || selectedSections.includes(section));
assert.ok(sections.length > 0);
for (const section of sections) {
  const mounted = await mount(section);
  try {
    const doc = mounted.dom.window.document;
    assert.match(doc.body.textContent, /ERP Utilities/);
    if (section === 'automatic-fields') {
      const automatic = await waitFor(() => doc.querySelector('#crud-automatic-fields'));
      const names = [...automatic.querySelectorAll('tbody tr')].map(row => row.querySelector('td').textContent);
      assert.deepEqual(names, ['id', 'created_at', 'updated_at', 'deleted_at', '_row_version']);
      assert.equal(automatic.querySelectorAll('button,input,select,textarea').length, 0);
      assert.match(automatic.textContent, /Solo lectura/);
      assert.match(automatic.textContent, /Generador/);
      assert.match(automatic.textContent, /Se crea al preparar el CRUD/);
      const root = await waitFor(() => doc.querySelector('#ck-access-campos'));
      assert.ok([...root.querySelectorAll('button')].some(button => button.textContent === 'Adicionar nuevo campo de programa CRUD'));
      assert.deepEqual(mounted.errors, []);
      continue;
    }
    if (section === 'validation-fields') {
      const root = await waitFor(() => doc.querySelector('#ck-access-campos'));
      [...root.querySelectorAll('button')].find(button => button.textContent === 'Adicionar nuevo campo de programa CRUD').click();
      const form = await waitFor(() => doc.querySelector('.q-dialog form'));
      const getField = label => [...form.querySelectorAll('.q-field')].find(el => el.querySelector('.q-field__label')?.textContent === label);
      for (const label of ['Nombre de columna', 'Etiqueta']) {
        const input = getField(label).querySelector('input');
        input.value = 'id';
        input.dispatchEvent(new mounted.dom.window.Event('input', { bubbles: true }));
      }
      await sleep(50);
      form.dispatchEvent(new mounted.dom.window.Event('submit', { bubbles: true, cancelable: true }));
      await waitFor(() => getField('Nombre de columna').textContent.includes(fixture.validation_error.Errors.column_name));
      assert.match(getField('Nombre de columna').textContent, /lo administra automáticamente el generador/);
      assert.equal(form.textContent.includes('The selected'), false);
      assert.deepEqual(mounted.errors, []);
      continue;
    }
    const generated = section.startsWith('generated-');
    const related = section.startsWith('related-');
    const dependent = section.startsWith('dependent-');
    assert.match(doc.body.textContent, dependent ? /Ubicaciones/i : (related ? /Relation_pedidos/ : (generated ? /Catálogo CRUD/ : /Consulta pedidos/)));
    if (generated || related || dependent) {
      const root = await waitFor(() => doc.querySelector('#ck-generated-program-' + (dependent ? fixture.dependent_program_id : (related ? fixture.related_program_id : fixture.generated_program_id))));
      await waitFor(() => root.querySelector('tbody')?.textContent.includes(dependent ? 'Ciudad A' : (related ? 'Cliente ABC' : 'Cliente UI')));
      const addButton = [...root.querySelectorAll('button')].find(button => /Adicionar|Agregar|Nuevo|Nueva|Añadir/i.test(button.textContent));
      const editButtons = root.querySelectorAll('tbody button');
      const administrator = section.endsWith('-admin');
      assert.equal(!!addButton, administrator);
      assert.equal(editButtons.length > 0, administrator);
      if (generated && administrator) assert.equal(addButton.textContent, 'Adicionar nuevo registro de «Catálogo CRUD»');
      if (dependent && !administrator) {
        const filters = [...root.querySelectorAll('.ck-q-filters .q-field')];
        const country = filters.find(el => el.querySelector('.q-field__label')?.textContent === 'Pais_id').querySelector('input');
        assert.ok(filters.find(el => el.textContent.includes('Ciudad_id')).classList.contains('q-field--disabled'));
        country.value = '1';
        country.dispatchEvent(new mounted.dom.window.Event('input', { bubbles: true }));
        await sleep(50);
        const department = [...root.querySelectorAll('.ck-q-filters .q-field')].find(el => el.querySelector('.q-field__label')?.textContent === 'Departamento_id').querySelector('input');
        department.focus();
        department.value = 'Departamento';
        department.dispatchEvent(new mounted.dom.window.Event('input', { bubbles: true }));
        const choice = await waitFor(() => [...doc.querySelectorAll('.q-menu .q-item')].find(el => el.textContent.includes('Departamento C')));
        choice.click();
        await sleep(50);
        country.value = '2';
        country.dispatchEvent(new mounted.dom.window.Event('input', { bubbles: true }));
        await waitFor(() => !root.querySelector('.ck-q-filters').textContent.includes('Departamento C'));
        assert.equal(mounted.calls.some(call => ['create', 'update', 'delete'].includes(call.action)), false);
      }
      if (dependent && administrator) {
        editButtons[0].click();
        const form = await waitFor(() => doc.querySelector('.q-dialog form'));
        const getField = name => [...form.querySelectorAll('.q-field')].find(el => el.querySelector('.q-field__label')?.textContent === name);
        const type = (field, value) => {
          const input = field.querySelector('input');
          input.focus();
          input.value = value;
          input.dispatchEvent(new mounted.dom.window.Event('input', { bubbles: true }));
        };
        const country = getField('Pais_id');
        let department = getField('Departamento_id'), city = getField('Ciudad_id');
        await waitFor(() => department.textContent.includes('Departamento A') && city.textContent.includes('Ciudad A'));
        type(city, 'lenta');
        await waitFor(() => mounted.pending.length === 1);
        type(country, '2');
        await waitFor(() => !getField('Departamento_id').textContent.includes('Departamento A') && getField('Ciudad_id').classList.contains('q-field--disabled'));
        mounted.pending.shift()();
        await sleep(100);
        assert.equal(doc.body.textContent.includes('Respuesta obsoleta'), false);
        type(country, '1');
        await sleep(50);
        department = getField('Departamento_id');
        type(department, 'Departamento');
        await waitFor(() => [...doc.querySelectorAll('.q-menu .q-item')].some(el => el.textContent.includes('Departamento C')));
        [...doc.querySelectorAll('.q-menu .q-item')].find(el => el.textContent.includes('Departamento C')).click();
        await waitFor(() => !getField('Ciudad_id').classList.contains('q-field--disabled'));
        city = getField('Ciudad_id');
        type(city, 'Ciudad');
        await waitFor(() => [...doc.querySelectorAll('.q-menu .q-item')].some(el => el.textContent.includes('Ciudad C')));
        [...doc.querySelectorAll('.q-menu .q-item')].find(el => el.textContent.includes('Ciudad C')).click();
        await sleep(50);
        form.dispatchEvent(new mounted.dom.window.Event('submit', { bubbles: true, cancelable: true }));
        const sent = await waitFor(() => mounted.calls.find(call => call.action === 'update'));
        assert.equal(sent.options.body.get('departamento_id'), String(fixture.dependent_state.department_c));
        assert.equal(sent.options.body.get('ciudad_id'), String(fixture.dependent_state.city_c));
      }
      if (related && administrator) {
        editButtons[0].click();
        const form = await waitFor(() => doc.querySelector('.q-dialog form'));
        const field = [...form.querySelectorAll('.q-field')].find(el => el.querySelector('.q-field__label')?.textContent === 'Cliente');
        await waitFor(() => field.textContent.includes('Cliente ABC'));
        const input = field.querySelector('input');
        input.focus();
        input.value = 'ABC';
        input.dispatchEvent(new mounted.dom.window.Event('input', { bubbles: true }));
        await waitFor(() => mounted.calls.some(call => call.action === 'autocomplete'));
        await waitFor(() => doc.querySelector('.q-menu .q-item__label--caption'));
        doc.querySelector('.q-menu .q-item').click();
        await sleep(50);
        form.dispatchEvent(new mounted.dom.window.Event('submit', { bubbles: true, cancelable: true }));
        await waitFor(() => mounted.calls.some(call => call.action === 'update'));
        const sent = mounted.calls.find(call => call.action === 'update').options.body;
        assert.equal(sent.get('cliente_id'), String(fixture.related_options[0].id));
        assert.ok(sent.get('_row_version'));
        assert.equal(mounted.calls.find(call => call.action === 'autocomplete').field, 'cliente_id');
      }
      assert.deepEqual(mounted.errors, []);
      continue;
    }
    if (section === 'user') {
      assert.equal(doc.querySelector('a[href$="/administracion/menu"]'), null);
      assert.equal(doc.querySelector('a[href$="/administracion/programas"]'), null);
      assert.equal(doc.querySelector('a[href$="/menu/102"]'), null);
    } else {
      const table = await waitFor(() => doc.querySelector('#ck-' + (systemsSections.includes(section) ? 'systems-' : 'access-') + section + ' .q-table'));
      assert.ok(table);
      const createLabel = createLabels[section];
      if (createLabel) assert.ok([...doc.querySelectorAll('button')].some(button => button.textContent === createLabel), createLabel);
      assert.ok(doc.querySelector('a[href$="/administracion/permisos"]'));
      if (section === 'opciones') {
        assert.match(table.textContent, /Lectura/);
        assert.match(table.textContent, /Insertar/);
        assert.match(table.textContent, /Modificar/);
        assert.match(table.textContent, /Eliminar/);
      }
      if (section === 'rutas') {
        assert.match(table.textContent, /Ruta Laravel/);
        assert.match(table.textContent, /Permiso requerido/);
      }
      if (section === 'programas') {
        assert.match(table.textContent, /Dirección URL/);
        assert.match(table.textContent, /Nombre de ruta/);
        assert.match(table.textContent, /Programa a ejecutar/);
        const createButton = [...doc.querySelectorAll('#ck-access-programas button')].find(button => /Adicionar|Agregar|Nuevo|Nueva|Añadir/i.test(button.textContent));
        assert.ok(createButton, 'Debe existir el botón para registrar una ruta');
        createButton.click();
        const form = await waitFor(() => doc.querySelector('.q-dialog form'));
        for (const label of ['Nombre de ruta', 'Dirección URL']) {
          const field = [...form.querySelectorAll('.q-field')].find(el => el.querySelector('.q-field__label')?.textContent === label);
          assert.ok(field?.querySelector('input'));
          assert.equal(field.classList.contains('q-select'), false, label + ' debe poder digitarse');
        }
        const program = [...form.querySelectorAll('.q-field')].find(el => el.querySelector('.q-field__label')?.textContent === 'Programa a ejecutar');
        program.querySelector('.q-field__control').click();
        const option = await waitFor(() => doc.querySelector('.q-menu .q-item'));
        option.click();
        await sleep(50);
        program.dispatchEvent(new mounted.dom.window.FocusEvent('focusout', { bubbles: true }));
        await waitFor(() => mounted.calls.some(call => call.action === 'programDefaults'));
        const method = [...form.querySelectorAll('.q-field')].find(el => el.querySelector('.q-field__label')?.textContent === 'Método HTTP');
        await waitFor(() => method.textContent.includes('GET y POST'));
      }
      if (section === 'generador') {
        assert.match(table.textContent, /Nombre del controlador/);
        assert.match(table.textContent, /Título del programa/);
        const createButton = [...doc.querySelectorAll('#ck-access-generador button')].find(button => /Adicionar|Agregar|Nuevo|Nueva|Añadir/i.test(button.textContent));
        assert.ok(createButton);
        createButton.click();
        const form = await waitFor(() => doc.querySelector('.q-dialog form'));
        for (const label of ['Nombre del controlador', 'Título del programa', 'Contenido inicial']) {
          const field = [...form.querySelectorAll('.q-field')].find(el => el.querySelector('.q-field__label')?.textContent === label);
          assert.ok(field?.querySelector('input,textarea'), label);
        }
        assert.match(form.textContent, /Tipo de programa/);
        assert.equal(doc.querySelector('.ck-q-dialog-title').textContent, 'Adicionar nuevo programa y controlador');
        assert.ok([...form.querySelectorAll('button')].some(button => button.textContent === 'Grabar programa y controlador'));
        assert.match(form.textContent, /Tabla de negocio/);
        const getField = label => [...form.querySelectorAll('.q-field')].find(el => el.querySelector('.q-field__label')?.textContent === label);
        const connection = getField('Conexión de base de datos');
        assert.ok(connection.textContent.includes('Base de datos ERP'));
        connection.querySelector('.q-field__control').click();
        const intranet = await waitFor(() => [...doc.querySelectorAll('.q-menu .q-item')].find(el => el.textContent.includes('Intranet SQL Server')));
        intranet.click();
        await sleep(50);
        getField('Tipo de programa').querySelector('.q-field__control').click();
        const crudOption = await waitFor(() => [...doc.querySelectorAll('.q-menu .q-item')].find(el => el.textContent.includes('Formulario CRUD')));
        crudOption.click();
        for (const [label, value] of [['Nombre del controlador', 'PruebaController'], ['Título del programa', 'Prueba UI'], ['Tabla de negocio (base.esquema.tabla)', 'comodisimos.test.prueba']]) {
          const input = getField(label).querySelector('input');
          input.value = value;
          input.dispatchEvent(new mounted.dom.window.Event('input', { bubbles: true }));
        }
        await sleep(50);
        form.dispatchEvent(new mounted.dom.window.Event('submit', { bubbles: true, cancelable: true }));
        const created = await waitFor(() => mounted.calls.find(call => call.action === 'create'));
        assert.equal(created.options.body.get('table_connection'), 'intranet_sqlsrv');
        assert.equal(created.options.body.get('table_name'), 'comodisimos.test.prueba');
        assert.equal(created.options.body.get('program_type'), 'crud');
        assert.equal(created.options.body.get('active'), '0');
        assert.equal(created.options.body.get('auto_detect_fields'), '1');
      }
      if (section === 'campos') {
        assert.match(table.textContent, /Nombre de columna/);
        assert.match(table.textContent, /Tipo de campo/);
        assert.match(doc.body.textContent, /Preparar CRUD/);
        assert.match(doc.body.textContent, /Detectar campos y relaciones/);
        const create = [...doc.querySelectorAll('#ck-access-campos button')].find(button => /Adicionar|Agregar|Nuevo|Nueva|Añadir/i.test(button.textContent));
        assert.ok(create);
        create.click();
        const form = await waitFor(() => doc.querySelector('.q-dialog form'));
        for (const label of ['Programa CRUD', 'Nombre de columna', 'Etiqueta', 'Tipo de campo', 'Obligatorio', 'Catálogo CRUD relacionado', 'Menú de consulta relacionado', 'Columna a mostrar', 'Depende del campo', 'Columna de filtro del catálogo']) {
          assert.ok([...form.querySelectorAll('.q-field__label')].some(el => el.textContent === label), label);
        }
      }
      if (section === 'menu') {
        const nameFilter = [...doc.querySelectorAll('.ck-q-filters .q-field')].find(el => el.textContent.includes('Nombre')).querySelector('input');
        nameFilter.focus();
        nameFilter.value = 'Consulta';
        nameFilter.dispatchEvent(new mounted.dom.window.Event('input', { bubbles: true }));
        await waitFor(() => mounted.calls.some(call => call.action === 'suggest'));
        await waitFor(() => doc.querySelector('.q-item__label--caption')?.textContent === 'Aplicaciones › Ventas');
        const suggestionCall = mounted.calls.find(call => call.action === 'suggest');
        assert.equal(suggestionCall.options.body.get('term'), 'Consulta');
        doc.querySelector('.q-menu .q-item').click();
        await sleep(50);
        assert.equal(nameFilter.value, 'Consulta pedidos');
        await waitFor(() => table.querySelector('tbody tr button'));
        [...table.querySelectorAll('tbody tr')].find(row => row.textContent.includes('Consulta pedidos')).querySelector('button').click();
        const form = await waitFor(() => doc.querySelector('.q-dialog form'));
        assert.match(form.textContent, /Ruta Laravel/);
        assert.equal(form.textContent.includes('Funcionalidad migrada'), false);
        const parentField = [...form.querySelectorAll('.q-field')].find(el => el.querySelector('.q-field__label')?.textContent === 'Opción padre');
        const parentInput = parentField.querySelector('input');
        await waitFor(() => parentField.textContent.includes('100 · Ventas'));
        parentInput.focus();
        parentInput.value = 'Ven';
        parentInput.dispatchEvent(new mounted.dom.window.Event('input', { bubbles: true }));
        await waitFor(() => mounted.calls.some(call => call.action === 'autocomplete'));
        await waitFor(() => doc.querySelector('.q-menu .q-item__label--caption')?.textContent === 'Aplicaciones');
        doc.querySelector('.q-menu .q-item').click();
        await sleep(50);
        assert.ok(parentField.textContent.includes('100 · Ventas'));
        const input = [...form.querySelectorAll('.q-field')].find(el => el.querySelector('.q-field__label')?.textContent === 'Nombre').querySelector('input');
        input.value = 'Nombre revisado';
        input.dispatchEvent(new mounted.dom.window.Event('input', { bubbles: true }));
        await sleep(50);
        form.dispatchEvent(new mounted.dom.window.Event('submit', { bubbles: true, cancelable: true }));
        await waitFor(() => mounted.calls.some(call => call.action === 'update'));
        const sent = mounted.calls.find(call => call.action === 'update').options.body;
        assert.ok(sent.get('revision'));
        assert.ok(sent.get('id'));
        assert.equal(sent.get('label'), 'Nombre revisado');
        assert.equal(sent.get('parent_id'), '100');
        assert.ok(sent.get('route_name'));
        assert.ok(sent.get('route_parameters'));
        await waitFor(() => form.textContent.includes('El registro cambió.'));
      }
    }
    assert.deepEqual(mounted.errors, []);
  } finally { mounted.dom.window.close(); }
}
console.log('Administración Quasar OK: ' + sections.join(', ') + '; formularios, permisos, CSRF y revisiones.');
