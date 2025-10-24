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
    && Object.keys(lastArg).every(key => LogOptsKeys.includes(key))
  ) {
    opts = args.pop() as LogOptions;
  }

  const isDebug = (opts.isDebug === true) || (typeof process !== 'undefined' && process?.env?.DEBUG === 'true');
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
    if (!node) return String(node);
    switch (node.nodeType) {
      case Node.ELEMENT_NODE: {
        let { tagName: tag, id, className: cls } = node as Element;
        tag = tag.toLowerCase();
        id = id ? `#${id}` : '';
        cls = cls ? '.' + cls.trim().replace(/\s+/g, '.') : '';
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

export function h(
  tag: string, // e.g. 'div', 'svg:circle', 'math:mi'
  attrs: Record<string, any> = {}, // e.g. { class: 'my-class', id: 'my-id', 'xlink:href': '#foo' }
  ...children: (string | Node | null)[] // e.g. 'Hello', document.createElement('span'), null
): HTMLElement | SVGElement | MathMLElement {

  const node =
    tag.startsWith('math:') ? document.createElementNS('http://www.w3.org/1998/Math/MathML', tag.slice(5)) as MathMLElement :
    tag.startsWith('svg:') ? document.createElementNS('http://www.w3.org/2000/svg', tag.slice(4)) as SVGElement :
    document.createElement(tag) as HTMLElement;

  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'xlink:href') {
      node.setAttributeNS('http://www.w3.org/1999/xlink', 'href', String(value));
    } else {
      node.setAttribute(key, String(value));
    }
  }
  
  children.forEach(child => {
    if (typeof child === 'string') {
      node.appendChild(document.createTextNode(child));
    } else if (isNode(child)) {
      node.appendChild(child);
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

export function htmlToElementK<K extends keyof HTMLElementTagNameMap>(
  html: string, tag: K, doc: Document = document
): HTMLElementTagNameMap[K]|null {
  const template = doc.createElement('template');
  template.innerHTML = html.trim();
  if (template.content.children.length !== 1) {
    // throw new Error(`html must contain exactly one element: ${html}`);
    console.warn(`html must contain exactly one element: ${html}`);
    return null;
  }
  const el = template.content.firstElementChild as HTMLElementTagNameMap[K];
  if (el.tagName.toLowerCase() !== tag.toLowerCase()) {
    // throw new Error(`No element found for tag ${tag} in HTML: ${html}`);
    console.warn(`No element found for tag ${tag} in HTML: ${html}`);
    return null;
  }
  return el;
}

export function htmlToElement(html:string, doc: Document = document): Element|null {
  const template = doc.createElement('template');
  template.innerHTML = html.trim();
  if (template.content.children.length !== 1) {
    // throw new Error(`html must contain exactly one element: ${html}`);
    console.warn(`html must contain exactly one element: ${html}`);
    return null;
  }
  return template.content.firstElementChild;
}

export function toKebabCase(str: string, opts: { splitNumbers?: boolean } = {}): string {
  const { splitNumbers = true } = opts;
  const re = splitNumbers
    ? /([A-Z]?[a-z]+|[A-Z]+(?![a-z])|\d+)/g
    : /([A-Z]?[a-z0-9]+|[A-Z0-9]+(?![a-z]))/g;
    
  return str
    .match(re)
    ?.map(w => w.toLowerCase())
    .join('-') ?? '';
}

export function toKebabCaseI18n(str: string): string {
  return str
    .normalize('NFC')
    // Insert a separator when switching between CJK and Latin
    .replace(/([\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}])(?=[A-Za-z])/gu, '$1 ')
    .replace(/([A-Za-z])(?=[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}])/gu, '$1 ')
    .match(/([\p{Lu}]?[\p{Ll}]+|[\p{Lu}]+(?![\p{Ll}])|[\p{L}]+|\p{N}+)/gu)
    ?.map(w => w.toLocaleLowerCase())
    .join('-') ?? '';
}

export function toPascalCase(str: string, keepAcronyms = false): string {
  const re = keepAcronyms
    ? /([A-Z][a-z]+|[A-Z](?![a-z])|[a-z]+|\d+)/g
    : /([A-Z][a-z]+|[A-Z]+(?![a-z])|[a-z]+|\d+)/g;

  return str.match(re)?.map(w => w[0].toLocaleUpperCase() + w.slice(1).toLocaleLowerCase()) .join('')
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
    .match(re)?.map(w => w[0].toLocaleUpperCase() + w.slice(1).toLocaleLowerCase())
    .join('') ?? '';
}

export function warn(...args: Parameters<typeof console.warn>): void {
  console.warn(...args);
}

export function warnNull(...args: Parameters<typeof console.warn>): null {
  console.warn(...args);
  return null;
}

export function warnTrue(...args: Parameters<typeof console.warn>): true {
  console.warn(...args);
  return true;
}

export function warnFalse(...args: Parameters<typeof console.warn>): false {
  console.warn(...args);
  return false;
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

interface MultiToggleDiv extends HTMLDivElement {
  init: () => void;
}

export function createMultiToggle({ initState = 0, onToggle = undefined, labels = ['a', 'b'], labelSide = 'right' }
  : { initState?: number; onToggle?: (newState: number) => void; labels?: string[]; labelSide?: 'left' | 'right';
} = {}) {
  if (!Array.isArray(labels) || labels.length === 0) {
    throw new Error('multi-toggle requires at least one label');
  }
  const checkbox = h('input', { type: 'checkbox', class: 'multi-toggle-checkbox', 'aria-label': 'Toggle view mode' });
  const slider = h('span', { class: 'multi-toggle-slider' });
  const switchBody = h('label', { class: 'multi-toggle-switchbody' }, checkbox, slider);
  const stateLabel = h('span', { class: `multi-toggle-label-${labelSide}` }, labels[initState]);
  const wrapper = labelSide === 'left'
    ? h('div', { class: 'multi-toggle' }, stateLabel, switchBody) as MultiToggleDiv
    : h('div', { class: 'multi-toggle' }, switchBody, stateLabel) as MultiToggleDiv;

  const setState = (newState: number): void => {
    state = newState;
    const knobProgress = labels.length === 1 ? 0 : newState / (labels.length - 1);
    wrapper.style.setProperty('--knob-progress', `${knobProgress}`);
    stateLabel.textContent = labels[newState];
    onToggle?.(newState);
  };

  let state = initState;
  wrapper.init = () => { setState(initState); };
  //setState(state);

  checkbox.addEventListener('change', () => {
    setState((state + 1) % labels.length);
  });

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

  const button = h('button', { class: 'copybutton' }, icon) as HTMLButtonElement;
  button.addEventListener('click', async function() {
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
      console.error('Copy error:', err);
    }
  });

  // set hint
  if (typeof hintText === 'string') {
    button.title = hintText;
  } else if (typeof hintText === 'function') {
    const updateTitle = () => { button.title = hintText(); };
    button.addEventListener('mouseenter', updateTitle);
    button.addEventListener('focus', updateTitle);
  }

  return h('div', { class: 'copybutton-wrapper' }, button, response) as HTMLDivElement;
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

export function isNode(x: any): x is Node {
  return !!x && typeof x === 'object' && typeof x.nodeType === 'number' && typeof x.nodeName === 'string';
}
export function isElement(node?: Node|null): node is Element {
  return !!node && node.nodeType === Node.ELEMENT_NODE;
}
export function isText(node?: Node|null): node is Text {
  return !!node && node.nodeType === Node.TEXT_NODE;
}
export function isComment(node?: Node|null): node is Comment {
  return !!node && node.nodeType === Node.COMMENT_NODE;
}
export function isDoc(node?: Node|null): node is Document {
  return !!node && node.nodeType === Node.DOCUMENT_NODE;
}
export function isDocFrag(node?: Node|null): node is DocumentFragment {
  return !!node && node.nodeType === Node.DOCUMENT_FRAGMENT_NODE;
}
export function isHTML(node?: Node|null): node is HTMLElement {
  return !!node && isElement(node) && node.namespaceURI === 'http://www.w3.org/1999/xhtml';
}
export function isSVG(node?: Node|null): node is SVGElement {
  return !!node && isElement(node) && node.namespaceURI === 'http://www.w3.org/2000/svg';
}
export function isMathML(node?: Node|null): node is MathMLElement {
  return !!node && isElement(node) && node.namespaceURI === 'http://www.w3.org/1998/Math/MathML';
}
export function isDiv(node?: Node|null): node is HTMLDivElement {
  return !!node && isElement(node) && node.tagName.toUpperCase() === 'DIV';
}
export function isStyle(node?: Node|null): node is HTMLStyleElement {
  return !!node && isElement(node) && node.tagName.toUpperCase() === 'STYLE';
}
export function isScript(node?: Node|null): node is HTMLScriptElement {
  return !!node && isElement(node) && node.tagName.toUpperCase() === 'SCRIPT';
}
export function isSpan(node?: Node|null): node is HTMLSpanElement {
  return !!node && isElement(node) && node.tagName.toUpperCase() === 'SPAN';
}
export function isOList(node?: Node|null): node is HTMLOListElement {
  return !!node && isElement(node) && node.tagName.toUpperCase() === 'OL';
}
export function isUList(node?: Node|null): node is HTMLUListElement {
  return !!node && isElement(node) && node.tagName.toUpperCase() === 'UL';
}
export function isListItem(node?: Node|null): node is HTMLLIElement {
  return !!node && isElement(node) && node.tagName.toUpperCase() === 'LI';
}
export function isHeading(node?: Node|null): node is HTMLHeadingElement {
  return !!node && isElement(node) && /^H[1-6]$/.test(node.tagName.toUpperCase());
}
export function isParagraph(node?: Node|null): node is HTMLParagraphElement {
  return !!node && isElement(node) && node.tagName.toUpperCase() === 'P';
}
export function isAnchor(node?: Node|null): node is HTMLAnchorElement {
  return !!node && isElement(node) && node.tagName.toUpperCase() === 'A';
}
export function isImage(node?: Node|null): node is HTMLImageElement {
  return !!node && isElement(node) && node.tagName.toUpperCase() === 'IMG';
}
export function isFigure(node?: Node|null): node is HTMLElement {
  return !!node && isElement(node) && node.tagName.toUpperCase() === 'FIGURE';
}
export function isInput(node?: Node|null): node is HTMLInputElement {
  return !!node && isElement(node) && node.tagName.toUpperCase() === 'INPUT';
}
export function isButton(node?: Node|null): node is HTMLButtonElement {
  return !!node && isElement(node) && node.tagName.toUpperCase() === 'BUTTON';
}
export function isSelect(node?: Node|null): node is HTMLSelectElement {
  return !!node && isElement(node) && node.tagName.toUpperCase() === 'SELECT';
}
export function isTextArea(node?: Node|null): node is HTMLTextAreaElement {
  return !!node && isElement(node) && node.tagName.toUpperCase() === 'TEXTAREA';
}
export function isTable(node?: Node|null): node is HTMLTableElement {
  return !!node && isElement(node) && node.tagName.toUpperCase() === 'TABLE';
}
export function isTableRow(node?: Node|null): node is HTMLTableRowElement {
  return !!node && isElement(node) && node.tagName.toUpperCase() === 'TR';
}
export function isTableCell(node?: Node|null): node is HTMLTableCellElement {
  return !!node && isElement(node) && (node.tagName.toUpperCase() === 'TD');
}
export function isTableHeader(node?: Node|null): node is HTMLTableCellElement {
  return !!node && isElement(node) && node.tagName.toUpperCase() === 'TH';
}
export function isTableBody(node?: Node|null): node is HTMLTableSectionElement {
  return !!node && isElement(node) && node.tagName.toUpperCase() === 'TBODY';
}
export function isTableHead(node?: Node|null): node is HTMLTableSectionElement {
  return !!node && isElement(node) && node.tagName.toUpperCase() === 'THEAD';
}
export function isTableFoot(node?: Node|null): node is HTMLTableSectionElement {
  return !!node && isElement(node) && node.tagName.toUpperCase() === 'TFOOT';
}
export function isFieldset(node?: Node|null): node is HTMLFieldSetElement {
  return !!node && isElement(node) && node.tagName.toUpperCase() === 'FIELDSET';
}
export function isLegend(node?: Node|null): node is HTMLLegendElement {
  return !!node && isElement(node) && node.tagName.toUpperCase() === 'LEGEND';
}
export function isLabel(node?: Node|null): node is HTMLLabelElement {
  return !!node && isElement(node) && node.tagName.toUpperCase() === 'LABEL';
}
export function isNav(node?: Node|null): node is HTMLElement {
  return !!node && isElement(node) && node.tagName.toUpperCase() === 'NAV';
}
export function isHeader(node?: Node|null): node is HTMLElement {
  return !!node && isElement(node) && node.tagName.toUpperCase() === 'HEADER';
}
export function isFooter(node?: Node|null): node is HTMLElement {
  return !!node && isElement(node) && node.tagName.toUpperCase() === 'FOOTER';
}
export function isSection(node?: Node|null): node is HTMLElement {
  return !!node && isElement(node) && node.tagName.toUpperCase() === 'SECTION';
}
export function isArticle(node?: Node|null): node is HTMLElement {
  return !!node && isElement(node) && node.tagName.toUpperCase() === 'ARTICLE';
}
export function isAside(node?: Node|null): node is HTMLElement {
  return !!node && isElement(node) && node.tagName.toUpperCase() === 'ASIDE';
}
export function isMain(node?: Node|null): node is HTMLElement {
  return !!node && isElement(node) && node.tagName.toUpperCase() === 'MAIN';
}
export function isDetails(node?: Node|null): node is HTMLDetailsElement {
  return !!node && isElement(node) && node.tagName.toUpperCase() === 'DETAILS';
}
export function isDialog(node?: Node|null): node is HTMLDialogElement {
  return !!node && isElement(node) && node.tagName.toUpperCase() === 'DIALOG';
}
export function isCanvas(node?: Node|null): node is HTMLCanvasElement {
  return !!node && isElement(node) && node.tagName.toUpperCase() === 'CANVAS';
}
export function isVideo(node?: Node|null): node is HTMLVideoElement {
  return !!node && isElement(node) && node.tagName.toUpperCase() === 'VIDEO';
}
export function isAudio(node?: Node|null): node is HTMLAudioElement {
  return !!node && isElement(node) && node.tagName.toUpperCase() === 'AUDIO';
}
export function isIFrame(node?: Node|null): node is HTMLIFrameElement {
  return !!node && isElement(node) && node.tagName.toUpperCase() === 'IFRAME';
}
export function isEmbed(node?: Node|null): node is HTMLEmbedElement {
  return !!node && isElement(node) && node.tagName.toUpperCase() === 'EMBED';
}
export function isObject(node?: Node|null): node is HTMLObjectElement {
  return !!node && isElement(node) && node.tagName.toUpperCase() === 'OBJECT';
}
export function isMap(node?: Node|null): node is HTMLMapElement {
  return !!node && isElement(node) && node.tagName.toUpperCase() === 'MAP';
}
export function isArea(node?: Node|null): node is HTMLAreaElement {
  return !!node && isElement(node) && node.tagName.toUpperCase() === 'AREA';
}
export function isForm(node?: Node|null): node is HTMLFormElement {
  return !!node && isElement(node) && node.tagName.toUpperCase() === 'FORM';
}
export function isFieldSet(node?: Node|null): node is HTMLFieldSetElement {
  return !!node && isElement(node) && node.tagName.toUpperCase() === 'FIELDSET';
}
export function isList(node?: Node|null): node is HTMLUListElement | HTMLOListElement {
  return !!node && isUList(node) || isOList(node);
}
export function isPre(node?: Node|null): node is HTMLPreElement {
  return !!node && isElement(node) && node.tagName.toUpperCase() === 'PRE';
}
export function isCode(node?: Node|null): node is HTMLElement {
  return !!node && isElement(node) && node.tagName.toUpperCase() === 'CODE';
}
export function isBlockquote(node?: Node|null): node is HTMLQuoteElement {
  return !!node && isElement(node) && node.tagName.toUpperCase() === 'BLOCKQUOTE';
}
export function isCustom(node?: Node|null): node is HTMLElement {
  return !!node && isElement(node) && node.tagName.includes('-');
}
export function isSup(node?: Node|null): node is HTMLElement {
  return !!node && isElement(node) && node.tagName.toUpperCase() === 'SUP';
}
export function isSub(node?: Node|null): node is HTMLElement {
  return !!node && isElement(node) && node.tagName.toUpperCase() === 'SUB';
}

export function levenshteinSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const m = a.length, n = b.length;
  if (m * n === 0) return 0;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i]);
  for (let j = 1; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]) + 1;
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
  for (let i = 0; i < a.length; i++)
    if (s1Matches[i]) {
      while (!s2Matches[k]) k++;
      if (a[i] !== b[k++]) transpositions++;
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
  const inter = [...A].filter(x => B.has(x)).length;
  const union = new Set([...A, ...B]).size;
  return union ? inter / union : 0;
}

export function isCaptionSimilar(a?: string|null, b?: string|null, opts: { unicode?: string; lower?: boolean; underscores?: boolean; trim?: boolean; punct?: boolean; trailingSlash?: boolean; } = {}) {
  if (a === b) return true;
  if (!a || !b) return false;
  const { unicode = 'NFC', lower = true, underscores = true, trim = true, punct = false, trailingSlash = true } = opts;
  const norm = (s: string) => {
    if (!s) return '';
    if (trailingSlash) s = s.replace(/\/+$/, '');
    if (punct) s = s.replace(/[.,:;?!'"\-–—]/g, '');
    s = s.normalize(unicode);
    if (underscores) s = s.replace(/_/g, ' ');
    if (lower) s = s.toLocaleLowerCase('en');
    if (trim) s = s.trim();
    return s;
  };
  return norm(a) === norm(b);
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
