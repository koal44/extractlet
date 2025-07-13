export function log(...args: unknown[]): void {
  const LogOptsKeys = ['isDebug', 'indent', 'escapeWhitespace', 'jsonifyStrings', 'verboseNodes'];
  type LogOptions = {
    isDebug?: boolean;
    indent?: number;
    escapeWhitespace?: boolean;
    jsonifyStrings?: boolean;
    verboseNodes?: boolean;
  }
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
    console.log(out);
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
  tag: string,
  attrs: Record<string, any> = {},
  ...children: (string | Node)[]
): HTMLElement | SVGElement {

  let node: HTMLElement | SVGElement;

  if (typeof tag === 'string' && tag.startsWith('svg:')) {
    node = document.createElementNS('http://www.w3.org/2000/svg', tag.slice(4));
  } else {
    node = document.createElement(tag);
  }

  for (const [key, value] of Object.entries(attrs)) {
    node.setAttribute(key, value);
  }
  children.forEach(child => {
    if (typeof child === 'string') {
      node.appendChild(document.createTextNode(child));
    } else if (isNode(child)) {
      node.appendChild(child);
    }
  });
  return node;
}

export function escapeRegExp(pattern: string): string {
  return pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

export function createMultiToggle({ initState = 0, onToggle = undefined, labels = ['a', 'b'], labelSide = 'right'}
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
    ? h('div', { class: 'multi-toggle' }, stateLabel, switchBody)
    : h('div', { class: 'multi-toggle' }, switchBody, stateLabel);



  const setState = (newState: number): void => {
    state = newState;
    const knobProgress = labels.length === 1 ? 0 : newState / (labels.length - 1);
    wrapper.style.setProperty('--knob-progress', `${knobProgress}`);
    stateLabel.textContent = labels[newState];
    onToggle?.(newState);
  };

  let state = initState;
  setState(state);

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
.copybutton {
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
  border: 1px solid currentColor;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 15px;
  align-content: center;
  margin-left: 5px;
}
.copybutton button {
  cursor: pointer;
  margin-left: 20px;
  padding: 6px 8px;
  background-color: var(--copybutton-bg);
  border: 1px solid currentColor;
  border-radius: 6px;
  color: var(--copybutton-color);
  transition: background-color 0.1s linear;
}
.copybutton-icon {
  width: 20px;
  height: 20px;
  fill: none;
}
.copybutton-icon path {
  stroke: currentColor;
  stroke-width: 1.66667;
  stroke-linecap: round;
  stroke-linejoin: round;
}
`;

export function createCopyButton(
  doc: Document,
  copyText: string | (() => string),
  responseText: string = 'Copied!'
): HTMLDivElement {
  // hidden helper to hold the text to be copied
  let ta = doc.getElementById('copybutton-hidden-ta') as HTMLTextAreaElement | null;
  if (!ta) {
    ta = h('textarea', { id: 'copybutton-hidden-ta' }) as HTMLTextAreaElement;
    doc.body.appendChild(ta);
  }

  const response = h('span', { class: 'copybutton-response' }, responseText);
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

  const button = h('button', {}, icon) as HTMLButtonElement;
  button.addEventListener('click', function() {
    ta.value = typeof copyText === 'function' ? copyText() : copyText;
    ta.select();

    try {
      const successful = doc.execCommand('copy');
      if (successful) {
        button.disabled = true;
        response.style.display = 'inline-block';
        setTimeout(() => {
          // Reset button to original state
          button.disabled = false;
          response.style.display = 'none';
        }, 1000);
      } else {
        alert('Failed to copy content.');
      }
    } catch (err) {
      console.error('Copy error:', err);
    }
  });

  return h('div', { class: 'copybutton' }, button, response) as HTMLDivElement;
}

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
export function isDocument(node?: Node|null): node is Document {
  return !!node && node.nodeType === Node.DOCUMENT_NODE;
}
export function isDocumentFragment(node?: Node|null): node is DocumentFragment {
  return !!node && node.nodeType === Node.DOCUMENT_FRAGMENT_NODE;
}
export function isHTMLElement(node?: Node|null): node is HTMLElement {
  return !!node && isElement(node) && node.namespaceURI === 'http://www.w3.org/1999/xhtml';
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
export function isFormControl(node?: Node|null): node is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | HTMLButtonElement {
  return !!node && isInput(node) || isTextArea(node) || isSelect(node) || isButton(node);
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
export function isSvg(node?: Node|null): node is SVGElement {
  return !!node && isElement(node) && node.namespaceURI === 'http://www.w3.org/2000/svg';
}
export function isMathMl(node?: Node|null): node is Element {
  return !!node && isElement(node) && node.namespaceURI === 'http://www.w3.org/1998/Math/MathML';
}
export function isCustomElement(node?: Node|null): node is HTMLElement {
  return !!node && isElement(node) && node.tagName.includes('-');
}
