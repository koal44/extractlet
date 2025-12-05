// TODO: Add support for auto-expanding long comment threads

/**
 * GitHub Issue — DOM Reference
 *
 * <HEAD>
 *   link[rel="canonical"]                         → Canonical issue URL (base for absolute links)
 *
 * <BODY>
 * main#js-repo-pjax-container (implicit root; not queried directly here)
 *
 *   /* Title * /
 *   bdi[data-testid="issue-title"]                → Issue title (textContent)
 *
 *   /* OP wrapper (author + meta + description) * /
 *   div[data-testid="issue-viewer-issue-container"]
 *     div[data-testid="issue-body"]
 *       *[data-testid="issue-body-header-author"] → OP author handle (textContent)
 *
 *       a[data-testid="issue-body-header-link"]   → Header link (permalink to OP)
 *         href                                    → contains fragment "#issue-<N>" (used to compute postId)
 *         relative-time[datetime]                 → OP created timestamp (ISO in @datetime)
 *       span (optional; sibling of the anchor)    → "edited by …" container
 *         a                                       → Editor username (textContent)
 *
 *       /* OP body (rendered Markdown HTML) * /
 *       div[data-testid="issue-body-viewer"]
 *         /* NOTE: scraper takes the entire viewer node for HTML/MD conversion * /
 *         /* Implementation expects a markdown root under this viewer * /
 *         div[data-testid="markdown-body"]?       → Markdown render root (stable on GH; not strictly required by scraper)
 *           ...                                   → Rendered HTML content of the issue body
 *
 *   /* Timeline: comments/replies * /
 *   div[data-testid="issue-timeline-container"]   → Wraps all timeline items (comments/events)
 *     > *                                         → Each direct child is one timeline item
 *       div[data-testid="comment-header"]         → Comment header (author + time + id)
 *         id                                      → "issuecomment-<N>" (stored as postId; combine with canonical URL for fragment link)
 *         a[data-testid="avatar-link"]            → Comment author handle (textContent)
 *         relative-time[datetime]                 → Comment timestamp (ISO in @datetime)
 *
 *       /* Comment body (rendered Markdown HTML) * /
 *       div[data-testid="markdown-body"]          → Markdown render root for this comment
 *         ...                                     → Rendered HTML content of the comment
 *
 * Notes:
 * - postId mapping (what the scraper persists):
 *   - OP: extracted from a[data-testid="issue-body-header-link"].href fragment (e.g., "issue-1651242529").
 *   - Comment: taken from div[data-testid="comment-header"].id (e.g., "issuecomment-1493698400").
 * - All timestamps are read from <relative-time datetime="...">; prefer @datetime over text.
 * - Author/editor names are read as plain textContent from the designated testid anchors/spans.
 * - Body HTML/MD: the scraper passes the whole viewer/body node to converters (no inner text scraping).
 * - Canonical URL: link[rel="canonical"] is resolved against document.baseURI for absolute form.
 */


import type { ToHtmlContext, ToMdElementHandler, ToMdContext, ToHtmlElementHandler } from '../core';
import { toHtml as _toHtml, toMd as _toMd } from '../core';
import {
  pickVal, pickEl, pickEls, asLastPathSeg, asIdFrag, asAbsUrl,
  type Locator,
} from '../utils/locator';
import type { XletContexts } from '../settings';
import type { CreatePage } from '../snapshot-loader';
import {
  h, htmlToElement, htmlToElementK, injectCss, isElement, isSub, isSup, isText,
} from '../utils/dom';
import { copyButtonCss, createCopyButton } from '../ui/copy-button';
import { warn } from '../utils/logging';
import { createMultiToggle, multiToggleCss } from '../ui/multi-toggle';
import { chooseCanonicalUrl, formatDateWithRelative } from '../utils/strings';
import { setLang } from '../normalize';

export type HubResult = {
  permalink: string;
  title: string;
  posts: Post[];
};

type Post = {
  contributor?: Contributor;
  bodyHtml?: string;
  bodyMd?: string;
  postId?: string;
}

type Contributor = {
  author?: string;
  timestamp?: string;
  editor?: string;
};

type GhDomain = 'issue' | 'pr' | 'discussion';
type GhKey =
  'permalink' | 'title' |
  'firstPost_author' | 'firstPost_postId' | 'firstPost_createdAt' | 'firstPost_editedBy' | 'firstPost_bodyViewer' |
  'posts_items' | 'posts_author' | 'posts_createdAt' | 'posts_postId' | 'posts_bodyViewer';
