import { hasOfType, isNonEmptyString, isNumber, isString } from './typing';
import DOMPurify from 'dompurify';

export type AttrValue = string | number | boolean | null | undefined;
export type HAttrs = Record<string, AttrValue | Document> & { __doc?: Document; };
export type HChild = string | Node | null | undefined;

export function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs?: HAttrs, ...children: HChild[]): HTMLElementTagNameMap[K];
export function h<K extends keyof SVGElementTagNameMap>(tag: `svg:${K}`, attrs?: HAttrs, ...children: HChild[]): SVGElementTagNameMap[K];
export function h<K extends keyof MathMLElementTagNameMap>(tag: `math:${K}`, attrs?: HAttrs, ...children: HChild[]): MathMLElementTagNameMap[K];
export function h(
  tag: string, // e.g. 'div', 'svg:circle', 'math:mi'
  attrs: HAttrs = {}, // e.g. { class: 'my-class', id: 'my-id', 'xlink:href': '#foo', __doc: document }
  ...children: HChild[] // e.g. 'Hello', document.createElement('span'), null
): HTMLElement | SVGElement | MathMLElement {

  const doc = attrs.__doc ?? document;

  const node: HTMLElement | SVGElement | MathMLElement =
    tag.startsWith('math:') ? doc.createElementNS('http://www.w3.org/1998/Math/MathML', tag.slice(5)) :
    tag.startsWith('svg:') ? doc.createElementNS('http://www.w3.org/2000/svg', tag.slice(4)) :
    doc.createElement(tag);

  for (const [key, value] of Object.entries(attrs)) {
    if (key === '__doc') continue;
    // assert value is AttrValue
    if (isDoc(value)) {
      console.warn(`[xlet] h(): ignoring document value for attr "${key}" on <${tag}>`);
      continue;
    }

    if (key === 'xlink:href') {
      node.setAttributeNS('http://www.w3.org/1999/xlink', 'href', String(value));
    } else if (value === true) {
      node.toggleAttribute(key, true);
    } else if (value === false || value === null || value === undefined) {
      node.toggleAttribute(key, false);
    } else {
      node.setAttribute(key, String(value));
    }
  }

  children.forEach((child) => {
    if (typeof child === 'string') {
      node.appendChild(doc.createTextNode(child));
    } else if (isNode(child)) {
      node.appendChild(child.ownerDocument === doc ? child : doc.importNode(child, true));
    }
    // else ignore null/undefined/non-node children
  });
  return node;
}

// Detached parse for inspection only; not for direct document insertion.
export function htmlToElementK<K extends keyof MathMLElementTagNameMap>(html: string, tag: `math:${K}`, doc?: Document): MathMLElementTagNameMap[K] | null;
export function htmlToElementK<K extends keyof SVGElementTagNameMap>(html: string, tag: `svg:${K}`, doc?: Document): SVGElementTagNameMap[K] | null;
export function htmlToElementK<K extends keyof HTMLElementTagNameMap>(html: string, tag: K, doc?: Document): HTMLElementTagNameMap[K] | null;
export function htmlToElementK(html: string, tag: string): Element | null {
  const baseTag =
    tag.startsWith('math:') ? tag.slice(5) :
    tag.startsWith('svg:') ? tag.slice(4) :
    tag;

  const doc = new DOMParser().parseFromString(html, 'text/html');
  if (doc.body.childElementCount !== 1) {
    console.warn(`[xlet] htmlToElementK(): result must contain exactly one element, got ${doc.body.childElementCount}: ${html.slice(0, 1000)}`);
    return null;
  }

  const el = doc.body.firstElementChild;
  if (!el) return null;

  if (el.tagName.toLowerCase() !== baseTag.toLowerCase()) {
    console.warn(`[xlet] htmlToElementK(): expected root <${baseTag}>, got <${el.tagName.toLowerCase()}>: ${html.slice(0, 1000)}`);
    return null;
  }
  return el;
}

