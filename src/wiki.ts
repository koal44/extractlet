/**
 * Wikipedia DOM Reference (Desktop)
 * 
 * main#content
 *   h1#firstHeading > span                       → Main title
 * 
 *   div#mw-content-text > div
 *     p                                          → Paragraph
 *     h2                                         → Section heading
 *     h3                                         → Subsection heading
 *     ul / ol                                    → Lists
 *     blockquote                                 → Blockquotes (rare)
 *     pre / code                                 → Preformatted/code blocks (e.g., from templates)
 *     table                                      → Tables (infoboxes, navboxes, etc.)
 *     div.reflist                                → Reference list (footnotes)
 *     div.thumb                                  → Inline images/thumbnails
 *     div.gallery                                → Image galleries
 *     sup.reference                              → Inline citation markers
 *     div.hatnote                                → Notes (e.g., disambiguation, summary boxes)
 */

import { log, h, injectCss, createMultiToggle, multiToggleCss, escapeRegExp, isElement, isDiv, isHeading, isSpan, isText, isListItem, htmlToElementK } from './utils.js';
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
    // const aType = node.getAttribute('type') || '';

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

  return { skip, node: clone };
}

export function toMd(node: Node|null): string {
  return _toMd(node, { shouldSkip, handlers: toMdHandlers });
}

export function toHtml(node: Node|null, opts: ToHtmlOptions = {}): Node|null {
  return _toHtml(node, { ...opts, elementHandler: toHtmlElemHandler });
}

class WikiNode {
  title: string; // Title of this section
  level: number; // 1 = <h1>, 2 = <h2>, etc.
  section: number; // Section number, starting from 0 (root section is 0)
  html: HTMLDivElement|null; // HTML content of this section
  htmlStr: string|null; // Used during serialization
  md: string; // Markdown content of this section
  raw: string; // Raw text content of this section
  children: WikiNode[]; // Child sections

