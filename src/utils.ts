import {
  hasOfType, isArray, isBigInt, isBoolean, isDate, isError, isErrorEvent, isEvent,
  isFunction, isMap, isNonEmptyString, isNumber, isObjectRecord, isPromise, isRegExp,
  isSet, isString, isSymbol, isURL,
} from './typing';

type LogOptions = {
  isDebug?: boolean;
  indent?: number;
  escapeWhitespace?: boolean;
  jsonifyStrings?: boolean;
  verboseNodes?: boolean;
}

export const lOpts: LogOptions =
  { isDebug: true, indent: 2, escapeWhitespace: true, jsonifyStrings: true, verboseNodes: true };

export function log(...args: unknown[]): void {
  const LogOptsKeys = ['isDebug', 'indent', 'escapeWhitespace', 'jsonifyStrings', 'verboseNodes'];
  const lastArg = args[args.length - 1];
  let opts: LogOptions = {};
  if (
    lastArg
    && typeof lastArg === 'object'
    && !Array.isArray(lastArg)
    && Object.keys(lastArg).length > 0
    && Object.keys(lastArg).every((key) => LogOptsKeys.includes(key))
  ) {
    opts = args.pop() as LogOptions;
  }

  const isDebug = (opts.isDebug === true) || (typeof process !== 'undefined' && process.env.DEBUG === 'true');
  const indent = opts.indent ?? 2;
  const escapeWhiteSpace = opts.escapeWhitespace ?? false;
  const jsonifyStrings = opts.jsonifyStrings ?? true;
  const verboseNodes = opts.verboseNodes ?? false;

  if (!isDebug) {
    return;
  }

  for (const arg of args) {
    let out;

    if (typeof arg === 'string') {
      out = jsonifyStrings ? JSON.stringify(arg).slice(1, -1) : arg;
    //} else if (arg && typeof arg === 'object' && typeof arg.nodeType === 'number') {
    } else if (isNode(arg)) {
      out = nodeSummary(arg);
    } else {
      try {
        out = JSON.stringify(arg, null, indent);
      } catch (err) {
        out = `[Unserializable object: ${err instanceof Error ? err.message : String(err)}]`;
      }
    }

    if (escapeWhiteSpace && typeof out === 'string') {
      out = out.replace(/\n/g, '\\n').replace(/\t/g, '\\t');
    }

    console.log(out); // eslint-disable-line no-restricted-properties
  }

  function nodeSummary(node: Node): string {
    if (verboseNodes && isElement(node)) {
      return node.outerHTML;
    }
    switch (node.nodeType) {
      case Node.ELEMENT_NODE: {
        let { tagName: tag, id, className: cls } = node as Element;
        tag = tag.toLowerCase();
        id = id ? `#${id}` : '';
        cls = cls ? `.${cls.trim().replace(/\s+/g, '.')}` : '';
        return `<${tag}${id}${cls}>`;
      }
      case Node.TEXT_NODE:
        return `#text "${node.textContent?.slice(0, 40) ?? ''}"`;
      case Node.COMMENT_NODE:
        return `<!-- ${node.textContent?.slice(0, 40) ?? ''} -->`;
      default:
        return `[${node.nodeName} type=${node.nodeType}]`;
    }
  }
}

