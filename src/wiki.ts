/**
 * Wikipedia DOM Reference (Desktop)
 * 
 * main#content
 *   h1#firstHeading > span                       → Main title
 * 
 *   div#mw-content-text > div
 *     h[2-6]                                     → Section heading
 */

import { log, h, injectCss, createMultiToggle, multiToggleCss, isElement, isDiv, isHeading, isSpan, isText, isListItem, htmlToElementK, jaroWinklerSimilarity, isSup } from './utils.js';
import { toHtml as _toHtml, toMd as _toMd, ToMdHandler, ToHtmlOptions } from './core.js';

export type WikiResult = {
  baseUrl: string; // Base URL of the wiki page
  rawUrl: string; // Raw URL of the wiki page
  data: WikiNode; // The WikiNode tree representing the page structure
}

declare global {
  interface Window {
    exampleRaw?: string;
  }
}

function shouldSkip(node: Node|null): boolean {
  if (!node) throw new Error('shouldSkip called with null or undefined node');
  if (isText(node)) return false; // Text nodes are never ignored

  if (isElement(node)) {
    // const id = node.id || '';
    // const className = node.className || '';
    const classList = node.classList || [];
    // const aType = node.getAttribute('type') || '';

    if (classList.contains('cite-accessibility-label')) {
      return true;
    }

    return false;
  }

  return true;
}

const toMdHandlers: Record<string, ToMdHandler> = {};

function toHtmlElemHandler(node:Element, ctx:ToHtmlOptions): { skip?: boolean; node?: Node } {
  if (shouldSkip(node)) return { skip: true };
  if (node.nodeType !== Node.ELEMENT_NODE) throw new Error('toHtmlElemHandler called with non-element node'); // shouldn't happen

  const skip = false;
  let clone;

  if (isSpan(node)) {
    if (node.classList.contains('mwe-math-element')) {
      const img = node.querySelector('img.mwe-math-fallback-image-inline') as HTMLImageElement|null;
      if (!img) return { skip: true };
      clone = toHtml(img) as HTMLImageElement;
      clone.style.verticalAlign = img.style.verticalAlign;
      return { node: clone };
    }
    if (node.classList.contains('mvar') || node.classList.contains('texhtml')) {
      const keepStyles = node.classList.contains('texhtml')
        ? new Set(['display', 'margin-bottom', 'vertical-align', 'line-height', 'font-size', 'text-align', 'white-space'])
        : ctx.keepStyles;
      clone = toHtml(node, { ...ctx, skipHandler: true, keepStyles }) as HTMLSpanElement;
      if (node.classList.contains('mvar')) clone.classList.add('mvar');
      if (node.classList.contains('texhtml')) clone.classList.add('texhtml');
      return { node: clone };
    }
  }

  if (isListItem(node) && node.id.startsWith('cite_note-')) {
    clone = toHtml(node, { ...ctx, skipHandler: true }) as HTMLLIElement;
    clone.id = node.id; // preserve the ID for references
  }

  if (isSup(node) && node.classList.contains('reference') && node.id.startsWith('cite_ref-')) {
    clone = toHtml(node, { ...ctx, skipHandler: true }) as HTMLElement;
    clone.id = node.id; // preserve the ID for references
  }

  return { skip, node: clone };
}

export function toMd(node: Node|null): string {
  return _toMd(node, { shouldSkip, handlers: toMdHandlers });
}

export function toHtml(node: Node|null, opts: ToHtmlOptions = {}): Node|null {
  return _toHtml(node, { ...opts, elementHandler: toHtmlElemHandler });
}

export class WikiNode {
  title: string; // Title of this section
  level: number; // 1 = <h1>, 2 = <h2>, etc.
  sectionNum: number; // Section number, starting from 0 (root section is 0)
  html: HTMLDivElement|null; // HTML content of this section
  htmlStr: string|null; // Used during serialization
  md: string; // Markdown content of this section
  raw: string; // Raw text content of this section
  children: WikiNode[]; // Child sections

  constructor(title:string, level:number, sectionNum:number) {
    this.title = title;
    this.level = level;
    this.sectionNum = sectionNum;
    this.html = h('div', { class: 'wikinode-section-content' }) as HTMLDivElement;
    this.htmlStr = null;
    this.md = '';
    this.raw = '';
    this.children = [];
  }

  static buildFromHTML(root:Document): WikiNode {
    if (!root || !root.querySelector) {
      throw new Error('Invalid root element provided for WikiNode.buildFromHTML');
    }
    const title = root.querySelector('h1#firstHeading > span')?.textContent?.trim() ?? '';
    if (!title) {
      throw new Error('No title found in the provided root element');
    }

    let curSectionNum = 0;
    let currentNode = new WikiNode(title, 1, curSectionNum);
    const rootNode = currentNode;

    for (const htmlNode of root.querySelector('div#mw-content-text > div')?.childNodes ?? []) {
      if (!isElement(htmlNode)) continue;
      const firstChild = htmlNode.children?.[0];
      if (isDiv(htmlNode) && isHeading(firstChild)) {
        const level = parseInt(firstChild.tagName[1]);
        const title = firstChild.textContent?.trim() ?? '';  // TODO: extract from html?
        curSectionNum++;
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
        const htmlFrag = toHtml(htmlNode);
        if (htmlFrag) {
          if (currentNode.html === null) throw new Error('Current node html is null');
          currentNode.html.appendChild(htmlFrag);
          currentNode.md += toMd(htmlNode);
        }
      }
    }
    return rootNode;
  }

