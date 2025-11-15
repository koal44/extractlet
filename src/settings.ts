import browser from 'webextension-polyfill';
import {
  DefaultToHtmlContext, DefaultToMdContext,
  BrMode, MathFenceStyle, MathView,
  ToMdContext, ToHtmlContext,
} from './core';
import { isBoolean, isString, Permutations } from './typing';
import { warn } from './utils';

type SpecValueType = string | boolean | number;
type ContextKind = 'markdown' | 'html';

type BoolSettingSpec = {
  kind: 'boolean';
  settingLabel: string;
  ctx: ContextKind;
  preview: string;
  values: readonly boolean[];
  valueLabels: readonly string[];
  coerce(val: unknown): boolean;
};
type StringSettingSpec = {
  kind: 'string';
  settingLabel: string;
  ctx: ContextKind;
  preview: string;
  values: readonly string[];
  valueLabels: readonly string[];
  coerce(val: unknown): string;
};

export type SettingSpec = BoolSettingSpec | StringSettingSpec;

type AllowedSettingKey = keyof typeof DefaultToMdContext | keyof typeof DefaultToHtmlContext;

export const XLET_SETTINGS = {
  filterRedundantLabels: boolSpec({
    values: [false, true] as const,
    valueLabels: ['Keep', 'Remove'] as const,
    settingLabel: 'Redundant text in links/images',
    ctx: 'markdown',
    preview: '<a href="https://example.com/all_about_cats" title="All About Cats">Cats!</a>',
    fallback: DefaultToMdContext.filterRedundantLabels,
  }),
  filterGenericLabels: boolSpec({
    values: [false, true] as const,
    valueLabels: ['Keep', 'Remove'] as const,
    settingLabel: 'Generic text in links/images',
    ctx: 'markdown',
    preview: '<a href="https://example.com/">Click here</a>',
    fallback: DefaultToMdContext.filterGenericLabels,
  }),
  mathFence: stringSpec({
    values: ['dollar', 'bracket'] as const satisfies Permutations<MathFenceStyle>,
    valueLabels: ['Dollars', 'Brackets'] as const,
    fallback: DefaultToMdContext.mathFence,
    settingLabel: 'Math delimiters',
    ctx: 'markdown',
    preview: '<math data-xlet display="block">ax^2 + bx + c = 0</math>',
  }),
  brMode: stringSpec({
    values: ['escape', 'hard', 'soft'] as const satisfies Permutations<BrMode>,
    valueLabels: ['Escaped LF', 'LF', 'Spaces + LF'] as const,
    fallback: DefaultToMdContext.brMode,
    settingLabel: 'Line breaks',
    ctx: 'markdown',
    preview: '<span>Line abc<br />Line abc<br />Line abc</span>',
  }),
  mathView: stringSpec({
    values: ['script', 'image', 'mathml'] as const satisfies Permutations<MathView>,
    valueLabels: ['TeX', 'SVG', 'MathML'] as const,
    fallback: DefaultToHtmlContext.mathView,
    settingLabel: 'Math source',
    ctx: 'html',
    preview: getMathViewPreview(),
  }),
} as const satisfies Partial<Record<AllowedSettingKey, SettingSpec>>;

export type XletSettingKey = keyof typeof XLET_SETTINGS;

function boolSpec(
  { values, valueLabels, fallback, settingLabel, ctx, preview }: { values: readonly boolean[]; valueLabels: readonly string[]; fallback: boolean; settingLabel: string; ctx: ContextKind; preview: string; }
): BoolSettingSpec {
  if (values.length !== valueLabels.length) console.warn(`val/labels mismatch for "${settingLabel}"`);
  if (!values.includes(fallback)) console.warn(`"${fallback}" is not in values [${values.join(', ')}]`);
  return {
    kind: 'boolean',
    values, valueLabels, settingLabel, ctx, preview,
    coerce(val: unknown): boolean { return isBoolean(val) ? val : fallback; },
  };
}

function stringSpec(
  { values, valueLabels, fallback, settingLabel, ctx, preview }: { values: readonly string[]; valueLabels: readonly string[]; fallback: string; settingLabel: string; ctx: ContextKind; preview: string; }
): StringSettingSpec {
  if (!values.includes(fallback)) console.warn(`"${fallback}" is not in values [${values.join(', ')}]`);
  if (values.length !== valueLabels.length) console.warn(`val/labels mismatch for "${settingLabel}"`);
  return {
    kind: 'string',
    values, valueLabels, settingLabel, ctx, preview,
    coerce(val: unknown): string { return (isString(val) && values.includes(val)) ? val : fallback; },
  };
}

export type XletSettings = Record<XletSettingKey, SpecValueType>;
export function coerceSetting(key: XletSettingKey, val: unknown) {
  return XLET_SETTINGS[key].coerce(val);
}
export function coerceSettings(raw: Record<string, unknown>): Partial<XletSettings> {
  const out: Partial<XletSettings> = {};
  for (const key of Object.keys(XLET_SETTINGS) as XletSettingKey[]) {
    out[key] = coerceSetting(key, raw[key]);
  }
  return out;
}

