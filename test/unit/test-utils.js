import { JSDOM } from 'jsdom';
import { strictEqual } from 'node:assert';

export function setupDom() {
  const dom = new JSDOM();
  global.Node = dom.window.Node;
  global.document = dom.window.document;
}

export function el(html, selector = 'body > *') {
  const dom = new JSDOM(html);
  return dom.window.document.querySelector(selector);
}

export function assertNodeEqual(a, b) {
  const aHtml = (a?.outerHTML || a?.textContent || String(a)).replace(/\s+/g, '');
  const bHtml = (b?.outerHTML || b?.textContent || String(b)).replace(/\s+/g, '');

  strictEqual(aHtml, bHtml);
}