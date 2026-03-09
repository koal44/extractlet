/**
 * Wikipedia Content DOM Reference
 *
 * == Classic Wikipedia (Desktop) ==
 *
 * html
 *   head
 *     title                                → (Fallback title)
 *     link[rel="canonical"]                → Permalink
 *     link[rel="alternate"][type="application/x-wiki"] → Raw wikitext
 *   body
 *     main#content
 *       h1#firstHeading > span             → Main title
 *       div#mw-content-text
 *         div.mw-parser-output
 *           h2...h6                          → Section headings
 *           <blocks>                         → Section content (paragraphs, lists, tables, etc.)
 *
 * == Parsoid HTML (API Output) ==
 *
 * html
 *   head
 *     title                                → Main title (use this for Parsoid; <h1> often absent)
 *     link[rel="dc:isVersionOf"]           → Permalink (protocol-relative or absolute)
 *   body
 *     section[data-mw-section-id="0"]
 *       <blocks>                           → Lead/intro content (no heading in section 0)
 *     section[data-mw-section-id="N"]
 *       h2...h6                            → Section heading (may be absent for some sections)
 *       <blocks>                           → Section content (paragraphs, lists, tables, etc.)
 *
 * Notes:
 * - <blocks> denotes content elements: <p>, <ul>, <ol>, <table>, <figure>, etc.
 * - In Parsoid, section 0 contains lead content (no heading).
 * - Main title in Parsoid is best taken from <head><title>.
 * - Not all sections have a heading (especially section 0).
 * - Permalinks and raw URLs are in <head> as <link> tags, but structure differs slightly.
 */


import type { ToHtmlContext, ToHtmlElementHandler, ToMdContext, ToMdElementHandler } from '../core';
import { toHtml as _toHtml, toMd as _toMd, safeFetch } from '../core';
import { frameMath, mathReprToHtml, mathReprToMd, normalizeTex, type MathRepr } from '../math-vendor';
import type { XletContexts } from '../settings';
import type { RenderPage } from '../snapshot-loader';
import type { HLevel } from '../utils/dom';
import {
  copyHrefAttr, copySrcAttr, h, htmlToElementK, isBreak, isDiv, isDoc, isElement,
  isHeading, isHTML, isListItem, isSub, isSup, isText, isUList, parseHeadingLevel,
} from '../utils/dom';
import { log, repr, warn } from '../utils/logging';
import { jaroWinklerSimilarity } from '../utils/strings';
import { renderXletPage, type XletNode, type XletPage } from '../xlet-page';

export type WikiResult = {
  baseUrl: string; // Base URL of the wiki page
  rawUrl: string; // Raw URL of the wiki page
  data: WikiNode | null; // The WikiNode tree representing the page structure
}

function shouldSkip(node: Node | null): boolean {
  if (!node) throw new Error('shouldSkip called with null or undefined node');
  if (!isElement(node)) throw new Error('shouldSkip called with non-element node'); // shouldn't happen

  // Drop boilerplate/non-content nodes early
  if (node.matches('meta, style, link')) return true;

  // Wikipedia/Parsoid noise
  if (node.classList.contains('cite-accessibility-label')) return true; // 'Jump up to:' screenreader label
  if (node.classList.contains('mw-empty-elt')) return true;             // placeholder / empty marker

  // Respect hidden elements (usually nav chrome / template junk)
  if (isHTML(node) && node.style.display === 'none') return true;

  // Drop certain template constructs
  if (node.classList.contains('authority-control')) return true;

  // hide certain backlink anchors that are hidden with CSS
  if (node.matches('a.mw-cite-up-arrow-backlink')
    && node.textContent?.trim() === '^'
    && node.previousElementSibling?.textContent?.trim() === '^'
  ) return true;

  return false;
}