export function settingsToContexts(settings: Partial<XletSettings>) {
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
          default: console.warn(`Unhandled markdown setting key "${String(key as never)}"`);
        }
        break;
      }
      case 'html': {
        switch (key) {
          case 'mathView': htmlCtx.mathView = val as MathView; break;
          default: console.warn(`Unhandled HTML setting key "${String(key as never)}"`);
        }
        break;
      }
      default: console.warn(`Unknown setting ctx for key "${String(key as never)}"`);
    }
  }
  return { mdCtx, htmlCtx };
}

const areas: Partial<Record<'local' | 'sync' | 'managed', browser.Storage.StorageArea>> = {
  local:   browser.storage.local,
  sync:    browser.storage.sync,
  managed: browser.storage.managed,
};

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

  const defaults: XletSettings = Object.fromEntries(
    Object.entries(XLET_SETTINGS).map(([k, spec]) => [k, spec.coerce(undefined)])
  ) as XletSettings;

  return { ...defaults, ...local, ...sync, ...managed };
}

export async function saveSettings(patch: Partial<Record<XletSettingKey, unknown>>): Promise<void> {
  const area = areas.sync ?? areas.local;
  if (!area) return warn('No storage area available');

  const coercedPatch = coerceSettings(patch);
  if (Object.keys(coercedPatch).length === 0) return;

  await area.set(coercedPatch);
}

export function observeSettings(
  onChange: (settings: XletSettings, patch: Partial<XletSettings>) => void
): () => void {
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

      const patch = coerceSettings(newChanges);
      const settings = await loadSettings();
      onChange(settings, patch);
    })();
  };

  browser.storage.onChanged.addListener(listener);

  // emit initial state
  // const settings = await loadSettings();
  // onChange(settings, {});

  return () => browser.storage.onChanged.removeListener(listener);
}

function getMathViewPreview() {
  return `<p><mjx-container class="MathJax CtxtMenu_Attached_0" jax="CHTML" style="font-size: 117.4%; position: relative;" tabindex="0" ctxtmenu_counter="0"><mjx-math class="mwe-math-element mwe-math-element-inline MJX-TEX" aria-hidden="true"><mjx-texatom texclass="ORD"><mjx-mstyle><mjx-mi class="mjx-i"><mjx-c class="mjx-c1D438 TEX-I"></mjx-c></mjx-mi><mjx-mo class="mjx-n" space="4"><mjx-c class="mjx-c3D"></mjx-c></mjx-mo><mjx-mi class="mjx-i" space="4"><mjx-c class="mjx-c1D45A TEX-I"></mjx-c></mjx-mi><mjx-msup><mjx-mi class="mjx-i"><mjx-c class="mjx-c1D450 TEX-I"></mjx-c></mjx-mi><mjx-script style="vertical-align: 0.413em;"><mjx-texatom size="s" texclass="ORD"><mjx-mn class="mjx-n"><mjx-c class="mjx-c32"></mjx-c></mjx-mn></mjx-texatom></mjx-script></mjx-msup></mjx-mstyle></mjx-texatom></mjx-math><mjx-assistive-mml unselectable="on" display="inline"><mjx-container class="MathJax CtxtMenu_Attached_0" jax="CHTML" style="font-size: 117.2%; position: relative;" tabindex="0" ctxtmenu_counter="1"><mjx-math class="mwe-math-element mwe-math-element-inline MJX-TEX" aria-hidden="true"><mjx-texatom texclass="ORD"><mjx-mstyle><mjx-mi class="mjx-i"><mjx-c class="mjx-c1D438 TEX-I"></mjx-c></mjx-mi><mjx-mo class="mjx-n" space="4"><mjx-c class="mjx-c3D"></mjx-c></mjx-mo><mjx-mi class="mjx-i" space="4"><mjx-c class="mjx-c1D45A TEX-I"></mjx-c></mjx-mi><mjx-msup><mjx-mi class="mjx-i"><mjx-c class="mjx-c1D450 TEX-I"></mjx-c></mjx-mi><mjx-script style="vertical-align: 0.413em;"><mjx-texatom size="s" texclass="ORD"><mjx-mn class="mjx-n"><mjx-c class="mjx-c32"></mjx-c></mjx-mn></mjx-texatom></mjx-script></mjx-msup></mjx-mstyle></mjx-texatom></mjx-math><mjx-assistive-mml unselectable="on" display="inline"><math xmlns="http://www.w3.org/1998/Math/MathML" class="mwe-math-element mwe-math-element-inline"><mrow data-mjx-texclass="ORD"><mstyle displaystyle="true" scriptlevel="0"><mi>E</mi><mo stretchy="false">=</mo><mi>m</mi><msup><mi>c</mi><mrow data-mjx-texclass="ORD"><mn>2</mn></mrow></msup></mstyle></mrow></math></mjx-assistive-mml></mjx-container></mjx-assistive-mml></mjx-container></p>`;
};

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
