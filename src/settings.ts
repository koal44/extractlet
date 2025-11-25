import browser from 'webextension-polyfill';
import type {
  BrMode, MathFenceStyle, MathView,
  ToMdContext, ToHtmlContext,
} from './core';
import { DefaultToHtmlContext, DefaultToMdContext } from './core';
import type { Permutations } from './utils/typing';
import { isBoolean, isString } from './utils/typing';
import { warn } from './utils/logging';

type SpecValueType = string | boolean | number;
type ContextKind = 'markdown' | 'html';

type BoolSettingSpec = {
  kind: 'boolean';
  settingLabel: string;
  ctx: ContextKind;
  preview: (() => Promise<string>) | (() => string);
  values: readonly boolean[];
  valueLabels: readonly string[];
  coerce(val: unknown): boolean;
};
type StringSettingSpec = {
  kind: 'string';
  settingLabel: string;
  ctx: ContextKind;
  preview: (() => Promise<string>) | (() => string);
  values: readonly string[];
  valueLabels: readonly string[];
  coerce(val: unknown): string;
};

type SettingSpec = BoolSettingSpec | StringSettingSpec;

type AllowedSettingKey = keyof typeof DefaultToMdContext | keyof typeof DefaultToHtmlContext;

export const XLET_SETTINGS = {
  filterRedundantLabels: boolSpec({
    values: [false, true] as const,
    valueLabels: ['Keep', 'Remove'] as const,
    settingLabel: 'Redundant text in links/images',
    ctx: 'markdown',
    preview: () => '<a href="https://example.com/all_about_cats" title="All About Cats">Cats!</a>',
    fallback: DefaultToMdContext.filterRedundantLabels,
  }),
  filterGenericLabels: boolSpec({
    values: [false, true] as const,
    valueLabels: ['Keep', 'Remove'] as const,
    settingLabel: 'Generic text in links/images',
    ctx: 'markdown',
    preview: () => '<a href="https://example.com/">Click here</a>',
    fallback: DefaultToMdContext.filterGenericLabels,
  }),
  mathFence: stringSpec({
    values: ['dollar', 'bracket'] as const satisfies Permutations<MathFenceStyle>,
    valueLabels: ['Dollars', 'Brackets'] as const,
    fallback: DefaultToMdContext.mathFence,
    settingLabel: 'Math delimiters',
    ctx: 'markdown',
    preview: () => '<mjx-container class="MathJax" data-xlet-tex="ax^2 + bx + c = 0" display="true" data-xlet-mathml="boo!"></mjx-container>',
  }),
  brMode: stringSpec({
    values: ['escape', 'hard', 'soft'] as const satisfies Permutations<BrMode>,
    valueLabels: ['Escaped LF', 'LF', 'Spaces + LF'] as const,
    fallback: DefaultToMdContext.brMode,
    settingLabel: 'Line breaks',
    ctx: 'markdown',
    preview: () => '<span>Line abc<br />Line abc<br />Line abc</span>',
  }),
  mathView: stringSpec({
    values: ['tex', 'svg', 'mathml'] as const satisfies Permutations<MathView>,
    valueLabels: ['TeX', 'SVG', 'MathML'] as const,
    fallback: DefaultToHtmlContext.mathView,
    settingLabel: 'Math source',
    ctx: 'html',
    preview: () => loadSnippet('mathview-preview.html'),
  }),
} as const satisfies Partial<Record<AllowedSettingKey, SettingSpec>>;

async function loadSnippet(name: string): Promise<string> {
  const url = browser.runtime.getURL(`snippets/${name}`);
  const res = await fetch(url);
  if (!res.ok) {
    return warn('<div>error</div>', `[xlet:settings] Failed to load snippet "${name}" (${res.status})`);
  }
  return res.text();
}

export type XletSettingKey = keyof typeof XLET_SETTINGS;