type GhTable = Record<GhDomain | 'all', Partial<Record<GhKey, Locator[]>>>;

const ghTable: GhTable  = {
  all: {
    permalink: [
      { sel: 'head > link[rel="canonical"]', attr: 'href', valMap: asAbsUrl },
      { sel: '#repo-content-turbo-frame', attr: 'src', valMap: asAbsUrl },
      // { sel: 'meta[property="og:url"]', attr: 'content' }, // unverified
      // { sel: 'react-app[initial-path]', attr: 'initial-path' }, // unverified
    ],
    title: [
      { sel: 'h1.gh-header-title > bdi.markdown-title', attr: 'textContent' },
      { sel: 'head > title', attr: 'textContent' },
    ],
    firstPost_author: [
    ],
    firstPost_postId: [
    ],
    firstPost_createdAt: [
    ],
    firstPost_editedBy: [
    ],
    firstPost_bodyViewer: [
    ],
    posts_items: [
    ],
    posts_author: [
    ],
    posts_createdAt: [
    ],
    posts_postId: [
    ],
    posts_bodyViewer: [
    ],
  },
  pr: {
    permalink: [
    ],
    title: [
    ],
    firstPost_author: [
      { sel: 'div[id^="issue-"] a.author', attr: 'textContent' },
    ],
    firstPost_postId: [
      { sel: 'div[id^="issue-"]', attr: 'id' },
    ],
    firstPost_createdAt: [
      { sel: 'div[id^="issue-"] .timeline-comment-header relative-time', attr: 'datetime' },
    ],
    firstPost_editedBy: [
    ],
    firstPost_bodyViewer: [
      { sel: 'div[id^="issue-"] .comment-body' },
    ],
    posts_items: [
      { sel: 'div[id^="issuecomment-"]' },
    ],
    posts_author: [
      { sel: ':scope .timeline-comment-header a.author', attr: 'textContent' },
    ],
    posts_createdAt: [
      { sel: ':scope .timeline-comment-header relative-time', attr: 'datetime' },
    ],
    posts_postId: [
      { sel: ':scope', attr: 'id' },
    ],
    posts_bodyViewer: [
      { sel: ':scope .comment-body' },
    ],
  },
  discussion: {
    permalink: [
    ],
    title: [
    ],
    firstPost_author: [
      {
        sel: 'div[id^="discussion-"] a[data-hovercard-type="user"]', attr: 'href', valMap: asLastPathSeg,
      },
    ],
    firstPost_postId: [
      { sel: 'div[id^="discussion-"]', attr: 'id' },
    ],
    firstPost_createdAt: [
      { sel: 'div[id^="discussion-"] h2 relative-time', attr: 'datetime' },
    ],
    firstPost_editedBy: [
    ],
    firstPost_bodyViewer: [
      { sel: 'div[id^="discussion-"] .comment-body' },
    ],
    posts_items: [
      { sel: 'div[id^="discussioncomment-"]' },
    ],
    posts_author: [
      {
        sel: ':scope a[data-hovercard-type="user"]', attr: 'href', valMap: asLastPathSeg,
      },
    ],
    posts_createdAt: [
      { sel: ':scope relative-time', attr: 'datetime' },
    ],
    posts_postId: [
      { sel: ':scope', attr: 'id' },
    ],
    posts_bodyViewer: [
      { sel: ':scope .comment-body' },
    ],
  },
  issue: {
    permalink: [
    ],
    title: [
      { sel: 'bdi[data-testid="issue-title"]', attr: 'textContent' },
    ],
    firstPost_author: [
      { sel: 'div[data-testid="issue-viewer-issue-container"] [data-testid="issue-body-header-author"]' },
    ],
    firstPost_postId: [
      {
        sel: 'div[data-testid="issue-viewer-issue-container"] a[data-testid="issue-body-header-link"]',
        attr: 'href', valMap: asIdFrag,
      },
    ],
    firstPost_createdAt: [
      { sel: 'div[data-testid="issue-viewer-issue-container"] a[data-testid="issue-body-header-link"] relative-time', attr: 'datetime' },
    ],
    firstPost_editedBy: [
      { sel: 'div[data-testid="issue-viewer-issue-container"] a[data-testid="issue-body-header-link"] + span a' },
    ],
    firstPost_bodyViewer: [
      { sel: 'div[data-testid="issue-viewer-issue-container"] div[data-testid="issue-body-viewer"]' },
    ],
    posts_items: [
      { sel: 'div[data-testid="issue-timeline-container"] > *' },
    ],
    posts_author: [
      { sel: ':scope div[data-testid="comment-header"] a[data-testid="avatar-link"]', attr: 'textContent' },
    ],
    posts_createdAt: [
      { sel: ':scope div[data-testid="comment-header"] relative-time', attr: 'datetime' },
    ],
    posts_postId: [
      { sel: ':scope div[data-testid="comment-header"]', attr: 'id' },
    ],
    posts_bodyViewer: [
      { sel: ':scope div[data-testid="markdown-body"]' },
    ],
  },
} as const;

