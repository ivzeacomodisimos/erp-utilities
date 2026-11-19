<template>
  <LookupSelect
    v-if="field.type === 'autocomplete'"
    :readonly="readonly"
    :model-value="modelValue"
    :initial-text="initialText"
    :url="field.autocompleteUrl"
    :request-params="requestParams"
    :dependency-context="dependencyContext"
    :dependency-ready="dependencyReady"
    :label="field.title"
    :rules="rules"
    :error="!!error"
    :error-message="error"
    :no-results="texts.noDataAvailable"
    :communication-error="texts.serverCommunicationError"
    outlined
    @update:model-value="update"
  />
  <q-select
    v-else-if="field.type === 'select'"
    :readonly="readonly"
    :model-value="selectValue"
    :options="selectOptions"
    :label="field.title"
    :rules="rules"
    :error="!!error"
    :error-message="error"
    emit-value
    map-options
    outlined
    @update:model-value="update"
  />
  <q-toggle
    v-else-if="field.type === 'checkbox'"
    :disable="readonly"
    :model-value="String(modelValue)"
    :true-value="String(checkedValue)"
    :false-value="String(uncheckedValue)"
    :label="field.title"
    @update:model-value="update"
  />
  <q-input
    v-else-if="field.type === 'date'"
    :readonly="readonly"
    autocomplete="off"
    :model-value="modelValue"
    :label="field.title"
    :rules="rules"
    :error="!!error"
    :error-message="error"
    mask="####-##-##"
    outlined
    @update:model-value="update"
  >
    <template #append>
      <q-icon :name="calendarIcon" class="cursor-pointer">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-date :model-value="modelValue" mask="YYYY-MM-DD" minimal @update:model-value="update" />
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
  <q-input
    v-else
    :readonly="readonly"
    autocomplete="off"
    :model-value="modelValue"
    :label="field.title"
    :type="inputType"
    :rules="rules"
    :error="!!error"
    :error-message="error"
    :autogrow="field.type === 'textarea'"
    outlined
    @update:model-value="update"
  />
</template>

<script setup>
import { computed } from 'vue';
import { QInput, QSelect, QToggle, QIcon, QPopupProxy, QDate } from 'quasar';
import { matEvent } from '@quasar/extras/material-icons';
import LookupSelect from './LookupSelect.vue';
import { quasarRules } from './rules';
import { lookupContext, dependenciesReady } from './lookupDependencies';

/**
 * Form input of a field, by type.
 */
const props = defineProps({
  field: { type: Object, required: true },
  modelValue: { type: [String, Number, Boolean], default: '' },
  initialText: { type: String, default: '' },
  texts: { type: Object, required: true },
  error: { type: String, default: '' },
  readonly: { type: Boolean, default: false },
  requestParams: { type: Object, default: () => ({}) },
  formValues: { type: Object, default: () => ({}) },
  allFields: { type: Array, default: () => [] },
});
const emit = defineEmits(['update:modelValue']);

const calendarIcon = matEvent;
const dependencyContext = computed(() => lookupContext(props.field, props.allFields, props.formValues));
const dependencyReady = computed(() => dependenciesReady(dependencyContext.value));
const rules = computed(() => quasarRules(props.field.rules, props.texts));
const inputType = computed(() => ({ textarea: 'textarea', password: 'password' }[props.field.type] || 'text'));
// The record may bring "1" (SQL Server returns strings) while the options say 1: Quasar
// compares with ===, so both sides are compared as strings or it shows the raw value.
const selectOptions = computed(() => (props.field.options || []).map((option) => ({ value: String(option.value), label: option.label })));
const selectValue = computed(() => {
  if (props.modelValue === null || props.modelValue === undefined) return null;
  if (props.modelValue === '' && !selectOptions.value.some(option => option.value === '')) return null;
  return String(props.modelValue);
});

const uncheckedValue = computed(() => (props.field.options && props.field.options[0] ? props.field.options[0].value : 0));
const checkedValue = computed(() => (props.field.options && props.field.options[1] ? props.field.options[1].value : 1));

function update(value) {
  emit('update:modelValue', value === null ? '' : value);
}
</script>