export function htmlToElement(str?: string, targetDoc: Document = document): Element | null {
  if (!str || !str.trim()) return null;
  if (!targetDoc.defaultView) {
    console.warn(null, `[xlet] htmlToElement(): provided document has no defaultView`);
    return null;
  }

  const purify = DOMPurify(targetDoc.defaultView);

  // <use> is white-listed so guard against XSS via its href attributes with a custom hook
  purify.addHook('afterSanitizeAttributes', (node) => {
    if (!(node instanceof Element) || node.tagName.toLowerCase() !== 'use') return;
    const isSafeUseRef = (v: string | null) => /^#[A-Za-z0-9_-]+$/.test((v ?? '').trim());
    if (!isSafeUseRef(node.getAttribute('href'))) node.removeAttribute('href');
    if (!isSafeUseRef(node.getAttribute('xlink:href'))) node.removeAttribute('xlink:href');
  });

  const allowed = new Map<string, Set<string>>([
    ['mjx-container', new Set(['jax'])],
  ]);

  const cleanHtml = purify.sanitize(
    str.trim(),
    {
      RETURN_DOM: true,
      CUSTOM_ELEMENT_HANDLING: {
        tagNameCheck: (tagName) => /^[a-z-]+$/.test(tagName), // (e.g. <mjx-container>)
        attributeNameCheck: (attrName, tagName) =>
          !!tagName && !!allowed.get(tagName)?.has(attrName),
      },
      ADD_TAGS: ['use'], // , '#comment'
      ADD_ATTR: ['xmlns:math', 'xmlns:svg'],
    }
  );

  warnPurifyRemoved(purify, str);

  if (!isHTML(cleanHtml) || cleanHtml.childElementCount !== 1) {
    console.warn(`[xlet] htmlToElement(): HTML must contain exactly one element: ${str.slice(0, 1000)}`);
    return null;
  }

  return cleanHtml.firstElementChild;
}

