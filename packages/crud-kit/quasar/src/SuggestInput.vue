<template>
  <q-select
    :model-value="modelValue || null"
    :options="options"
    option-value="key"
    option-label="label"
    :label="label"
    :dense="dense"
    :outlined="outlined"
    use-input
    fill-input
    hide-selected
    hide-dropdown-icon
    input-debounce="300"
    clearable
    autocomplete="off"
    @filter="search"
    @input-value="type"
    @update:model-value="select"
  >
    <template #option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section>
          <q-item-label>{{ scope.opt.label }}</q-item-label>
          <q-item-label v-if="scope.opt.caption" caption>{{ scope.opt.caption }}</q-item-label>
        </q-item-section>
      </q-item>
    </template>
    <template #loading>
      <q-spinner color="primary" size="1.2em" />
    </template>
  </q-select>
</template>

<script setup>
import { ref } from 'vue';
import { QItem, QItemLabel, QItemSection, QSelect, QSpinner } from 'quasar';
import { post } from './api';

/**
 * Free-text filter that suggests the values already stored (Field::suggestions()): what is
 * typed is the filter, picking a suggestion only fills it in. A suggestion may bring a second
 * line (caption) that tells apart records with the same value.
 */
const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  url: { type: String, required: true },
  label: { type: String, default: '' },
  dense: { type: Boolean, default: false },
  outlined: { type: Boolean, default: false },
  communicationError: { type: String, default: 'Error' },
});
const emit = defineEmits(['update:modelValue']);

const options = ref([]);

function type(text) {
  emit('update:modelValue', text || '');
}

function select(option) {
  emit('update:modelValue', option === null || option === undefined ? '' : (typeof option === 'object' ? option.value : option));
}

async function search(term, update, abort) {
  if (!term) {
    update(() => {
      options.value = [];
    });
    return;
  }
  try {
    const items = await post(props.url, { term }, props.communicationError);
    update(() => {
      // Values can repeat (one suggestion per record): the position is the option key.
      options.value = items.map((item, index) => ({ key: index, value: item.value, label: item.label, caption: item.caption || '' }));
    });
  } catch (e) {
    abort();
  }
}
</script>
