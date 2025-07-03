// import { test } from 'node:test';
// import * as assert from 'node:assert'; 
// import { toMd } from '../../src/wiki.js';
// import { JSDOM } from 'jsdom';

// const dom = new JSDOM();
// global.Node = dom.window.Node;
// global.document = dom.window.document;

// function el(html, selector = 'body > *') {
//   const dom = new JSDOM(html);
//   return dom.window.document.querySelector(selector);
// }

// function assertNodeEqual(a, b) {
//   const aHtml = (a?.outerHTML || a?.textContent || String(a)).replace(/\s+/g, '');
//   const bHtml = (b?.outerHTML || b?.textContent || String(b)).replace(/\s+/g, '');

//   assert.strictEqual(aHtml, bHtml);
// }