// summarize unknown values for logging
export function repr(obj: unknown, max = 80): string {
  let out: string;
  try {
    if (obj === undefined) { out = 'undefined'; }
    else if (obj === null) { out = 'null'; }
    else if (isError(obj)) { out = `Error: ${obj.message}`; }
    else if (isErrorEvent(obj)) { out = `ErrorEvent: ${obj.message}`; }
    else if (isDate(obj)) { out = obj.toISOString(); }
    else if (isBigInt(obj)) { out = `${obj}n`; }
    else if (isSymbol(obj)) { out = String(obj); }
    else if (isFunction(obj)) { out = `function ${obj.name || '<anonymous>'}()`; }
    else if (isString(obj)) { out = obj; }
    else if (isNumber(obj)) { out = String(obj); }
    else if (isBoolean(obj)) { out = String(obj); }
    else if (isArray(obj)) { out = `Array(len=${obj.length})`; }
    else if (isMap(obj)) { out = `Map(size=${obj.size})`; }
    else if (isSet(obj)) { out = `Set(size=${obj.size})`; }
    else if (isPromise(obj)) { out = 'Promise'; }
    else if (isURL(obj)) { out = `URL(${obj.href})`; }
    else if (isRegExp(obj)) { out = obj.toString(); }
    else if (isEvent(obj)) { out = `Event(type=${obj.type})`; }
    else if (isDoc(obj)) { out = `Document(title="${obj.title}")`; }
    else if (isNodeList(obj)) { out = `NodeList(len=${obj.length})`; }
    else if (isElement(obj)) {
      const tag = obj.tagName.toLowerCase();
      const id = obj.id ? `#${obj.id}` : '';
      out = `<${tag}${id}>`;
    }
    else if (isNode(obj)) {
      out = obj.nodeType === Node.COMMENT_NODE
        ? 'CommentNode'
        : `[${obj.nodeName} type=${obj.nodeType}]`;
    }
    else if (isObjectRecord(obj)) {
      const ctor = obj.constructor.name;
      const name = ctor && ctor !== 'Object' ? ctor : 'Object';
      const content = `${name}(${Object.keys(obj).join(',')}`;
      out = `${content.length + 1 > max ? `${content.slice(0, max - 2)  }…` : content})`;
    }
    else { out = typeof obj; }
  } catch {
    return '<uninspectable>';
  }

  return out.length > max ? `${out.slice(0, max - 1)}…` : out;
}

type AttrValue = string | number | boolean | null | undefined;
type HAttrs = Record<string, AttrValue | Document> & { __doc?: Document; };

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

export function escapeRegExp(pattern: string): string {
  return pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function escapeHtml(html: string): string {
  return html.replace(/[&<>]/g, (ch) => ( // /[&<>"']/
    {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      // '"': '&quot;',
      // "'": '&#39;',
    }[ch] ?? (() => { throw new Error(`Unexpected character in escapeHtml: ${ch}`); })()
  ));
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

export function toKebabCase(str: string, opts: { splitNumbers?: boolean; } = {}): string {
  const { splitNumbers = true } = opts;
  const re = splitNumbers
    ? /([A-Z]?[a-z]+|[A-Z]+(?![a-z])|\d+)/g
    : /([A-Z]?[a-z0-9]+|[A-Z0-9]+(?![a-z]))/g;

  return str
    .match(re)
    ?.map((w) => w.toLowerCase())
    .join('-') ?? '';
}

export function toKebabCaseI18n(str: string): string {
  return str
    .normalize('NFC')
    // Insert a separator when switching between CJK and Latin
    .replace(/([\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}])(?=[A-Za-z])/gu, '$1 ')
    .replace(/([A-Za-z])(?=[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}])/gu, '$1 ')
    .match(/([\p{Lu}]?[\p{Ll}]+|[\p{Lu}]+(?![\p{Ll}])|[\p{L}]+|\p{N}+)/gu)
    ?.map((w) => w.toLocaleLowerCase())
    .join('-') ?? '';
}

export function toPascalCase(str: string, keepAcronyms = false): string {
  const re = keepAcronyms
    ? /([A-Z][a-z]+|[A-Z](?![a-z])|[a-z]+|\d+)/g
    : /([A-Z][a-z]+|[A-Z]+(?![a-z])|[a-z]+|\d+)/g;

  return str.match(re)?.map((w) => w[0].toLocaleUpperCase() + w.slice(1).toLocaleLowerCase()) .join('')
    ?? '';
}

export function toPascalCaseI18n(str: string, keepAcronyms = false) {
  const re = keepAcronyms
    ? /([\p{Lu}][\p{Ll}]+|[\p{Lu}](?![\p{Ll}])|[\p{Ll}]+|[\p{L}]+|\p{N}+)/gu
    : /([\p{Lu}][\p{Ll}]+|[\p{Lu}]+(?![\p{Ll}])|[\p{Ll}]+|[\p{L}]+|\p{N}+)/gu;

  return str
    .normalize('NFC')
    // Insert a separator when switching between CJK and Latin
    .replace(/([\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}])(?=[A-Za-z])/gu, '$1 ')
    .replace(/([A-Za-z])(?=[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}])/gu, '$1 ')
    .match(re)?.map((w) => w[0].toLocaleUpperCase() + w.slice(1).toLocaleLowerCase())
    .join('') ?? '';
}

