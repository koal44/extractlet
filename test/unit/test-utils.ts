import { JSDOM } from 'jsdom';
import { strictEqual } from 'node:assert';
import { isElement, isNode } from '../../src/utils';

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
  const dom = new JSDOM(html);;
  return dom.window.document.querySelector(selector);
}

export function assertNodeEqual(a:Node|string|null, b:Node|string|null) {
  function html(x:Node|string|null): string {
    if (x === null || x === undefined) return '';
    if (typeof x === 'string') return x;
    if (isElement(x)) return x.outerHTML;
    if (isNode(x)) return x.textContent || '';
    return String(x);
  }

  const aHtml = html(a).replace(/\s+/g, '');
  const bHtml = html(b).replace(/\s+/g, '');

  strictEqual(aHtml, bHtml);
}