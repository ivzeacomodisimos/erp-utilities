import { createApp } from 'vue';
import { Quasar, Notify, Dialog } from 'quasar';
import iconSet from 'quasar/icon-set/svg-material-icons';
import 'quasar/dist/quasar.css';
import './crud-kit.css';
import CrudTable from './CrudTable.vue';

const instances = new WeakMap();
function elementFor(selector) {
  return typeof selector === 'string' ? document.querySelector(selector) : selector;
}
export function filter(selector, values) {
  const instance = instances.get(elementFor(selector));
  if (instance) instance.filter(values);
}
export function reload(selector) {
  const instance = instances.get(elementFor(selector));
  if (instance) return instance.reload();
}

/**
 * Mounts a CRUD described by the PHP QuasarRenderer schema.
 *
 * @param {string} selector element where the CRUD is painted
 * @param {object} schema see Ivandzb\CrudKit\Render\Quasar\QuasarRenderer::schema()
 */
export function mount(selector, schema) {
  const element = elementFor(selector);
  if (!element) {
    throw new Error(`crud-kit: element not found: ${selector}`);
  }
  const app = createApp(CrudTable, { schema });
  app.use(Quasar, { plugins: { Notify, Dialog }, iconSet, config: { dark: false } });
  const instance = app.mount(element);
  instances.set(element, instance);
  return instance;
}