export function warn<T>(val: T, ...args: Parameters<typeof console.warn>): T {
  console.warn(...args);
  return val;
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

export type MultiToggleDiv = HTMLDivElement & {
  init: () => void;
  setState: (newState: number, opts?: { silent?: boolean; }) => void;
  getLabels: () => readonly string[];
  getState: () => number;
}

export function isMultToggleDiv(x: unknown): x is MultiToggleDiv {
  return (
    isDiv(x) &&
    hasOfType(x, 'init', isFunction) &&
    hasOfType(x, 'setState', isFunction) &&
    hasOfType(x, 'getLabels', isFunction) &&
    hasOfType(x, 'getState', isFunction)
  );
}

export function createMultiToggle(
  {
    initState = 0,
    onToggle,
    labels = ['a', 'b'],
    labelSide = 'right',
  }: {
    initState?: number;
    onToggle?: (newState: number) => void;
    labels?: readonly string[];
    labelSide?: 'left' | 'right';
  } = {}
) {
  if (labels.length === 0) {
    throw new Error('multi-toggle requires at least one label');
  }
  const checkbox = h('input', { type: 'checkbox', class: 'multi-toggle-checkbox', 'aria-label': 'Toggle view mode' });
  const slider = h('span', { class: 'multi-toggle-slider' });
  const switchBody = h('label', { class: 'multi-toggle-switchbody' }, checkbox, slider);
  const stateLabel = h('span', { class: `multi-toggle-label-${labelSide}` }, labels[initState]);
  const wrapper = labelSide === 'left'
    ? h('div', { class: 'multi-toggle' }, stateLabel, switchBody) as MultiToggleDiv
    : h('div', { class: 'multi-toggle' }, switchBody, stateLabel) as MultiToggleDiv;

  const setState = (newState: number, opts: { silent?: boolean; } = {}): void => {
    if (newState < 0 || newState >= labels.length) {
      return warn(undefined, `[xlet:toggle] Invalid multi-toggle state: ${newState}`);
    }
    if (newState === state) return; // nothing to do
    state = newState;
    const knobProgress = labels.length === 1 ? 0 : newState / (labels.length - 1);
    wrapper.style.setProperty('--knob-progress', `${knobProgress}`);
    stateLabel.textContent = labels[newState];
    if (!opts.silent) onToggle?.(newState);
  };

  let state = -1;
  wrapper.init = () => { setState(initState, { silent: false }); };
  wrapper.setState = setState;
  wrapper.getLabels = () => labels;
  wrapper.getState = () => state;

  checkbox.addEventListener('change', () => {
    setState((state + 1) % labels.length);
  });

  // swallow specSynthetic activation clicks
  checkbox.addEventListener('click', (ev: MouseEvent | PointerEvent) => {
    if (ev.target === checkbox && ev.detail === 0) ev.stopPropagation();
  });

  // wrapper.init(); // auto initialize state

  return wrapper;
}

export const multiToggleCss = /* css */ `
.multi-toggle {
  --track-width: 50px;
  --track-height: 22px;
  --knob-size: 16px;
  --knob-offset: calc((var(--track-height) - var(--knob-size)) / 2);
  --knob-range: calc(var(--track-width) - var(--knob-size) - var(--knob-offset) * 2);
  --knob-progress: 0;
}
.multi-toggle-switchbody {
  position: relative;
  display: inline-block;
  vertical-align: middle;
  width: var(--track-width);
  height: var(--track-height);
}
.multi-toggle-checkbox {
  opacity: 0;
  width: 0;
  height: 0;
}
.multi-toggle-slider {
  position: absolute;
  cursor: pointer;
  background-color: #a3a9b3;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  transition: 0.2s;
  border-radius: var(--track-height);
}
.multi-toggle-slider:before {
  position: absolute;
  content: "";
  height: var(--knob-size);
  width: var(--knob-size);
  left: var(--knob-offset);
  bottom: var(--knob-offset);
  background-color: white;
  transition: 0.2s;
  border-radius: 50%;
}
.multi-toggle-slider::before {
  transform: translateX(calc(var(--knob-range) * var(--knob-progress)));
}
.multi-toggle-label-left,
.multi-toggle-label-right {
  display: inline-block;
  font-size: 0.9em;
  vertical-align: middle;
}
.multi-toggle-label-left {
  margin-right: 0.7em;
}
.multi-toggle-label-right {
  margin-left: 0.7em;
}
`;

export const copyButtonCss = /* css */ `
.copybutton-wrapper {
  font-size: var(--copybutton-size, 1em); /* scalable */
  --copybutton-color: #4ca5f2;
  --copybutton-bg: #f2f4f7;
  display: inline-flex;
}
#copybutton-hidden-ta {
  position: fixed;
  top: 0;
  left: 0;
  opacity: 0;
  pointer-events: none;
}
.copybutton-response {
  display: none;
  color: var(--copybutton-color);
  background-color: var(--copybutton-bg);
  border: 0.05em solid currentColor;
  border-radius: 0.3em;
  padding: 0.2em 0.4em;
  font-size: 0.75em;
  align-content: center;
  margin-left: 0.25em;
}
.copybutton {
  font-size: inherit;
  cursor: pointer;
  margin: 0;
  padding: 0.3em 0.4em;
  background-color: var(--copybutton-bg);
  border: 0.08em solid currentColor;
  border-radius: 0.3em;
  color: var(--copybutton-color);
  transition: background-color 0.1s linear;
}
.copybutton-icon {
  width: 1em;
  height: 1em;
  fill: none;
  display: block;
}
.copybutton-icon path {
  stroke: currentColor;
  stroke-width: 0.08em;
  stroke-linecap: round;
  stroke-linejoin: round;
}
`;

export function createCopyButton(
  copyText: string | (() => string),
  responseText: string | (() => string) = 'Copied!',
  hintText: string | (() => string) = 'Copy'
): HTMLDivElement {
  const response = h('span', { class: 'copybutton-response' });
  const iconPath = h('svg:path', {
    d: 'M4.16667 12.5H3.33333C2.89131 12.5 2.46738 12.3244 2.15482 12.0118C1.84226 11.6993 1.66667 11.2754 1.66667 10.8333V3.33332C1.66667 2.8913 1.84226 2.46737 2.15482 2.15481C2.46738 1.84225 2.89131 1.66666 3.33333 1.66666H10.8333C11.2754 1.66666 11.6993 1.84225 12.0118 2.15481C12.3244 2.46737 12.5 2.8913 12.5 3.33332V4.16666M9.16667 7.49999H16.6667C17.5871 7.49999 18.3333 8.24618 18.3333 9.16666V16.6667C18.3333 17.5871 17.5871 18.3333 16.6667 18.3333H9.16667C8.24619 18.3333 7.5 17.5871 7.5 16.6667V9.16666C7.5 8.24618 8.24619 7.49999 9.16667 7.49999Z',
  });
  const icon = h('svg:svg', {
    class: 'copybutton-icon',
    viewBox: '0 0 20 20',
    role: 'img',
    'aria-label': 'copy',
    focusable: 'false',
  }, iconPath);

  const button = h('button', { class: 'copybutton' }, icon);
  button.addEventListener('click', () => {
    void (async function() {
      const text = typeof copyText === 'function' ? copyText() : copyText;
      try {
        await navigator.clipboard.writeText(text);
        button.disabled = true;
        response.textContent = typeof responseText === 'function' ? responseText() : responseText;
        response.style.display = 'inline-block';
        setTimeout(() => {
          // Reset button to original state
          button.disabled = false;
          response.style.display = 'none';
        }, 1000);
      } catch (err) {
        alert('Failed to copy content.');
        console.error(`[xlet:button] Copy error: ${repr(err)}`);
      }
    })();
  });


  // set hint
  if (typeof hintText === 'string') {
    button.title = hintText;
  } else if (typeof hintText === 'function') {
    const updateTitle = () => { button.title = hintText(); };
    button.addEventListener('mouseenter', updateTitle);
    button.addEventListener('focus', updateTitle);
  }

  return h('div', { class: 'copybutton-wrapper' }, button, response);
}

// Bad idea. css parsing is complex and if doing inline styles,
// then just use elem.style.someStyleProp
//
// export function parseStyle(css: string): Record<string, string> {
//   const obj: Record<string, string> = {};
//   for (const rule of css.split(';')) {
//     if (!rule.trim()) continue;
//     const [key, value] = rule.split(':').map(s => s.trim());
//     if (!key || value === undefined) continue;
//     obj[key] = value;
//   }
//   return obj;
// }


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

export function levenshteinSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const m = a.length, n = b.length;
  if (m * n === 0) return 0;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i]);
  for (let j = 1; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1;
    }
  }
  const dist = dp[m][n];
  return 1 - dist / Math.max(m, n);
}

