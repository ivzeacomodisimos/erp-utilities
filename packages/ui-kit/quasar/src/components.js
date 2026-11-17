import { computed, defineComponent, h, onBeforeUnmount, onMounted, ref } from 'vue';
import {
  QBadge, QBtn, QBtnDropdown, QDrawer, QExpansionItem, QFooter, QHeader, QIcon, QItem, QItemSection, QLayout,
  QFile, QInput, QList, QPage, QPageContainer, QSeparator, QTab, QTabPanel, QTabPanels, QTabs,
} from 'quasar';
import { renderNodes } from './render';

/** Form field with local state and explicit DOM bridge for external domain scripts. */
export const UkInput = defineComponent({
  name: 'UkInput',
  props: { node: { type: Object, required: true } },
  setup(props) {
    const p = props.node.p || {};
    const isFile = p.type === 'file';
    const input = ref(null), value = ref(isFile ? null : (p.value || '')), disabled = ref(!!p.disabled);
    let native = null;
    const setValue = event => {
      value.value = isFile ? null : String(event.detail.value ?? '');
      if (native) native.value = isFile ? '' : value.value;
    };
    const getValue = event => { event.detail.value = value.value; };
    const setDisabled = event => { disabled.value = !!event.detail.disabled; if (native) native.disabled = disabled.value; };
    onMounted(() => {
      native = input.value.getNativeElement();
      native.addEventListener('ui-kit:set-value', setValue);
      native.addEventListener('ui-kit:set-disabled', setDisabled);
      native.addEventListener('ui-kit:get-value', getValue);
    });
    onBeforeUnmount(() => {
      native?.removeEventListener('ui-kit:set-value', setValue);
      native?.removeEventListener('ui-kit:set-disabled', setDisabled);
      native?.removeEventListener('ui-kit:get-value', getValue);
    });
    return () => {
      const { id, value: initial, disabled: initialDisabled, required, ...attrs } = p;
      // QFile clears its native input after selection; the field retains the File.
      return h(isFile ? QFile : QInput, { ...attrs, ref: input, for: id, outlined: true, stackLabel: true,
        ...(isFile ? {} : { required }), disable: disabled.value, modelValue: value.value,
        'onUpdate:modelValue': next => { value.value = next; } },
      isFile ? { prepend: () => h(QIcon, { name: 'upload_file' }) } : undefined);
    };
  },
});

/*
 * Trusted HTML (legacy screens, crud-kit, templates). The PHP side wrote it in the page,
 * hidden (#uk-raw-N), so its scripts already ran; here its nodes are moved into place,
 * keeping their event handlers. If this component goes away (a tab is closed) the nodes
 * go back to the hidden holder, so they are not lost.
 *
 * The block takes the font of the page <body>, not Quasar's, so legacy content looks
 * the same as in the old theme.
 */
export const UkRaw = defineComponent({
  name: 'UkRaw',
  props: { node: { type: Object, required: true } },
  setup(props) {
    const el = ref(null);
    let holder = null;
    onMounted(() => {
      holder = document.getElementById(props.node.p.source);
      if (!holder || !el.value) {
        return;
      }
      const body = window.getComputedStyle(document.body);
      ['fontFamily', 'fontSize', 'lineHeight', 'color'].forEach((property) => {
        el.value.style[property] = body[property];
      });
      while (holder.firstChild) {
        el.value.appendChild(holder.firstChild);
      }
    });
    onBeforeUnmount(() => {
      if (holder && el.value) {
        while (el.value.firstChild) {
          holder.appendChild(el.value.firstChild);
        }
      }
    });
    return () => h('div', { ref: el, class: 'uk-raw' });
  },
});

