import { copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

/*
 * One self-contained file (Vue 3 + Quasar inside, nothing on window but UiKitQuasar),
 * so it works in pages that already have Vue 2, jQuery or another Quasar bundle.
 *
 * CSS, in both directions:
 * - Quasar's CSS only reaches the app (.uk-quasar) and what Quasar teleports to <body>
 *   (dialogs, menus, notifications), and never the trusted HTML blocks inside the app
 *   (.uk-raw: legacy screens keep their own look).
 * - The host page's global CSS (Bootstrap, old themes) does not reach Quasar's markup:
 *   :is() gives every scoped rule the specificity of an id, and RESET (first in the file,
 *   so Quasar's equal-specificity rules win) reverts what the host sets and Quasar does not.
 *   SVG and .ck-host-icon (Font Awesome) keep their own styles.
 */
const SCOPE = ':is(.uk-quasar, [id^="q-portal"], #q-notify)';
const NOT_RAW = ':not(.uk-raw *)';
const KEEP = 'svg, svg *, .ck-host-icon, .uk-raw, .uk-raw *';
const RESET_SELECTOR = `${SCOPE} *:not(${KEEP}), ${SCOPE} *:not(${KEEP})::before, ${SCOPE} *:not(${KEEP})::after`;

const MATERIAL_ICONS_FONT = fileURLToPath(new URL('./node_modules/@quasar/extras/material-icons/web-font/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2', import.meta.url));

// Start of the last compound selector (after the last combinator outside parentheses).
function lastCompoundStart(selector) {
  let depth = 0;
  let start = 0;
  for (let i = 0; i < selector.length; i++) {
    const char = selector[i];
    if (char === '(' || char === '[') depth++;
    else if (char === ')' || char === ']') depth--;
    else if (depth === 0 && (char === ' ' || char === '>' || char === '+' || char === '~')) start = i + 1;
  }
  return start;
}

// The subject of the selector (last compound) must not be inside a raw block. The
// condition goes before the first pseudo-element (::before, ::-webkit-scrollbar:hover...).
function excludeRaw(selector) {
  const start = lastCompoundStart(selector);
  const compound = selector.slice(start);
  const pseudo = compound.search(/::|:(before|after|first-line|first-letter|-webkit-|-moz-|-ms-)/);
  if (pseudo === -1) {
    return selector + NOT_RAW;
  }
  return selector.slice(0, start + pseudo) + NOT_RAW + selector.slice(start + pseudo);
}

function scopeSelector(selector) {
  const trimmed = selector.trim();
  if (trimmed.startsWith(':root')) {
    return SCOPE + trimmed.slice(5);
  }
  // "html", "body": the document-level element becomes the scope. A qualified one
  // ("body.body--dark", "body.desktop .q-btn") stays as an ancestor condition.
  const documentLevel = trimmed.match(/^(html|body)([.:#[][^\s>+~]*)?/);
  if (documentLevel) {
    const rest = trimmed.slice(documentLevel[0].length).trim().replace(/^>\s*/, '');
    const scoped = rest ? `${SCOPE} ${excludeRaw(rest)}` : SCOPE;
    return documentLevel[2] ? `${documentLevel[0]} ${scoped}` : scoped;
  }
  return `${SCOPE} ${excludeRaw(trimmed)}`;
}

const scopeQuasarCss = {
  postcssPlugin: 'ui-kit-scope',
  Once(root, { rule, decl }) {
    const file = (root.source && root.source.input && root.source.input.file) || '';
    if (/quasar[\\/]dist[\\/]quasar\.css$/.test(file)) {
      const reset = rule({ selector: RESET_SELECTOR });
      reset.append(decl({ prop: 'all', value: 'revert' }));
      reset.__ukScoped = true;
      root.prepend(reset);
    }
  },
  Rule(rule) {
    if (rule.__ukScoped) {
      return;
    }
    const parent = rule.parent;
    if (parent && parent.type === 'atrule' && /keyframes$/i.test(parent.name)) {
      return;
    }
    rule.selectors = rule.selectors.map(scopeSelector);
    rule.__ukScoped = true;
  },
};

// Material Icons (Quasar's default icon names) next to the bundle: downloaded only when used.
const copyMaterialIcons = {
  name: 'ui-kit-material-icons',
  writeBundle(options) {
    copyFileSync(MATERIAL_ICONS_FONT, `${options.dir}/material-icons.woff2`);
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
      name: 'UiKitQuasar',
      formats: ['iife'],
      fileName: () => 'ui-kit-quasar.js',
      cssFileName: 'ui-kit-quasar',
    },
  },
}));