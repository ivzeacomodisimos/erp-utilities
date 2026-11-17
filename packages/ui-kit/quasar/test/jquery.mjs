// Behavior of the HTML + jQuery renderer (assets/ui-kit.js) in jsdom: node test/jquery.mjs
import { JSDOM, VirtualConsole } from 'jsdom';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const html = execFileSync('php', ['test/page-jquery.php'], { encoding: 'utf8' }).replace(/^[^<]*/, '');
const errors = [];
const virtualConsole = new VirtualConsole();
virtualConsole.on('jsdomError', (e) => errors.push(e.message));
const dom = new JSDOM(html, { url: pathToFileURL(`${process.cwd()}/test/page.html`).href, runScripts: 'dangerously', resources: 'usable', virtualConsole });
const { window } = dom;
await new Promise((resolve) => window.addEventListener('load', resolve));

let failed = 0;
function check(name, ok, detail = '') {
  console.log(`${ok ? '  ok  ' : '  FALLA'} ${name}${ok || !detail ? '' : ' → ' + detail}`);
  if (!ok) failed++;
}
const doc = window.document;
const click = (el) => el.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
const layout = doc.querySelector('[data-uk-layout]');

check('jQuery cargado y la página pintada', typeof window.jQuery === 'function' && !!layout);
click(doc.querySelector('[data-uk-toggle="left"]'));
check('el botón ☰ abre el panel izquierdo', layout.classList.contains('is-left-open'));
click(doc.querySelector('[data-uk-close]'));
check('el fondo oscuro lo cierra', !layout.classList.contains('is-left-open'));

const group = doc.querySelector('[data-uk-menu-toggle]');
check('el grupo del menú empieza cerrado', group.getAttribute('aria-expanded') === 'false' && group.nextElementSibling.hidden);
click(group);
check('al pulsarlo se abre', group.getAttribute('aria-expanded') === 'true' && !group.nextElementSibling.hidden);

const search = doc.querySelector('[data-uk-menu-search]');
const typeSearch = (text) => { search.value = text; search.dispatchEvent(new window.Event('input', { bubbles: true })); };
const optionLi = (label) => [...doc.querySelectorAll('.uk-menu li')].find((li) => li.querySelector('.uk-menu-label')?.textContent === label);
group.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
typeSearch('pick');
check('el buscador encuentra la opción hija y abre su grupo', !optionLi('Picking').hidden && !optionLi('Logística').hidden
  && group.getAttribute('aria-expanded') === 'true' && optionLi('Inicio').hidden);
typeSearch('ick');
check('solo coincide con el inicio de las palabras', optionLi('Picking').hidden && !doc.querySelector('.uk-menu-empty').hidden);
typeSearch('LOGISTICA');
check('sin distinguir mayúsculas ni tildes, el grupo trae sus opciones', !optionLi('Logística').hidden && !optionLi('Picking').hidden && optionLi('Inicio').hidden);
typeSearch('zzz');
check('sin coincidencias muestra el aviso', !doc.querySelector('.uk-menu-empty').hidden && optionLi('Inicio').hidden);
typeSearch('');
check('al borrar vuelve el menú como estaba', !optionLi('Inicio').hidden && doc.querySelector('.uk-menu-empty').hidden
  && group.getAttribute('aria-expanded') === 'false');

const [tab1, tab2] = doc.querySelectorAll('[data-uk-tab]');
click(tab2);
check('la pestaña cambia de panel', tab2.getAttribute('aria-selected') === 'true' && doc.querySelector('#t-panel-uno').hidden && !doc.querySelector('#t-panel-dos').hidden);
tab2.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
check('las flechas del teclado mueven entre pestañas', tab1.getAttribute('aria-selected') === 'true');

check('sin errores de JavaScript', errors.length === 0, errors.join(' | '));
console.log(failed === 0 ? '\njquery OK' : `\n${failed} fallas`);
process.exit(failed === 0 ? 0 : 1);
