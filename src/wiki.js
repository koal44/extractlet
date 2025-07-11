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
 * 
 */

import { log, h, injectCss, createMultiToggle, multiToggleCss, createCopyButton, copyButtonCss, escapeRegExp } from './utils.js';
import { baseCss, toHtml as _toHtml, toMd as _toMd } from './core.js';

function shouldSkip(node) {
  if (!node) throw new Error('shouldSkip called with null or undefined node');
  if (node.nodeType === Node.TEXT_NODE) return false; // Text nodes are never ignored

  if (node.nodeType === Node.ELEMENT_NODE) {
    // const id = node.id || '';
    // const className = node.className || '';
    // const aType = node.getAttribute('type') || '';

    return false;
  }

  return true;
}

const toMdHandlers = {};

function toHtmlElemHandler(node, ctx) {
  if (shouldSkip(node)) return { skip: true };
  if (node.nodeType !== Node.ELEMENT_NODE) throw new Error('toHtmlElemHandler called with non-element node'); // shouldn't happen

  return { skip: false, node: null };
}

export function toMd(node) {
  return _toMd(node, { shouldSkip, handlers: toMdHandlers });
}

export function toHtml(node) {
  return _toHtml(node, { elementHandler: toHtmlElemHandler });
}

class WikiNode {
  constructor(title, level, section) {
    this.title = title;
    this.level = level; // 2 = <h2>, 3 = <h3>, etc.
    this.section = section;
    this.html = h('div', { class: 'wiki-node' });
    this.md = '';
    this.raw = '';
    this.children = [];
  }

  static buildFromHTML(root) {
    if (!root || !root.querySelector) {
      throw new Error('Invalid root element provided for WikiNode.buildFromHTML');
    }
    const title = root.querySelector('h1#firstHeading > span')?.textContent.trim() || '';
    if (!title) {
      throw new Error('No title found in the provided root element');
    }
    const rootNode = new WikiNode(title, 1, -1);
    let curSection = 0;
    let currentNode = rootNode;

    for (const htmlNode of root.querySelector('div#mw-content-text > div').childNodes) {
      const firstChild = htmlNode.children?.[0];
      if (htmlNode.tagName === 'DIV' && /^H[2-6]$/.test(firstChild?.tagName)) {
        const level = parseInt(firstChild.tagName[1]);
        const title = firstChild.textContent.trim();
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
          currentNode.html.appendChild(toHtml(htmlNode));
          currentNode.md += toMd(htmlNode);
        }
      }
    }
    return rootNode;
  }
  
  addChild(section) {
    this.children.push(section);
  }

  *[Symbol.iterator]() {
    yield this;
    for (const child of this.children) {
      yield* child;
    }
  }

  find(fn) {
    for (const node of this) {
      if (fn(node)) return node;
    }
    return null;
  }

  getNodeBySection(section) {
    return this.find(n => n.section === section);
  }

  getNodeByTitle(title) {
    return this.find(n => n.title === title);
  }

  getLastNodeByLevel(level) {
    if (this.level === level) return this;
    for (let i = this.children.length - 1; i >= 0; i--) {
      const found = this.children[i].getLastNodeByLevel(level);
      if (found) return found;
    }
    return null;
  }

  // Pretty-print the tree (for debugging)
  toString(indent = 0) {
    let out = `${'  '.repeat(indent)}- ${this.title} (H${this.level})\n`;
    for (const child of this.children) {
      out += child.toString(indent + 1);
    }
    return out;
  }

  getHtml() {
    const titleElem = h(`h${this.level}`, {}, this.title);
    const container = h('div', { class: 'wikinode-html' }, titleElem);
    if (this.html) {
      container.appendChild(this.html);
    }
    for (const child of this.children) {
      container.appendChild(child.getHtml());
    }
    return container;
  }

  getMd() {
    let out = `${'='.repeat(this.level)} ${this.title.trim()} ${'='.repeat(this.level)}\n\n`;
    out += this.md ? this.md + '\n\n' : '';
    for (const child of this.children) {
      out += child.getMd();
    }
    return out;
  }

  getRaw() {
    let out = this.raw ? this.raw + '\n\n' : '';
    for (const child of this.children) {
      out += child.getRaw();
    }
    return out;
  }

  populateRaw(rawText) {
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

}

function getBaseAndRawUrl(root) {
  const baseUrl = root.querySelector('link[rel="canonical"]')?.href || '';

  const altLink = root.querySelector('link[rel="alternate"][type="application/x-wiki"]');
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

async function fetchRawPage(rawUrl) {
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

const wikiCss = /* css */ `
html {
  --color-base: #202122;
  font-family: sans-serif;
  line-height: 1.625;
}
img {
  vertical-align: middle;
}
.top-bar {
  <!-- display: flex; -->
}
.top-heading {
  margin-top: 0;
  line-height: 1;
}
.perma-link {
  display: block;
  margin-bottom: 0.7em
}
.show-html .html-view,
.show-md .md-view,
.show-raw .raw-view {
  display: block;
}
.show-html .md-view,
.show-html .raw-view,
.show-md .html-view,
.show-md .raw-view,
.show-raw .html-view,
.show-raw .md-view {
  display: none;
}
.html-view h1 {
  margin-top: 0;
}
`;

export async function runBookmarklet(root = document) {
  const { baseUrl, rawUrl } = getBaseAndRawUrl(root);
  if (!baseUrl) {
    alert('No wiki content found.');
    return;
  }

  const win = window.open('', '_blank', '');
  if (!win) {
    alert('Failed to open new window. Please allow popups for this site.');
    return;
  }
  const doc = win.document;
  doc.title = 'Bookmarklet';
  injectCss(baseCss, { doc });
  injectCss(wikiCss, { doc });
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

  // --- Prepare Wiki tree and extract content ---
  const tree = WikiNode.buildFromHTML(root);
  // log('WikiNode tree:\n', tree.toString());
  const rawText = await fetchRawPage(rawUrl);
  // log(rawText.slice(0, 1000), '...');
  for (const node of tree) node.populateRaw(rawText);

  // --- Render views ---
  const html = h('div', { class: 'html-view' }, tree.getHtml());
  const md = h('pre', { class: 'md-view' }, tree.getMd());
  const raw = h('pre', { class: 'raw-view' }, tree.getRaw());
  const contentBox = h('div', { style: 'margin-top: 3em;' }, html, md, raw);
  doc.body.appendChild(contentBox);
}