function boolSpec(
  { values, valueLabels, fallback, settingLabel, ctx, preview }:
  { values: readonly boolean[];
    valueLabels: readonly string[];
    fallback: boolean;
    settingLabel: string;
    ctx: ContextKind;
    preview: (() => Promise<string>) | (() => string); }
): BoolSettingSpec {
  if (values.length !== valueLabels.length) console.warn(`[xlet:settings] val/labels mismatch for "${settingLabel}"`);
  if (!values.includes(fallback)) console.warn(`[xlet:settings] "${fallback}" is not in values [${values.join(', ')}]`);
  return {
    kind: 'boolean',
    values, valueLabels, settingLabel, ctx, preview,
    coerce(val: unknown): boolean { return isBoolean(val) ? val : fallback; },
  };
}

function stringSpec(
  { values, valueLabels, fallback, settingLabel, ctx, preview }:
  { values: readonly string[];
    valueLabels: readonly string[];
    fallback: string;
    settingLabel: string;
    ctx: ContextKind;
    preview: (() => Promise<string>) | (() => string); }
): StringSettingSpec {
  if (!values.includes(fallback)) console.warn(`[xlet:settings] "${fallback}" is not in values [${values.join(', ')}]`);
  if (values.length !== valueLabels.length) console.warn(`[xlet:settings] val/labels mismatch for "${settingLabel}"`);
  return {
    kind: 'string',
    values, valueLabels, settingLabel, ctx, preview,
    coerce(val: unknown): string { return (isString(val) && values.includes(val)) ? val : fallback; },
  };
}

export type XletSettings = Record<XletSettingKey, SpecValueType>;
function coerceSetting(key: XletSettingKey, val: unknown) {
  return XLET_SETTINGS[key].coerce(val);
}

export type XletContexts = { md: Partial<ToMdContext>; html: Partial<ToHtmlContext>; };
export function settingsToContexts(settings: Partial<XletSettings>): XletContexts {
  const mdCtx: Partial<ToMdContext> = {};
  const htmlCtx: Partial<ToHtmlContext> = {};
  for (const [key, optVal] of Object.entries(settings) as [XletSettingKey, SpecValueType][]) {
    const spec = XLET_SETTINGS[key];
    const val = spec.coerce(optVal);
    switch (spec.ctx) {
      case 'markdown': {
        switch (key) {
          case 'mathFence': mdCtx.mathFence = val as MathFenceStyle; break;
          case 'brMode': mdCtx.brMode = val as BrMode; break;
          case 'filterRedundantLabels': mdCtx.filterRedundantLabels = val as boolean; break;
          case 'filterGenericLabels': mdCtx.filterGenericLabels = val as boolean; break;
          default: console.warn(`[xlet:settings] Unhandled markdown setting key "${String(key as never)}"`);
        }
        break;
      }
      case 'html': {
        switch (key) {
          case 'mathView': htmlCtx.mathView = val as MathView; break;
          default: console.warn(`[xlet:settings] Unhandled HTML setting key "${String(key as never)}"`);
        }
        break;
      }
      default: console.warn(`[xlet:settings] Unknown setting ctx for key "${String(key as never)}"`);
    }
  }
  return { md: mdCtx, html: htmlCtx };
}

const areas: Partial<Record<'local' | 'sync' | 'managed', browser.Storage.StorageArea>> = {
  local:   browser.storage.local,
  sync:    browser.storage.sync,
  managed: browser.storage.managed,
};

export function coerceSettings(raw: Record<string, unknown>): Partial<XletSettings> {
  const out: Partial<XletSettings> = {};
  for (const key of Object.keys(XLET_SETTINGS) as XletSettingKey[]) {
    if (!(key in raw)) continue;
    out[key] = coerceSetting(key, raw[key]);
  }
  return out;
}

