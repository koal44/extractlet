import type { SiteKind } from './extractlet';
import { isFunction, isString } from './utils/typing';
import { isElement } from './utils/dom';

export const XLET_ATTRS = {
  site: 'data-xlet-site',
  skip: 'data-xlet-skip',
  tex: 'data-xlet-tex',
  mathml: 'data-xlet-mathml',
  lang: 'data-xlet-lang',
  preserve: 'data-xlet-preserve', // white-space
} as const;

export type XletAttrKey = keyof typeof XLET_ATTRS;
export type XletAttrName = (typeof XLET_ATTRS)[XletAttrKey];

export function setSite(el: Element, site: SiteKind): void {
  // eslint-disable-next-line no-restricted-syntax
  el.setAttribute(XLET_ATTRS.site, site);
}

export function getSite(el: Element): SiteKind | null {
  return el.getAttribute(XLET_ATTRS.site) as SiteKind | null;
}

export function markSkip(el: Element): void {
  // eslint-disable-next-line no-restricted-syntax
  el.toggleAttribute(XLET_ATTRS.skip, true);
}

export function clearSkip(el: Element): void {
  // eslint-disable-next-line no-restricted-syntax
  el.toggleAttribute(XLET_ATTRS.skip, false);
}

export function hasSkip(node: Node | null): boolean {
  return isElement(node) && node.hasAttribute(XLET_ATTRS.skip);
}

export function setLang(el: Element, lang: string): void {
  // eslint-disable-next-line no-restricted-syntax
  el.setAttribute(XLET_ATTRS.lang, lang);
}

export function getLang(el: Element): string | null {
  return el.getAttribute(XLET_ATTRS.lang);
}

export function setPreserve(el: Element, preserve: boolean): void {
  // eslint-disable-next-line no-restricted-syntax
  el.toggleAttribute(XLET_ATTRS.preserve, preserve);
}

export function getPreserve(el: Element): boolean {
  return el.hasAttribute(XLET_ATTRS.preserve);
}

export function normalizeDoc(site: SiteKind): void {
  // all site normalizations
  annotateMathJax();

  // site-specific normalizations
  switch (site) {
    case 'se':
      break;
    case 'wiki':
      break;
    case 'hub':
      break;
    default: throw new Error(`Unknown site kind: ${String(site satisfies never)}`);
  }
}

type MjxGlobal = {
  // v3/v4
  startup?: {
    document?: {
      math?: {
        list?: MjxLinkedList;
      };
      toMML?: (node: unknown) => string;
    };
  };

  // v2
  Hub?: {
    getAllJax?: () => Array<{
      SourceElement?: () => Element | null;
      root?: {
        toMathML?: (x: string) => string;
      };
    }>;
  };
}

type MjxLinkedList = {
  next?: MjxLinkedList;
  prev?: MjxLinkedList;
  data?: {
    math?: unknown;
    typesetRoot?: unknown;
    inputJax?: {
      name?: string;
    };
    inputData?: {
      originalMml?: string;
    };
    root?: unknown;
    data?: {
      root?: unknown;
    };
  };
}

function annotateMathJax(): void {
  const win = document.defaultView as (Window & { MathJax?: MjxGlobal; }) | null;
  const mjx = win?.MathJax;
  if (!mjx) return;

  // --- v2 support ---
  const jaxes = mjx.Hub?.getAllJax?.() ?? [];
  for (const jax of jaxes) {
    const src = jax.SourceElement?.();
    if (!isElement(src)) continue;

    const mml = jax.root?.toMathML?.('');
    if (isString(mml) && !getMathMl(src)) {
      setMathMl(src, mml);
    }
  }

  // --- v3/v4 support ---
  const list = mjx.startup?.document?.math?.list;
  if (!list) return;

  for (
    let link = list.next, i = 0;
    link && link !== list && i < 10000;
    link = link.next, i++
  ) {
    const { typesetRoot, math, inputJax, inputData } = link.data ?? {};
    if (!isElement(typesetRoot)) continue;

    // v4+ only: set originalMml if available
    const originalMml = inputData?.originalMml;
    if (originalMml && !getMathMl(typesetRoot)) {
      setMathMl(typesetRoot, originalMml);
    }

    // v3/v4: set source from `math` if not already set
    if (isString(math)) {
      const name = inputJax?.name;

      if (name === 'TeX' && !getTex(typesetRoot)) {
        setTex(typesetRoot, math);
      } else if (name === 'MathML' && !getMathMl(typesetRoot)) {
        setMathMl(typesetRoot, math);
      }
    }

    // v3/v4: regenerate MathML if missing
    if (!getMathMl(typesetRoot)) {
      const root = link.data?.root ?? link.data?.data?.root;
      const toMML = mjx.startup?.document?.toMML;
      const mml = root && isFunction(toMML) && toMML(root);
      if (isString(mml)) {
        setMathMl(typesetRoot, mml);
      }
    }
  }
}

export function setTex(el: Element, tex: string): void {
  // eslint-disable-next-line no-restricted-syntax
  el.setAttribute(XLET_ATTRS.tex, tex);
}

export function getTex(el: Element): string | null {
  return el.getAttribute(XLET_ATTRS.tex);
}

export function setMathMl(el: Element, mathml: string): void {
  // eslint-disable-next-line no-restricted-syntax
  el.setAttribute(XLET_ATTRS.mathml, mathml);
}

export function getMathMl(el: Element): string | null {
  return el.getAttribute(XLET_ATTRS.mathml);
}
