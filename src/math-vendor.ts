import type { MathView, ToHtmlContext, ToMdContext } from './core';
import { getMathMl, getTex } from './normalize';
import { h, htmlToElementK } from './utils/dom';
import { repr } from './utils/logging';

export function frameMath(tex: string, display: DisplayMode, ctx: ToMdContext) {
  // if (!tex) return ''; // if it happens, leave it visible for debugging
  if (ctx.compact) display = 'inline';

  const lFence = ctx.mathFence === 'dollar'
    ? (display === 'block' ? '$$' : '$')
    : (display === 'block' ? '\\[' : '\\(');
  const rFence = ctx.mathFence === 'dollar'
    ? (display === 'block' ? '$$' : '$')
    : (display === 'block' ? '\\]' : '\\)');

  return display === 'block'
    ? frameMd(`${lFence}\n${tex}\n${rFence}`, 'block', ctx)
    : `${lFence}${tex}${rFence}`;

  function frameMd(md: string, mode: 'block' | 'inline', ctx: ToMdContext): string {
    if (mode === 'inline') return md;
    const bookEnd = ctx.inListItem ? '\n' : '\n\n';
    return `${bookEnd}${md}${bookEnd}`;
  }
}

type MathVendorToHtmlResult = { skip?: boolean; node?: Node; } | null;
type DisplayMode = 'block' | 'inline';

function createTexNode(tex: string, display: DisplayMode): Element {
  return display === 'block'
    ? h('pre', { class: 'xlet-math-tex xlet-math-block' }, h('code', {}, tex))
    : h('code', { class: 'xlet-math-tex xlet-math-inline' }, tex);
}

function createMathmlNode(mathNode: MathMLElement, display: DisplayMode): Element {
  mathNode.classList.add('xlet-math-mathml');
  if (display === 'block') {
    mathNode.setAttribute('display', 'block');
    mathNode.classList.add('xlet-math-block');
  } else {
    mathNode.removeAttribute('display');
    mathNode.classList.add('xlet-math-inline');
  }

  return mathNode;
}

function createSvgNode(root: Element, display: DisplayMode): Element {
  // mathjax v4 may have multiple svgs inside a single container
  const els = root.matches('svg') ? [root] : [...root.children];
  const nodes = els.map((el) => el.cloneNode(true));

  return display === 'block'
    ? h('div', { class: 'xlet-math-svg xlet-math-block' }, ...nodes)
    : h('span', { class: 'xlet-math-svg xlet-math-inline' }, ...nodes);
}

function scrubMathJaxAttrs(el: Element): void {
  for (const name of [...el.getAttributeNames()]) {
    if (
      name.startsWith('data-mjx-') ||
      name === 'data-latex'
    ) {
      el.removeAttribute(name);
    }
  }

  for (const child of el.children) {
    scrubMathJaxAttrs(child);
  }
}

function handleMjxSkippableNode(el: Element): MathVendorToHtmlResult | null {
  // ignore auxillary components
  const id = el.getAttribute('id');
  if (
    id === 'MathJax_Font_Test' ||
    id === 'MathJax_Message' ||
    (
      el.matches('[style*="visibility: hidden" i]') &&
      el.querySelector(':scope > [id="MathJax_Hidden"]')
    ) ||
    (
      el.matches('[style*="position: absolute" i][style*="width: 0" i]') &&
      el.querySelector(':scope > [id="MathJax_Font_Test"]')
    ) ||
    el.matches('.MJX_LiveRegion') ||
    el.matches('.MathJax_Processing') ||
    el.matches('.MathJax_Error')
  ) return { skip: true };

  // v2.x let script be the orchestrator and skip everything else
  if (
    el.matches('.MathJax_Preview') ||
    el.matches('span[id^="MathJax-Element-"]') ||
    el.matches('div[id^="MathJax-Element-"]') ||
    el.matches('.MathJax_SVG_Display') ||
    el.matches('.MathJax_PHTML_Display') ||
    el.matches('.MathJax_PlainSource_Display') ||
    el.matches('.MathJax_Display') ||
    el.matches('.MJXc-display')
  ) return { skip: true };

  return null;
}

function handleHiddenMjxSvgTable(el: Element, view?: MathView): MathVendorToHtmlResult | null {
  // v2.x hidden mathjax svg (global glyph table)
  if (
    el.matches('[style*="visibility: hidden" i]') &&
    el.querySelector(':scope > [id="MathJax_SVG_Hidden"]')
  ) {
    const svg = el.querySelector(':scope > svg');
    if (!svg || view !== 'svg') return { skip: true };

    return {
      node: h(
        'div', { style: 'position:absolute;width:0;height:0;overflow:hidden;visibility:hidden;' },
        svg.cloneNode(true),
      ),
    };
  }

  return null;
}

export type MathRepr = {
  tex: string | null;
  mathml: MathMLElement | null;
  svg: Element | null;
  display: DisplayMode;
};