export function jaroWinklerSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const m = Math.max(0, Math.floor(Math.max(a.length, b.length) / 2) - 1);
  let matches = 0, transpositions = 0;
  const s1Matches = [], s2Matches = [];
  for (let i = 0; i < a.length; i++) {
    for (let j = Math.max(0, i - m); j < Math.min(b.length, i + m + 1); j++) {
      if (!s2Matches[j] && a[i] === b[j]) {
        s1Matches[i] = s2Matches[j] = true; matches++; break;
      }
    }
  }
  if (!matches) return 0;
  let k = 0;
  for (let i = 0; i < a.length; i++) {
    if (s1Matches[i]) {
      while (!s2Matches[k]) k++;
      if (a[i] !== b[k++]) transpositions++;
    }
  }
  transpositions /= 2;
  const jw = ((matches / a.length) + (matches / b.length) + ((matches - transpositions) / matches)) / 3;
  // Winkler bonus for common prefix
  let l = 0;
  const prefix = 0.1;
  while (l < 4 && a[l] && a[l] === b[l]) l++;
  return jw + l * prefix * (1 - jw);
}

export function jaccardSimilarity(a: string, b: string): number {
  const A = new Set(a.toLowerCase().split(/\s+/));
  const B = new Set(b.toLowerCase().split(/\s+/));
  const inter = [...A].filter((x) => B.has(x)).length;
  const union = new Set([...A, ...B]).size;
  return union ? inter / union : 0;
}

