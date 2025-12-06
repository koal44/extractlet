import { hasOfType, isNonEmptyString, isNumber } from './typing';

export type AttrValue = string | number | boolean | null | undefined;
export type HAttrs = Record<string, AttrValue | Document> & { __doc?: Document; };

export function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs?: HAttrs, ...children: (string | Node | null)[]): HTMLElementTagNameMap[K];
export function h<K extends keyof SVGElementTagNameMap>(tag: `svg:${K}`, attrs?: HAttrs, ...children: (string | Node | null)[]): SVGElementTagNameMap[K];
export function h<K extends keyof MathMLElementTagNameMap>(tag: `math:${K}`, attrs?: HAttrs, ...children: (string | Node | null)[]): MathMLElementTagNameMap[K];
export function h(
  tag: string, // e.g. 'div', 'svg:circle', 'math:mi'
  attrs: HAttrs = {}, // e.g. { class: 'my-class', id: 'my-id', 'xlink:href': '#foo', __doc: document }
  ...children: (string | Node | null)[] // e.g. 'Hello', document.createElement('span'), null
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

export function htmlToElementK<K extends keyof MathMLElementTagNameMap>(html: string, tag: `math:${K}`, doc?: Document): MathMLElementTagNameMap[K] | null;
export function htmlToElementK<K extends keyof SVGElementTagNameMap>(html: string, tag: `svg:${K}`, doc?: Document): SVGElementTagNameMap[K] | null;
export function htmlToElementK<K extends keyof HTMLElementTagNameMap>(html: string, tag: K, doc?: Document): HTMLElementTagNameMap[K] | null;
export function htmlToElementK(
  html: string, tag: string, doc: Document = document
): Element | null {
  const template = doc.createElement('template');
  template.innerHTML = html.trim();
  if (template.content.children.length !== 1) {
    // throw new Error(`html must contain exactly one element: ${html}`);
    // return warn(null, `[xlet] html must contain exactly one element: ${html.slice(0, 1000)}`);
    return null;
  }
  const el = template.content.firstElementChild;

  const expectedTag =
    tag.startsWith('math:') ? tag.slice(5) :
    tag.startsWith('svg:') ? tag.slice(4) :
    tag;

  if (el?.tagName.toLowerCase() !== expectedTag.toLowerCase()) {
    // throw new Error(`No element found for tag ${tag} in HTML: ${html}`);
    // warn(null, `[xlet] No element found for tag ${tag} in HTML: ${html.slice(0, 1000)}`);
    return null;
  }
  return el;
}

export function htmlToElement(str?: string, doc: Document = document): Element | null {
  if (!str || !str.trim()) return null;
  const template = doc.createElement('template');
  template.innerHTML = str.trim();
  if (template.content.children.length !== 1) {
    // throw new Error(`html must contain exactly one element: ${html}`);
    // return warn(null, `[xlet] html must contain exactly one element: ${str.slice(0, 1000)}`);
    return null;
  }
  return template.content.firstElementChild;
}

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