function warnPurifyRemoved(purify: DOMPurify.DOMPurify, html: string): void {
  const removed = purify.removed.filter((item) => {
    if ('element' in item && isComment(item.element)) return false;

    if ('attribute' in item) {
      const name = item.attribute?.name ?? '';
      const ignoreAttrs = new Set([
        'columnspacing', 'columnalign', 'focusable', 'ctxtmenu_counter',
      ]);
      if (ignoreAttrs.has(name)) return false;
    }

    return true;
  });

  if (!removed.length) return;

  const counts = new Map<string, number>();

  const nodeLabel = (node: Node | null | undefined): string => {
    if (!node) return '(null)';
    if (node.nodeType === Node.ELEMENT_NODE) return `<${(node as Element).tagName.toLowerCase()}>`;
    if (node.nodeType === Node.TEXT_NODE) return '#text';
    if (node.nodeType === Node.COMMENT_NODE) return '#comment';
    return `#node(${node.nodeType})`;
  };

  for (const item of removed) {
    const key = 'attribute' in item
      ? `attr ${item.attribute?.name ?? '(null-attr)'} from ${nodeLabel(item.from)}`
      : `element ${nodeLabel(item.element)}`;

    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const summary = [...counts.entries()]
    .map(([k, n]) => (n === 1 ? k : `${k} ×${n}`))
    .join('; ');

  console.warn(
    `[xlet] htmlToElement(): removed disallowed content from HTML:\n${summary}\nOriginal HTML: ${html.slice(0, 1000)}`
  );
}
void warnPurifyRemoved; // shush linters

export function injectCss(
  css: string,
  { id = undefined, doc = document }: { id?: string; doc?: Document; } = {}
): void {
  if (id && doc.getElementById(id)) return;

  const style: HTMLStyleElement = doc.createElement('style');
  style.textContent = css;
  if (id) style.id = id;
  doc.head.appendChild(style);
}

/*
  Avoid if possible and use elem.style.setProperty(key, value) directly.

  This helper exists mainly for environments where some elements
  (e.g. MathML elements in jsdom) claim to implement ElementCSSInlineStyle
  type-wise but do not actually provide a working CSSStyleDeclaration at runtime.

  See: https://github.com/jsdom/jsdom/issues/3515
*/
export function addStyle(elem: HTMLElement | SVGElement | MathMLElement, key: string, value: string) {
  const style = elem.style as CSSStyleDeclaration | undefined; // don't let jsdom fool us!
  if (style && typeof style.setProperty === 'function') {
    style.setProperty(key, value);
    return;
  }

  // Fallback for elements that don't implement CSSStyleDeclaration properly
  // piggybacking is easier than parsing!
  const proxy = h('div', { style: elem.getAttribute('style') ?? '' });
  proxy.style.setProperty(key, value);
  elem.setAttribute('style', proxy.getAttribute('style') ?? '');
}

export function lastUrlSegment(url: string): string {
  const clean = url.split(/[?#]/)[0].replace(/\/+$/, '');
  return decodeURIComponent(clean.split('/').pop() || '');
}

export type HLevel = 1 | 2 | 3 | 4 | 5 | 6;
export function parseHeadingLevel(el: HTMLHeadingElement): HLevel {
  const n = parseInt(el.tagName.slice(1), 10);
  if (n < 1 || n > 6 || !Number.isInteger(n)) {
    console.warn(`[xlet:wiki-node] invalid heading level: ${el.tagName}`);
    return Math.min(6, Math.max(1, Math.trunc(n))) as HLevel;
  }
  return n as HLevel;
}

export function safeDecode(u?: string | null): string {
  if (!u) return '';
  try { return decodeURIComponent(u); }
  catch { return u; }
};

export function nodeName(node: Node | null): string {
  if (!node) return '#null';
  if (isText(node)) return '#text';
  if (isElement(node)) return node.id ? `#${node.tagName.toLowerCase()}#${node.id}` : node.tagName.toLowerCase();
  return `#${node.nodeName}`;
}

export function copyHrefAttr(dest: Element, src: Element) {
  const val = getNormalizedUrl(src, 'href');
  if (val) dest.setAttribute('href', val);
}

export function copySrcAttr(dest: Element, src: Element) {
  const val = getNormalizedUrl(src, 'src');
  if (val) dest.setAttribute('src', val);
}

export function getNormalizedUrl(node: Element, attr: 'href' | 'src'): string {
  const url = node.getAttribute(attr)?.trim();
  if (!url) return '';
  if (url.startsWith('#')) return url;
  if (url.toLowerCase().startsWith('javascript:')) return '#';
  if (url.startsWith('//')) return `https:${url}`; // assume protocol-relative URLs are HTTPS

  // --- resolve relative urls ---
  // prefer browser-resolved property
  if (hasOfType(node, attr, isString)) {
    return node[attr].trim();
  }
  // otherwise resolve using doc's base uri
  try {
    return new URL(url, node.ownerDocument.baseURI).href;
  } catch {
    return url;
  }
}

export function copyStyleAttr(dest: HTMLElement, src: HTMLElement, allowStyles: boolean | ReadonlySet<string>) {
  if (!src.hasAttribute('style')) return; // check only one of these?
  if (allowStyles === false) return;
  if (allowStyles === true) {
    dest.setAttribute('style', src.getAttribute('style')!);
    return;
  }

  const keep = new Set([
    ...allowStyles,
    'display', 'clear',
    ...(isImage(src) ? ['width', 'height'] : []),
  ]);

  let styleString = '';
  for (const k of keep) {
    const v = src.style.getPropertyValue(k);
    if (v) styleString += `${k}: ${v}; `;
  }
  styleString = styleString.trim();

  if (styleString) dest.setAttribute('style', styleString);
}

export function scrubSvgElement(e: Element): void {
  if (e.matches('script,foreignObject')) return void e.remove();

  for (const { name: n, value: v } of [...e.attributes]) {
    if (
      /^(on|aria-)/i.test(n) ||
      /^(style|class|id|role|version)$/i.test(n) ||
      (/^(xlink:)?href$/i.test(n) && !/^\s*#/.test(v))
    ) e.removeAttribute(n);
  }

  for (let i = e.children.length; i--;) scrubSvgElement(e.children[i]);
}

export function findCommonAncestor(root: ParentNode, selectors: string[]): Element | null {
  if (selectors.length === 0) return null;
  const descendants = [...root.querySelectorAll(selectors.join(', '))];

  if (descendants.length === 0) return null;
  if (descendants.length === 1) return descendants[0];

  const [first, ...rest] = descendants;
  for (let candidate = first.parentElement; candidate; candidate = candidate.parentElement) {
    if (rest.every((el) => candidate.contains(el))) {
      return candidate;
    }
  }

  return null;
}

export function findByText(root: ParentNode, text: string, selectors: string[]): Element[] {
  const matches: Element[] = [];
  for (const el of root.querySelectorAll(selectors.join(', '))) {
    if (el.textContent?.trim() === text) matches.push(el);
  }
  return matches;
}

export function isNode(x: unknown): x is Node {
  return !!x && typeof x === 'object'
    && hasOfType(x, 'nodeType', isNumber) && hasOfType(x, 'nodeName', isNonEmptyString);
}
export function isElement(x: unknown): x is Element {
  return isNode(x) && x.nodeType === Node.ELEMENT_NODE;
}
export function isText(x: unknown): x is Text {
  return isNode(x) && x.nodeType === Node.TEXT_NODE;
}
export function isComment(x: unknown): x is Comment {
  return isNode(x) && x.nodeType === Node.COMMENT_NODE;
}
export function isDoc(x: unknown): x is Document {
  return isNode(x) && x.nodeType === Node.DOCUMENT_NODE;
}
export function isDocFrag(x: unknown): x is DocumentFragment {
  return isNode(x) && x.nodeType === Node.DOCUMENT_FRAGMENT_NODE;
}
export function isNodeList(x: unknown): x is NodeList {
  return !!x && typeof x === 'object'
    && Object.prototype.toString.call(x) === '[object NodeList]';
}
export function isHtmlCollection(x: unknown): x is HTMLCollection {
  return !!x && typeof x === 'object'
    && Object.prototype.toString.call(x) === '[object HTMLCollection]';
}
export function isHTML(x: unknown): x is HTMLElement {
  return isElement(x) && x.namespaceURI === 'http://www.w3.org/1999/xhtml';
}
export function isSVG(x: unknown): x is SVGElement {
  return isElement(x) && x.namespaceURI === 'http://www.w3.org/2000/svg';
}
export function isMathML(x: unknown): x is MathMLElement {
  return isElement(x) && x.namespaceURI === 'http://www.w3.org/1998/Math/MathML';
}
export function isDiv(x: unknown): x is HTMLDivElement {
  return isElement(x) && x.tagName.toUpperCase() === 'DIV';
}
export function isStyle(x: unknown): x is HTMLStyleElement {
  return isElement(x) && x.tagName.toUpperCase() === 'STYLE';
}
export function isScript(x: unknown): x is HTMLScriptElement {
  return isElement(x) && x.tagName.toUpperCase() === 'SCRIPT';
}
export function isSpan(x: unknown): x is HTMLSpanElement {
  return isElement(x) && x.tagName.toUpperCase() === 'SPAN';
}
export function isOList(x: unknown): x is HTMLOListElement {
  return isElement(x) && x.tagName.toUpperCase() === 'OL';
}
export function isUList(x: unknown): x is HTMLUListElement {
  return isElement(x) && x.tagName.toUpperCase() === 'UL';
}
export function isListItem(x: unknown): x is HTMLLIElement {
  return isElement(x) && x.tagName.toUpperCase() === 'LI';
}
export function isHeading(x: unknown): x is HTMLHeadingElement {
  return isElement(x) && /^H[1-6]$/.test(x.tagName.toUpperCase());
}
export function isParagraph(x: unknown): x is HTMLParagraphElement {
  return isElement(x) && x.tagName.toUpperCase() === 'P';
}
export function isAnchor(x: unknown): x is HTMLAnchorElement {
  return isElement(x) && x.tagName.toUpperCase() === 'A';
}
export function isImage(x: unknown): x is HTMLImageElement {
  return isElement(x) && x.tagName.toUpperCase() === 'IMG';
}
export function isBreak(x: unknown): x is HTMLBRElement {
  return isElement(x) && x.tagName.toUpperCase() === 'BR';
}
export function isFigure(x: unknown): x is HTMLElement {
  return isElement(x) && x.tagName.toUpperCase() === 'FIGURE';
}
export function isInput(x: unknown): x is HTMLInputElement {
  return isElement(x) && x.tagName.toUpperCase() === 'INPUT';
}
export function isButton(x: unknown): x is HTMLButtonElement {
  return isElement(x) && x.tagName.toUpperCase() === 'BUTTON';
}
export function isSelect(x: unknown): x is HTMLSelectElement {
  return isElement(x) && x.tagName.toUpperCase() === 'SELECT';
}
export function isTextArea(x: unknown): x is HTMLTextAreaElement {
  return isElement(x) && x.tagName.toUpperCase() === 'TEXTAREA';
}
export function isTable(x: unknown): x is HTMLTableElement {
  return isElement(x) && x.tagName.toUpperCase() === 'TABLE';
}
export function isTableRow(x: unknown): x is HTMLTableRowElement {
  return isElement(x) && x.tagName.toUpperCase() === 'TR';
}
export function isTableCell(x: unknown): x is HTMLTableCellElement {
  return isElement(x) && (x.tagName.toUpperCase() === 'TD');
}
export function isTableHeader(x: unknown): x is HTMLTableCellElement {
  return isElement(x) && x.tagName.toUpperCase() === 'TH';
}
export function isTableBody(x: unknown): x is HTMLTableSectionElement {
  return isElement(x) && x.tagName.toUpperCase() === 'TBODY';
}
export function isTableHead(x: unknown): x is HTMLTableSectionElement {
  return isElement(x) && x.tagName.toUpperCase() === 'THEAD';
}
export function isTableFoot(x: unknown): x is HTMLTableSectionElement {
  return isElement(x) && x.tagName.toUpperCase() === 'TFOOT';
}
export function isFieldset(x: unknown): x is HTMLFieldSetElement {
  return isElement(x) && x.tagName.toUpperCase() === 'FIELDSET';
}
export function isLegend(x: unknown): x is HTMLLegendElement {
  return isElement(x) && x.tagName.toUpperCase() === 'LEGEND';
}
export function isLabel(x: unknown): x is HTMLLabelElement {
  return isElement(x) && x.tagName.toUpperCase() === 'LABEL';
}
export function isNav(x: unknown): x is HTMLElement {
  return isElement(x) && x.tagName.toUpperCase() === 'NAV';
}
export function isHeader(x: unknown): x is HTMLElement {
  return isElement(x) && x.tagName.toUpperCase() === 'HEADER';
}
export function isFooter(x: unknown): x is HTMLElement {
  return isElement(x) && x.tagName.toUpperCase() === 'FOOTER';
}
export function isSection(x: unknown): x is HTMLElement {
  return isElement(x) && x.tagName.toUpperCase() === 'SECTION';
}
export function isArticle(x: unknown): x is HTMLElement {
  return isElement(x) && x.tagName.toUpperCase() === 'ARTICLE';
}
export function isAside(x: unknown): x is HTMLElement {
  return isElement(x) && x.tagName.toUpperCase() === 'ASIDE';
}
export function isMain(x: unknown): x is HTMLElement {
  return isElement(x) && x.tagName.toUpperCase() === 'MAIN';
}
export function isDetails(x: unknown): x is HTMLDetailsElement {
  return isElement(x) && x.tagName.toUpperCase() === 'DETAILS';
}
export function isDialog(x: unknown): x is HTMLDialogElement {
  return isElement(x) && x.tagName.toUpperCase() === 'DIALOG';
}
export function isCanvas(x: unknown): x is HTMLCanvasElement {
  return isElement(x) && x.tagName.toUpperCase() === 'CANVAS';
}
export function isVideo(x: unknown): x is HTMLVideoElement {
  return isElement(x) && x.tagName.toUpperCase() === 'VIDEO';
}
export function isAudio(x: unknown): x is HTMLAudioElement {
  return isElement(x) && x.tagName.toUpperCase() === 'AUDIO';
}
export function isIFrame(x: unknown): x is HTMLIFrameElement {
  return isElement(x) && x.tagName.toUpperCase() === 'IFRAME';
}
export function isEmbed(x: unknown): x is HTMLEmbedElement {
  return isElement(x) && x.tagName.toUpperCase() === 'EMBED';
}
export function isObject(x: unknown): x is HTMLObjectElement {
  return isElement(x) && x.tagName.toUpperCase() === 'OBJECT';
}
export function isHtmlMap(x: unknown): x is HTMLMapElement {
  return isElement(x) && x.tagName.toUpperCase() === 'MAP';
}
export function isArea(x: unknown): x is HTMLAreaElement {
  return isElement(x) && x.tagName.toUpperCase() === 'AREA';
}
export function isForm(x: unknown): x is HTMLFormElement {
  return isElement(x) && x.tagName.toUpperCase() === 'FORM';
}
export function isFieldSet(x: unknown): x is HTMLFieldSetElement {
  return isElement(x) && x.tagName.toUpperCase() === 'FIELDSET';
}
export function isList(x: unknown): x is HTMLUListElement | HTMLOListElement {
  return !!x && isUList(x) || isOList(x);
}
export function isPre(x: unknown): x is HTMLPreElement {
  return isElement(x) && x.tagName.toUpperCase() === 'PRE';
}
export function isCode(x: unknown): x is HTMLElement {
  return isElement(x) && x.tagName.toUpperCase() === 'CODE';
}
export function isBlockquote(x: unknown): x is HTMLQuoteElement {
  return isElement(x) && x.tagName.toUpperCase() === 'BLOCKQUOTE';
}
export function isCustom(x: unknown): x is HTMLElement {
  return isElement(x) && x.tagName.includes('-');
}
export function isSup(x: unknown): x is HTMLElement {
  return isElement(x) && x.tagName.toUpperCase() === 'SUP';
}
export function isSub(x: unknown): x is HTMLElement {
  return isElement(x) && x.tagName.toUpperCase() === 'SUB';
}
export function isAttr(x: unknown): x is Attr {
  return !!x && typeof Attr !== 'undefined' && x instanceof Attr;
}

const INLINE_TAGS = new Set([
  'a', 'abbr', 'b', 'bdi', 'bdo', 'button', 'cite', 'code', 'data', 'dfn',
  'em', 'i', 'kbd', 'label', 'mark', 'q', 'ruby', 's', 'samp', 'small',
  'span', 'strong', 'sub', 'sup', 'time', 'u', 'var', 'wbr',
]);
export function isInlineElement(x: Element): boolean {
  return INLINE_TAGS.has(x.tagName.toLowerCase());
}
