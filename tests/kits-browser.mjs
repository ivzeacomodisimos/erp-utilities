import assert from 'node:assert/strict';
import { JSDOM, VirtualConsole, CookieJar } from '../packages/ui-kit/quasar/node_modules/jsdom/lib/api.js';
const origin = process.env.ERP_TEST_ORIGIN || 'http://web';
const cookieJar = new CookieJar();
const errors = [];
const virtualConsole = new VirtualConsole();
virtualConsole.on('jsdomError', error => {
  if (error.type !== 'css parsing') errors.push(error.message);
});
const dom = await JSDOM.fromURL(origin + '/login', {
  cookieJar, virtualConsole, runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true,
  beforeParse(window) {
    window.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
    window.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
    window.scrollTo = () => {};
    window.Element.prototype.scrollTo = () => {};
    Object.defineProperty(window.screen, 'orientation', { value: { type: 'landscape-primary', angle: 0, addEventListener() {}, removeEventListener() {} } });
  },
});
if (dom.window.document.readyState !== 'complete') {
  await new Promise(resolve => dom.window.addEventListener('load', resolve, { once: true }));
}
for (let i = 0; i < 100 && !dom.window.document.querySelector('#uk-app form'); i++) {
  await new Promise(resolve => setTimeout(resolve, 100));
}
const document = dom.window.document;
assert.ok(document.querySelector('#uk-app .q-layout'), 'ui-kit debe montar el login Quasar');
const form = document.querySelector('form[action$="/login"]');
assert.ok(form);
assert.equal(form.method, 'post');
assert.ok(form.querySelector('input[name="_token"]').value);
assert.equal(form.querySelector('input[name="username"]').autocomplete, 'username');
assert.equal(form.querySelector('input[name="password"]').type, 'password');
assert.equal(form.querySelector('input[name="password"]').autocomplete, 'current-password');
assert.equal(form.querySelector('input[name="password"]').value, '');
assert.ok(form.querySelector('button[type="submit"]'));
assert.equal(document.querySelector('.uk-left'), null);
const privatePage = await fetch(origin + '/', { redirect: 'manual' });
assert.equal(privatePage.status, 302);
assert.ok(privatePage.headers.get('location').endsWith('/login'));
assert.equal((await fetch(origin + '/api/v1/me')).status, 401);
assert.equal((await fetch(origin + '/administracion/menu?crud=access-menu&action=list', { redirect: 'manual' })).status, 302);
dom.window.close();
assert.deepEqual(errors, []);
console.log('Login Quasar OK: campos, contraseña oculta, CSRF, submit y rutas privadas inaccesibles sin JWT.');
console.log('Los menús autenticados, tokens y permisos se verifican en PHPUnit aislado.');