function getLocators(varKey: GhKey, domain?: GhDomain): Locator[] {
  return domain
    ? [...(ghTable[domain][varKey] ?? []), ...(ghTable['all'][varKey] ?? [])]
    : ghTable['all'][varKey] ?? [];
}

function matchGhUrl(str: string, withHash = false): string | null {
  try {
    const u = new URL(str, 'https://github.com');
    if (u.hostname !== 'github.com') return null;

    const m = u.pathname.match(/^\/([^/]+)\/([^/]+)\/(issues|pull|discussions)\/(\d+)(?:\/.*)?$/);
    if (!m) return null;

    const [, owner, repo, kind, id] = m;
    const base = `https://github.com/${owner}/${repo}/${kind}/${id}`;
    return withHash && u.hash ? `${base}${u.hash}` : base;
  } catch {
    return null;
  }
}

function detectGhDomain(str: string): GhDomain | undefined  {
  //   /owner/repo/issues/123
  //   /owner/repo/pull/456
  //   /owner/repo/discussions/789
  const u = new URL(str);
  if (u.pathname.includes('/pull/')) return 'pr';
  if (u.pathname.includes('/issues/')) return 'issue';
  if (u.pathname.includes('/discussions/')) return 'discussion';
}

function scrapePermaUrl(doc: Document): string | undefined {
  let link = pickVal(getLocators('permalink'), doc);
  link = chooseCanonicalUrl(link, doc.baseURI);
  if (!link) return warn(undefined, 'scrapePermaUrl: no link found');
  const detected = matchGhUrl(link, false);
  if (detected) return detected;
}

function scrapeTitle(doc: Document, domain: GhDomain): string | undefined {
  const title = pickVal(getLocators('title', domain), doc);
  return title;
}

function scrapeFirstPost(doc: Document, domain: GhDomain, ctxs?: XletContexts): Post | undefined {
  const author    = pickVal(getLocators('firstPost_author',    domain), doc);
  const postId    = pickVal(getLocators('firstPost_postId',    domain), doc);
  const createdAt = pickVal(getLocators('firstPost_createdAt', domain), doc);
  const editedBy  = pickVal(getLocators('firstPost_editedBy',  domain), doc);

  if (!author && !createdAt && !postId) return undefined;

  const contributor: Contributor = {
    author,
    timestamp: createdAt,
    editor: editedBy,
  };

  const bodyViewer = pickEl(getLocators('firstPost_bodyViewer', domain), doc);
  const bodyHtml   = bodyViewer ? toHtml(bodyViewer, ctxs?.html)?.outerHTML : undefined;
  const bodyMd     = bodyViewer ? toMd(bodyViewer, ctxs?.md) : undefined;

  return { contributor, bodyHtml, bodyMd, postId: postId };
}

function scrapePosts(doc: Document, domain: GhDomain, ctxs?: XletContexts): Post[] {
  const items = pickEls(getLocators('posts_items', domain), doc);

  const posts: Post[] = [];
  for (const item of items) {
    const author    = pickVal(getLocators('posts_author',     domain), doc, item);
    const createdAt = pickVal(getLocators('posts_createdAt',  domain), doc, item);
    const postId    = pickVal(getLocators('posts_postId',     domain), doc, item);
    const bodyEl    =  pickEl(getLocators('posts_bodyViewer', domain), doc, item);

    const isComment = author || createdAt || bodyEl;
    if (!isComment) continue;

    const contributor: Contributor = { author, timestamp: createdAt, editor: undefined };
    const bodyHtml = bodyEl ? toHtml(bodyEl, ctxs?.html)?.outerHTML : undefined;
    const bodyMd   = bodyEl ? toMd(bodyEl, ctxs?.md) : undefined;

    posts.push({ contributor, bodyHtml, bodyMd, postId: postId });
  }

  return posts;
}

