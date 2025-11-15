import {
  loadSettings, saveSettings, settingsToContexts, XLET_SETTINGS, XletSettingKey, XletSettings,
} from './settings';
import {
  createMultiToggle, h, htmlToElement, injectCss, isForm, multiToggleCss,
  warn,
} from './utils';
import { toMd } from './core';
import { toHtml as wikiToHtml } from './sites/wiki'; // TODO: unify with core.toHtml

let _settings: XletSettings | null = null;

function createToggle<T extends string | number | boolean>(
  fieldName: string,
  values: readonly T[],
  initValue: T,
  labels?: readonly string[],
  labelSide: 'left' | 'right' = 'left',
  onValueChange?: (newValue: T) => void,
): HTMLElement {
  const tokens = values.map(String);
  if (labels?.length !== values.length) {
    console.warn(`Labels length mismatch for toggle "${fieldName}"`);
    labels = tokens;
  }

  // resolve init state using string tokens
  const initToken = String(initValue);
  let initState = tokens.indexOf(initToken);
  if (initState === -1) {
    console.error(`initial value "${initToken}" for toggle "${fieldName}" not found in values`);
    initState = 0;
  }

  const tog = createMultiToggle({
    initState, labels, labelSide,
    onToggle: (state) => {
      const newValue = values[state];
      onValueChange?.(newValue);
    },
  });

  tog.init(); // position knob/label

  return h('div', { class: 'toggle-field' }, tog);
}

function appendSettingRow(container: HTMLElement, key: XletSettingKey, val: unknown): HTMLDivElement {
  const spec = XLET_SETTINGS[key];
  const id = String(key);
  const rowDiv = h('div', { class: 'row' });

  const handleSettingChange = (newValue: string | boolean) => {
    if (!_settings) return warn('Settings not initialized yet');

    const oldValue = _settings[key];
    const coercedNew = spec.coerce(newValue);
    if (coercedNew === oldValue) return; // no change

    _settings[key] = coercedNew;
    void saveSettings(_settings).catch((err) => {
      console.error(`Failed to save settings after changing "${String(key)}":`, err);
    });
    showPreview(key, rowDiv);
  };

  const control = createToggle(
    id,
    spec.values,
    spec.coerce(val),
    spec.valueLabels,
    'left',
    handleSettingChange,
  );

  control.addEventListener('click', (e) => { e.stopPropagation(); }); // prevent row click

  rowDiv.appendChild(h('label', {}, spec.settingLabel));
  rowDiv.appendChild(h('div', { class: 'cell' }, control));
  rowDiv.addEventListener('click', () => { showPreview(key, rowDiv); });

  container.appendChild(rowDiv);
  return rowDiv;
}

function showPreview(key: XletSettingKey, row: HTMLElement) {
  const spec = XLET_SETTINGS[key];
  const rows = document.querySelectorAll<HTMLDivElement>('.row.active');
  rows.forEach((r) => r.classList.remove('active'));

  row.classList.add('active');

  if (!_settings) return warn('Settings not initialized yet');
  const previewBox = document.getElementById('preview-box');
  if (!previewBox) return warn('Preview box not found');
  previewBox.innerHTML = '';

  const { mdCtx, htmlCtx } = settingsToContexts(_settings);
  const previewNode = htmlToElement(spec.preview);
  if (!previewNode) return warn(`Failed to parse preview for setting "${String(key)}"`);

  switch (spec.ctx) {
    case 'html': {
      previewBox.appendChild(h('div', { class: 'html-view' }, wikiToHtml(previewNode, htmlCtx)));
      break;
    }
    case 'markdown': {
      previewBox.appendChild(h('div', { class: 'md-view' }, toMd(previewNode, mdCtx)));
      break;
    }
    default: throw new Error(`Unknown setting ctx for key "${String(key as never)}"`);
  }
}

async function initForm(form: HTMLFormElement) {
  const mdContainer = form.querySelector<HTMLElement>('#md-options');
  const htmlContainer = form.querySelector<HTMLElement>('#html-options');
  if (!mdContainer || !htmlContainer) return warn('Settings containers not found');
  mdContainer.innerHTML = htmlContainer.innerHTML = '';

  _settings = await loadSettings();
  for (const key of Object.keys(XLET_SETTINGS) as XletSettingKey[]) {
    const spec = XLET_SETTINGS[key];
    switch (spec.ctx) {
      case 'markdown': appendSettingRow(mdContainer, key, _settings[key]); break;
      case 'html': appendSettingRow(htmlContainer, key, _settings[key]); break;
      default: throw new Error(`Unknown setting ctx for key "${String(key as never)}"`);
    }
  }
}

async function initOptionsPage() {
  injectCss(multiToggleCss, { id: 'multi-toggle-css', doc: document });
  const form = document.getElementById('settings-form');
  if (!isForm(form)) return warn('Options form not found');
  await initForm(form);
}

void initOptionsPage().catch((err) => {
  console.error('Failed to initialize options page:', err);
});
