import { JSDOM } from 'jsdom';
import { AssertionError } from 'node:assert';
import {
  escapeHtml, isElement, isHTML, isNode, isText, log,
} from '../../src/utils';
import { execSync } from 'node:child_process';
import { isString } from '../../src/typing';

export function setupDom() {
  const dom = new JSDOM();

  // add global.Node, global.document, global.HTMLDivElement, etc.
  for (const prop of Reflect.ownKeys(dom.window)) {
    if (prop in globalThis) continue;
    const desc = Object.getOwnPropertyDescriptor(dom.window, prop);
    if (!desc) continue;
    try {
      Reflect.defineProperty(globalThis, prop, desc);
      // globalThis[prop] = dom.window[prop]; -- works, just not lint friendly
    } catch {
      // Ignore properties that cannot be set
    }
  }
}

// Each call creates a new JSDOM instance to break prototype chain assumptions.
// This ensures tests will fail if src code relies on instanceof checks.
export function el(html: string, base?: string): Element {
  const doc = new JSDOM(html, { url: base }).window.document;
  const first = doc.body.firstElementChild;
  if (!first) {
    const preview = html.length > 200 ? `${html.slice(0, 200)  }…` : html;
    throw new Error(`el(): no <body> child from HTML: ${preview}`);
  }
  return first;
}

export function mathEl(html: string, base?: string): MathMLElement {
  // normalize to a proper MathML root and ensure xmlns is present
  html = /^\s*<math\b/i.test(html)
    ? html.replace(/^(\s*<math)(?![^>]*\bxmlns=)/i, '$1 xmlns="http://www.w3.org/1998/Math/MathML"')
    : `<math xmlns="http://www.w3.org/1998/Math/MathML">${html}</math>`;

  return el(html, base) as MathMLElement;
}

export function docEl(html: string, base?: string): Document {
  const doc = new JSDOM(html, { url: base }).window.document;
  return doc;
}

export function assertNodeEqual(
  actual: Node | string | null,
  expected: Node | string | null,
  opts: {
    dropWsNodes?: boolean;
    trimBodyEnd?: boolean; // jsdom/parse5 may add extra whitespace at the end of <body>; trim it
  } = { dropWsNodes: false, trimBodyEnd: false },
): void {
  const asElement = (x: Node | string | null) => isString(x) ? el(x) : x;
  const actualHtml = htmlify(asElement(actual), opts);
  const expectedHtml = htmlify(asElement(expected), opts);

  // throw custom AssertionError so that error points to caller rather than this function
  if (actualHtml !== expectedHtml) {
    const err = new AssertionError({
      message: 'Expected nodes to be equal',
      actual: actualHtml,
      expected: expectedHtml,
      operator: 'strictEqual',
      stackStartFn: assertNodeEqual, // hide this frame and below
    });
    throw err;
  }
}

export function htmlify(
  el: Node | string | null | undefined,
  opts: {
    dropWsNodes?: boolean;
    trimBodyEnd?: boolean;
  } = { dropWsNodes: false, trimBodyEnd: false },
): string {
  if (el === null || el === undefined) return '';
  if (typeof el === 'string') return el;
  if (isElement(el)) {
    const tag = el.tagName.toLowerCase();
    const attrs: string[] = [];
    const sorted = [...el.attributes].sort((a, b) => a.name.localeCompare(b.name));
    for (const { name, value } of sorted) {
      let val = value;

      switch (name) {
        case 'class':
          if (el.classList.length > 0) {
            val = [...el.classList].sort().join(' ');
          }
          break;
        case 'style':
          if (isHTML(el) && el.style.length > 0) {
            val = Array.from(el.style)
              .sort()
              .map((k) => `${k}: ${el.style.getPropertyValue(k)};`)
              .join(' ');
          }
          break;
        default:
          val = value;
      }

      attrs.push(`${name}="${val}"`);
    }
    const attrString = attrs.length ? ` ${attrs.join(' ')}` : '';
    let children = [...el.childNodes].map((child) => htmlify(child, opts)).join('');
    if (opts.trimBodyEnd && tag === 'body') {
      children = children.trimEnd();
    }
    return `<${tag}${attrString}>${children}</${tag}>`;
  }
  if (isText(el)) {
    const raw = el.textContent ?? '';
    return opts.dropWsNodes && /^\s*$/.test(raw) ? '' : escapeHtml(raw);
  }
  if (isNode(el)) {
    return escapeHtml(el.textContent || '');
  }
  return String(el);
}

export function assertApproxEqual(actual: number, expected: number, tolerance = 0.001, message = '') {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`Expected a:'${actual}' ≈ e:'${expected}' (±${tolerance})${message ? `: ${message}` : ''}`);
  }
}

function pandocAvailable(): void {
  try {
    execSync('pandoc --version', { stdio: 'ignore' });
  } catch {
    throw new Error('Error: Pandoc not found in PATH.\nInstall from https://github.com/jgm/pandoc/releases\n');
  }
}

export function logPandocHtmlToMd(input: string): void {
  pandocAvailable();
  if (process.env.PANDOC !== 'true') return;

  const mdFlavors = ['markdown']; //, 'markdown_phpextra', 'markdown_mmd', 'markdown_strict', 'commonmark', 'gfm', 'commonmark_x'];
  log(`[${logPandocHtmlToMd.name}]\n--- Input ---\n${input}\n\n`, { jsonifyStrings: false });
  for (const flavor of mdFlavors) {
    const out = execSync('pandoc -f html -t markdown', { input }).toString();
    log(`--- Output ${flavor} ---\n${out}`, { jsonifyStrings: false });
  }
}

export function logPandocWtToMd(input: string): void {
  pandocAvailable();
  if (process.env.PANDOC !== 'true') return;

  const mdFlavors = ['markdown']; // 'markdown_phpextra', 'markdown_mmd', 'markdown_strict', 'commonmark', 'gfm', 'commonmark_x'];
  log(`[${logPandocWtToMd.name}]\n--- Input ---\n${input}\n\n`, { jsonifyStrings: false });
  for (const flavor of mdFlavors) {
    const out = execSync(`pandoc -f mediawiki -t ${flavor}`, { input }).toString();
    log(`--- Output ${flavor} ---\n${out}`, { jsonifyStrings: false });
  }
}