const toMdElemHandler: ToMdElementHandler = (el, ctx, gc) => {
  if (shouldSkip(el)) return { skip: true };

  // Math extraction (wiki-specific repr -> TeX)
  const mathRepr = extractMathRepr(el);
  if (mathRepr) return mathReprToMd(mathRepr, ctx);

  // Math extraction for blocks
  if (el.matches('dl > dd')) {
    const parts: string[] = [];

    for (const child of el.children) {
      const repr = extractMathRepr(child);
      if (!repr?.tex) { parts.length = 0; break; }
      parts.push(normalizeTex(repr.tex));
    }

    if (parts.length) {
      const tex = parts.join('\n');
      return { md: frameMath(tex, 'block', ctx) };
    }
  }

  // Layout-only <br> inside certain math constructs
  if (
    isBreak(el) &&
    (isSub(el.nextSibling) || isSup(el.nextSibling)) &&
    (isText(el.previousSibling) || isElement(el.previousSibling))
  ) return { skip: true };

  // texhtml wrapper => inline TeX
  if (el.matches('span.texhtml')) {
    const md = toMd(el, { ...ctx, skipCustomHandler: true, inTex: true });
    return { md: `$${md}$` };
  }

  // Ignore spacer spans used inside texhtml
  if (el.matches('span') && el.parentElement?.matches('span.texhtml') && el.textContent?.trim() === '') {
    return { skip: true };
  }

  // Wikipedia citation sup should behave like plain inline content (not ^{...})
  if (el.matches('sup.reference')) {
    return { md: gc(el, 'inline') };
  }

  // Wikipedia renders citation brackets as spans; escape to avoid [[...]] semantics in some MD consumers
  if (el.matches('span.cite-bracket')) {
    const match = el.textContent?.match(/[[\]]/);
    if (match) return { md: `\\${match[0]}` };
  }

  // Reflist 'jump back up' block: drop content, but inject an anchor for the cite_note-* target
  if (el.matches('span.mw-cite-backlink')) {
    if (isListItem(el.parentElement) && el.parentElement.id.startsWith('cite')) {
      return { md: `<a id="${el.parentElement.id}"></a>` };
    }
    return { skip: true };
  }

  // Navboxes: normalize table-ish navigation UI into list-ish HTML, then markdownify inside a fence
  if (el.matches('.navbox')) {
    const navRoot = transformNav(el)[0] as Element;
    const navMd = toMd(navRoot, { ...ctx, skipCustomHandler: true });
    return { md: `\n\n:::navbox  \n${navMd.trim()}\n\n:::\n\n` };
  }

  return {};
};

export function toMd(node: Node | null, opts: Partial<ToMdContext> = {}): string {
  return _toMd(node, { elementHandler: toMdElemHandler, ...opts });
}

const toHtmlElemHandler: ToHtmlElementHandler = (node, ctx) => {
  if (shouldSkip(node)) return { skip: true };
  if (node.nodeType !== Node.ELEMENT_NODE) throw new Error('toHtmlElemHandler called with non-element node'); // shouldn't happen

  if (node.matches('span.mwe-math-element')) {
    const repr = extractMathRepr(node);
    if (!repr) return { skip: true };
    const r = mathReprToHtml(repr, ctx);
    return r?.skip ? { skip: true } : { node: r?.node };
  }

  if (node.matches('span.mvar, span.texhtml')) {
    const allowed: Set<string> = new Set();

    if (node.matches('span.mvar')) {
      allowed.add('font-style');
    }

    if (node.matches('span.texhtml')) {
      ['display', 'margin-bottom', 'vertical-align', 'line-height', 'font-size', 'text-align', 'white-space']
        .forEach((s) => allowed.add(s));
    }

    const clone = toHtml(node, { ...ctx, allowStyles: (ctx.allowStyles === true ? true : allowed) });
    if (!clone) return { skip: true };
    // if (node.classList.contains('mvar')) clone.classList.add('mvar');
    // if (node.classList.contains('texhtml')) clone.classList.add('texhtml');
    return { node: clone };
  }

  if (node.matches('li[id^="cite_note-"], sup.reference[id^="cite_ref-"]')) {
    const clone = toHtml(node, ctx) as HTMLLIElement | null;
    if (!clone) return { skip: true };
    clone.id = node.id; // preserve the ID for references
    return { node: clone };
  }

  // navbox
  if (node.matches('div.navbox table')) {
    const clone = toHtml(node, ctx) as HTMLTableElement | null;
    if (!clone) return { skip: true };
    clone.classList.add('xlet-navbox');
    return { node: clone };
  }
  if (node.matches('th.navbox-title button')) return { skip: true };
  if (node.matches('th.navbox-title .navbar')) return { skip: true };

  // return { skip: false, node: undefined };
  return {};
};

