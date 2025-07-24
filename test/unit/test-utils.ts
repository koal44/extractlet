import { JSDOM } from 'jsdom';
import { strictEqual } from 'node:assert';
import { escapeHtml, isElement, isHTMLElement, isNode, isText } from '../../src/utils';

export function setupDom() {
  const dom = new JSDOM();

  // add global.Node, global.document, global.HTMLDivElement, etc.
  for (const prop of Object.getOwnPropertyNames(dom.window)) {
    if (prop in globalThis) continue;
    try {
      (globalThis as any)[prop] = (dom.window as any)[prop];
    } catch {
      // Ignore properties that cannot be set
    }
  }
}

// Each call creates a new JSDOM instance to break prototype chain assumptions.
// This ensures tests will fail if src code relies on instanceof checks.
export function el(html: string, selector = 'body > *'): Element | null {
  // document.body.innerHTML = html;
  // return document.querySelector(selector);

  const dom = new JSDOM(html);
  return dom.window.document.querySelector(selector);
}

export function assertNodeEqual(actual:Node|string|null, expected:Node|string|null) {
  const actualHtml = htmlify(actual); //.replace(/\s+/g, '');
  const expectedHtml = htmlify(expected); //.replace(/\s+/g, '');

  strictEqual(actualHtml, expectedHtml);
}

export function htmlify(el: Node|string|null|undefined): string {
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
          if (isHTMLElement(el) && el.style.length > 0) {
            val = Array.from(el.style)
              .sort()
              .map(k => `${k}: ${el.style.getPropertyValue(k)};`)
              .join(' ');
          }
          break;
        default:
          val = value;
      }

      attrs.push(`${name}="${val}"`);
    }
    const attrString = attrs.length ? ' ' + attrs.join(' ') : '';
    const children = [...el.childNodes].map(child => htmlify(child)).join('');
    return `<${tag}${attrString}>${children}</${tag}>`;
  }
  if (isText(el)) {
    return escapeHtml(el.textContent || '');
  }
  if (isNode(el)) {
    return escapeHtml(el.textContent || '');
  }
  return String(el);
}

export function assertApproxEqual(actual:number, expected:number, tolerance = 0.001, message = '') {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`Expected a:'${actual}' ≈ e:'${expected}' (±${tolerance})${message ? ': ' + message : ''}`);
  }
}
