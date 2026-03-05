import browser from 'webextension-polyfill';
import type {
  BrMode, MathFenceStyle, MathView, SubSupMode,
  ToMdContext, ToHtmlContext, GeneralContext,
} from './core';
import { DefaultToHtmlContext, DefaultToMdContext, DefaultGeneralContext } from './core';
import type { Permutations } from './utils/typing';
import { isBoolean, isString } from './utils/typing';
import { warn } from './utils/logging';
import { type HAttrs } from './utils/dom';

type SpecValueType = string | boolean | number;
type ContextKind = 'markdown' | 'html' | 'general';

type Preview = {
  content: () => string | Node | Promise<string | Node>;
  wire?: (root: HTMLElement, contexts: XletContexts) => void;
  attrs?: HAttrs;
  label?: 'Preview' | 'Info';
};

type BoolSettingSpec = {
  kind: 'boolean';
  settingLabel: string;
  ctx: ContextKind;
  preview: Preview;
  values: readonly boolean[];
  valueLabels: readonly string[];
  coerce(val: unknown): boolean;
};

type StringSettingSpec = {
  kind: 'string';
  settingLabel: string;
  ctx: ContextKind;
  preview: Preview;
  values: readonly string[];
  valueLabels: readonly string[];
  coerce(val: unknown): string;
};

type SettingSpec = BoolSettingSpec | StringSettingSpec;

type AllowedSettingKey =
  keyof typeof DefaultToMdContext |
  keyof typeof DefaultToHtmlContext |
  keyof typeof DefaultGeneralContext;