function shouldSkip(node: Node | null): boolean {
  if (!node) throw new Error('shouldSkip called with null or undefined node');
  if (isText(node)) return false; // Text nodes are never skipped

  if (isElement(node)) {

    return node.matches([
      'tool-bar', 'tool-tip',
      '[role="toolbar"]', '[role="tooltip"]',
      '.task-list-item .handle', // task-list drag handle
      '.zeroclipboard-container',
      'clipboard-copy',
      'clipboard',
      'svg.octicon',
      // '.sr-only', '.visually-hidden', '[hidden]',
    ].join(','));


    // const id = node.id || '';
    // const className = node.className || '';
    // const aType = node.getAttribute('type') || '';


    // const tagName = node.tagName.toUpperCase();

    // if (tagName.includes('CLIPBOARD')) return true;
    // if (node.matches('tool-bar, tool-tip')) return true;
    // if (['toolbar', 'tooltip'].includes(node.getAttribute('role') ?? '')) return true;
    // if (node.matches('.task-list-item .handle')) return true;

    // return false;
  }

  return true;
}

const toMdElemHandler: ToMdElementHandler = (node, _ctx, gc) => {
  if (shouldSkip(node)) return { skip: true };
  if (node.matches('td.comment-body')) {
    const md = gc(node, 'block');
    return { md };
  }
  if (node.matches('em, i')) {
    return { md: `_${gc(node, 'inline')}_` }; // use _..._ rather than *...*
  }
  if (node.matches('br')) return { md: '\n' }; // without the double space
  if (node.matches('input[type="checkbox"]')) {
    return { md: node.hasAttribute('checked') ? '[x] ' : '[ ] ' };
  }
  if (node.matches('a.user-mention, a.issue-link')) {
    return { md: node.textContent ?? '' };
  }

  // GitHub code table (line-numbered snippet)
  if (node.matches('table.js-file-line-container')) {
    const table = node as HTMLTableElement;
    const entries: { num: string; code: string; }[] = [];
    let lang = '';

    for (const tr of table.rows) {
      const lineTd = tr.querySelector('td[data-line-number]');
      const codeTd = tr.querySelector('td.blob-code');
      if (!lineTd || !codeTd) continue;

      const num = lineTd.getAttribute('data-line-number');
      if (!num) continue;

      const code = codeTd.textContent ?? ''; // toMd(codeTd, { ...ctx, wsMode: 'pre' });
      entries.push({ num, code });
      if (!lang) {
        lang = [...codeTd.classList].find((c) => c.endsWith('-file-line'))?.replace(/-file-line$/, '') ?? '';
      }
    }

    if (!entries.length) return {};

    const maxDigits = entries.reduce(
      (m, e) => (e.num.length > m ? e.num.length : m)
      , 0
    );

    const lines = entries.map(({ num, code }) => {
      const padded = num.padStart(maxDigits, ' ');
      return `  ${padded} ${code}`;
    });

    const md = [`\`\`\`${lang}`, ...lines, '```'].join('\n');
    return { md };
  }

  if (node.matches('div.highlight')) {
    const lang = [...node.classList].find((c) => c.startsWith('highlight-source-'))?.replace('highlight-source-', '') ?? '';
    const pre = node.querySelector('pre');
    if (pre) setLang(pre, lang);
  }

  if (node.matches('markdown-accessiblity-table')) {
    const md = gc(node, 'block');
    return { md };
  }

  if (node.matches('td, th')) {
    // handle font-shrinking hacks that wrap full cell content in <sub> or <sup>
    const childs = [...node.childNodes].filter((n) => isElement(n) || (isText(n) && n.textContent?.trim()));
    if (childs.length === 1 && (isSub(childs[0]) || isSup(childs[0]))) {
      const md = gc(childs[0], 'inline');
      return { md };
    }
  }

  if (node.matches('g-emoji')) {
    const txt = node.textContent?.trim();
    if (txt) return { md: txt };

    const alias = node.getAttribute('alias');
    return { md: alias ? `:${alias}:` : '' };
  }

  return {};
};

