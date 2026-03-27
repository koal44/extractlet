import { isElement } from './dom';
import { repr, warn } from './logging';
import { isROArray } from './typing';

export type Locator = { sel: string; attr?: string; valMap?: ValMapFn; };
export type ValMapFn = (v: string, root: ParentNode) => string;

export function pickEl<T extends Element>(locators: Locator | readonly Locator[], root: ParentNode): T | undefined {
  for (const { sel } of asLocators(locators)) {
    if (sel === ':scope') {
      if (isElement(root)) return root as T;
      continue;
    }
    const el = root.querySelector<T>(sel);
    if (el) return el;
  }
  return undefined;
}

export function pickEls<T extends Element>(locators: Locator | readonly Locator[], root: ParentNode): T[] {
  for (const { sel } of asLocators(locators)) {
    if (sel === ':scope') {
      if (isElement(root)) return [root as T];
      continue;
    }
    const els = root.querySelectorAll<T>(sel);
    if (els.length > 0) return [...els];
  }
  return [];
}

export function pickVal(locators: Locator | readonly Locator[], root: ParentNode): string | undefined {
  for (const { sel, attr, valMap } of asLocators(locators)) {
    const el = sel === ':scope' && isElement(root) ? root : root.querySelector(sel);
    if (!el) continue;
    let val =
      attr === 'innerHTML' ? el.innerHTML :
      attr === 'outerHTML' ? el.outerHTML :
      attr === 'textContent' || !attr ? el.textContent ?? undefined :
      el.getAttribute(attr) ?? undefined;

    if (val === undefined) continue;
    val = valMap ? valMap(val, root) : val;
    if (val) return val;
  }
  return undefined;
}

function asLocators(locators: Locator | readonly Locator[]): readonly Locator[] {
  return isROArray(locators) ? locators : [locators];
}

// MapFns
export const asIs: ValMapFn = (v) => v;

export const asAbsUrl: ValMapFn = (v, doc) => {
  try { return new URL(v, doc.baseURI).href; }
  catch { return warn(v, `[xlet:asAbsUrl] invalid URL: ${repr(v)}`); }
};

export const asIdFrag: ValMapFn = (v) => {
  if (!v.includes('#')) return warn(v, `[xlet:asIdFrag] no fragment in: ${v}`);
  const frag = v.split('#')[1];
  return frag ? frag : warn(v, `[xlet:asIdFrag] empty fragment in: ${v}`);
};

export const asLastPathSeg: ValMapFn = (v) => {
  const seg = v.split('/').filter(Boolean).pop();
  return seg ?? warn(v, `[xlet:asLastPathSeg] no path segment in: ${v}`);
};