  static fromPojo(pojo: WikiNode): WikiNode {
    const node = new WikiNode(pojo.title, pojo.level, pojo.sectionNum);
    node.html = null;
    node.htmlStr = pojo.htmlStr;
    node.md = pojo.md;
    node.raw = pojo.raw;
    node.children = (pojo.children || []).map(WikiNode.fromPojo);
    return node;
  }

  addChild(section:WikiNode) {
    this.children.push(section);
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

  getNodeBySection(section:number) {
    return this.find(n => n.sectionNum === section);
  }

  getNodeByTitle(title:string) {
    return this.find(n => n.title === title);
  }

  getLastNodeByLevel(level:number): WikiNode|null {
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
      console.warn(`[WikiNode.serialize] No html for section "${this.title}" (H${this.level}) [§${this.sectionNum}]`);
      return; // nothing to serialize
    }
    this.htmlStr = this.html?.outerHTML ?? '';
    this.html = null;
    for (const child of this.children) {
      child.serialize();
    }
  }

  deserialize() {
    if (this.htmlStr === null) {
      console.warn(`[WikiNode.deserialize] No htmlStr for section "${this.title}" (H${this.level}) [§${this.sectionNum}]`);
      return; // nothing to deserialize
    }
    this.html = htmlToElementK(this.htmlStr, 'div');
    this.htmlStr = null;
    for (const child of this.children) {
      child.deserialize();
    }
  }
}

  export function parseRawIntoSections(rawText: string): {level:number, sectionNum:number, title:string, raw:string}[] {
    const sections: {level:number, sectionNum:number, title:string, raw:string}[] = [];
    const sectionRegex = /^(={2,6})\s*([^=].*?[^=])\s*\1\s*$/gm;

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
  rawText: string,
  opts: { similarityFn?: (a: string, b: string) => number } = {}
) {
  const similarityFn = opts.similarityFn || jaroWinklerSimilarity;
  const nodes = [...root];
  const sections = parseRawIntoSections(rawText);
  const MIN_ACCEPTABLE_SCORE = 0.5;

  if (nodes.length !== sections.length) {
    console.warn(`Mismatch: ${nodes.length} HTML nodes vs ${sections.length} wikitext sections`);
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
  if (nodes.length) console.warn(`Unmatched nodes: ${nodes.map(n => `${n.title} (H${n.level}) [§${n.sectionNum}]`).join(', ')}`);
  if (sections.length) console.warn(`Unmatched sections: ${sections.map(s => `${s.title} (H${s.level}) [§${s.sectionNum}]`).join(', ')}`);
}

function renderHtml(node: WikiNode): HTMLDivElement {
  const titleElem = h(`h${node.level}`, { class: 'html-wikinode-title' }, node.title);
  const container = h('div', { class: 'html-wikinode-section' }, titleElem) as HTMLDivElement;
  container.id = `html-section-${node.sectionNum}`;

  if (node.html) container.appendChild(node.html);
  for (const child of node.children) {
    container.appendChild(renderHtml(child));
  }
  return container;
}

function renderMd(node: WikiNode): HTMLDivElement {
  const titleElem = h(`h${node.level}`, { class: 'md-wikinode-title' }, node.title);
  const container = h('div', { class: 'md-wikinode-section' }, titleElem) as HTMLDivElement;
  container.id = `md-section-${node.sectionNum}`;

  // const out = `${'='.repeat(node.level)} ${node.title} ${'='.repeat(node.level)}\n\n${node.md}`;
  const pre = h('pre', { class: 'md-text' }, node.md);
  container.appendChild(pre);
  for (const child of node.children) {
    container.appendChild(renderMd(child));
  }
  return container;
}

function renderRaw(node: WikiNode): HTMLDivElement {
  const titleElem = h(`h${node.level}`, { class: 'raw-wikinode-title' }, node.title);
  const container = h('div', { class: 'raw-wikinode-section' }, titleElem) as HTMLDivElement;
  container.id = `raw-section-${node.sectionNum}`;

  const pre = h('pre', { class: 'raw-text' }, node.raw);
  container.appendChild(pre);
  for (const child of node.children) {
    container.appendChild(renderRaw(child));
  }
  return container;
}

function getBaseAndRawUrl(root:Document): { baseUrl: string; rawUrl: string } {
  const baseLink = root.querySelector('link[rel="canonical"]') as HTMLLinkElement|null;
  const baseUrl = baseLink?.href ?? '';

  const altLink = root.querySelector('link[rel="alternate"][type="application/x-wiki"]') as HTMLLinkElement|null;
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

  return { baseUrl, rawUrl };
}

export function normalizeWikitext(raw:string): string {
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

async function fetchRawPage(rawUrl: string): Promise<string> {
  // override for local testing
  if (location.protocol === 'file:' && typeof window['exampleRaw'] === 'string') {
    log('[fetchRawPage] Using local override for exampleRaw');
    return window['exampleRaw'];
  }

  try {
    const res = await fetch(rawUrl);
    return res.ok
      ? await res.text()
      : (console.warn(`[fetchRawPage] HTTP ${res.status} for "${rawUrl}"`), '');
  } catch (err) {
    console.warn(`[fetchRawPage] Fetch error for "${rawUrl}":`, err);
    return '';
  }
}

export async function extractFromDoc(root: Document = document): Promise<WikiResult|undefined> {
  const { baseUrl, rawUrl } = getBaseAndRawUrl(root);
  if (!baseUrl) {
    return;
  }

  const tree = WikiNode.buildFromHTML(root);
  tree.serialize();
  const result: WikiResult = {
    data: tree,
    baseUrl: baseUrl,
    rawUrl: rawUrl,
  };

  return result;
}

export async function createPage(result: WikiResult, doc:Document): Promise<void> {
  const { baseUrl, rawUrl, data } = result;

  // --- restore WikiNode tree after serialization ---
  const tree = WikiNode.fromPojo(data);
  tree.deserialize();

  const rawText = await fetchRawPage(rawUrl);
  // log(rawText.slice(0, 1000), '...');
  populateWikiNodeWithRaw(tree, rawText);

  const topHeading = h('h1', { class: 'top-heading' }, 'Extractlet · Wiki');
  const permaLink = h('a', { href: baseUrl, target: '_blank', class: 'perma-link' }, baseUrl);
  const topBar = h('div', { class: 'top-bar' }, topHeading, permaLink);
  doc.body.appendChild(topBar);

  const views = [
    { key: 'html', label: 'HTML', showClass: 'show-html', idPrefix: 'html-section-', observeClass: 'html-wikinode-title', containerClass: 'html-view' },
    { key: 'md', label: 'Markdown', showClass: 'show-md', idPrefix: 'md-section-', observeClass: 'md-wikinode-title', containerClass: 'md-view' },
    { key: 'raw', label: 'Raw', showClass: 'show-raw', idPrefix: 'raw-section-', observeClass: 'raw-wikinode-title', containerClass: 'raw-view' },
  ];
  let currentSectionNum: number|null = null;
  let currentViewState = 0; // html default view

  const viewToggle = createMultiToggle({
    initState: currentViewState,
    labels: views.map(v => v.label),
    labelSide: 'right',
    onToggle: (state) => {
      const prevView = views[currentViewState];
      currentViewState = state;

      // Determine visible section in previous view
      const toggleBar = doc.querySelector('.view-toggle') as HTMLElement;
      if (!toggleBar) return; // no toggle bar probably means page not yet rendered (or a bug..)
      const focusLine = toggleBar.getBoundingClientRect().bottom + 10;

      const headings = doc.querySelectorAll(`.${prevView.observeClass}`);
      let bestHeading: HTMLElement | null = null;
      let bestDelta = Infinity;

      for (const el of headings) {
        const rect = el.getBoundingClientRect();
        const delta = Math.abs(focusLine - rect.top);
        if (delta < bestDelta) {
          bestHeading = el as HTMLElement;
          bestDelta = delta;
        }
      }

      const activeSectionNum = bestHeading?.parentElement?.id?.match(/-(\d+)$/);
      const mainContainer = doc.querySelector(`.${prevView.containerClass}`) as HTMLElement | null;
      const isPreambleActive = mainContainer ? mainContainer.getBoundingClientRect().top > focusLine : false;
      currentSectionNum = (activeSectionNum && !isPreambleActive) ? +activeSectionNum[1] : null;

      // Switch view
      const nextView = views[state];
      doc.body.classList.remove(...views.map(v => v.showClass));
      doc.body.classList.add(nextView.showClass);

      // Scroll to equivalent section
      if (currentSectionNum !== null) {
        const targetId = `${nextView.idPrefix}${currentSectionNum}`;
        const targetEl = doc.getElementById(targetId);
        if (targetEl) {
          const sectionTop = targetEl.getBoundingClientRect().top;
          const offset = sectionTop - focusLine;
          window.scrollBy({ top: offset, behavior: 'auto' });
        }
      }
    },
  });

  injectCss(multiToggleCss, { id: 'wiki-multi-toggle', doc });
  const viewToggleContainer = h('div', { class: 'view-toggle' }, viewToggle);
  doc.body.appendChild(viewToggleContainer);

  // --- Render views ---
  const html = h('div', { class: 'html-view' }, renderHtml(tree));
  const md = h('div', { class: 'md-view' }, renderMd(tree));
  const raw = h('div', { class: 'raw-view' }, renderRaw(tree));
  const contentBox = h('div', { class: 'content-box' }, html, md, raw);
  doc.body.appendChild(contentBox);
}
