import { h } from 'vue';

/*
 * Paints the description that Ivandzb\UiKit\Render\QuasarRenderer writes:
 *   { t: 'q-btn' | 'div' | 'uk-layout', p: {props}, c: [children], s: { slot: [children] } }
 * A string is a text. Nothing is evaluated: tags and props go to Vue's h().
 */
export const registry = {};

export function renderNodes(list) {
  return (list || []).map(renderNode);
}

export function renderNode(node) {
  if (node === null || node === undefined) {
    return null;
  }
  if (typeof node === 'string') {
    return node;
  }
  const component = registry[node.t];
  // ui-kit components read their own description (props, slots, data).
  if (component && node.t.startsWith('uk-')) {
    return h(component, { node });
  }
  const props = node.p || {};
  if (!component) {
    return h(node.t, props, renderNodes(node.c));
  }
  const slots = {};
  if (node.c) {
    slots.default = () => renderNodes(node.c);
  }
  Object.keys(node.s || {}).forEach((name) => {
    slots[name] = () => renderNodes(node.s[name]);
  });
  return h(component, props, slots);
}