export function isLabelRedundant(label?: string, reference?: string): boolean {
  if (!label || !reference) return false;

  const nRef = norm(reference);
  const nLabel = norm(label);

  return (nLabel.length >= 3 && nRef.includes(nLabel));

  // ---- helper ----
  function norm(s: string): string {
    let out = s;
    try { out = decodeURIComponent(out); } catch { /* ignore malformed escapes */ }
    return out
      .normalize('NFC')
      .toLowerCase()
      .replace(/[.,:;?!'"()[\]\-–—\s_/\\…]+/g, '');
  }
}

export function filterGenericLabel(label?: string): string {
  if (!label) return '';
  const toks = label.normalize('NFC').toLowerCase().split(/[^0-9\p{L}]+/u).filter(Boolean);
  const generic = new Set([
    'here', 'click', 'me', 'tap',
    'more', 'read', 'learn', 'see', 'view', 'findout',
    'details', 'info', 'information',
    'continue', 'reading', 'keep', 'next',
    'article', 'post', 'page', 'source',
    'link', 'this', 'the', 'my', 'a', 'an',
  ]);
  const kept = toks.filter((w) => !generic.has(w));
  const content = kept.join('');
  return content;
}

export function isLabelGeneric(label?: string): boolean {
  if (!label) return true;
  const content = filterGenericLabel(label);
  if (content.length === 0) return true;
  return false;
  // return isLabelRedundant(content, reference);
}

export function lastUrlSegment(url: string): string {
  const clean = url.split(/[?#]/)[0].replace(/\/+$/, '');
  return decodeURIComponent(clean.split('/').pop() || '');
}

export function formatDateWithRelative(iso?: string | null): string {
  if (!iso) return 'unknown-date';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return 'invalid-date';

  const pad = (n: number) => String(n).padStart(2, '0');
  const ymd = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  // --- relative ---
  const diffMs = Date.now() - d.getTime();
  const diffDays = Math.round(diffMs / 86400000); // 1 day = 86400000 ms
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  let rel: string;
  if (Math.abs(diffDays) < 30) rel = rtf.format(-diffDays, 'day');
  else if (Math.abs(diffDays) < 365) rel = rtf.format(-Math.round(diffDays / 30), 'month');
  else rel = rtf.format(-Math.round(diffDays / 365), 'year');

  return `${ymd} (${rel})`;
}

// A, B, C, ... Z, AA, AB, ...
export function alphaLabel(idx1: number): string {
  let n = idx1, s = '';
  while (n > 0) { n--; s = String.fromCharCode(65 + (n % 26)) + s; n = Math.floor(n / 26); }
  return s;
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