export function toHtml(node: Node | null, opts: Partial<ToHtmlContext> = {}): Node | null {
  return _toHtml(node, { elementHandler: toHtmlElemHandler, ...opts });
}

export function transformNav(node: Node | null): Node[] {
  if (!node) return [];
  if (isText(node)) return [document.createTextNode(node.textContent ?? '')];
  if (!isElement(node)) return [];

  // Drop navbox UI chrome / styles that should not reach Markdown
  if (node.matches('button, .navbar, link, style, .mw-collapsible-text, .mw-collapsible-toggle')) return [];

  const tag = node.tagName.toLowerCase();

  // Normalize common navbox quirks
  if (tag === 'br') return [document.createTextNode(' ')];

  // Self-links (no href) should render as text; bold only for the navbox title
  if (tag === 'a' && !node.hasAttribute('href')) {
    const next = node.closest('th.navbox-title') ? document.createElement('strong') : document.createElement('span');
    next.textContent = node.textContent;
    return [next];
  }

  // Flatten table section containers (prevents invalid <tbody> under <ul> after mapping)
  switch (tag) {
    case 'thead':
    case 'tbody':
    case 'tfoot':
    case 'colgroup':
      return [...node.childNodes].flatMap(transformNav);
  }

  // Table -> list structure (navboxes are navigational, not tabular)
  let nextType = tag;
  let nextNS = node.namespaceURI || 'http://www.w3.org/1999/xhtml';
  switch (nextType) {
    case 'table': nextType = 'ul'; nextNS = 'http://www.w3.org/1999/xhtml'; break;
    case 'tr': nextType = 'li'; nextNS = 'http://www.w3.org/1999/xhtml'; break;
    case 'td':
    case 'th': nextType = 'div'; nextNS = 'http://www.w3.org/1999/xhtml'; break;
  }

  const next = document.createElementNS(nextNS, nextType);

  // Keep only relevant attrs (href/src/title); drop styling/handlers/etc.
  for (const attr of node.attributes) {
    const name = attr.name.toLowerCase();
    switch (name) {
      case 'href':  copyHrefAttr(next, node); break;
      case 'src':   copySrcAttr(next, node); break;
      // eslint-disable-next-line no-restricted-syntax
      case 'title': next.setAttribute('title', attr.value.replace(/\s+/g, ' ').trim()); break;
    }
  }

  // hlist headers (e.g. Physics + Engineering) are label sets; render inline with separators
  if (node.matches('div.hlist')) {
    const ul = node.querySelector(':scope > ul');
    if (isUList(ul)) {
      let first = true;
      for (const li of ul.children) {
        const childEl = li.firstElementChild;
        if (!childEl) continue;
        if (!first) next.appendChild(document.createTextNode(' • '));
        first = false;
        for (const c of transformNav(childEl)) next.appendChild(c);
      }
      return next.childNodes.length ? [next] : [];
    }
  }

  // Default: recurse and rebuild subtree under the mapped node
  for (const child of node.childNodes) {
    for (const c of transformNav(child)) next.appendChild(c);
  }

  // Drop empty containers created by mapping/flattening
  if (!next.textContent?.trim() && next.childNodes.length === 0) return [];

  return [next];
}

