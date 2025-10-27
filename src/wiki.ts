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


import { log, h, injectCss, createMultiToggle, multiToggleCss, isElement, isDiv, isHeading, isSpan, isText, isListItem, htmlToElementK, jaroWinklerSimilarity, isSup, createCopyButton, copyButtonCss, warn, isHTML, isDoc, warnNull } from './utils.js';
import { toHtml as _toHtml, toMd as _toMd, ToHtmlOptions, ToMdContext, ToMdElementHandler } from './core.js';

export type WikiResult = {
  baseUrl: string; // Base URL of the wiki page
  rawUrl: string; // Raw URL of the wiki page
  data: WikiNode|null; // The WikiNode tree representing the page structure
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
    const tag = node.tagName.toUpperCase();
    if (['META', 'STYLE', 'LINK'].includes(tag)) return true;
    // const id = node.id || '';
    // const aType = node.getAttribute('type') || '';
    
    const classList = node.classList || [];
    if (classList.contains('cite-accessibility-label')) return true;
    if (classList.contains('mw-empty-elt')) return true;

    if (isHTML(node)) {
      if (node.style.display === 'none') return true;
    }
    return false;
  }

  // if it's not an elem or text, always skip
  return true;
}

const toMdElemHandler: ToMdElementHandler = (node, _ctx, _gc) => {
  if (shouldSkip(node)) return { skip: true };

  // if (node.tagName === 'SPAN' && node.getAttribute('typeof') === 'mw:Entity') {
  //   const md = node.textContent; // node.textContent ?? '';
  //   log('typeof mw:Entity', node, node.textContent, node.innerHTML);
  //   return { md };
  // }
  
  // const tag = node.tagName.toUpperCase();
  // if (tag === 'FIGURE') {
  //   const captionNode = node.querySelector('figcaption');  // case sensitive??
  //   const parts = [];
  //   for (const child of node.childNodes) {
  //     if (captionNode && child === captionNode) continue;
  //     parts.push(toMd(child, ctx));
  //   }

  //   let md = ':::figure\n';
  //   md += parts.filter(Boolean).join('\n');
  //   if (parts.length && captionNode) md += '\n';
  //   if (captionNode) {
  //     const caption = toMd(captionNode, ctx).trim();  // captionNode.textContent??
  //     if (caption) md += '\n' + caption;
  //   }
  //   md += '\n:::';
  //   return { md };
  // }
  return {};
};

export function toMd(node: Node|null, ctx: Partial<ToMdContext> = {}): string {
  return _toMd(node, { ...ctx, toMdElementHandler: toMdElemHandler });
}

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