export const UkLayout = defineComponent({
  name: 'UkLayout',
  props: { node: { type: Object, required: true } },
  setup(props) {
    const slots = props.node.s || {};
    const p = props.node.p || {};
    const left = ref(false);
    const right = ref(false);
    const hasLeft = computed(() => (slots.left || []).length > 0);
    const hasRight = computed(() => (slots.right || []).length > 0);

    return () => {
      const children = [
        h(QHeader, { elevated: true, class: 'uk-header' }, () => h('div', { class: 'uk-header-row' }, [
          hasLeft.value
            ? h(QBtn, {
              flat: true, round: true, dense: true, icon: 'menu', 'aria-label': 'Menú', class: 'uk-drawer-toggle',
              onClick: () => { left.value = !left.value; },
            })
            : null,
          ...renderNodes(slots.header),
        ])),
      ];
      if (hasLeft.value) {
        // Floating: always the mobile drawer (hidden on load, over the content and the header,
        // as tall as the window, closed by its backdrop); otherwise shown on wide screens.
        const floating = p.leftFloating === true;
        children.push(h(QDrawer, {
          side: 'left', modelValue: left.value, 'onUpdate:modelValue': (value) => { left.value = value; },
          showIfAbove: !floating, behavior: floating ? 'mobile' : 'default',
          bordered: true, width: p.leftWidth || 270, class: 'uk-left',
        }, () => (floating
          ? [
            h('div', { class: 'uk-drawer-head' }, [
              h('span', { class: 'uk-drawer-title' }, 'Menú'),
              h(QBtn, {
                flat: true, round: true, dense: true, icon: 'close', 'aria-label': 'Cerrar menú', class: 'uk-drawer-close',
                onClick: () => { left.value = false; },
              }),
            ]),
            ...renderNodes(slots.left),
          ]
          : renderNodes(slots.left))));
      }
      if (hasRight.value) {
        children.push(h(QDrawer, {
          side: 'right', modelValue: right.value, 'onUpdate:modelValue': (value) => { right.value = value; },
          showIfAbove: true, bordered: true, width: p.rightWidth || 280, class: 'uk-right',
        }, () => h('div', { class: 'q-pa-md' }, renderNodes(slots.right))));
      }
      children.push(h(QPageContainer, null, () => h(QPage, { class: 'uk-main' }, () => renderNodes(slots.main))));
      if ((slots.footer || []).length > 0) {
        children.push(h(QFooter, { bordered: true, class: 'uk-footer' }, () => h('div', { class: 'uk-footer-row' }, renderNodes(slots.footer))));
      }
      const { leftWidth, rightWidth, leftFloating, ...attrs } = p;
      // Fixed header and footer; the side panels take the whole height beside them.
      return h(QLayout, { view: 'hHh LpR lFr', ...attrs, class: ['uk-layout', attrs.class] }, () => children);
    };
  },
});