export const XLET_SETTINGS = {
  filterRedundantLabels: boolSpec({
    values: [false, true] as const,
    valueLabels: ['Keep', 'Remove'] as const,
    settingLabel: 'Redundant text in links/images',
    ctx: 'markdown',
    preview: {
      content: () => '<a href="https://example.com/all_about_cats" title="All About Cats">Cats!</a>',
    },
    fallback: DefaultToMdContext.filterRedundantLabels,
  }),
  filterGenericLabels: boolSpec({
    values: [false, true] as const,
    valueLabels: ['Keep', 'Remove'] as const,
    settingLabel: 'Generic text in links/images',
    ctx: 'markdown',
    preview: {
      content: () => '<a href="https://example.com/">Click here</a>',
    },
    fallback: DefaultToMdContext.filterGenericLabels,
  }),
  mathFence: stringSpec({
    values: ['dollar', 'bracket'] as const satisfies Permutations<MathFenceStyle>,
    valueLabels: ['Dollars', 'Brackets'] as const,
    fallback: DefaultToMdContext.mathFence,
    settingLabel: 'Math delimiters',
    ctx: 'markdown',
    preview: {
      content: () => '<mjx-container class="MathJax" data-xlet-tex="ax^2 + bx + c = 0" display="true" data-xlet-mathml="boo!"></mjx-container>',
    },
  }),
  brMode: stringSpec({
    values: ['escape', 'hard', 'soft'] as const satisfies Permutations<BrMode>,
    valueLabels: ['Escaped LF', 'LF', 'Spaces + LF'] as const,
    fallback: DefaultToMdContext.brMode,
    settingLabel: 'Line breaks',
    ctx: 'markdown',
    preview: {
      content: () => '<span>Line abc<br />Line abc<br />Line abc</span>',
    },
  }),
  prettyTables: boolSpec({
    values: [false, true] as const,
    valueLabels: ['LLM-friendly', 'Human-friendly'] as const,
    settingLabel: 'Markdown tables',
    ctx: 'markdown',
    preview: {
      content: () => '<table><thead><tr><th>Impactor</th><th>Diameter (km)</th></tr></thead><tbody><tr><td>Chicxulub</td><td>10</td></tr><tr><td>Tunguska</td><td>0.05</td></tr></tbody></table>',
      attrs: { style: 'font-family: monospace;' },
    },
    fallback: DefaultToMdContext.prettyTables,
  }),
  subSupMode: stringSpec({
    values: ['html', 'tex'] as const satisfies Permutations<SubSupMode>,
    valueLabels: ['HTML', 'TeX'] as const,
    fallback: DefaultToMdContext.subSupMode,
    settingLabel: 'Subscripts & superscripts',
    ctx: 'markdown',
    preview: {
      content: () => '<p>H<sub>2</sub>O</p>',
    },
  }),
  mathView: stringSpec({
    values: ['tex', 'svg', 'mathml'] as const satisfies Permutations<MathView>,
    valueLabels: ['TeX', 'SVG', 'MathML'] as const,
    fallback: DefaultToHtmlContext.mathView,
    settingLabel: 'Math source',
    ctx: 'html',
    preview: {
      content: () => loadSnippet('mathview-preview.html'),
    },
  }),
  fetchMissingContent: boolSpec({
    values: [false, true] as const,
    valueLabels: ['Forbid', 'Allow'] as const,
    settingLabel: 'Fetch missing content',
    ctx: 'general',
    preview: {
      label: 'Info',
      content: () => `
        <div class="fetch-info">
          <table><tbody>
            <tr><td>WikiText</td><td data-fetch-status>—</td></tr>
          </tbody></table>
        </div>`,
      wire: (root, contexts) => {
        const enabled = contexts.general?.fetchMissingContent !== false;
        const statusVal = enabled ? '✓' : '✗'; // ✓/✗, ✔/✖, 🟢/🔴, ✅/❌, Allowed/Blocked
        root.querySelectorAll<HTMLElement>('[data-fetch-status]').forEach((el) => {
          el.textContent = statusVal;
        });
      },
    },
    fallback: DefaultGeneralContext.fetchMissingContent,
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
    preview: Preview; }
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
    preview: Preview; }
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

export type XletContexts = {
  md?: Partial<ToMdContext>;
  html?: Partial<ToHtmlContext>;
  general?: Partial<GeneralContext>;
};

export function settingsToContexts(settings: Partial<XletSettings>): XletContexts {
  const genCtx: Partial<GeneralContext> = {};
  const mdCtx: Partial<ToMdContext> = {};
  const htmlCtx: Partial<ToHtmlContext> = {};
  for (const [key, optVal] of Object.entries(settings) as [XletSettingKey, SpecValueType][]) {
    const spec = XLET_SETTINGS[key];
    const val = spec.coerce(optVal);
    switch (key) {
      // markdown settings
      case 'mathFence': mdCtx.mathFence = val as MathFenceStyle; break;
      case 'brMode': mdCtx.brMode = val as BrMode; break;
      case 'filterRedundantLabels': mdCtx.filterRedundantLabels = val as boolean; break;
      case 'filterGenericLabels': mdCtx.filterGenericLabels = val as boolean; break;
      case 'prettyTables': mdCtx.prettyTables = val as boolean; break;
      case 'subSupMode': mdCtx.subSupMode = val as SubSupMode; break;

      // html settings
      case 'mathView': htmlCtx.mathView = val as MathView; break;

      // general settings
      case 'fetchMissingContent': genCtx.fetchMissingContent = val as boolean; break;

      // no default case
      default: throw new Error(`[xlet:settings] Unhandled setting key "${String(key satisfies never)}"`);
    }
  }
  return { md: mdCtx, html: htmlCtx, general: genCtx };
}

const areas: Partial<Record<'local' | 'sync' | 'managed', browser.Storage.StorageArea>> = {
  local:   browser.storage.local,
  sync:    browser.storage.sync,
  managed: browser.storage.managed,
};

async function safeGet(area: browser.Storage.StorageArea | undefined, keys: string[]): Promise<Record<string, unknown>> {
  if (!area) return {};
  try { return await area.get(keys); }
  catch { return {}; } // managed storage can throw if no enterprise manifest is present
}

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
    safeGet(areas.local, keys),
    safeGet(areas.sync, keys),
    safeGet(areas.managed, keys),
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