function extractMathRepr(el: Element): MathRepr | null {
  if (!el.matches('span.mwe-math-element')) return null;

  const parentTag = el.parentElement?.tagName.toUpperCase() ?? '';
  const display = parentTag === 'DD' ? 'block' : 'inline';

  const mathEl = el.querySelector('math');
  const mathml = mathEl ? (mathEl.cloneNode(true) as MathMLElement) : null;

  let tex =
    mathEl?.querySelector('annotation[encoding="application/x-tex"]')?.textContent?.trim()
    ?? (mathEl?.getAttribute('alttext')?.trim() ?? null)
    ?? (el.querySelector(':scope > img[alt]')?.getAttribute('alt')?.trim() ?? null);

  // If there's TeX and it's immediately followed by punctuation, include the punctuation in the TeX and remove it from the DOM
  if (display === 'block' && tex && el.nextSibling?.nodeType === Node.TEXT_NODE) {
    const m = el.nextSibling.textContent?.match(/^\s*(\.\.\.|[…,.;:!?])\s*$/u);
    if (m) {
      tex += m[1];
      el.nextSibling.remove();
    }
  }

  const img = el.querySelector<HTMLImageElement>('img.mwe-math-fallback-image-inline')
    ?? el.querySelector<HTMLImageElement>('img[src]') ?? null;

  // Only <img src=...svg>. No inline svg without fetch, so keep null for now.
  const svg: Element | null = null;

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!tex && !mathml && !img && !svg) return null;

  return { tex, mathml, svg, img, display };
}

export class WikiNode {
  title: string; // Title of this section
  level: HLevel; // 1 = <h1>, 2 = <h2>, etc.
  sectionNum: number; // Section number, starting from 0 (root section is 0)
  html: HTMLDivElement | null; // HTML content of this section
  htmlStr: string | null; // Used during serialization
  md: string; // Markdown content of this section
  raw: string; // Raw text content of this section
  children: WikiNode[]; // Child sections

  constructor(title: string, level: HLevel, sectionNum: number) {
    this.title = title;
    this.level = level;
    this.sectionNum = sectionNum;
    this.html = h('div', { class: 'wikinode-section-content' });
    this.htmlStr = null;
    this.md = '';
    this.raw = '';
    this.children = [];
  }

  static buildFromHTML(root: Element | Document, ctxs?: XletContexts): WikiNode | null {
    const title = root.querySelector('h1#firstHeading')?.textContent?.trim() ?? '';
    if (!title) return warn(null, '[xlet:wiki-build] No title found in the provided root element');

    let curSectionNum = 0;
    let currentNode = new WikiNode(title, 1, curSectionNum);
    const currentMdDiv = h('div', { __doc: root.ownerDocument ?? root });
    const rootNode = currentNode;

    for (const htmlNode of root.querySelector('div#mw-content-text > div.mw-parser-output')?.children ?? []) {
      const firstChild = htmlNode.children[0];

      if (isDiv(htmlNode) && isHeading(firstChild)) {
        const level = parseHeadingLevel(firstChild);
        const title = firstChild.textContent?.trim() ?? '';  // TODO: extract from html?
        curSectionNum++;
        // currentNode.md = currentNode.md.trim(); // alt
        currentNode.md = toMd(currentMdDiv, ctxs?.md).trim();
        currentMdDiv.innerHTML = ''; // Reset
        currentNode = new WikiNode(title, level, curSectionNum);

        // Find correct parent based on level
        let parentLevel = level - 1;
        let parentNode = null;
        while (parentLevel > 0) {
          parentNode = rootNode.getLastNodeByLevel(parentLevel);
          if (parentNode) break;
          parentLevel--;
        }
        if (!parentNode) { throw new Error(`Impossible. No parent found for section "${title}" at level ${level}`); }
        parentNode.addChild(currentNode);
      } else {
        const htmlFrag = toHtml(htmlNode, ctxs?.html);
        if (htmlFrag) {
          if (currentNode.html === null) throw new Error('Current node html is null');
          currentNode.html.appendChild(htmlFrag);
          // currentNode.md += toMd(htmlNode) + '\n\n'; // alt
          const clone = htmlNode.cloneNode(true) as HTMLElement;
          currentMdDiv.appendChild(clone);
        }
      }
    }
    // currentNode.md = currentNode.md.trim(); // alt
    currentNode.md = toMd(currentMdDiv, ctxs?.md).trim();
    return rootNode;
  }

