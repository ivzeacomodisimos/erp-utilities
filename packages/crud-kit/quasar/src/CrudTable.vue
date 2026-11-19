<template>
  <div ref="rootRef" class="ck-crud-quasar">
    <!-- Filters -->
    <q-form v-if="filterFields.length > 0" class="ck-q-filters" @submit.prevent="applyFilters">
      <template v-for="field in filterFields" :key="field.name">
        <LookupSelect
          v-if="field.type === 'autocomplete'"
          :model-value="filters[field.name]"
          @update:model-value="updateFilter(field, $event)"
          class="ck-q-filter"
          :url="field.autocompleteUrl"
          :request-params="requestParams"
          :dependency-context="lookupContext(field, fields, filters)"
          :dependency-ready="dependenciesReady(lookupContext(field, fields, filters))"
          :label="field.title"
          :no-results="texts.noDataAvailable"
          :communication-error="texts.serverCommunicationError"
          dense
          outlined
        />
        <SuggestInput
          v-else-if="field.suggestUrl"
          :model-value="filters[field.name]"
          @update:model-value="updateFilter(field, $event)"
          class="ck-q-filter"
          :url="field.suggestUrl"
          :request-params="requestParams"
          :label="field.title"
          :communication-error="texts.serverCommunicationError"
          dense
          outlined
        />
        <q-select
          v-else-if="field.options"
          :model-value="filters[field.name]"
          @update:model-value="updateFilter(field, $event)"
          class="ck-q-filter"
          :options="field.options"
          :label="field.title"
          emit-value
          map-options
          clearable
          dense
          outlined
        />
        <q-input v-else :model-value="filters[field.name]" @update:model-value="updateFilter(field, $event)" class="ck-q-filter" autocomplete="off" :label="field.title" dense outlined clearable />
      </template>
      <q-btn type="submit" color="primary" unelevated :label="texts.filter"
        :loading="loading" :disable="loading || form.saving || selectionBusy" />
    </q-form>

    <section v-if="selectionProgress" class="ck-q-selection-progress q-pa-md q-mb-md bg-grey-2 rounded-borders"
      :aria-label="selectionProgress.label" :aria-busy="selectionBusy">
      <div role="status" aria-live="polite" aria-atomic="true">
        <strong>{{ selectionProgress.label }}</strong>:
        {{ selectionCounts.success }} {{ texts.progressSucceeded }},
        {{ selectionCounts.error }} {{ texts.progressFailed }}.
        {{ selectionCounts.processed }}/{{ selectionProgress.items.length }}
        <span v-if="selectionCounts.current"> — {{ texts.progressRunning }}: {{ selectionCounts.current.label }}</span>
      </div>
      <q-linear-progress class="q-my-sm" size="8px" :value="selectionCounts.processed / selectionProgress.items.length" />
      <ul class="q-my-none q-pl-md" style="max-height: 180px; overflow-y: auto">
        <li v-for="(item, index) in selectionProgress.items" :key="index" :data-status="item.status">
          {{ item.label }} — {{ texts[{ pending: 'progressPending', running: 'progressRunning', success: 'progressDone', error: 'progressFailed' }[item.status]] }}<span v-if="item.error">: {{ item.error }}</span>
        </li>
      </ul>
    </section>

    <q-table
      dense
      v-show="visible"
      v-model:pagination="pagination"
      v-model:selected="selected"
      :title="schema.title"
      :rows="rows"
      :columns="columns"
      :row-key="rowKey"
      :loading="loading"
      :selection="canSelect ? schema.selection : 'none'"
      :rows-per-page-options="[5, 10, 25, 50, 100]"
      :rows-per-page-label="texts.pageSizeChangeLabel"
      :no-data-label="texts.noDataAvailable"
      :loading-label="texts.loadingMessage"
      :pagination-label="paginationLabel"
      binary-state-sort
      flat
      bordered
      class="ck-q-table"
      @request="onRequest"
    >
      <template #top>
        <div class="ck-q-title">{{ schema.title }}</div>
        <q-space />
        <q-btn v-if="schema.refreshSeconds" class="ck-q-refresh q-mr-sm" :icon="icons.refresh"
          :label="texts.refresh" color="white" flat dense no-caps
          :disable="loading || form.saving || selectionBusy" @click="reload(false)" />
        <q-btn v-for="action in selectionActions" :key="action.name" class="q-mr-sm"
          :label="action.label" color="white" outline dense no-caps
          :loading="selectionBusy" :disable="selectionBusy || loading || selected.length === 0"
          @click="runSelectionAction(action)" />
        <q-btn
          v-if="schema.selection === 'multiple' && urls.delete"
          class="q-mr-sm"
          :icon="icons.delete"
          :label="texts.deleteSelected"
          outline
          dense
          no-caps
          @click="deleteSelected"
        />
        <q-btn v-if="urls.create" :icon="icons.add" :label="texts.addNewRecord" color="primary" unelevated dense no-caps @click="openForm(null)" />
        <q-btn v-if="nested" class="ck-q-close-child q-ml-sm" :icon="icons.close"
          :aria-label="texts.close" color="white" flat round dense
          :disable="form.saving || selectionBusy" @click="$emit('close')">
          <q-tooltip>{{ texts.close }}</q-tooltip>
        </q-btn>
      </template>

      <template #body="props">
        <!-- Keys: the body is a flat list of rows and child rows; without them Vue matches by
             position and reuses the open child of another row (it keeps that row's records). -->
        <q-tr :key="`row-${props.key}`" :props="props">
          <q-td v-if="canSelect" auto-width>
            <q-checkbox v-model="props.selected" dense />
          </q-td>
          <q-td v-for="column in props.cols" :key="column.name" :props="props">
            <template v-if="column.name === '__children'">
              <q-btn
                v-for="child in schema.children"
                :key="child.name"
                class="ck-q-child-button"
                :class="{ 'ck-q-child-open': openChild(props.row) === child.name }"
                flat
                dense
                @click="toggleChild(props.row, child.name)"
              >
                <i v-if="isFontIcon(child.icon)" class="ck-host-icon" :class="child.icon" aria-hidden="true"></i>
                <q-icon v-else :name="child.icon || icons.list" />
                <q-tooltip>{{ child.title }}</q-tooltip>
              </q-btn>
            </template>
            <template v-else-if="column.name === '__actions'">
              <q-btn v-if="urls.update" :icon="icons.edit" size="sm" flat dense round @click="openForm(props.row)">
                <q-tooltip>{{ texts.editRecord }}</q-tooltip>
              </q-btn>
              <q-btn v-if="urls.delete" :icon="icons.delete" size="sm" flat dense round @click="confirmDelete(props.row)">
                <q-tooltip>{{ texts.deleteText }}</q-tooltip>
              </q-btn>
            </template>
            <span v-else-if="column.field.html" v-html="props.row[column.name]"></span>
            <template v-else>{{ cellText(column.field, props.row) }}</template>
          </q-td>
        </q-tr>
        <q-tr v-if="openChild(props.row)" :key="`child-${props.key}-${openChild(props.row)}`" class="ck-q-child-row">
          <q-td colspan="100%">
            <!-- Pinned to the visible width: in a wide table the child does not scroll away with it. -->
            <div class="ck-q-child-panel" :style="childPanelStyle">
            <CrudTable
              :key="`${props.key}-${openChild(props.row)}`"
              :schema="childSchema(openChild(props.row))"
              :fixed-filters="childFilters(props.row, openChild(props.row))"
              nested
              @close="closeChild(props.row)"
            />
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <!-- Create / edit -->
    <q-dialog v-model="form.open" persistent>
      <q-card class="ck-q-form-card">
        <q-card-section class="ck-q-dialog-title">{{ form.record ? texts.editRecord : texts.addNewRecord }}</q-card-section>
        <q-card-section v-if="!form.record && sequence && sequenceProgress" class="q-py-none text-primary text-weight-medium">
          {{ sequenceProgress }}
        </q-card-section>
        <q-form ref="formRef" @submit.prevent="save">
          <q-card-section class="ck-q-form-fields">
            <FieldInput
              v-for="field in formFields"
              :key="field.name + ':' + formEpoch"
              :model-value="form.values[field.name]"
              :field="field"
              :request-params="requestParams"
              :form-values="form.values"
              :all-fields="fields"
              :initial-text="form.record && field.textField ? String(form.record[field.textField] || '') : ''"
              :texts="texts"
              :error="form.errors[field.name] || ''"
              :readonly="form.saving || sequenceReadonly(field.name)"
              @focusout="fillFrom(field)"
              @update:model-value="updateField(field, $event)"
            />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat :label="texts.cancel" :disable="form.saving" v-close-popup />
            <q-btn type="submit" color="primary" unelevated :label="form.saving ? texts.saving : texts.save" :loading="form.saving" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import {
  useQuasar, QTable, QTr, QTd, QBtn, QSpace, QForm, QInput, QSelect, QDialog, QCard, QCardSection,
  QCardActions, QCheckbox, QIcon, QTooltip, QLinearProgress, ClosePopup,
} from 'quasar';
import { matAdd, matClose, matDelete, matEdit, matList, matRefresh } from '@quasar/extras/material-icons';
import FieldInput from './FieldInput.vue';
import LookupSelect from './LookupSelect.vue';
import SuggestInput from './SuggestInput.vue';
import { post, CrudError } from './api';
import { sequenceNow, sequenceRange } from './createSequence';
import { lookupContext, dependenciesReady, clearDependentValues } from './lookupDependencies';

defineOptions({ name: 'CrudTable', directives: { ClosePopup } });

const props = defineProps({
  schema: { type: Object, required: true },
  /** link values sent by the parent row (child tables) */
  fixedFilters: { type: Object, default: () => ({}) },
  nested: { type: Boolean, default: false },
});
defineEmits(['close']);

const $q = useQuasar();
const formEpoch = ref(0);
const icons = { add: matAdd, close: matClose, delete: matDelete, edit: matEdit, list: matList, refresh: matRefresh };
const texts = props.schema.texts;
const urls = props.schema.urls;
const requestParams = props.schema.requestParams || {};
const selectionActions = props.schema.selectionActions || [];
const canSelect = computed(() => props.schema.selection && (urls.delete || selectionActions.length > 0));
const selectionBusy = ref(false);
const selectionProgress = ref(null);
const selectionCounts = computed(() => {
  const items = selectionProgress.value?.items || [];
  const success = items.filter(item => item.status === 'success').length;
  const error = items.filter(item => item.status === 'error').length;
  return { success, error, processed: success + error, current: items.find(item => item.status === 'running') };
});
const fields = props.schema.fields;
const keyFields = fields.filter((field) => field.key).map((field) => field.name);
const rowKey = keyFields.length === 1 ? keyFields[0] : '__rowId';

const rows = ref([]);
const selected = ref([]);
const loading = ref(false);
const visible = ref(props.nested || props.schema.loadOnStart);
const pagination = ref({
  page: 1,
  rowsPerPage: props.schema.pageSize,
  sortBy: props.schema.sortBy || null,
  descending: !!props.schema.descending,
  rowsNumber: 0,
});
const filters = reactive({});
const appliedFilters = ref({});
const openChildren = reactive({});
const formRef = ref(null);
const rootRef = ref(null);
const visibleWidth = ref(0);
let resizeObserver = null;
let refreshTimer = null;
let refreshErrorShown = false;
// 24px left padding + 8px right padding of the child row (see .ck-q-child-row in crud-kit.css).
const childPanelStyle = computed(() => (visibleWidth.value > 0 ? { width: `${visibleWidth.value - 34}px` } : {}));
const form = reactive({ open: false, record: null, values: {}, errors: {}, saving: false,
  completed: 0, sequenceTotal: 0, sequenceStart: 0, sequenceCommon: {} });
const sequence = props.schema.createSequence || null;
const sequenceProgress = computed(() => {
  const total = form.sequenceTotal || Number(sequence && form.values[sequence.totalField]);
  const current = sequence && sequence.totalIsLastNumber
    ? (form.sequenceStart ? form.sequenceStart + form.completed : Number(form.values[sequence.incrementField]) || 1)
    : form.completed + 1;
  return total > 0 ? String(sequence.progressLabel || 'Record {current} of {total}')
    .replace('{current}', String(Math.min(current, total))).replace('{total}', String(total)) : '';
});

function sequenceReadonly(name) {
  return Boolean(!form.record && sequence && form.completed > 0 &&
    [sequence.totalField, sequence.incrementField, ...(sequence.commonFields || [])].includes(name));
}

const filterFields = computed(() => (props.nested ? [] : fields.filter((field) => field.filter)));
const formFields = computed(() => fields.filter((field) => (form.record ? field.edit : field.create) && field.type !== 'hidden'));

const columns = computed(() => {
  const list = fields
    .filter((field) => field.list)
    .map((field) => ({
      name: field.name,
      label: field.title,
      field,
      align: 'left',
      sortable: field.sortable,
      style: field.width ? `width: ${field.width}` : undefined,
      headerStyle: field.width ? `width: ${field.width}` : undefined,
    }));
  // First, so they are visible in wide tables without scrolling sideways.
  if (props.schema.children.length > 0) {
    list.unshift({ name: '__children', label: '', field: {}, align: 'center', style: 'width: 1%; white-space: nowrap' });
  }
  if (urls.update || urls.delete) {
    list.push({ name: '__actions', label: '', field: {}, align: 'center', style: 'width: 1%' });
  }
  return list;
});

function paginationLabel(first, last, total) {
  return String(texts.pagingInfo || '{0}-{1} / {2}').replace('{0}', first).replace('{1}', last).replace('{2}', total);
}

function notifyError(error) {
  $q.notify({ type: 'negative', message: error instanceof CrudError ? error.message : texts.serverCommunicationError, position: 'top' });
}

function cellText(field, row) {
  const value = row[field.name];
  if (field.textField && row[field.textField] !== undefined && row[field.textField] !== null && row[field.textField] !== '') {
    return row[field.textField];
  }
  if (field.options) {
    const option = field.options.find((item) => String(item.value) === String(value));
    if (option) {
      return option.label;
    }
  }
  return value === null || value === undefined ? '' : value;
}

// Only the answer to the latest request is painted: a slow, older one (e.g. a heavy filter)
// must not overwrite the list after the user filtered again.
let lastRequest = 0;

async function onRequest(request) {
  const { page, rowsPerPage, sortBy, descending } = request.pagination;
  const current = ++lastRequest;
  loading.value = true;
  try {
    const params = Object.assign({}, requestParams, appliedFilters.value, props.fixedFilters, {
      jtStartIndex: (page - 1) * rowsPerPage,
      jtPageSize: rowsPerPage,
      jtSorting: sortBy ? `${sortBy} ${descending ? 'DESC' : 'ASC'}` : '',
    });
    const payload = await post(urls.list, params, texts.serverCommunicationError);
    if (current !== lastRequest) {
      return;
    }
    rows.value = payload.Records.map((record, index) => Object.assign({ __rowId: `${page}-${index}` }, record));
    refreshErrorShown = false;
    selected.value = [];
    pagination.value = { page, rowsPerPage, sortBy, descending, rowsNumber: Number(payload.TotalRecordCount) };
  } catch (error) {
    if (current === lastRequest) {
      if (!request.background || !refreshErrorShown) notifyError(error);
      refreshErrorShown = true;
    }
  } finally {
    if (current === lastRequest) {
      loading.value = false;
    }
  }
}

function reload(firstPage, background = false) {
  const current = pagination.value;
  return onRequest({ pagination: Object.assign({}, current, firstPage ? { page: 1 } : {}), background });
}

function applyFilters() {
  if (loading.value || form.saving || selectionBusy.value) return;
  const values = {};
  Object.keys(filters).forEach((name) => {
    if (filters[name] !== null && filters[name] !== undefined && filters[name] !== '') {
      values[name] = filters[name];
    }
  });
  appliedFilters.value = values;
  visible.value = true;
  rootRef.value?.dispatchEvent(new CustomEvent('crud-kit:filtered', { bubbles: true,
    detail: { crud: props.schema.id, filters: { ...values } } }));
  reload(true);
}

// Public bridge for forms outside the CRUD. Nothing runs until explicitly called.
function filterFromOutside(values = {}) {
  filterFields.value.forEach((field) => { filters[field.name] = values[field.name] ?? ''; });
  applyFilters();
}
defineExpose({ filter: filterFromOutside, reload: () => reload(false) });

function changed() {
  rootRef.value?.dispatchEvent(new CustomEvent('crud-kit:changed', { bubbles: true, detail: { crud: props.schema.id } }));
}

function keyParams(row) {
  const params = {};
  keyFields.forEach((name) => {
    params[name] = row[name];
  });
  return params;
}

async function runSelectionAction(action) {
  if (selectionBusy.value || selected.value.length === 0) return;
  const records = selected.value.map(keyParams);
  selectionBusy.value = true;
  const failures = [];
  let completed = 0;
  try {
    if (action.confirmation && !(await new Promise((resolve) => {
      $q.dialog({ title: action.label, message: action.confirmation, cancel: { label: texts.cancel, flat: true },
        ok: { label: action.label, color: 'primary' }, persistent: true })
        .onOk(() => resolve(true)).onCancel(() => resolve(false));
    }))) return;
    selectionProgress.value = { label: action.label, items: records.map(record => ({
      label: keyFields.map(key => `${fields.find(field => field.name === key).title}: ${record[key]}`).join(', '),
      status: 'pending', error: '',
    })) };
    // One entity per request: show each result without additional server calls or automatic replay.
    for (const [index, record] of records.entries()) {
      const item = selectionProgress.value.items[index];
      item.status = 'running';
      try {
        await post(action.url, Object.assign({}, requestParams, action.params, { selected: JSON.stringify([record]) }), texts.serverCommunicationError);
        completed++;
        item.status = 'success';
      } catch (error) {
        item.status = 'error';
        item.error = error.message;
        failures.push(`${JSON.stringify(record)}: ${error.message}`);
      }
    }
    $q.notify({ type: failures.length ? 'warning' : 'positive',
      message: `${action.label}: ${completed}/${records.length}. ${[...new Set(failures)].join(' ')}`,
      timeout: failures.length ? 0 : 6000, closeBtn: true, position: 'top' });
    selected.value = [];
    if (completed) changed();
    reload(false);
  } finally {
    selectionBusy.value = false;
  }
}

function openForm(record) {
  formEpoch.value++;
  if (form.saving) return;
  form.record = record;
  form.completed = 0;
  form.sequenceTotal = 0;
  form.sequenceStart = 0;
  form.sequenceCommon = {};
  form.errors = {};
  form.values = {};
  fields.forEach((field) => {
    let value = record ? record[field.name] : field.default;
    if (!record && props.schema.createFromFilters && appliedFilters.value[field.name] !== undefined) {
      value = appliedFilters.value[field.name];
    }
    if (!record && props.fixedFilters[field.name] !== undefined) {
      value = props.fixedFilters[field.name];
    }
    form.values[field.name] = value === null || value === undefined ? '' : value;
    // fillFrom only when the value changes: leaving an untouched field keeps the record.
    filledWith[field.name] = form.values[field.name];
  });
  if (!record && sequence) {
    form.values[sequence.nowField] = sequenceNow(sequence.timeZone);
  }
  form.open = true;
}

// Field::fillFrom(): when the user leaves the field, the server fills other fields. Only once
// per value, so moving through the form does not repeat the request.
const filledWith = {};
function updateField(field, value) {
  const previous = form.values[field.name];
  form.values[field.name] = value;
  if (String(previous ?? '') !== String(value ?? '')) {
    for (const name of clearDependentValues(field.name, fields, form.values)) {
      delete form.errors[name];
    }
  }
  if (field.type === 'select') fillFrom(field);
}

function updateFilter(field, value) {
  const previous = filters[field.name];
  filters[field.name] = value;
  if (String(previous ?? '') !== String(value ?? '')) clearDependentValues(field.name, fields, filters);
}

async function fillFrom(field) {
  const value = form.values[field.name];
  if (!field.fillUrl || value === '' || value === null || value === undefined || filledWith[field.name] === value) {
    return;
  }
  filledWith[field.name] = value;
  try {
    const values = Object.assign({}, requestParams, form.values, props.fixedFilters, form.record ? keyParams(form.record) : {});
    const payload = await post(field.fillUrl, values, texts.serverCommunicationError);
    const record = (payload && payload.Record) || {};
    Object.keys(record).forEach((name) => {
      if (name !== field.name && Object.prototype.hasOwnProperty.call(form.values, name)) {
        form.values[name] = record[name] === null || record[name] === undefined ? '' : record[name];
      }
    });
  } catch (error) {
    notifyError(error);
  }
}

async function save() {
  if (form.saving) return;
  form.saving = true;
  form.errors = {};
  try {
    let range = null;
    if (!form.record && sequence) {
      range = form.sequenceTotal ? sequenceRange({ [sequence.totalField]: form.sequenceTotal,
        [sequence.incrementField]: form.sequenceStart }, sequence)
        : sequenceRange(form.values, sequence);
      if (!range) throw new CrudError(sequence.invalidMessage || 'Invalid sequence range.');
    }
    const values = Object.assign({}, requestParams, form.values, props.fixedFilters, form.record ? keyParams(form.record) : {});
    await post(form.record ? urls.update : urls.create, values, texts.serverCommunicationError);
    if (range) {
      if (form.completed === 0) {
        form.sequenceTotal = range.total;
        form.sequenceStart = range.start;
        form.sequenceCommon = Object.fromEntries((sequence.commonFields || []).map((name) => [name, values[name]]));
      }
      form.completed++;
    }
    if (range && form.sequenceStart + form.completed <= range.end) {
      Object.assign(form.values, form.sequenceCommon, sequence.resetValues || {}, {
        [sequence.totalField]: form.sequenceTotal,
        [sequence.incrementField]: form.sequenceStart + form.completed,
        [sequence.nowField]: sequenceNow(sequence.timeZone),
      });
      await nextTick();
      if (formRef.value) formRef.value.resetValidation();
    } else {
      form.open = false;
    }
    reload(false);
  } catch (error) {
    if (error instanceof CrudError && Object.keys(error.errors).length > 0) {
      form.errors = error.errors;
    }
    notifyError(error);
  } finally {
    form.saving = false;
  }
}

function confirm(message) {
  return new Promise((resolve) => {
    $q.dialog({
      title: texts.areYouSure,
      message,
      cancel: { label: texts.cancel, flat: true },
      ok: { label: texts.deleteText, color: 'negative', unelevated: true },
      persistent: true,
    }).onOk(() => resolve(true)).onCancel(() => resolve(false));
  });
}

async function confirmDelete(row) {
  if (!(await confirm(texts.deleteConfirmation))) {
    return;
  }
  try {
    await post(urls.delete, Object.assign({}, requestParams, keyParams(row)), texts.serverCommunicationError);
    changed();
    reload(false);
  } catch (error) {
    notifyError(error);
  }
}

async function deleteSelected() {
  if (selected.value.length === 0) {
    $q.notify({ type: 'warning', message: texts.noneSelected, position: 'top' });
    return;
  }
  if (!(await confirm(String(texts.deleteSelectedConfirm).replace('{count}', selected.value.length)))) {
    return;
  }
  const failures = [];
  for (const row of selected.value) {
    try {
      await post(urls.delete, Object.assign({}, requestParams, keyParams(row)), texts.serverCommunicationError);
    } catch (error) {
      failures.push(error);
    }
  }
  if (failures.length > 0) {
    $q.notify({
      type: 'negative',
      position: 'top',
      message: String(texts.canNotDeletedRecords || '{0}/{1}').replace('{0}', failures.length).replace('{1}', selected.value.length),
      caption: failures[0].message,
    });
  }
  if (failures.length < selected.value.length) changed();
  reload(false);
}

/* Child tables: one open per row (accordion) */
function openChild(row) {
  return openChildren[row[rowKey]] || null;
}

function toggleChild(row, name) {
  const key = row[rowKey];
  if (openChildren[key] === name) {
    delete openChildren[key];
    return;
  }
  Object.keys(openChildren).forEach((other) => delete openChildren[other]);
  openChildren[key] = name;
}

function closeChild(row) {
  delete openChildren[row[rowKey]];
}

function childSchema(name) {
  return props.schema.children.find((child) => child.name === name).schema;
}

function childFilters(row, name) {
  const child = props.schema.children.find((item) => item.name === name);
  const values = {};
  Object.keys(child.links).forEach((childField) => {
    values[childField] = row[child.links[childField]];
  });
  return values;
}

function isFontIcon(icon) {
  return /^(fas|far|fab|fa) /.test(icon || '');
}

onMounted(() => {
  if (visible.value) {
    reload(true);
  }
  if (props.schema.refreshSeconds) {
    refreshTimer = setInterval(() => {
      if (visible.value && !loading.value && !form.open && !selectionBusy.value
        && selected.value.length === 0 && document.visibilityState !== 'hidden') reload(false, true);
    }, Math.max(5, Number(props.schema.refreshSeconds)) * 1000);
  }
  if (typeof ResizeObserver !== 'undefined' && rootRef.value) {
    resizeObserver = new ResizeObserver(() => {
      visibleWidth.value = rootRef.value ? rootRef.value.clientWidth : 0;
    });
    resizeObserver.observe(rootRef.value);
  }
});

onBeforeUnmount(() => {
  if (refreshTimer !== null) clearInterval(refreshTimer);
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});
</script>