function normalize(text) {
  return String(text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Every typed word must start a word of the label ("fact prob" finds "Facturas con problemas",
// "ob" does not find "problemas").
function matchesWords(label, term) {
  const words = normalize(label).split(/[^a-z0-9]+/);
  return term.split(/\s+/).every((part) => words.some((word) => word.startsWith(part)));
}

// Options that match the term; a group stays with the options that match, or with all of
// them when its own name matches.
function filterItems(items, term) {
  const result = [];
  items.forEach((item) => {
    if (matchesWords(item.label, term)) {
      result.push(item);
    } else if (item.items) {
      const children = filterItems(item.items, term);
      if (children.length > 0) {
        result.push({ ...item, items: children });
      }
    }
  });
  return result;
}

function menuItems(items, level, searching, onNavigate) {
  return items.map((item) => {
    if (item.items) {
      return h(QExpansionItem, {
        // While searching the groups open; a new key remounts them with their usual state after.
        key: (searching ? 'search:' : '') + item.label,
        label: item.label,
        icon: item.icon,
        defaultOpened: searching || !!item.open,
        headerClass: 'uk-menu-item uk-menu-group',
        contentInsetLevel: 0.4,
        expandIconClass: 'uk-menu-caret',
      }, () => h(QList, { dense: level > 0 }, () => menuItems(item.items, level + 1, searching, onNavigate)));
    }
    const sections = [];
    if (item.icon) {
      sections.push(h(QItemSection, { avatar: true }, () => h(QIcon, { name: item.icon })));
    }
    sections.push(h(QItemSection, null, () => item.label));
    if (item.badge) {
      sections.push(h(QItemSection, { side: true }, () => h(QBadge, { label: item.badge, color: 'primary' })));
    }
    return h(QItem, {
      clickable: !!item.href,
      tag: item.href ? 'a' : 'div',
      href: item.href,
      onClick: item.href ? onNavigate : undefined,
      active: !!item.active,
      activeClass: 'uk-menu-active',
      'aria-current': item.active ? 'page' : undefined,
      class: 'uk-menu-item',
      dense: level > 0,
    }, () => sections);
  });
}

export const UkMenu = defineComponent({
  name: 'UkMenu',
  props: { node: { type: Object, required: true } },
  setup(props) {
    const term = ref('');
    const dropdown = ref(null);
    const collapsed = ref(false);
    try { collapsed.value = localStorage.getItem('ui-kit:module-menu-collapsed') === 'true'; } catch (_) {}
    function toggleCollapsed() {
      collapsed.value = !collapsed.value;
      try { localStorage.setItem('ui-kit:module-menu-collapsed', String(collapsed.value)); } catch (_) {}
    }
    function activeLabel(items) {
      for (const item of items) {
        if (item.active && !item.items) return item.label;
        const child = item.items && activeLabel(item.items);
        if (child) return child;
      }
      return '';
    }
    return () => {
      const { items, search, noResults, mobileDropdown, ...attrs } = props.node.p || {};
      const searching = normalize(term.value.trim());
      const shown = searching ? filterItems(items || [], searching) : (items || []);
      const children = [];
      if (search) {
        children.push(h(QInput, {
          modelValue: term.value, 'onUpdate:modelValue': (value) => { term.value = value || ''; },
          dense: true, outlined: true, clearable: true, placeholder: search, 'aria-label': search,
          class: 'uk-menu-search', autocomplete: 'off',
        }, { prepend: () => h(QIcon, { name: 'search' }) }));
      }
      children.push(shown.length > 0 || !searching
        ? h(QList, { padding: true }, () => menuItems(shown, 0, !!searching))
        : h('p', { class: 'uk-menu-empty' }, noResults));
      if (!mobileDropdown) return h('nav', { ...attrs, class: ['uk-menu', attrs.class] }, children);
      return h('nav', { ...attrs, 'aria-label': attrs['aria-label'] || 'Opciones del modulo',
        class: ['uk-menu', 'uk-menu--mobile-dropdown', { 'uk-menu--collapsed': collapsed.value }, attrs.class] }, [
        h(QBtn, { class: 'uk-menu-collapse-toggle', flat: true, noCaps: true, color: 'primary',
          icon: collapsed.value ? 'more_vert' : 'chevron_left', label: collapsed.value ? undefined : 'Contraer menu',
          title: collapsed.value ? 'Expandir menu' : 'Contraer menu',
          'aria-label': collapsed.value ? 'Expandir menu' : 'Contraer menu', 'aria-expanded': !collapsed.value,
          onClick: toggleCollapsed,
        }),
        h('div', { class: 'uk-menu-desktop' }, children),
        h(QBtnDropdown, { ref: dropdown, label: activeLabel(items || []) || 'Opciones del modulo',
          icon: 'more_vert', color: 'primary', outline: true, noCaps: true, align: 'left', fit: true,
          class: 'uk-menu-mobile-trigger', contentClass: 'uk-menu uk-menu-mobile-popup',
          contentStyle: { maxWidth: 'calc(100vw - 32px)' },
        }, () => h(QList, { padding: true }, () => menuItems(items || [], 0, false, () => dropdown.value?.hide()))),
      ]);
    };
  },
});

export const UkTabs = defineComponent({
  name: 'UkTabs',
  props: { node: { type: Object, required: true } },
  setup(props) {
    const p = props.node.p || {};
    const panels = props.node.s || {};
    const current = ref(p.active);
    return () => {
        const { tabs, active, keepPanelsMounted, ...attrs } = p;
      return h('div', { ...attrs, class: ['uk-tabs', attrs.class] }, [
        h(QTabs, {
          modelValue: current.value, 'onUpdate:modelValue': (value) => { current.value = value; },
          align: 'left', activeColor: 'primary', indicatorColor: 'primary', noCaps: true, class: 'text-grey-8',
          }, () => (tabs || []).map((tab) => h(QTab, { name: tab.name, label: tab.label, icon: tab.icon,
            ...(keepPanelsMounted && attrs.id ? { id: `${attrs.id}-tab-${tab.name}`, 'aria-controls': `${attrs.id}-panel-${tab.name}` } : {}) }))),
        h(QSeparator),
          keepPanelsMounted
            ? h('div', { class: 'uk-tab-panels' }, (tabs || []).map(tab => h('div', {
              id: attrs.id ? `${attrs.id}-panel-${tab.name}` : undefined,
              role: 'tabpanel', 'aria-labelledby': attrs.id ? `${attrs.id}-tab-${tab.name}` : undefined,
              class: 'uk-tab-panel q-pa-md', hidden: current.value !== tab.name,
              style: current.value !== tab.name ? { display: 'none' } : {},
            }, renderNodes(panels[tab.name]))))
            : h(QTabPanels, { modelValue: current.value, keepAlive: true, class: 'uk-tab-panels' },
          () => (tabs || []).map((tab) => h(QTabPanel, { name: tab.name, class: 'uk-tab-panel' }, () => renderNodes(panels[tab.name])))),
      ]);
    };
  },
});