  static buildFromParsoidHTML(root: Document | Element, ctxs?: XletContexts): WikiNode | null {
    let childElems: Element[] = [];
    let curWikiNode: WikiNode | null = null;

    if (isDoc(root)) {
      const sect0 = root.querySelector('section[data-mw-section-id="0"]');
      if (!sect0) return warn(null, '[xlet:wiki-build] No section[data-mw-section-id="0"] found in the provided document');
      const title = root.querySelector('head > title')?.textContent?.trim() ?? '';
      if (!title) return warn(null, '[xlet:wiki-build] No title found in the provided document');

      curWikiNode = new WikiNode(title, 1, 0);
      const bodyChildren = [...root.body.children].filter((el) => el !== sect0);
      childElems = [...bodyChildren, ...sect0.children];
    } else {
      const firstElem = root.firstElementChild;
      const heading = firstElem && isHeading(firstElem) ? firstElem : null;
      if (!heading) return warn(null, '[xlet:wiki-build] No heading found in the provided element');
      const title = heading.textContent?.trim() ?? '';
      if (!title) return warn(null, '[xlet:wiki-build] No title found in the provided element');
      const level = parseHeadingLevel(heading);
      const sectionId = root.getAttribute('data-mw-section-id');
      if (!sectionId) return warn(null, '[xlet:wiki-build] No data-mw-section-id found in the section element');

      curWikiNode = new WikiNode(title, level, +sectionId);
      const sectChildren = [...root.children].filter((el) => el !== heading);
      childElems = sectChildren;
    }

    const currentMdDiv = h('div', { __doc: root.ownerDocument ?? root });
    for (const child of childElems) {
      if (child.tagName.toLowerCase() === 'section') {
        curWikiNode.addChild(WikiNode.buildFromParsoidHTML(child, ctxs));
      } else {
        const htmlFrag = toHtml(child, ctxs?.html);
        if (htmlFrag) {
          curWikiNode.html!.appendChild(htmlFrag);
          currentMdDiv.appendChild(child.cloneNode(true) as Element);
        }
      }
    }
    curWikiNode.md = toMd(currentMdDiv, ctxs?.md).trim();

    return curWikiNode;
  }

  static fromPojo(pojo: WikiNode): WikiNode {
    const node = new WikiNode(pojo.title, pojo.level, pojo.sectionNum);
    node.html = null;
    node.htmlStr = pojo.htmlStr;
    node.md = pojo.md;
    node.raw = pojo.raw;
    node.children = pojo.children.map((c) => WikiNode.fromPojo(c));
    return node;
  }

  addChild(section: WikiNode | null) {
    if (section !== null) this.children.push(section);
  }

  *[Symbol.iterator](): Generator<WikiNode, void, unknown> {
    yield this;
    for (const child of this.children) {
      yield* child;
    }
  }

  find(fn: (node: WikiNode) => boolean): WikiNode | null {
    for (const node of this) {
      if (fn(node)) return node;
    }
    return null;
  }

  getNodeBySection(section: number) {
    return this.find((n) => n.sectionNum === section);
  }

  getNodeByTitle(title: string) {
    return this.find((n) => n.title === title);
  }

  getLastNodeByLevel(level: number): WikiNode | null {
    if (this.level === level) return this;
    for (let i = this.children.length - 1; i >= 0; i--) {
      const found = this.children[i].getLastNodeByLevel(level);
      if (found) return found;
    }
    return null;
  }