export function toHtml(node: Node|null, opts: ToHtmlOptions = {}): Node|null {
  return _toHtml(node, { ...opts, toHtmlElementHandler: toHtmlElemHandler });
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

  static buildFromHTML(root:Document|HTMLElement): WikiNode|null {
    const title = root.querySelector('h1#firstHeading')?.textContent?.trim() ?? '';
    if (!title) return warnNull('No title found in the provided root element');

    let curSectionNum = 0;
    let currentNode = new WikiNode(title, 1, curSectionNum);
    const currentMdDiv = h('div') as HTMLDivElement;
    const rootNode = currentNode;

    for (const htmlNode of root.querySelector('div#mw-content-text > div.mw-parser-output')?.children ?? []) {
      const firstChild = htmlNode.children?.[0];

      if (isDiv(htmlNode) && isHeading(firstChild)) {
        const level = parseInt(firstChild.tagName[1]);
        const title = firstChild.textContent?.trim() ?? '';  // TODO: extract from html?
        curSectionNum++;
        // currentNode.md = currentNode.md.trim(); // alt
        currentNode.md = toMd(currentMdDiv).trim();
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
        const htmlFrag = toHtml(htmlNode);
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
    currentNode.md = toMd(currentMdDiv).trim();
    return rootNode;
  }

  static buildFromParsoidHTML(root:Document|Element): WikiNode|null {
    let childElems: Element[] = [];
    let curWikiNode: WikiNode|null = null;

    if (isDoc(root)) {
      const sect0 = root.querySelector('section[data-mw-section-id="0"]');
      if (!sect0) return warnNull('No section[data-mw-section-id="0"] found in the provided document');
      const title = root.querySelector('head > title')?.textContent?.trim() ?? '';
      if (!title) return warnNull('No title found in the provided document');
      
      curWikiNode = new WikiNode(title, 1, 0);
      const bodyChildren = [...root.body.children].filter(el => el !== sect0);
      childElems = [...bodyChildren, ...sect0.children];
    } else {
      const firstElem = root.firstElementChild;
      const heading = firstElem && isHeading(firstElem) ? firstElem : null;
      if (!heading) return warnNull('No heading found in the provided element');
      const title = heading.textContent?.trim() ?? '';
      if (!title) return warnNull('No title found in the provided element');
      const level = heading.tagName[1];
      const sectionId = root.getAttribute('data-mw-section-id');
      if (!sectionId) return warnNull('No data-mw-section-id found in the section element');

      curWikiNode = new WikiNode(title, +level, +sectionId);
      const sectChildren = [...root.children].filter(el => el !== heading);
      childElems = sectChildren;
    }

    const currentMdDiv = h('div') as HTMLDivElement;
    for (const child of childElems) {
      if (child.tagName.toLowerCase() === 'section') {
        curWikiNode.addChild(WikiNode.buildFromParsoidHTML(child));
      } else {
        const htmlFrag = toHtml(child);
        if (htmlFrag) {
          curWikiNode.html!.appendChild(htmlFrag);
          currentMdDiv.appendChild(child.cloneNode(true) as Element);
        }
      }
    }
    curWikiNode.md = toMd(currentMdDiv).trim();

    return curWikiNode;
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

  addChild(section:WikiNode|null) {
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

  getFullMd(): string {
    return `${'='.repeat(this.level)} ${this.title} ${'='.repeat(this.level)}\n\n${this.md}`;
  }
}

export function parseRawIntoSections(rawText: string): {level:number, sectionNum:number, title:string, raw:string}[] {
  const sections: {level:number, sectionNum:number, title:string, raw:string}[] = [];
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
  const copyText = node.html?.outerHTML || ''; // TODO: use node.md!! node.html is only for dev
  const copyBtn = createCopyButton(copyText, "Copied HTML!");
  const titleElem = h(`h${node.level}`, { class: 'html-wikinode-title' }, node.title);
  const titleBar = h('div', { class: 'wikinode-titlebar' }, titleElem, copyBtn);
  const container = h('div', { class: 'html-wikinode-section' }, titleBar) as HTMLDivElement;
  container.id = `html-section-${node.sectionNum}`;

  if (node.html) container.appendChild(node.html);
  for (const child of node.children) {
    container.appendChild(renderHtml(child));
  }
  return container;
}

function renderMd(node: WikiNode): HTMLDivElement {
  const copyBtn = createCopyButton(node.getFullMd(), "Copied Markdown!");
  const titleElem = h(`h${node.level}`, { class: 'md-wikinode-title' }, node.title);
  const titleBar = h('div', { class: 'wikinode-titlebar' }, titleElem, copyBtn);
  const container = h('div', { class: 'md-wikinode-section' }, titleBar) as HTMLDivElement;
  container.id = `md-section-${node.sectionNum}`;

  // const out = `${'='.repeat(node.level)} ${node.title} ${'='.repeat(node.level)}\n\n${node.md}`;
  const textElem = h('p', { class: 'md-text' }, node.md);
  container.appendChild(textElem);
  for (const child of node.children) {
    container.appendChild(renderMd(child));
  }
  return container;
}

function renderRaw(node: WikiNode): HTMLDivElement {
  const copyBtn = createCopyButton(node.raw, "Copied Wikitext!");
  const titleElem = h(`h${node.level}`, { class: 'raw-wikinode-title' }, node.title);
  const titleBar = h('div', { class: 'wikinode-titlebar' }, titleElem, copyBtn);
  const container = h('div', { class: 'raw-wikinode-section' }, titleBar) as HTMLDivElement;
  container.id = `raw-section-${node.sectionNum}`;

  const rawBody = stripHeading(node);
  const textElem = h('p', { class: 'raw-text' }, rawBody);
  container.appendChild(textElem);
  for (const child of node.children) {
    container.appendChild(renderRaw(child));
  }
  return container;

  // --- helper fn ----
  function stripHeading(node: WikiNode): string {
    const raw = node.raw || '';
    if (node.level === 1 || !node.raw) return raw;

    const sectionRegex = /^(={2,6})\s*([^=].*?[^=])\s*\1(?:\s*<!--.*?-->)*\s*$/;
    const lines = raw.split('\n');
    if (lines.length && sectionRegex.test(lines[0])) {
      return lines.slice(1).join('\n');
    }
    return raw;
  }
}

function getPermaUrl(doc: Document): string|null {
  // classic pages
  const canonical = doc.querySelector('head > link[rel="canonical"]') as HTMLLinkElement|null;
  if (canonical) return new URL(canonical.href, doc.baseURI).href;

  // parsoid pages
  const dcLink = doc.querySelector('head > link[rel="dc:isVersionOf"]') as HTMLLinkElement|null;
  if (dcLink) return new URL(dcLink.href, doc.baseURI).href;

  return null;
}

function getRawUrl(root: Document, baseUrl: string): string {
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
  return rawUrl;
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
  const permaUrl = getPermaUrl(root);
  if (!permaUrl) {
    console.warn('[extractFromDoc] No base URL found in the document');
    return;
  }
  const rawUrl = getRawUrl(root, permaUrl);
  
  const isParsoidPage = root.querySelector('head > meta[property="mw:htmlVersion"]') !== null;
  const tree = isParsoidPage ? WikiNode.buildFromParsoidHTML(root) : WikiNode.buildFromHTML(root);

  if (tree) tree.serialize();

  const result: WikiResult = {
    data: tree,
    baseUrl: permaUrl,
    rawUrl: rawUrl,
  };

  return result;
}

function getCopyPreamble(url: string): string {
  const copyArr: string[] = [];
  copyArr.push(
    '===========================================',
    '           Extractlet · Wiki',
    '===========================================',
    `URL: ${url}`
  );
  return copyArr.join('\n');
}

export async function createPage(result: WikiResult, doc:Document): Promise<void> {
  injectCss(multiToggleCss, { id: 'wiki-multi-toggle', doc });
  injectCss(copyButtonCss, { id: 'wiki-copy-button', doc });

  // --- passed data from background script ---
  const { baseUrl, rawUrl, data } = result;
  if (!data) return warn('No tree data provided to createPage');

  // --- restore WikiNode tree after serialization ---
  const tree = WikiNode.fromPojo(data);
  tree.deserialize();

  // --- fetch raw wikitext and add it to the tree ---
  const rawText = await fetchRawPage(rawUrl);
  populateWikiNodeWithRaw(tree, rawText);

  // --- There are 3 views: HTML, Markdown, Raw ---
  type ViewKey = 'html' | 'md' | 'raw';
  const viewKeys: ViewKey[] = ['html', 'md', 'raw'];
  const views: Record<
    ViewKey,
    {
      label: string;
      showClass: string;
      idPrefix: string;
      observeClass: string;
      containerClass: string;
      getCopyAllText: () => string;
      getCopyAllResponse: () => string;
      getCopyAllHint: () => string;
    }> =
    {
    html: {
      label: 'HTML',
      showClass: 'show-html',
      idPrefix: 'html-section-',
      observeClass: 'html-wikinode-title',
      containerClass: 'html-view',
      getCopyAllText: () => `${getCopyPreamble(baseUrl)}\n\n${[...tree].map(n => n.getFullMd()).join('\n\n')}`,
      getCopyAllResponse: () => 'Copied all sections as Markdown!',
      getCopyAllHint: () => 'Copy all sections as Markdown',
    },
    md: {
      label: 'Markdown',
      showClass: 'show-md',
      idPrefix: 'md-section-',
      observeClass: 'md-wikinode-title',
      containerClass: 'md-view',
      getCopyAllText: () => `${getCopyPreamble(baseUrl)}\n\n${[...tree].map(n => n.getFullMd()).join('\n\n')}`,
      getCopyAllResponse: () => 'Copied all sections as Markdown!',
      getCopyAllHint: () => 'Copy all sections as Markdown',
    },
    raw: {
      label: 'Wikitext',
      showClass: 'show-raw',
      idPrefix: 'raw-section-',
      observeClass: 'raw-wikinode-title',
      containerClass: 'raw-view',
      getCopyAllText: () => `${getCopyPreamble(baseUrl)}\n\n${[...tree].map(n => n.raw).join('\n\n')}`,
      getCopyAllResponse: () => 'Copied all sections as Wikitext!',
      getCopyAllHint: () => 'Copy all sections as Wikitext',
    },
  };

  let currentSectionNum: number|null = null;
  let currentView: ViewKey = 'html';

  const topHeading = h('h1', { class: 'top-heading' }, 'Extractlet · Wiki');
  const copyAllButton = createCopyButton(
    () => views[currentView].getCopyAllText(),
    () => views[currentView].getCopyAllResponse(),
    () => views[currentView].getCopyAllHint()
  );
  const topBar = h('div', { class: 'top-bar' }, topHeading, copyAllButton);
  doc.body.appendChild(topBar);

  const permaLink = h('a', { href: baseUrl, target: '_blank', class: 'perma-link' }, baseUrl);
  doc.body.appendChild(permaLink);

  const viewToggle = createMultiToggle({
    initState: viewKeys.indexOf(currentView),
    labels: viewKeys.map(vk => views[vk].label),
    labelSide: 'right',
    onToggle: (state) => {
      const prevView = views[currentView];
      currentView = viewKeys[state];

      // Determine visible section in previous view
      const toggleBar = doc.querySelector('.view-toggle') as HTMLElement | null;
      if (!toggleBar) return warn("Toggle bar (.view-toggle) not found: UI may not be fully rendered.");

      const focusLine = toggleBar.getBoundingClientRect().bottom + 10;

      const headings = doc.querySelectorAll(`.${prevView.observeClass}`);
      if (headings.length === 0) return warn(`No headings found with class ${prevView.observeClass}. View state: ${currentView}.`); 

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

      if (!bestHeading) return warn("No bestHeading found despite non-empty headings list. Possible DOM error.");
      const titlebar = bestHeading.parentElement;
      if (!titlebar || !isDiv(titlebar)) return warn("Best heading's parent is not a div. Possible DOM structure change.");
      const sectionDiv = titlebar.parentElement;
      if (!sectionDiv || !isDiv(sectionDiv)) return warn("Best heading's grandparent is not a div. Possible DOM structure change.");
      const activeSectionNum = sectionDiv.id?.match(/-(\d+)$/)?.[1];
      if (!activeSectionNum) return warn("Active section number not found in sectionDiv ID:", sectionDiv.id, sectionDiv);
      const mainContainer = doc.querySelector(`.${prevView.containerClass}`) as HTMLElement | null;
      if (!mainContainer) return warn(`Main container not found with class ${prevView.containerClass}. Possible DOM structure change.`);
      const isPreambleActive = mainContainer ? mainContainer.getBoundingClientRect().top > focusLine : false;
      currentSectionNum = !isPreambleActive ? +activeSectionNum : null;

      // Switch view
      const nextView = views[currentView];
      doc.body.classList.remove(...viewKeys.map(vk => views[vk].showClass));
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

  const viewToggleContainer = h('div', { class: 'view-toggle' }, viewToggle);
  doc.body.appendChild(viewToggleContainer);

  // --- Render views ---
  const html = h('div', { class: 'html-view' }, renderHtml(tree));
  const md = h('div', { class: 'md-view' }, renderMd(tree));
  const raw = h('div', { class: 'raw-view' }, renderRaw(tree));
  const contentBox = h('div', { class: 'content-box' }, html, md, raw);
  doc.body.appendChild(contentBox);
  viewToggle.init(); // init at the end to ensure all dom elements used by onToggle are present
}
