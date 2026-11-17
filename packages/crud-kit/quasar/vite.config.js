import { copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

/*
 * Material Icons (Quasar's icon names: "local_shipping", "list_alt"...) is copied next to the
 * bundle instead of being inlined: the browser downloads it only when a screen uses one.
 * Both crud-kit-quasar.css and ../crud-kit.css (jTable) point to this file.
 */
const MATERIAL_ICONS_FONT = fileURLToPath(new URL('./node_modules/@quasar/extras/material-icons/web-font/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2', import.meta.url));
const copyMaterialIcons = {
  name: 'crud-kit-material-icons',
  writeBundle(options) {
    copyFileSync(MATERIAL_ICONS_FONT, `${options.dir}/material-icons.woff2`);
  },
};

/*
 * Builds one self-contained file (Vue 3 + Quasar inside, nothing on window but
 * CrudKitQuasar) so it can be used in pages that already have Vue 2, jQuery or nothing.
 *
 * Quasar's CSS is global; here every selector is scoped to the CRUD container and to
 * the nodes Quasar teleports to <body> (dialogs, menus, notifications), so the rest
 * of the host page is not restyled.
 *
 * The other direction matters too: host pages often load Bootstrap or their own global
 * CSS (.row with negative margins, label, input, table...), which would leak into
 * Quasar's markup. :is() gives every scoped rule the specificity of an id, so Quasar
 * wins over the host, and RESET (first in the file, so Quasar's equal-specificity rules
 * come later and win) reverts whatever the host sets that Quasar does not. SVG content
 * is left alone: reverting it would drop the icons' presentation attributes. So are
 * elements marked .ck-host-icon (Font Awesome icons that the host page provides).
 */
const SCOPE = ':is(.ck-quasar, [id^="q-portal"], #q-notify)';
const KEEP = 'svg, svg *, .ck-host-icon';
const RESET_SELECTOR = `${SCOPE} *:not(${KEEP}), ${SCOPE} *:not(${KEEP})::before, ${SCOPE} *:not(${KEEP})::after`;

function scopeSelector(selector) {
  const trimmed = selector.trim();
  if (trimmed.startsWith(':root')) {
    return SCOPE + trimmed.slice(5);
  }
  // "html", "body": the document-level element becomes the scope. A qualified one
  // ("body.body--dark", "body.desktop .q-btn") stays as an ancestor condition, so
  // dark-mode or platform rules only apply when Quasar puts that class on <body>.
  const documentLevel = trimmed.match(/^(html|body)([.:#[][^\s>+~]*)?/);
  if (documentLevel) {
    const rest = trimmed.slice(documentLevel[0].length).trim().replace(/^>\s*/, '');
    const scoped = rest ? `${SCOPE} ${rest}` : SCOPE;
    return documentLevel[2] ? `${documentLevel[0]} ${scoped}` : scoped;
  }
  return `${SCOPE} ${trimmed}`;
}

const scopeQuasarCss = {
  postcssPlugin: 'crud-kit-scope',
  Once(root, { rule, decl }) {
    const file = (root.source && root.source.input && root.source.input.file) || '';
    if (/quasar[\\/]dist[\\/]quasar\.css$/.test(file)) {
      const reset = rule({ selector: RESET_SELECTOR });
      reset.append(decl({ prop: 'all', value: 'revert' }));
      reset.__ckScoped = true;
      root.prepend(reset);
    }
  },
  Rule(rule) {
    if (rule.__ckScoped) {
      return;
    }
    const parent = rule.parent;
    if (parent && parent.type === 'atrule' && /keyframes$/i.test(parent.name)) {
      return;
    }
    rule.selectors = rule.selectors.map(scopeSelector);
    rule.__ckScoped = true;
  },
};

export default defineConfig(({ mode }) => ({
  plugins: [vue(), copyMaterialIcons],
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode === 'development' ? 'development' : 'production'),
    __VUE_OPTIONS_API__: 'true',
    __VUE_PROD_DEVTOOLS__: mode === 'development' ? 'true' : 'false',
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
  },
  css: {
    postcss: { plugins: [scopeQuasarCss] },
  },
  build: {
    sourcemap: mode === 'development',
    minify: mode !== 'development',
    outDir: '../assets/quasar',
    emptyOutDir: true,
    cssCodeSplit: false,
    lib: {
      entry: 'src/main.js',
      name: 'CrudKitQuasar',
      formats: ['iife'],
      fileName: () => 'crud-kit-quasar.js',
      cssFileName: 'crud-kit-quasar',
    },
  },
}));