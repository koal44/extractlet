import { repr, warn } from './logging';

export type Locator = { sel: string; attr?: string; valMap?: ValMapFn; };
export type ValMapFn = (v: string, doc: Document, scope?: ParentNode) => string;

export function pickEl(specs: readonly Locator[], doc: Document, scope?: Element): Element | undefined {
  for (const { sel } of specs) {
    if (sel === ':scope') {
      if (scope) return scope;
      else continue;
    }
    const el = (scope ?? doc).querySelector(sel);
    if (el) return el;
  }
  return undefined;
}

export function pickEls(specs: readonly Locator[], doc: Document, scope?: Element): Element[] {
  for (const { sel } of specs) {
    if (sel === ':scope') {
      if (scope) return [scope];
      else continue;
    }
    const els = (scope ?? doc).querySelectorAll(sel);
    if (els.length > 0) return [...els];
  }
  return [];
}

export function pickVal(specs: readonly Locator[], doc: Document, scope?: Element): string | undefined {
  for (const { sel, attr, valMap } of specs) {
    const el = sel === ':scope' ? scope : (scope ?? doc).querySelector(sel);
    if (!el) continue;
    let val =
      attr === 'innerHTML' ? el.innerHTML.trim() :
      attr === 'outerHTML' ? el.outerHTML.trim() :
      attr === 'textContent' || !attr ? el.textContent?.trim() ?? undefined :
      el.getAttribute(attr)?.trim() ?? undefined;
    if (val === undefined) continue;
    val = valMap ? valMap(val, doc, scope).trim() : val;
    if (val) return val;
  }
  return undefined;
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