  // Pretty-print the tree (for debugging)
  toString(indent = 0) {
    let out = `${'  '.repeat(indent)}- ${this.title} (H${this.level}) [§${this.sectionNum}]\n`;
    for (const child of this.children) {
      out += child.toString(indent + 1);
    }
    return out;
  }

  serialize() {
    if (this.html === null) {
      // nothing to serialize
      return console.warn(`[xlet:wiki-serial] No html for section "${this.title}" (H${this.level}) [§${this.sectionNum}]`);
    }
    this.htmlStr = this.html.outerHTML;
    this.html = null;
    for (const child of this.children) {
      child.serialize();
    }
  }

  deserialize() {
    if (this.htmlStr === null) {
      // nothing to deserialize
      return console.warn(`[xlet:wiki-deserial] No htmlStr for section "${this.title}" (H${this.level}) [§${this.sectionNum}]`);
    }
    this.html = htmlToElementK(this.htmlStr, 'div', document);
    this.htmlStr = null;
    for (const child of this.children) {
      child.deserialize();
    }
  }

  getSelfMd(): string {
    const hash = '#'.repeat(this.level);
    return `${hash} ${this.title} ${hash}${this.md ? '\n\n' : ''}${this.md}`;
  }

  getSubtreeMd(): string {
    let out = this.getSelfMd();
    for (const child of this.children) {
      out += `\n\n${child.getSubtreeMd()}`;
    }
    return out;
  }
}

export function parseRawIntoSections(rawText: string): {level: number; sectionNum: number; title: string; raw: string;}[] {
  const sections: {level: number; sectionNum: number; title: string; raw: string;}[] = [];
  const sectionRegex = /^(={2,6})\s*([^=].*?[^=])\s*\1(?:\s*<!--.*?-->)*\s*$/gm;

  let match;
  let lastSectionStart = 0;
  let sectionNum = 0;
  sections.push({ level: 1, sectionNum, title: '', raw: '' }); // root section
  while ((match = sectionRegex.exec(rawText)) !== null) {
    const level = match[1].length;
    const title = match[2];
    sections[sections.length - 1].raw = rawText.slice(lastSectionStart, match.index).trim();
    lastSectionStart = match.index;
    sections.push({ level, sectionNum: ++sectionNum, title, raw: '' });
  }
  sections[sections.length - 1].raw = rawText.slice(lastSectionStart); // add last section raw text

  return sections;
}

export function populateWikiNodeWithRaw(
  root: WikiNode,
  rawText: string | undefined,
  opts: { similarityFn?: (a: string, b: string) => number; } = {}
) {
  if (!rawText) return; // nothing to populate
  const similarityFn = opts.similarityFn || jaroWinklerSimilarity;
  const nodes = [...root];
  const sections = parseRawIntoSections(rawText);
  const MIN_ACCEPTABLE_SCORE = 0.5;

  if (nodes.length !== sections.length) {
    console.warn(`[xlet:wiki-populate] Mismatch: ${nodes.length} HTML nodes vs ${sections.length} wikitext sections`);
  }

  while (nodes.length && sections.length) {
    let bestPair = null;
    let bestScore = -1;
    outer: for (let ni = 0; ni < nodes.length; ni++) {
      for (let si = 0; si < sections.length; si++) {
        if (sections[si].level !== nodes[ni].level) continue;
        let score = similarityFn(nodes[ni].title, normalizeWikitext(sections[si].title));
        if (sections[si].level === 1) {
          score = 1; // Level 1 sections are unique and always match (even if raw title is empty, which it always is)
        }
        if (score > bestScore) {
          bestScore = score;
          bestPair = { ni, si, score };
          if (score === 1) break outer; // perfect match, no need to check further
        }
      }
    }
    if (!bestPair || bestScore < MIN_ACCEPTABLE_SCORE) {
      // No more acceptable matches
      break;
    }
    // Assign and remove
    nodes[bestPair.ni].raw = sections[bestPair.si].raw;
    nodes.splice(bestPair.ni, 1);
    sections.splice(bestPair.si, 1);
  }
  if (nodes.length) console.warn(`[xlet:wiki-pop] Unmatched nodes: ${nodes.map((n) => `${n.title} (H${n.level}) [§${n.sectionNum}]`).join(', ')}`);
  if (sections.length) console.warn(`[xlet:wiki-pop] Unmatched sections: ${sections.map((s) => `${s.title} (H${s.level}) [§${s.sectionNum}]`).join(', ')}`);
}

