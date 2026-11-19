import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM, VirtualConsole } from '../packages/ui-kit/quasar/node_modules/jsdom/lib/api.js';

const fixture = JSON.parse(await readFile(new URL('../.runtime/tests/program-wizard-ui.json', import.meta.url), 'utf8'));
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function waitFor(check) {
  for (let i = 0; i < 180; i++) { const result = check(); if (result) return result; await sleep(50); }
  throw new Error('El asistente no alcanzó el estado esperado.');
}
async function run(failPublish, related = false) {
  const errors = [], calls = [];
  const withRelated = state => related ? { ...state, related_menus: [{ id: 123, label: 'Catálogo relacionado' }] } : state;
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', error => { if (error.type !== 'css parsing') errors.push(error.message); });
  const dom = new JSDOM(fixture.html.replace(/http:\/\/localhost(?::\d+)?/g, 'http://web'), {
    url: 'http://web/administracion/asistente-programas', runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true, virtualConsole,
    beforeParse(window) {
      window.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
      window.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
      window.scrollTo = () => {}; window.Element.prototype.scrollTo = () => {};
      Object.defineProperty(window.screen, 'orientation', { value: { type: 'landscape-primary', angle: 0, addEventListener() {}, removeEventListener() {} } });
      window.fetch = async (url, options) => {
        if (!options.method) { assert.equal(new URL(url).searchParams.get('program_id'), String(fixture.initial.program.id)); return { ok: true, json: async () => ({ State: withRelated(fixture.initial) }) }; }
        const body = JSON.parse(options.body); calls.push(body);
        assert.ok(body._token); assert.equal(options.headers['X-CSRF-TOKEN'], body._token);
        if (body.action === 'prepare') { assert.equal(body.snapshot, fixture.initial.snapshot); return { ok: true, json: async () => ({ State: withRelated(fixture.prepared) }) }; }
        assert.equal(body.action, 'publish'); assert.equal(body.snapshot, fixture.prepared.snapshot);
        assert.equal(body.route_name, 'prueba.index'); assert.equal(body.route_uri, '/aplicaciones/prueba'); assert.equal(body.parent_id, 50);
        assert.equal(body.grants[0].user_id, fixture.reader_id); assert.equal(body.grants[0].can_view, true); assert.equal(body.grants[0].can_create, true);
        assert.equal(body.grants[0].can_delete, false);
        assert.equal(body.grant_related_view, related);
        if (failPublish) return { ok: false, status: 422, json: async () => ({ errors: { route_uri: ['La dirección ya está registrada. Revise la ruta.'] } }) };
        return { ok: true, json: async () => ({ State: withRelated(fixture.published) }) };
      };
    },
  });
  try {
    if (dom.window.document.readyState !== 'complete') await new Promise(resolve => dom.window.addEventListener('load', resolve, { once: true }));
    const doc = dom.window.document, get = id => doc.querySelector('#wizard-' + id);
    try { await waitFor(() => get('program-info')?.textContent.includes('Pendiente de preparación')); } catch (error) { throw new Error(error.message + JSON.stringify(errors)); }
    assert.equal(get('next').disabled, true);
    get('prepare').click();
    await waitFor(() => get('program-info').textContent.includes('CRUD preparado') && !get('controls').disabled);
    get('next').click(); assert.equal(doc.querySelector('[data-step="1"]').hidden, false);
    assert.equal(get('route-name').value, 'prueba.index'); assert.equal(get('uri').value, '/aplicaciones/prueba');
    assert.ok(get('parent').value.includes('50'));
    get('next').click(); assert.equal(doc.querySelector('[data-step="2"]').hidden, false);
    get('user').value = fixture.reader_id; get('add-user').click();
    if (related) { assert.equal(get('related').hidden, false); get('related-view').checked = true; }
    const create = get('grants').querySelector('input[aria-label^="Crear ·"]'); create.checked = true; create.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
    get('next').click(); assert.equal(doc.querySelector('[data-step="3"]').hidden, false);
    assert.match(get('review').textContent, /prueba.index/); assert.match(get('review').textContent, /Consultar, Crear/);
    get('back').click(); assert.equal(doc.querySelector('[data-step="2"]').hidden, false);
    get('next').click();
    get('publish').click(); get('form').dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));
    if (failPublish) {
      await waitFor(() => !get('errors').hidden && !get('controls').disabled);
      assert.match(get('errors').textContent, /La dirección ya está registrada/);
      assert.equal(get('complete').hidden, true); assert.equal(get('uri').value, '/aplicaciones/prueba');
      assert.equal(doc.querySelector('[data-step="3"]').hidden, false);
    } else {
      await waitFor(() => !get('complete').hidden);
      assert.equal(new URL(get('open').href).pathname, '/aplicaciones/prueba');
      assert.equal(get('form').hidden, true);
      get('again').click(); assert.equal(get('form').hidden, false);
      assert.equal(get('route-name').readOnly, true);
      assert.equal(get('grants').querySelectorAll('tbody tr').length, 1);
    }
    assert.equal(calls.filter(call => call.action === 'publish').length, 1);
    assert.deepEqual(errors, []);
  } finally { dom.window.close(); }
}
await run(false);
await run(true);
await run(false, true);
console.log('Asistente OK: preparar, ruta y menú, usuarios, revisión, alta, recuperación de errores y protección de doble envío.');