export function toMd(node: Node | null, ctx: Partial<ToMdContext> = {}): string {
  return _toMd(node, { elementHandler: toMdElemHandler, ...ctx });
}

const toHtmlElemHandler: ToHtmlElementHandler = (node, ctx) => {
  if (shouldSkip(node)) return { skip: true };
  if (!isElement(node)) throw new Error('toHtmlElemHandler called with non-element node');

  // td.comment-body => convert to div to avoid table context issues
  if (node.matches('td.comment-body')) {
    const tmp = toHtml(node, { ...ctx })!;
    const div = document.createElement('div');
    while (tmp.firstChild) div.appendChild(tmp.firstChild);
    return { node: div };
  }

  if (node.matches('td[data-line-number]') && !node.textContent?.trim()) {
    const line = node.getAttribute('data-line-number');
    if (line) node.textContent = line;
    node.removeAttribute('data-line-number');
    return {};
  }

  if (node.matches('table.js-file-line-container')) {
    const table = toHtml(node, ctx);
    if (!table) return { skip: true };
    table.classList.add('code-table');
    table.removeAttribute('data-tab-size');
    table.removeAttribute('data-paste-markdown-skip');

    const div = h('div', { class: 'code-table-wrapper' }, table);
    return { node: div };
  }

  if (node.matches('markdown-accessiblity-table')) {
    const table = node.querySelector('table');
    table?.style.removeProperty('width');
  }

  const cleanAttrs = ['data-pjax'];
  for (const attr of cleanAttrs) {
    if (node.hasAttribute(attr)) node.removeAttribute(attr);
  }

  return {}; // default processing
};

export function toHtml(node: Element, opts?: Partial<ToHtmlContext>): Element | null;
export function toHtml(node: Node | null, opts: Partial<ToHtmlContext> = {}): Node | null {
  return _toHtml(node, { elementHandler: toHtmlElemHandler, ...opts });
}

function buildPosts(data: HubResult, doc: Document): HTMLElement {
  const div = h('div', { class: 'posts' });
  data.posts.forEach(function(post, idx) {
    const postNode = h('div', { class: 'post' });
    div.appendChild(postNode);

    const postTitle = h('h2', { class: 'post-title' }, idx === 0 ? 'Initial Post' : `Comment ${idx}`);
    const copyButton = buildCopyButton(doc, data, idx);
    const postHeading = h('div', { class: 'post-heading' }, postTitle, copyButton);
    postNode.appendChild(postHeading);

    postNode.appendChild(buildPostView(post, 'md', doc));
    postNode.appendChild(buildPostView(post, 'html', doc));
  });

  return div;
}

function buildPostView(post: Post, viewMode: 'html' | 'md', doc: Document): HTMLDivElement {
  const modes: Record<'html' | 'md', { key: 'bodyHtml' | 'bodyMd'; class: string; }> = {
    html: { key: 'bodyHtml', class: 'html-view' },
    md:   { key: 'bodyMd',   class: 'md-view'   },
  };
  const mode = modes[viewMode];

  function renderBody(str?: string): Node | string | null {
    switch (viewMode) {
      case 'html': return htmlToElement(str, doc);
      case 'md': return str ?? null;
      default: throw new Error(`Unknown mode: ${String(viewMode)}`);
    }
  }

  const postBodyStr = post[mode.key];
  const postBody = renderBody(postBodyStr);
  const bodyDiv = h('div', { class: 'post-body' }, postBody);

  return h('div', { class: mode.class }, bodyDiv, contribLine(post));
}

function contribLine(p: Post): string {
  const a = p.contributor?.author ?? 'unknown';
  const t = p.contributor?.timestamp ?? null;
  // const edited = p.contributor?.editor ? `; edited by ${p.contributor.editor}` : '';
  const edited = ''; // Omitted for now (seems unnecessary clutter)
  const when = t ? formatDateWithRelative(t) : 'unknown time';
  return `[[ ${a} on ${when}${edited} ]]`;
}

