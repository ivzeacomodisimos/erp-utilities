// Smoke test of the built bundle in jsdom: node test/smoke.mjs
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { sequenceNow, sequenceRange } from '../src/createSequence.js';

const schema = JSON.parse(execFileSync('php', ['test/schema.php'], { encoding: 'utf8' }).replace(/^[^{]*/, ''));
const dom = new JSDOM('<!doctype html><html><body><div class="ck-quasar" id="ck-trips"></div></body></html>', {
  url: 'http://localhost/', pretendToBeVisual: true, runScripts: 'outside-only',
});
const { window } = dom;
window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
window.ResizeObserver = window.ResizeObserver || class { observe() {} unobserve() {} disconnect() {} };
window.scrollTo = () => {};
window.Element.prototype.scrollTo = window.Element.prototype.scrollTo || function () {};
// Present in every browser, missing in jsdom.
Object.defineProperty(window.screen, 'orientation', { value: { type: 'landscape-primary', angle: 0, addEventListener() {}, removeEventListener() {} } });

const calls = [];
let childDataReady = true;
let listGate = null;
window.fetch = async (url, options) => {
  const params = Object.fromEntries(new URLSearchParams(options.body.toString()));
  const action = new URL(url, 'http://localhost/').searchParams.get('action');
  const crud = new URL(url, 'http://localhost/').searchParams.get('crud');
  calls.push({ crud, action, params });
  let payload = { Result: 'OK' };
  if (action === 'list' && crud === 'trips') {
    if (listGate) await listGate;
    payload = { Result: 'OK', TotalRecordCount: 2, Records: [
      { id: 7, name: 'Primero', city: '05001', city__text: 'Medellín', leg: 'T1', detail: '<b class="html-ok">7</b>' },
      { id: 8, name: 'Segundo', city: '11001', city__text: 'Bogotá', leg: 'T2', detail: '' },
    ] };
  } else if (action === 'list' && crud === 'trip-lists') {
    payload = { Result: 'OK', TotalRecordCount: childDataReady ? 1 : 0,
      Records: childDataReady ? [{ list: 900, trip: Number(params.trip), state: 'En tránsito' }] : [] };
  } else if (action === 'byName') {
    payload = { Result: 'OK', Record: { leg: 'T2', name: 'no se pisa' } };
  } else if (action === 'suggest') {
    return { json: async () => [{ value: 'Primero guardado', label: 'Primero guardado', caption: 'Ruta del primero' }, { value: 'Primero guardado', label: 'Primero guardado' }] };
  } else if (action === 'create') {
    payload = { Result: 'OK', Record: params };
  }
  return { json: async () => payload };
};

const errors = [];
window.addEventListener('error', (e) => errors.push(e.message));
const tick = (ms = 50) => new Promise((resolve) => setTimeout(resolve, ms));
let failed = 0;
function check(name, ok, detail = '') {
  console.log(`${ok ? '  ok  ' : '  FALLA'} ${name}${ok || !detail ? '' : ' → ' + detail}`);
  if (!ok) failed++;
}

// Control the optional refresh clock without waiting five real seconds.
const refreshTimers = new Map();
let fakeTimerId = 100000;
const originalInterval = window.setInterval.bind(window);
const originalClearInterval = window.clearInterval.bind(window);
window.setInterval = (callback, delay, ...args) => {
  if (delay !== 5000) return originalInterval(callback, delay, ...args);
  const id = ++fakeTimerId;
  refreshTimers.set(id, callback);
  return id;
};
window.clearInterval = (id) => {
  if (!refreshTimers.delete(id)) originalClearInterval(id);
};
schema.children[0].schema.refreshSeconds = 5;
window.eval(readFileSync('../assets/quasar/crud-kit-quasar.js', 'utf8'));
check('no expone window.Vue', window.Vue === undefined);
window.CrudKitQuasar.mount('#ck-trips', schema);
await tick(150);
const root = window.document.querySelector('#ck-trips');
const text = () => window.document.body.textContent;

check('título y filtros', text().includes('Viajes de prueba') && text().includes('Filtrar'));
check('lista pedida con orden y página', calls[0] && calls[0].action === 'list' && calls[0].params.jtPageSize === '10' && calls[0].params.jtSorting === 'id ASC', JSON.stringify(calls[0]));
check('filas con textos de lookup y opciones', text().includes('Medellín') && text().includes('Tramo 2') && text().includes('Segundo'));
check('campo html', !!root.querySelector('b.html-ok'));

const childButton = root.querySelector('.ck-q-child-button');
check('botón de tabla hija', !!childButton);
childButton.click();
await tick(150);
const childCall = calls.find((c) => c.crud === 'trip-lists');
check('hija pedida con el vínculo trip=7', childCall && childCall.params.trip === '7', JSON.stringify(childCall));
check('hija pintada', text().includes('En tránsito'));
const closeChildButton = root.querySelector('.ck-q-child-panel .ck-q-close-child');
check('submantenimiento tiene X accesible', !!closeChildButton && closeChildButton.getAttribute('aria-label') === 'Cerrar');
closeChildButton.click();
await tick(100);
check('X cierra solo el detalle y conserva tabla principal', !root.querySelector('.ck-q-child-panel') && text().includes('Segundo'));
check('tabla principal no tiene X de submantenimiento', !root.querySelector('.ck-q-close-child'));
check('cerrar detalle detiene su refresco automatico', refreshTimers.size === 0);
root.querySelector('.ck-q-child-button').click();
await tick(150);
check('el detalle se puede abrir otra vez', !!root.querySelector('.ck-q-child-panel') && text().includes('En tránsito'));
check('refresco habilitado solo en el detalle', refreshTimers.size === 1 && !root.querySelector(':scope > .ck-crud-quasar > .ck-q-refresh'));
const refreshChild = root.querySelector('.ck-q-child-panel .ck-q-refresh');
check('boton Actualizar del historial visible', !!refreshChild && refreshChild.textContent.includes('Actualizar'));
childDataReady = false;
refreshChild.click();
await tick(100);
check('permite consultar historial aun vacio', !text().includes('En tránsito'));
childDataReady = true;
const beforeRefresh = calls.length;
[...refreshTimers.values()][0]();
await tick(100);
check('eventos posteriores aparecen sin cerrar el detalle', text().includes('En tránsito')
  && calls.slice(beforeRefresh).length === 1 && calls.at(-1).action === 'list' && calls.at(-1).params.trip === '7');
Object.defineProperty(window.document, 'visibilityState', { configurable: true, value: 'hidden' });
const beforeHidden = calls.length;
[...refreshTimers.values()][0]();
await tick(30);
check('pausa consultas automaticas en pestana oculta', calls.length === beforeHidden);
Object.defineProperty(window.document, 'visibilityState', { configurable: true, value: 'visible' });

const addButton = [...root.querySelectorAll('button')].find((b) => b.textContent.includes('Adicionar nuevo registro'));
check('botón crear', !!addButton);
addButton.click();
await tick(200);
const form = window.document.querySelector('.ck-q-form-card form');
check('diálogo de creación', !!form && text().includes('Grabar'));
const before = calls.length;
form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
await tick(200);
check('validación impide grabar vacío', calls.slice(before).every((c) => c.action !== 'create') && text().includes('Este campo es obligatorio'), calls.slice(before).map((c) => c.action).join(','));

const nameInput = [...window.document.querySelectorAll('.ck-q-form-card input')][0];
nameInput.value = 'Nuevo';
nameInput.dispatchEvent(new window.Event('input', { bubbles: true }));
await tick(100);
nameInput.dispatchEvent(new window.FocusEvent('focusout', { bubbles: true }));
await tick(200);
const fillCall = calls.find((c) => c.action === 'byName');
check('al salir del campo pide el llenado con los valores del formulario', fillCall && fillCall.params.name === 'Nuevo', JSON.stringify(fillCall));
form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
await tick(300);
const create = calls.find((c) => c.action === 'create');
check('crear envía los valores', create && create.params.name === 'Nuevo', JSON.stringify(create));
check('el llenado completó otro campo sin pisar el que se editó', create && create.params.leg === 'T2', JSON.stringify(create));
// Filter with suggestions: free text, suggestions from action=suggest.
window.document.querySelectorAll('.q-dialog').forEach((d) => d.remove());
const filterInput = root.querySelector('.ck-q-filters .ck-q-filter input');
filterInput.value = 'pri';
filterInput.dispatchEvent(new window.Event('input', { bubbles: true }));
await tick(500);
const suggestCall = calls.find((c) => c.action === 'suggest');
check('el filtro pide sugerencias', suggestCall && suggestCall.params.term === 'pri' && suggestCall.crud === 'trips', JSON.stringify(suggestCall));
check('muestra la sugerencia con su segunda línea', text().includes('Primero guardado') && text().includes('Ruta del primero'));
const beforeFilter = calls.length;
root.querySelector('.ck-q-filters').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
await tick(200);
const filtered = calls.slice(beforeFilter).find((c) => c.action === 'list');
check('filtra con el texto escrito (sin elegir sugerencia)', filtered && filtered.params.name === 'pri', JSON.stringify(filtered));
// Custom multi-selection must work without granting delete permission.
const hostSelection = window.document.createElement('div');
hostSelection.id = 'selection-only';
window.document.body.appendChild(hostSelection);
const selectionSchema = JSON.parse(JSON.stringify(schema));
delete selectionSchema.urls.delete;
selectionSchema.children = [];
selectionSchema.selectionActions = [{ name: 'processRows', label: 'Procesar bloque',
  url: 'api.php?crud=trips&action=processRows', params: { _csrf: 'session-token' } }];
window.CrudKitQuasar.mount('#selection-only', selectionSchema);
await tick(200);
const selectButton = [...hostSelection.querySelectorAll('button')].find((b) => b.textContent.includes('Procesar bloque'));
check('accion de seleccion visible y bloqueada sin filas', !!selectButton && selectButton.disabled);
check('accion contrasta con la barra azul', selectButton.classList.contains('text-white') && !selectButton.classList.contains('text-primary'));
const boxes = hostSelection.querySelectorAll('tbody .q-checkbox');
check('checkboxes disponibles sin permiso de eliminar', boxes.length === 2);
for (const box of boxes) {
  box.click();
  await tick(30);
}
await tick(50);
selectButton.click();
selectButton.click();
await tick(300);
const processed = calls.filter((c) => c.action === 'processRows');
check('procesa dos filas una vez y conserva CSRF', processed.length === 2
  && processed.every((c) => c.params._csrf === 'session-token')
  && processed.map((c) => JSON.parse(c.params.selected)[0].id).join(',') === '7,8', JSON.stringify(processed));
check('reloj usa fecha de Bogota incluso al cambiar de dia UTC',
  sequenceNow('America/Bogota', new Date('2026-11-05T04:59:59Z')) === '2026-11-04 23:59:59');
const sequence = { totalField: 'total', incrementField: 'number', nowField: 'date',
  timeZone: 'America/Bogota', maxValue: 99, commonFields: ['lot', 'height', 'width', 'density'],
  resetValues: { length: '', weight: '', quality: '' }, progressLabel: 'Bloque {current} de {total}',
  invalidMessage: 'Secuencia fuera de rango' };
check('rango controla inicio, total y ultimo numero',
  sequenceRange({ total: 3, number: 97 }, sequence)?.start === 97
  && sequenceRange({ total: 4, number: 97 }, sequence) === null
  && sequenceRange({ total: 0, number: 1 }, sequence) === null);
const hostSequence = window.document.createElement('div');
hostSequence.id = 'create-sequence';
window.document.body.appendChild(hostSequence);
const sequenceSchema = JSON.parse(JSON.stringify(schema));
sequenceSchema.id = 'sequence';
sequenceSchema.title = 'Captura de bloques';
sequenceSchema.urls = { list: 'api.php?crud=sequence&action=list', create: 'api.php?crud=sequence&action=create' };
sequenceSchema.children = [];
sequenceSchema.selection = null;
sequenceSchema.createSequence = sequence;
sequenceSchema.fields = [{ name: 'id', title: 'Id', key: true, list: true, create: false, edit: false, type: 'number', rules: {} },
  ...['total','lot','height','width','density','number','date','length','weight','quality'].map((name) => ({
    name, title: name, type: 'text', create: true, edit: true, list: true, rules: { required: true },
  }))];
const sequencePosts = [];
let failedOnce = false;
const previousFetch = window.fetch;
window.fetch = async (url, options) => {
  const u = new URL(url, 'http://localhost/');
  if (u.searchParams.get('crud') !== 'sequence') return previousFetch(url, options);
  const params = Object.fromEntries(new URLSearchParams(options.body.toString()));
  if (u.searchParams.get('action') === 'create') {
    sequencePosts.push(params);
    if (params.number === '98' && !failedOnce) {
      failedOnce = true;
      return { json: async () => ({ Result: 'ERROR', Message: 'Broker sin confirmar' }) };
    }
    return { json: async () => ({ Result: 'OK', Record: params }) };
  }
  return { json: async () => ({ Result: 'OK', TotalRecordCount: 0, Records: [] }) };
};
window.CrudKitQuasar.mount('#create-sequence', sequenceSchema);
await tick(100);
[...hostSequence.querySelectorAll('button')].find((b) => b.textContent.includes('Adicionar')).click();
await tick(100);
const sequenceInput = (name) => [...window.document.querySelectorAll('.ck-q-form-card .q-field')]
  .find((f) => f.querySelector('.q-field__label')?.textContent === name)?.querySelector('input');
const typeSequence = async (values) => {
  for (const [name, value] of Object.entries(values)) {
    const input = sequenceInput(name);
    input.value = value;
    input.dispatchEvent(new window.Event('input', { bubbles: true }));
  }
  await tick(30);
};
const submitSequence = () => window.document.querySelector('.ck-q-form-card form')
  .dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
check('inicia fecha actual automaticamente', /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(sequenceInput('date').value));
await typeSequence({ total: '4', number: '97', lot: '26110314', height: '660', width: '1905',
  density: '35', length: '1405', weight: '59.5', quality: 'A' });
submitSequence();
await tick(150);
check('secuencia que supera 99 no publica', sequencePosts.length === 0);
await typeSequence({ total: '3' });
submitSequence();
submitSequence();
await tick(250);
check('primer bloque no cierra dialogo ni duplica envio', sequencePosts.length === 1 && !!sequenceInput('number'));
check('incrementa numero y conserva datos comunes bloqueados', sequenceInput('number').value === '98'
  && sequenceInput('lot').value === '26110314' && sequenceInput('height').value === '660'
  && sequenceInput('width').value === '1905' && sequenceInput('density').value === '35'
  && sequenceInput('total').readOnly && sequenceInput('lot').readOnly);
check('limpia datos variables del siguiente corte', sequenceInput('length').value === ''
  && sequenceInput('weight').value === '' && sequenceInput('quality').value === '');
await typeSequence({ length: '1300', weight: '55', quality: 'B' });
submitSequence();
await tick(180);
check('fallo conserva numero y valores sin avanzar', sequenceInput('number').value === '98'
  && sequenceInput('weight').value === '55' && window.document.body.textContent.includes('Bloque 2 de 3'));
submitSequence();
await tick(180);
check('aceptacion posterior avanza una sola vez', sequenceInput('number').value === '99');
await typeSequence({ length: '1200', weight: '50', quality: 'A' });
submitSequence();
await tick(350);
check('ultimo bloque cierra dialogo', !window.document.querySelector('.ck-q-form-card'));
check('cada corte lleva sus datos nuevos y comunes', sequencePosts.map((p) => p.number).join(',') === '97,98,98,99'
  && sequencePosts.every((p) => p.lot === '26110314' && p.width === '1905')
  && sequencePosts[3].weight === '50');
// Resume an interrupted lot: total means the last block number, not another 14 creations.
const resumedOptions = { ...sequence, totalIsLastNumber: true };
check('retomar valida el numero contra el total del lote',
  sequenceRange({ total: 14, number: 12 }, resumedOptions)?.end === 14
  && sequenceRange({ total: 14, number: 15 }, resumedOptions) === null
  && sequenceRange({ total: 100, number: 12 }, resumedOptions) === null);
const resumeHost = window.document.createElement('div');
resumeHost.id = 'resume-sequence';
window.document.body.appendChild(resumeHost);
window.CrudKitQuasar.mount('#resume-sequence', { ...sequenceSchema, createSequence: resumedOptions });
await tick(120);
[...resumeHost.querySelectorAll('button')].find((b) => b.textContent.includes('Adicionar')).click();
await tick(100);
const previousPosts = sequencePosts.length;
await typeSequence({ total: '14', number: '15', lot: '26110314', height: '660', width: '1905',
  density: '35', length: '1405', weight: '59.5', quality: 'A' });
submitSequence();
await tick(100);
check('no permite registrar un bloque superior al total', sequencePosts.length === previousPosts);
await typeSequence({ number: '12' });
for (const block of [12, 13, 14]) {
  if (block > 12) await typeSequence({ length: '1405', weight: '59.5', quality: 'A' });
  check(`retoma en bloque ${block} de 14`, sequenceInput('number').value === String(block)
    && window.document.body.textContent.includes(`Bloque ${block} de 14`));
  submitSequence();
  await tick(block === 14 ? 350 : 150);
  if (block < 14) check(`mantiene abierto despues del bloque ${block}`, !!sequenceInput('number'));
}
check('cierra en 14 sin sugerir ni enviar el 15', !window.document.querySelector('.ck-q-form-card')
  && sequencePosts.slice(previousPosts).map((p) => p.number).join(',') === '12,13,14');
// Hold a real list request to exercise both button clicks and form submission (Enter).
const filterForm=window.document.querySelector('#ck-trips .ck-q-filters');
const filterButton=filterForm.querySelector('button[type="submit"]');
const tripLists=()=>calls.filter(call=>call.crud==='trips'&&call.action==='list').length;
const submitFilter=()=>filterForm.dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));
let releaseList;
listGate=new Promise(resolve=>{releaseList=resolve;});
const beforeBlockedFilter=tripLists();
submitFilter();await tick();
check('Filtrar se bloquea y muestra carga mientras espera al backend',filterButton.disabled&&!!filterButton.querySelector('.q-spinner')&&tripLists()===beforeBlockedFilter+1);
filterButton.click();submitFilter();submitFilter();await tick();
check('Clicks repetidos y Enter no acumulan peticiones al backend',tripLists()===beforeBlockedFilter+1);
releaseList();listGate=null;await tick(100);
check('Filtrar vuelve a estar disponible al terminar',!filterButton.disabled);
let rejectList;
listGate=new Promise((resolve,reject)=>{rejectList=reject;});
submitFilter();await tick();
rejectList(new Error('Simulated backend failure'));listGate=null;await tick(100);
check('Un error tambien desbloquea Filtrar',!filterButton.disabled);
submitFilter();await tick(100);
check('Permite una nueva consulta despues del error',tripLists()===beforeBlockedFilter+3&&!filterButton.disabled);
check('sin errores JS', errors.length === 0, errors.join(' | '));
console.log(failed === 0 ? '\nsmoke OK' : `\n${failed} fallas`);
process.exit(failed === 0 ? 0 : 1);