export async function loadSettings(): Promise<XletSettings> {
  const keys = Object.keys(XLET_SETTINGS) as XletSettingKey[];

  const [localRaw, syncRaw, managedRaw] = await Promise.all([
    areas.local?.get(keys)   ?? {},
    areas.sync?.get(keys)    ?? {},
    areas.managed?.get(keys) ?? {},
  ]);

  const local   = coerceSettings(localRaw);
  const sync    = coerceSettings(syncRaw);
  const managed = coerceSettings(managedRaw);

  const defaults = Object.fromEntries(
    Object.entries(XLET_SETTINGS).map(([k, spec]) => [k, spec.coerce(undefined)])
  ) as XletSettings;

  return { ...defaults, ...local, ...sync, ...managed };
}

export async function saveSettings(patch: Partial<Record<XletSettingKey, unknown>>): Promise<void> {
  const area = areas.sync ?? areas.local;
  if (!area) return console.warn('[xlet:settings] No storage area available');

  const coercedPatch = coerceSettings(patch);
  if (Object.keys(coercedPatch).length === 0) return;

  await area.set(coercedPatch);
}

export function observeSettings(
  onChange: (settings: XletSettings, patch: Partial<XletSettings>) => Promise<void>
): () => void {
  let last: XletSettings | null = null;
  const listener = (changes: Record<string, browser.Storage.StorageChange>, areaName: string) => {
    void (async () => {
      if (!['local', 'sync', 'managed'].includes(areaName)) return;

      const isXletKey = (key: string): key is XletSettingKey => key in XLET_SETTINGS;
      const newChanges = Object.fromEntries(
        Object.entries(changes)
          .filter(([key]) => isXletKey(key))
          .map(([key, change]) => [key, change.newValue])
      );
      if (Object.keys(newChanges).length === 0) return;

      const next = await loadSettings();
      const diff: Partial<XletSettings> = {};
      for (const key of Object.keys(newChanges) as XletSettingKey[]) {
        if (last?.[key] !== next[key]) {
          diff[key] = next[key];
        }
      }
      last = next;

      if (Object.keys(diff).length === 0) return;
      await onChange({ ...next }, { ...diff });
    })();
  };

  browser.storage.onChanged.addListener(listener);

  return () => browser.storage.onChanged.removeListener(listener);
}

// harder-to-maintain version that gives better typing for XletSettings
//
// export type XletSettings = {
//   -readonly [K in XletSettingKey]: ReturnType<typeof XLET_SETTINGS[K]['coerce']>;
// };
// export function coerceSetting(key: 'filterRedundantLabels', val: unknown): XletSettings['filterRedundantLabels'];
// export function coerceSetting(key: 'filterGenericLabels',   val: unknown): XletSettings['filterGenericLabels'];
// export function coerceSetting(key: 'mathFenceStyle',        val: unknown): XletSettings['mathFenceStyle'];
// export function coerceSetting(key: 'brMode',                val: unknown): XletSettings['brMode'];
// export function coerceSetting(key: 'mathView',              val: unknown): XletSettings['mathView'];
// export function coerceSetting(key: XletSettingKey, val: unknown): XletSettings[XletSettingKey] {
//   return XLET_SETTINGS[key].coerce(val);
// }
// export function coerceSettings(raw: Record<string, unknown>): Partial<XletSettings> {
//   const out: Partial<XletSettings> = {};
//   for (const [k, v] of Object.entries(raw)) {
//     if (isXletKey(k)) {
//       switch (k) {
//         case 'filterRedundantLabels': out[k] = coerceSetting(k, v); break;
//         case 'filterGenericLabels':   out[k] = coerceSetting(k, v); break;
//         case 'mathFenceStyle':        out[k] = coerceSetting(k, v); break;
//         case 'brMode':                out[k] = coerceSetting(k, v); break;
//         case 'mathView':              out[k] = coerceSetting(k, v); break;
//         default: throw new Error(`Unknown setting key: ${String(k satisfies never)}`);
//       }
//     }
//   }
//   return out;
// }
