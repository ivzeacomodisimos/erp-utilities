import { createApp } from 'vue';
import {
  Quasar, Notify, Dialog,
  QAvatar, QBadge, QBanner, QBtn, QCard, QCardActions, QCardSection, QChip, QDrawer,
  QExpansionItem, QFooter, QHeader, QIcon, QItem, QItemLabel, QItemSection, QLayout, QList,
  QPage, QPageContainer, QSeparator, QSpace, QTab, QTabPanel, QTabPanels, QTabs, QToolbar,
  QToolbarTitle, QTooltip,
} from 'quasar';
import 'quasar/dist/quasar.css';
import './ui-kit.css';
import { registry, renderNodes } from './render';
import { UkInput, UkLayout, UkMenu, UkRaw, UkTabs } from './components';

export function setFieldValue(id, value) {
  const element = document.getElementById(id);
  if (!element) return;
  element.value = element.type === 'file' ? '' : String(value ?? '');
  element.dispatchEvent(new CustomEvent('ui-kit:set-value', { detail: { value } }));
}
export function getFieldValue(id) {
  const element = document.getElementById(id);
  if (!element) return null;
  const detail = { value: element.type === 'file' ? element.files?.[0] : element.value };
  element.dispatchEvent(new CustomEvent('ui-kit:get-value', { detail }));
  return detail.value;
}
export function setFieldDisabled(id, disabled) {
  const element = document.getElementById(id);
  if (!element) return;
  element.disabled = !!disabled;
  element.dispatchEvent(new CustomEvent('ui-kit:set-disabled', { detail: { disabled } }));
}

// Domain controllers can use the same themed feedback as components.
export function notify(message, type = 'info') {
  return Notify.create({ message: String(message), type, position: 'top', html: false });
}
export function confirm(message, title = 'Confirmar') {
  return new Promise((resolve) => {
    Dialog.create({ title: String(title), message: String(message), html: false,
      cancel: { label: 'Cancelar', flat: true }, ok: { label: 'Aceptar', color: 'primary' }, persistent: true })
      .onOk(() => resolve(true)).onCancel(() => resolve(false));
  });
}
export function alert(message, title = 'Informacion') {
  return new Promise((resolve) => {
    Dialog.create({ title: String(title), message: String(message), html: false, class: 'uk-feedback-dialog', ok: { label: 'Aceptar' } }).onDismiss(resolve);
  });
}

// Quasar components the PHP side can name (Element::make('q-chip') also works).
Object.assign(registry, {
  'q-avatar': QAvatar,
  'q-badge': QBadge,
  'q-banner': QBanner,
  'q-btn': QBtn,
  'q-card': QCard,
  'q-card-actions': QCardActions,
  'q-card-section': QCardSection,
  'q-chip': QChip,
  'q-drawer': QDrawer,
  'q-expansion-item': QExpansionItem,
  'q-footer': QFooter,
  'q-header': QHeader,
  'q-icon': QIcon,
  'q-item': QItem,
  'q-item-label': QItemLabel,
  'q-item-section': QItemSection,
  'q-layout': QLayout,
  'q-list': QList,
  'q-page': QPage,
  'q-page-container': QPageContainer,
  'q-separator': QSeparator,
  'q-space': QSpace,
  'q-tab': QTab,
  'q-tab-panel': QTabPanel,
  'q-tab-panels': QTabPanels,
  'q-tabs': QTabs,
  'q-toolbar': QToolbar,
  'q-toolbar-title': QToolbarTitle,
  'q-tooltip': QTooltip,
  'uk-layout': UkLayout,
  'uk-input': UkInput,
  'uk-menu': UkMenu,
  'uk-raw': UkRaw,
  'uk-tabs': UkTabs,
});

/**
 * Paints a tree described by the PHP QuasarRenderer.
 *
 * @param {string|Element} selector mount point
 * @param {Array} tree list of nodes
 */
export function mount(selector, tree) {
  const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
  if (!element) {
    throw new Error(`ui-kit: element not found: ${selector}`);
  }
  const app = createApp({ name: 'UiKitPage', render: () => renderNodes(tree) });
  app.use(Quasar, { plugins: { Notify, Dialog }, config: { dark: false } });
  app.mount(element);
  return app;
}