function getRawBody(node: WikiNode): string {
  const raw = node.raw || '';
  if (node.level === 1 || !node.raw) return raw;

  const sectionRegex = /^(={2,6})\s*([^=].*?[^=])\s*\1(?:\s*<!--.*?-->)*\s*$/;
  const lines = raw.split('\n');
  if (lines.length && sectionRegex.test(lines[0])) {
    return lines.slice(1).join('\n');
  }
  return raw;
}

function getPermaUrl(srcDoc: Document): string | null {
  // classic pages
  const canonical = srcDoc.querySelector<HTMLLinkElement>('head > link[rel="canonical"]');
  if (canonical) return new URL(canonical.href, srcDoc.baseURI).href;

  // parsoid pages
  const dcLink = srcDoc.querySelector<HTMLLinkElement>('head > link[rel="dc:isVersionOf"]');
  if (dcLink) return new URL(dcLink.href, srcDoc.baseURI).href;

  return null;
}

function getRawUrl(srcDoc: Document, baseUrl: string): string {
  const altLink = srcDoc.querySelector<HTMLLinkElement>('link[rel="alternate"][type="application/x-wiki"]');
  let rawUrl = altLink?.href.includes('action=edit')
    ? altLink.href.replace(/action=edit$/, 'action=raw')
    : '';
  if (!rawUrl) {
    const baseTitle = baseUrl.match(/\/wiki\/([^#?]+)/)?.[1] || '';
    const baseDomain = baseUrl.match(/^https?:\/\/[^/]+/)?.[0] || 'https://en.wikipedia.org';
    if (baseTitle) {
      rawUrl = `${baseDomain}/w/index.php?origin=*&title=${baseTitle}&action=raw`; //&origin=*
    }
  }
  return rawUrl;
}

export function normalizeWikitext(raw: string): string {
  // Remove bold/italic
  raw = raw.replace(/'''/g, '').replace(/''/g, '');

  // Files with captions
  raw = raw.replace(/\[\[File:[^|\]]+\|[^|\]]*\|([^\]]+)\]\]/ig, '$1');
  // Internal/external links
  raw = raw.replace(/\[\[[^|\]]+\|([^\]]+)\]\]/g, '$1');
  raw = raw.replace(/\[\[([^|\]]+)\]\]/g, '$1');
  raw = raw.replace(/\[http[^\s\]]+\s+([^\]]+)\]/g, '$1');
  // <ref>...</ref> to []
  raw = raw.replace(/<ref[^>]*>.*?<\/ref>/gi, '[]');
  // Remove allowed tags, keep text
  raw = raw.replace(/<(\/?)(b|big|code|em|i|p|small|span|strong|sub|sup)[^>]*>/gi, '');
  // Trim outer whitespace
  return raw.trim();
}

async function fetchRawPage(rawUrl: string, ctxs?: XletContexts): Promise<string | undefined> {
  // override for local testing
  if (location.protocol === 'file:' && typeof window['exampleRaw'] === 'string') {
    log('[fetchRawPage] Using local override for exampleRaw');
    return window['exampleRaw'];
  }

  try {
    const res = await safeFetch(rawUrl, ctxs);
    if (!res) {
      // blocked by settings (fetchMissingContent = false)
      return undefined;
    }
    if (!res.ok) {
      return warn('', `[xlet:wik-fetch] HTTP ${res.status} for "${rawUrl}"`);
    }
    return await res.text();
  } catch (err) {
    return warn('', `[xlet:wiki-fetch] Fetch error for "${rawUrl}": ${repr(err)}`);
  }
}

export function extractFromDoc(sourceDoc: Document, ctxs?: XletContexts): WikiResult | undefined {
  const permaUrl = getPermaUrl(sourceDoc);
  if (!permaUrl) {
    return warn(undefined, '[xlet:wiki-extract] No base URL found in the document');
  }
  const rawUrl = getRawUrl(sourceDoc, permaUrl);

  const isParsoidPage = sourceDoc.querySelector('head > meta[property="mw:htmlVersion"]') !== null;
  const tree = isParsoidPage
    ? WikiNode.buildFromParsoidHTML(sourceDoc, ctxs)
    : WikiNode.buildFromHTML(sourceDoc, ctxs);

  if (tree) tree.serialize();

  const result: WikiResult = {
    data: tree,
    baseUrl: permaUrl,
    rawUrl: rawUrl,
  };

  return result;
}

type WikiPageState = {
  viewIdx: number; // Index of the current view (0 = HTML, 1 = Markdown, 2 = Raw)
  rawText?: string; // Cached raw text of the page
};

export const renderPage: RenderPage = async (
  { sourceDoc, targetDoc, ctxs, root, state }:
  { sourceDoc: Document; targetDoc: Document; ctxs?: XletContexts; root: HTMLElement; state: WikiPageState; }
) => {
  const result = extractFromDoc(sourceDoc, ctxs);
  if (!result) return warn(undefined, '[xlet:wiki-create] Failed to extract data from document');

  const { baseUrl } = result;
  const page = await createWikiPage(result, ctxs, state);
  if (!baseUrl || !page) return warn(undefined, '[xlet:wiki-render] Failed to create wiki tree from document');

  renderXletPage(page, targetDoc, root);
};

export async function createWikiPage(
  result: WikiResult, ctxs?: XletContexts, state: WikiPageState = { viewIdx: 0 }
): Promise<XletPage | undefined> {
  const { baseUrl, rawUrl, data } = result;
  if (!data) return warn(undefined, '[xlet:wiki-create] No tree data extracted from the document');

  const tree = WikiNode.fromPojo(data);

  if (!state.rawText) state.rawText = await fetchRawPage(rawUrl, ctxs);
  populateWikiNodeWithRaw(tree, state.rawText);

  const settingsLink = h('a', { href: '#' }, 'fetch settings');
  settingsLink.addEventListener('click', async (e) => {
    e.preventDefault();
    // TODO: use a data-xlet-action marker and centralize page actions in xlet-page
    // Do not import browser directly into this module (tests won't be happy).
    // wiki-page.html should source the polyfill.
    type BrowserGlobal = { browser?: { runtime?: { openOptionsPage?: () => Promise<void>; }; }; };
    const openOptsPageFn = (globalThis as BrowserGlobal).browser?.runtime?.openOptionsPage;
    if (openOptsPageFn) await openOptsPageFn();
  });
  const rawFallback = ctxs?.general?.fetchMissingContent === false
    ? h('p', {}, 'Raw wikitext is unavailable due to ', settingsLink, '.')
    : h('p', {}, 'Raw wikitext is unavailable.');

  const page: XletPage = {
    siteLabel: new URL(baseUrl).hostname,
    title: tree.title,
    views: ['html', 'md', 'raw'],
    state,
    root: wikiNodeToXletNode(tree, true, baseUrl),
    viewFallbacks: {
      raw: rawFallback,
    },
  };

  return page;
};

function wikiNodeToXletNode(node: WikiNode, isRoot = false, permalink?: string): XletNode {
  return {
    label: node.title,
    permalink: isRoot ? permalink : undefined,
    copyable: true,
    content: {
      md: node.md,
      html: node.htmlStr || undefined,
      raw: getRawBody(node) || undefined,
    },
    children: node.children.map((child) => wikiNodeToXletNode(child)),
  };
}