function getMjxV2Repr(el: Element, view: MathView): MathRepr | null {
  const id = el.getAttribute('id');

  if (el.matches('script[type^="math/tex" i], script[type^="math/mml" i]')) {
    const display: DisplayMode = el.matches('script[type*="mode=display" i]') ? 'block' : 'inline';

    const mathmlStr = getMathMl(el); // should always exist after normalize()
    const mathml = mathmlStr ? htmlToElementK(mathmlStr, 'math:math') : null;
    if (mathml) scrubMathJaxAttrs(mathml);
    if (mathml === null && view !== 'tex') {
      console.warn(`[xlet:math] MathJax v2 script without MathML annotation ${repr(el)}`);
    }

    const tex =
      getTex(el) ??
        (el.matches('script[type^="math/tex" i]')
          ? (el.textContent ?? '')
          : null);

    const svg = el.parentElement?.querySelector(`.MathJax_SVG[id^="${id}-"] svg`) ?? null;

    return { tex, mathml, svg, display };
  }

  return null;
}

function getMjxV34Repr(el: Element): MathRepr | null {
  // only care about v3/v4 MathJax containers
  if (!el.matches('mjx-container.MathJax')) return null;

  const display: DisplayMode = el.hasAttribute('display') ? 'block' : 'inline';
  const tex = getTex(el);

  // prefer normalized MathML over assistive
  const assistiveSel = ':scope > mjx-assistive-mml > math';
  const mathmlStr = getMathMl(el);
  const mathml = (mathmlStr ? htmlToElementK(mathmlStr, 'math:math') : null) ?? el.querySelector(assistiveSel);
  if (mathml) scrubMathJaxAttrs(mathml);
  if (!mathml) {
    console.warn(`[xlet:math] MathJax v3/v4 script without MathML annotation ${repr(el)}`);
  }

  const svg = el.matches('mjx-container[jax="SVG"]') ? el : null;
  if (svg) {
    for (const assist of svg.querySelectorAll('mjx-assistive-mml')) {
      assist.remove();
    }
  }

  return { tex, mathml, svg, display };
}

export function mathVendorToHtml(el: Element, ctx: ToHtmlContext): MathVendorToHtmlResult {
  const skippablesResult = handleMjxSkippableNode(el);
  if (skippablesResult) return skippablesResult;

  const svgTableResult = handleHiddenMjxSvgTable(el, ctx.mathView);
  if (svgTableResult) return svgTableResult;

  const repr = getMjxV2Repr(el, ctx.mathView) ?? getMjxV34Repr(el);
  if (!repr) return null;

  return mathReprToHtml(repr, ctx);
}

export function mathReprToHtml(content: MathRepr, ctx: ToHtmlContext): MathVendorToHtmlResult {
  const { tex, mathml, svg, display } = content;

  if (!tex && !mathml && !svg) return { skip: true };

  // if (view === 'mathml' && !mathml) console.log('[xlet] Requested MathML view but no MathML available', el);
  // if (view === 'tex' && !tex) console.log('[xlet] Requested TeX view but no TeX available', el);
  // if (view === 'svg' && !svg) console.log('[xlet] Requested SVG view but no SVG available', el);

  let node: Node | null = null;
  const view = ctx.mathView;
  switch (view) {
    case 'mathml': {
      if (mathml) node = createMathmlNode(mathml, display);
      if (!node && svg) node = createSvgNode(svg, display);
      if (!node && tex) node = createTexNode(tex, display);
      return node ? { node } : { skip: true };
    }
    case 'tex': {
      if (tex) node = createTexNode(tex, display);
      if (!node && mathml) node = createMathmlNode(mathml, display);
      if (!node && svg) node = createSvgNode(svg, display);
      return node ? { node } : { skip: true };
    }
    case 'svg': {
      if (svg) node = createSvgNode(svg, display);
      if (!node && mathml) node = createMathmlNode(mathml, display);
      if (!node && tex) node = createTexNode(tex, display);
      return node ? { node } : { skip: true };
    }
    default: throw new Error(`Unsupported mathView: ${String(view satisfies never)}`);
  }
}

export function mathVendorToMd(el: Element, ctx: ToMdContext): { skip?: boolean; md?: string; } | null {
  const skippablesResult = handleMjxSkippableNode(el);
  if (skippablesResult) return skippablesResult;

  const svgTableResult = handleHiddenMjxSvgTable(el);
  if (svgTableResult) return { skip: true };

  const repr = getMjxV2Repr(el, 'tex') ?? getMjxV34Repr(el);
  if (!repr) return null;

  return mathReprToMd(repr, ctx);
}

export function mathReprToMd(repr: MathRepr, ctx: ToMdContext): { skip?: boolean; md?: string; } {
  const { tex, mathml, svg, display } = repr;

  if (!tex && !mathml && !svg) return { skip: true };

  if (tex) return { md: frameMath(normalizeTex(tex), display, ctx) };
  if (mathml) return { md: mathml.outerHTML || '' };

  return { skip: true };
}

export function normalizeTex(tex: string): string {
  let out = tex.trim();

  // Strip outer {\displaystyle ...} wrapper
  const m = out.match(/^\{\s*\\displaystyle\b\s*(.*?)\s*\}$/s);
  out = m ? m[1].trim() : out;

  // Remove ws before _{...} / ^{...}
  out = out.replace(/[ \t]+(?=[_^]\{)/g, '');

  // Collapse "\command {"
  out = out.replace(/\\([a-zA-Z]+)[ \t]+\{/g, '\\$1{');

  // Fix wiki artifact: whitespace between "}" and punctuation
  out = out.replace(/\}[ \t]+([,.;:!?])/g, '}$1');

  return out;
}
