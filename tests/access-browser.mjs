import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM, VirtualConsole } from '../packages/ui-kit/quasar/node_modules/jsdom/lib/api.js';

const fixture = JSON.parse(await readFile(new URL('../.runtime/tests/access-ui.json', import.meta.url), 'utf8'));
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function waitFor(check) {
  for (let i = 0; i < 140; i++) {
    const result = check();
    if (result) return result;
    await sleep(50);
  }
  throw new Error('La interfaz no alcanzó el estado esperado.');
}
async function mount(section) {
  const errors = [], calls = [];
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
        calls.push({ action, options });
        assert.equal(options.method, 'POST');
        assert.ok(options.body.get('_token'));
        return { json: async () => action === 'list' ? fixture[section + '_list']
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
  return { dom, errors, calls };
}
for (const section of ['menu', 'permisos', 'usuarios', 'opciones', 'user']) {
  const mounted = await mount(section);
  try {
    const doc = mounted.dom.window.document;
    assert.match(doc.body.textContent, /ERP Utilities/);
    assert.match(doc.body.textContent, /Consulta pedidos/);
    if (section === 'user') {
      assert.equal(doc.querySelector('a[href$="/administracion/menu"]'), null);
      assert.equal(doc.querySelector('a[href$="/menu/102"]'), null);
    } else {
      const table = await waitFor(() => doc.querySelector('#ck-access-' + section + ' .q-table'));
      assert.ok(table);
      assert.ok(doc.querySelector('a[href$="/administracion/permisos"]'));
      if (section === 'opciones') {
        assert.match(table.textContent, /Lectura/);
        assert.match(table.textContent, /Insertar/);
        assert.match(table.textContent, /Modificar/);
        assert.match(table.textContent, /Eliminar/);
      }
      if (section === 'menu') {
        await waitFor(() => table.querySelector('tbody tr button'));
        table.querySelector('tbody tr button').click();
        const form = await waitFor(() => doc.querySelector('.q-dialog form'));
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
        await waitFor(() => form.textContent.includes('El registro cambió.'));
      }
    }
    assert.deepEqual(mounted.errors, []);
  } finally { mounted.dom.window.close(); }
}
console.log('Accesos Quasar OK: menú por usuario, cuatro CRUD, permisos de botones, CSRF, revisiones y errores de edición.');