  constructor(title:string, level:number, section:number) {
    this.title = title;
    this.level = level;
    this.section = section;
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

    let curSection = 0;
    let currentNode = new WikiNode(title, 1, curSection);
    const rootNode = currentNode;

    for (const htmlNode of root.querySelector('div#mw-content-text > div')?.childNodes ?? []) {
      if (!isElement(htmlNode)) continue;
      const firstChild = htmlNode.children?.[0];
      if (isDiv(htmlNode) && isHeading(firstChild)) {
        const level = parseInt(firstChild.tagName[1]);
        const title = firstChild.textContent?.trim() ?? '';  // TODO: extract from html?
        curSection++;
        currentNode = new WikiNode(title, level, curSection);

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

  static reviveWikiNode(pojo: any): WikiNode {
    const node = new WikiNode(pojo.title, pojo.level, pojo.section);
    node.html = null;
    node.htmlStr = pojo.htmlStr;
    node.md = pojo.md;
    node.raw = pojo.raw;
    node.children = (pojo.children || []).map(WikiNode.reviveWikiNode);
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
    return this.find(n => n.section === section);
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
    let out = `${'  '.repeat(indent)}- ${this.title} (H${this.level}) [§${this.section}]\n`;
    for (const child of this.children) {
      out += child.toString(indent + 1);
    }
    return out;
  }

  populateRaw(rawText:string): void {
    const marker = '='.repeat(this.level);
    const title = this.title.trim();

    // Find section start
    let startIdx = 0;
    let headingSkipIdx = 0;
    if (this.level > 1) {
      const headingRegex = new RegExp(`^${marker}\\s*${escapeRegExp(title)}\\s*${marker}\\s*$`, 'm');
      const match = headingRegex.exec(rawText);
      if (!match) {
        console.warn(`[WikiNode.populateRaw] No section match for "${title}"`);
        console.warn(`rawText: "${rawText.slice(0, 100)}..."`);
        this.raw = '';
        return;
      }
      startIdx = match.index;
      headingSkipIdx = startIdx + match[0].length;
    }

    // Find next section end
    const rest = rawText.slice(headingSkipIdx);
    const nextSectionRegex = /^(={1,6})\s*[^=].*?[^=]\s*\1\s*$/gm;
    const nextMatch = nextSectionRegex.exec(rest);
    const endIdx = nextMatch ? headingSkipIdx + nextMatch.index : rawText.length;

    this.raw = rawText.slice(startIdx, endIdx).trim();
  }

  static parseRawIntoSections(rawText: string): {title:string, rawText:string}[] {
    const sections: {title:string, rawText:string}[] = [];
    const sectionRegex = /^(={1,6})\s*([^=].*?[^=])\s*\1\s*$/gm; // Matches headings with 1-6 equals signs
    let match;

    while ((match = sectionRegex.exec(rawText)) !== null) {
      const title = match[2].trim();
      const startIdx = match.index + match[0].length;
      const endIdx = sectionRegex.lastIndex;
      const sectionRaw = rawText.slice(startIdx, endIdx).trim();
      sections.push({ title, rawText: sectionRaw });
    }

    return sections;
  }

  serialize() {
    if (this.html === null) {
      console.warn(`[WikiNode.serialize] No html for section "${this.title}" (H${this.level}) [§${this.section}]`);
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
      console.warn(`[WikiNode.deserialize] No htmlStr for section "${this.title}" (H${this.level}) [§${this.section}]`);
      return; // nothing to deserialize
    }
    this.html = htmlToElementK(this.htmlStr, 'div');
    this.htmlStr = null;
    for (const child of this.children) {
      child.deserialize();
    }
  }
}

function renderHtml(node: WikiNode): HTMLDivElement {
  const titleElem = h(`h${node.level}`, {}, node.title);
  const container = h('div', { class: 'wikinode-section' }, titleElem) as HTMLDivElement;

  if (node.html) container.appendChild(node.html);
  for (const child of node.children) {
    container.appendChild(renderHtml(child));
  }
  return container;
}

function renderMd(node: WikiNode): string {
  let out = `${'='.repeat(node.level)} ${node.title.trim()} ${'='.repeat(node.level)}\n\n`;
  out += node.md ? node.md + '\n\n' : '';
  for (const child of node.children) {
    out += renderMd(child);
  }
  return out;
}

function renderRaw(node: WikiNode): string {
  let out = node.raw ? node.raw + '\n\n' : '';
  for (const child of node.children) {
    out += renderRaw(child);
  }
  return out;
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
  const tree = WikiNode.reviveWikiNode(data);
  tree.deserialize();

  const rawText = await fetchRawPage(rawUrl);
  // log(rawText.slice(0, 1000), '...');
  for (const node of tree) node.populateRaw(rawText);

  injectCss(multiToggleCss, { id: 'wiki-multi-toggle', doc });

  const topHeading = h('h1', { class: 'top-heading' }, 'Extractlet · Wiki');
  const permaLink = h('a', { href: baseUrl, target: '_blank', class: 'perma-link' }, baseUrl);
  const viewToggle = createMultiToggle({
    initState: 0,
    onToggle: (state) => {
      doc.body.classList.remove('show-html', 'show-md', 'show-raw');
      doc.body.classList.add(['show-html', 'show-md', 'show-raw'][state]);
    },
    labels: ['html', 'md', 'raw'],
    labelSide: 'right',
  });
  const topBar = h('div', { class: 'top-bar' }, topHeading, permaLink, viewToggle);
  doc.body.appendChild(topBar);

  // --- Render views ---
  const html = h('div', { class: 'html-view' }, renderHtml(tree));
  const md = h('pre', { class: 'md-view' }, renderMd(tree));
  const raw = h('pre', { class: 'raw-view' }, renderRaw(tree));
  const contentBox = h('div', { style: 'margin-top: 3em;' }, html, md, raw);
  doc.body.appendChild(contentBox);
}
