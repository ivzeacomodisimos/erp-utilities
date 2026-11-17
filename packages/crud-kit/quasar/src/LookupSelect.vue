<template>
  <q-select
    :model-value="modelValue"
    :options="options"
    :label="label"
    :rules="rules"
    :error="error"
    :error-message="errorMessage"
    :dense="dense"
    :outlined="outlined"
    use-input
    input-debounce="300"
    emit-value
    map-options
    clearable
    hide-dropdown-icon
    autocomplete="off"
    @filter="search"
    @update:model-value="select"
  >
    <template #loading>
      <!-- Quasar hides its own spinner when there is no dropdown icon; this one always shows. -->
      <q-spinner color="primary" size="1.2em" />
    </template>
    <template #option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section>
          <q-item-label>{{ scope.opt.label }}</q-item-label>
          <q-item-label v-if="scope.opt.caption" caption>{{ scope.opt.caption }}</q-item-label>
        </q-item-section>
      </q-item>
    </template>
    <template #no-option>
      <q-item>
        <q-item-section class="text-grey">{{ noResults }}</q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script setup>
import { ref, watch } from 'vue';
import { QSelect, QItem, QItemLabel, QItemSection, QSpinner } from 'quasar';
import { post } from './api';

/**
 * Search box of an autocomplete field: shows the text, keeps the value (code).
 */
const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  initialText: { type: String, default: '' },
  url: { type: String, required: true },
  label: { type: String, default: '' },
  rules: { type: Array, default: () => [] },
  // null (not false): with any other value Quasar reserves the space for the message
  // below the field, and in the filter bar it would no longer line up with the others.
  error: { type: Boolean, default: null },
  errorMessage: { type: String, default: undefined },
  dense: { type: Boolean, default: false },
  outlined: { type: Boolean, default: false },
  noResults: { type: String, default: '—' },
  communicationError: { type: String, default: 'Error' },
  requestParams: { type: Object, default: () => ({}) },
});
const emit = defineEmits(['update:modelValue']);

// Text of the chosen value: comes from the record (initialText) and is replaced by the
// label of the option the user picks, so the field never falls back to showing the code.
const selectedText = ref(props.initialText);

function initialOptions() {
  return props.modelValue !== '' && props.modelValue !== null && props.modelValue !== undefined
    ? [{ value: props.modelValue, label: selectedText.value || String(props.modelValue) }]
    : [];
}

const options = ref(initialOptions());

watch(() => props.initialText, (text) => {
  selectedText.value = text;
  options.value = initialOptions();
});

function select(value) {
  const option = options.value.find((item) => item.value === value);
  selectedText.value = option ? option.label : '';
  emit('update:modelValue', value === null ? '' : value);
}

async function search(term, update, abort) {
  if (!term) {
    update(() => {
      options.value = initialOptions();
    });
    return;
  }
  try {
    const items = await post(props.url, { ...props.requestParams, term }, props.communicationError);
    update(() => {
      options.value = items.map((item) => ({ value: item.id, label: item.label, caption: item.caption || '' }));
    });
  } catch (e) {
    abort();
  }
}
</script>