function buildCopyButton(doc: Document, pageData: HubResult, postIdx = -1) {
  const allPosts = pageData.posts;

  if (postIdx < -1 || postIdx >= allPosts.length) {
    throw new Error(`Invalid postIdx: ${postIdx}`);
  }

  const isAll = postIdx === -1;
  const isOp = postIdx === 0;
  const isComment = postIdx >= 1;

  const responseTxt =
    isAll      ? 'Copied All!' :
    isOp       ? 'Copied Post!' :
    isComment  ? `Copied Comment ${postIdx}!` : '';

  const hintTxt =
    isAll      ? 'Copy all posts' :
    isOp       ? 'Copy post' :
    isComment  ? `Copy comment ${postIdx}` : '';

  const copyArr: string[] = [];

  if (isAll) {
    copyArr.push(
      '===========================================',
      '           Extractlet · GitHub',
      '==========================================='
    );
  }

  if (pageData.title) copyArr.push(`Title: ${pageData.title}`);
  const url = isAll ? pageData.permalink : allPosts[postIdx].postId ? `${pageData.permalink}#${allPosts[postIdx].postId}` : pageData.permalink;
  if (url) copyArr.push(`URL: ${url}`, '');

  allPosts.forEach((post, idx) => {
    if (!isAll && idx !== postIdx) return;
    // if (isAll && idx === 0) copyArr.push(''); // pre-amble \n post0
    copyArr.push(''); // postN \n postN+1

    const postType = idx === 0 ? 'Post' : `Comment ${idx}`;
    const heading = isAll ? `❖❖ ${postType} ❖❖` : `Post: ${postType}`;

    copyArr.push(heading);
    copyArr.push((post.bodyMd ?? '').trim());

    const cl = contribLine(post);
    if (cl) copyArr.push('', cl);

    copyArr.push('');
  });

  const copyTxt = `${copyArr.join('\n').trim()}\n`;
  return createCopyButton(() => copyTxt, () => responseTxt, () => hintTxt, { doc });
}

export function extractFromDoc(sourceDoc: Document, ctxs?: XletContexts): HubResult | undefined {
  const permalink = scrapePermaUrl(sourceDoc);
  if (!permalink) {
    console.debug('[extractFromDoc] No base URL found in the document');
    return;
  }

  const domain = detectGhDomain(permalink);
  if (!domain) {
    console.debug('[extractFromDoc] Unable to detect GitHub domain for', permalink);
    return;
  }

  const title  = scrapeTitle(sourceDoc, domain) ?? '???';
  const first  = scrapeFirstPost(sourceDoc, domain, ctxs);
  const others = scrapePosts(sourceDoc, domain, ctxs);

  const posts = [
    ...(first ? [first] : []),
    ...others,
  ];

  return { permalink, title, posts };
}

export const createPage: CreatePage = ({ sourceDoc, targetDoc, ctxs, root, state }) => {
  const pageData = extractFromDoc(sourceDoc, ctxs);
  if (!pageData) return warn(undefined, `[xlet:hub] extractFromDoc returned no data`);

  injectCss(multiToggleCss, { id: 'multi-toggle-css', doc: targetDoc });
  injectCss(copyButtonCss, { id: 'copy-button-css', doc: targetDoc });
  const topHeading = h('h1', { class: 'top-heading' }, 'Extractlet · GitHub Page');
  const copyAllButton = buildCopyButton(targetDoc, pageData);
  const topBar = h('div', { class: 'top-bar' }, topHeading, copyAllButton);
  root.appendChild(topBar);

  if (pageData.permalink) {
    const permalink = `<a href="${pageData.permalink}">${pageData.permalink}</a>`;
    const permalinkNode = htmlToElementK(permalink, 'a', targetDoc);
    const permalinkDiv = h('div', { class: 'perma-link' }, permalinkNode);
    root.appendChild(permalinkDiv);
  }

  const viewClasses = ['show-html', 'show-md'];
  const viewToggle = createMultiToggle({
    initState: state.viewIdx,
    onToggle: (newIdx) => {
      state.viewIdx = newIdx;
      root.classList.remove(...viewClasses);
      root.classList.add(viewClasses[newIdx]);
    },
    labels: ['html', 'md'],
    labelSide: 'right',
  });
  const viewToggleContainer = h('div', { class: 'view-toggle' }, viewToggle);
  root.appendChild(viewToggleContainer);

  const output = buildPosts(pageData, targetDoc);
  root.appendChild(output);
  viewToggle.init(); // init at the end to ensure all dom elements used by onToggle are present
};
