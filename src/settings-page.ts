import type { XletSettingKey, XletSettings } from './settings';
import { loadSettings, observeSettings, saveSettings, settingsToContexts, XLET_SETTINGS } from './settings';
import { createMultiToggle, multiToggleCss, type MultiToggleDiv } from './ui/multi-toggle';
import { h, htmlToElement, injectCss, isForm } from './utils/dom';
import { toHtml, toMd } from './core';
import browser from 'webextension-polyfill';
import { repr } from './utils/logging';

let _settings: XletSettings | null = null;
let _activePreviewKey: XletSettingKey | null = null;
const _toggles: Partial<Record<XletSettingKey, MultiToggleDiv>> = {};
const _rows: Partial<Record<XletSettingKey, HTMLDivElement>> = {};

function createToggle<T extends string | number | boolean>(
  settingKey: XletSettingKey,
  values: readonly T[],
  initValue: T,
  labels?: readonly string[],
  labelSide: 'left' | 'right' = 'left',
  onValueChange?: (newValue: T) => void,
): HTMLElement {
  const tokens = values.map(String);
  if (labels?.length !== values.length) {
    console.warn(`[xlet:opt] Labels length mismatch for toggle "${settingKey}"`);
    labels = tokens;
  }

  // resolve init state using string tokens
  const initToken = String(initValue);
  let initState = tokens.indexOf(initToken);
  if (initState === -1) {
    console.error(`[xlet:opt] initial value "${initToken}" for toggle "${settingKey}" not found in values`);
    initState = 0;
  }

  const tog = createMultiToggle({
    initState, labels, labelSide,
    onToggle: (state) => {
      const newValue = values[state];
      onValueChange?.(newValue);
    },
  });

  tog.init();
  _toggles[settingKey] = tog;

  return h('div', { class: 'setting-control' }, tog);
}

function appendSettingRow(container: HTMLElement, key: XletSettingKey, val: unknown): HTMLDivElement {
  const spec = XLET_SETTINGS[key];
  const rowDiv = h('div', { class: 'setting-row' });

  const handleSettingChange = (newValue: string | boolean) => {
    if (!_settings) return console.warn(`[xlet:opt] Settings not initialized yet; ignoring change for "${key}"`);

    const oldValue = _settings[key];
    const coercedNew = spec.coerce(newValue);
    if (coercedNew === oldValue) return; // no change

    _settings[key] = coercedNew;
    void saveSettings(_settings).catch((err) => {
      console.error(`[xlet:opt] Failed to save settings after changing "${key}": ${repr(err)}`);
    });
    _activePreviewKey = key;
  };

  const control = createToggle(
    key,
    spec.values,
    spec.coerce(val),
    spec.valueLabels,
    'left',
    (newValue) => { void handleSettingChange(newValue); },
  );

  control.addEventListener('click', (e) => { e.stopPropagation(); }); // prevent row click

  rowDiv.appendChild(h('label', {}, spec.settingLabel));
  rowDiv.appendChild(control);
  rowDiv.addEventListener('click', () => { void showPreview(key, rowDiv); });

  container.appendChild(rowDiv);
  _rows[key] = rowDiv;
  return rowDiv;
}

async function showPreview(key: XletSettingKey, row: HTMLElement) {
  _activePreviewKey = key;
  const spec = XLET_SETTINGS[key];
  const rows = document.querySelectorAll<HTMLDivElement>('.setting-row.active');
  rows.forEach((r) => r.classList.remove('active'));

  row.classList.add('active');

  if (!_settings) return console.warn('[xlet:opt] Settings not initialized yet');
  const previewBox = document.getElementById('preview-box');
  if (!previewBox) return console.warn('[xlet:opt] Preview box not found');
  previewBox.innerHTML = '';

  const { md: mdCtx, html: htmlCtx } = settingsToContexts(_settings);
  const previewNode = htmlToElement(await spec.preview());
  if (!previewNode) return console.warn(`[xlet:opt] Failed to parse preview for key "${String(key)}"`);

  switch (spec.ctx) {
    case 'html': {
      previewBox.appendChild(h('div', { class: 'html-view' }, toHtml(previewNode, htmlCtx)));
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
  const mdContainer = form.querySelector<HTMLElement>('#md-settings');
  const htmlContainer = form.querySelector<HTMLElement>('#html-settings');
  if (!mdContainer || !htmlContainer) return console.warn('[xlet:opt] Settings containers not found');
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

async function initSettingsPage() {
  injectCss(multiToggleCss, { id: 'multi-toggle-css', doc: document });

  // setup form
  const form = document.getElementById('settings-form');
  if (!isForm(form)) return console.warn('[xlet:settings] Settings form not found');
  await initForm(form);

  // set app-version
  const verEl = document.getElementById('app-version');
  if (verEl) {
    const manifest = browser.runtime.getManifest();
    verEl.textContent = manifest.version || '0.0.0';
  }

  observeSettings(async (settings, diff) => {
    _settings = settings;

    // update toggles
    for (const key of Object.keys(diff) as XletSettingKey[]) {
      const tog = _toggles[key];
      if (!tog) continue;

      const spec = XLET_SETTINGS[key];
      const newValue = settings[key];
      const tokens = spec.values.map(String);
      const newState = tokens.indexOf(String(newValue));
      if (newState === -1) {
        console.error(`[xlet:opt] observed value "${newValue}" for toggle "${key}" not found in values`);
        continue;
      }

      tog.setState(newState, { silent: true });
    }

    // update preview
    if (_activePreviewKey) {
      const row = _rows[_activePreviewKey];
      if (!row) return;
      await showPreview(_activePreviewKey, row);
    }

  });
}

void initSettingsPage().catch((err) => {
  console.error(`[xlet:opt] Failed to initialize settings page: ${repr(err)}`);
});
