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
import { attachStickyHeader } from '../ui/sticky';

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
      { sel: '.js-timeline-item  .TimelineItem' },
    ],
    posts_author: [
      { sel: ':scope .timeline-comment-header a.author', attr: 'textContent' },
      { sel: ':scope .TimelineItem-body a.author', attr: 'textContent' },
      { sel: ':scope img.avatar-user', attr: 'alt', valMap: (alt) => alt.replace(/^@/, '') },
    ],
    posts_createdAt: [
      { sel: ':scope .timeline-comment-header relative-time', attr: 'datetime' },
      { sel: ':scope .TimelineItem-body relative-time', attr: 'datetime' },
    ],
    posts_postId: [
      { sel: ':scope [id^="issuecomment-"]', attr: 'id' },
      { sel: ':scope [id^="pullrequestreview-"]', attr: 'id' },
      { sel: ':scope [id^="event-"]', attr: 'id' },
      { sel: ':scope [id^="commits-pushed-"]', attr: 'id' },
      // { sel: ':scope', attr: 'id' },
    ],
    posts_bodyViewer: [
      // { sel: ':scope .comment-body' },
      { sel: ':scope .TimelineItem-body' },
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

function scrapePermaUrl(srcDoc: Document): string | undefined {
  let link = pickVal(getLocators('permalink'), srcDoc);
  link = chooseCanonicalUrl(link, srcDoc.baseURI);
  if (!link) return warn(undefined, 'scrapePermaUrl: no link found');
  const detected = matchGhUrl(link, false);
  if (detected) return detected;
}

function scrapeTitle(srcDoc: Document, domain: GhDomain): string | undefined {
  const title = pickVal(getLocators('title', domain), srcDoc);
  return title;
}

function scrapeFirstPost(srcDoc: Document, domain: GhDomain, ctxs?: XletContexts): Post | undefined {
  const author    = pickVal(getLocators('firstPost_author',    domain), srcDoc);
  const postId    = pickVal(getLocators('firstPost_postId',    domain), srcDoc);
  const createdAt = pickVal(getLocators('firstPost_createdAt', domain), srcDoc);
  const editedBy  = pickVal(getLocators('firstPost_editedBy',  domain), srcDoc);

  if (!author && !createdAt && !postId) return undefined;

  const contributor: Contributor = {
    author,
    timestamp: createdAt,
    editor: editedBy,
  };

  const bodyViewer = pickEl(getLocators('firstPost_bodyViewer', domain), srcDoc);
  const bodyHtml   = bodyViewer ? toHtml(bodyViewer, ctxs?.html)?.outerHTML : undefined;
  const bodyMd     = bodyViewer ? toMd(bodyViewer, ctxs?.md) : undefined;

  return { contributor, bodyHtml, bodyMd, postId: postId };
}

function scrapePosts(srcDoc: Document, domain: GhDomain, ctxs?: XletContexts): Post[] {
  const items = pickEls(getLocators('posts_items', domain), srcDoc);

  const posts: Post[] = [];
  for (const item of items) {
    const author    = pickVal(getLocators('posts_author',     domain), srcDoc, item);
    const createdAt = pickVal(getLocators('posts_createdAt',  domain), srcDoc, item);
    const postId    = pickVal(getLocators('posts_postId',     domain), srcDoc, item);
    let bodyEl      =  pickEl(getLocators('posts_bodyViewer', domain), srcDoc, item);
    bodyEl = normalizeTimelineBody(bodyEl ?? item);

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
      'link',
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
  if (node.matches('relative-time')) {
    const dt = node.getAttribute('datetime');
    return { md: dt ? formatDateWithRelative(dt) : (node.textContent?.trim() ?? '') };
  }

  // GitHub code table (line-numbered snippet)
  if (
    node.matches('table') &&
    node.querySelector('td[data-line-number]') &&
    node.querySelector('.blob-code-inner, td.blob-code')
  ) {
    const table = node as HTMLTableElement;
    type Entry = { leftNo: string; rightNo: string; op: '+' | '-' | ' '; code: string; };
    const entries: Entry[] = [];
    let lang = '';

    // Detect line number columns (some tables have one for additions and one for deletions, but some have only one shared column)
    const lineNoCols = new Set<number>();
    for (const tr of table.rows) for (const c of tr.cells) if (c.hasAttribute('data-line-number')) lineNoCols.add(c.cellIndex);
    if (lineNoCols.size > 2) return {};
    const leftCol = Math.min(...lineNoCols);
    const rightCol = lineNoCols.has(leftCol + 1) ? leftCol + 1 : null;

    for (const tr of table.rows) {
      const leftTd = tr.cells[leftCol] as HTMLTableCellElement | undefined;
      const rightTd = rightCol ? (tr.cells[rightCol] as HTMLTableCellElement | undefined) : undefined;
      const leftNo = leftTd?.getAttribute('data-line-number')?.trim() ?? '';
      const rightNo = rightTd?.getAttribute('data-line-number')?.trim() ?? '';

      const codeTd = tr.querySelector<HTMLElement>('td.blob-code, td.blob-code-inner');
      if (!codeTd) continue;

      // ignore pretty-print whitespace (alt: .blob-code-inner=pre, .blob-code!=pre)
      let code = '';
      const kids = [...codeTd.childNodes];
      for (let i = 0; i < kids.length; i++) {
        const t = kids[i].textContent ?? '';
        if ((i === 0 || i === kids.length - 1) && isText(kids[i]) && /[\r\n]/.test(t)) continue;
        code += t;
      }

      const classList = [...codeTd.classList, ...tr.classList];
      const op = classList.some((c) => /addition/.test(c)) ? '+'
        : classList.some((c) => /deletion/.test(c)) ? '-'
        : ' ';
      entries.push({ leftNo, rightNo, op, code });
      lang ||= classList.find((c) => c.endsWith('-file-line'))?.replace(/-file-line$/, '') ?? '';
    }

    if (!entries.length) return {};

    const maxPropLen = (prop: 'leftNo' | 'rightNo') =>
      entries.reduce((m, e) => Math.max(m, e[prop].length), 0);
    const leftW = maxPropLen('leftNo');
    const rightW = maxPropLen('rightNo');
    const opUse = entries.some((e) => e.op !== ' ');
    const lines = entries.map(({ leftNo, rightNo, op, code }) => {
      let out = `  ${leftNo.padStart(leftW, ' ')}`;
      if (rightW > 0) out += ` ${rightNo.padStart(rightW, ' ')}`;
      if (opUse) out += ` ${op}`;
      return code ? `${out} ${code}` : out;
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

  if (node.matches('include-fragment')) {
    if (!node.textContent?.trim()) return { md: '[xlet: thread content not loaded; load on GitHub]' };
  }

  if (node.matches('task-lists table') && node.querySelectorAll('td').length === 1) {
    const td = node.querySelector('td');
    return { md: td ? gc(td, 'block') : '' };
  }

  // treat custom els as <div>
  if (node.matches('task-lists, turbo-frame, details-collapsible, details-toggle, deferred-diff-lines')) return { md: gc(node, 'block') };

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

function normalizeTimelineBody(node?: Element): Element | undefined {
  if (!node) return undefined;
  if (node.matches('.TimelineItem-body')) {
    const clone = node.cloneNode(true) as HTMLElement;

    // // Prefer actual markdown comment body if present
    // const contentBody = clone.querySelector('.comment-body') ?? clone.querySelector('.markdown-body');
    // if (contentBody) return contentBody;

    // Remove inline review-comment header strips
    clone.querySelectorAll('h3').forEach((h3) => {
      if (!h3.querySelector('img.avatar, a.author')) return;
      const row = h3.parentElement;
      if (!row) return;
      const hasActionSibling = [...row.children].some((el) =>
        el !== h3 && el.querySelector('.timeline-comment-actions')
      );
      if (!hasActionSibling) return;
      row.remove();
    });

    // Remove leading avatar/icon anchors
    clone.querySelectorAll('span.avatar, img.avatar-user, img.avatar').forEach((el) => {
      const a = el.closest('a');
      if (a && clone.contains(a)) a.remove();
    });

    // Remove relative-time and following sibs
    const rt = clone.querySelector('relative-time');
    if (rt) {
      const timeAnchor = rt.closest('a');
      const cutPoint = (timeAnchor && clone.contains(timeAnchor)) ? timeAnchor : rt;
      removeFollowingSiblings(cutPoint);
      cutPoint.remove();
    }

    // Remove reaction summaries
    clone.querySelectorAll('div.comment-reactions').forEach((reactions) => {
      const p = reactions.parentElement;
      if (p?.matches('div.edit-comment-hide')) p.remove();
    });

    // Replace GitHub hidden-conversations load-more form with a compact marker (before button removal).
    clone.querySelectorAll('form.js-review-hidden-comment-ids').forEach((form) => {
      const label = (form.querySelector('button')?.textContent ?? '').replace(/\s+/g, ' ').trim();
      if (!/^\d+\s+hidden\s+conversation(s)?$/i.test(label)) return;
      form.replaceWith(h('div', {}, `▸ [xlet: ${label}; load on GitHub]`));
    });

    clone.querySelectorAll('.minimized-comment').forEach((el) => el.remove());
    clone.querySelectorAll('.AvatarStack').forEach((el) => el.remove());
    clone.querySelectorAll('.hidden-text-expander').forEach((el) => el.remove());
    clone.querySelectorAll('dialog-helper').forEach((el) => el.remove());
    clone.querySelectorAll('button').forEach((el) => el.remove());
    // clone.querySelectorAll('.Details-content--hidden').forEach((el) => el.remove());

    // slice anchor titles to first line to avoid clutter (GH might stuff commit title + body there...)
    clone.querySelectorAll('a[title]').forEach((a) => {
      const title = a.getAttribute('title');
      if (!title) return;
      const firstLine = title.split(/\r?\n/, 1)[0]?.trimEnd() ?? '';
      // eslint-disable-next-line no-restricted-syntax
      a.setAttribute('title', firstLine);
    });

    // remove code links that are likely to be duped commit hashes
    clone.querySelectorAll('code > a[href]').forEach((a) => {
      const txt = (a.textContent ?? '').trim();
      if (/^[0-9a-f]{6,9}$/i.test(txt)) {
        a.closest('code')?.remove(); // or a.remove() if you prefer
      }
    });

    // unwrap code blocks that only contain a single link (common in GH commit links)
    clone.querySelectorAll('code').forEach((code) => {
      const { firstElementChild, childElementCount, childNodes } = code;
      if (childElementCount !== 1 || firstElementChild?.tagName !== 'A') return;
      for (const n of childNodes) {
        if (n !== firstElementChild && (n.nodeType !== Node.TEXT_NODE || n.textContent?.trim())) {
          return;
        }
      }
      code.replaceWith(firstElementChild);
    });

    // Remove commit build status details (too noisy for one little check mark)
    clone.querySelectorAll('details.commit-build-statuses').forEach((el) => el.remove());
    clone.querySelectorAll('.timeline-comment-header').forEach((el) => el.remove());
    clone.querySelectorAll('form.js-comment-update').forEach((el) => el.remove());
    clone.querySelectorAll('form.js-pick-reaction').forEach((el) => el.remove());
    clone.querySelectorAll('form.js-review-hidden-comment-ids').forEach((el) => el.remove());
    clone.querySelectorAll('.pr-review-reactions').forEach((el) => el.remove());
    clone.querySelectorAll('.js-minimize-comment').forEach((el) => el.remove());
    clone.querySelectorAll('.Details-content--closed').forEach((el) => el.remove());
    clone.querySelectorAll('.Details-content--open').forEach((el) => el.remove());
    clone.querySelectorAll('.timeline-comment-actions').forEach((el) => el.remove());
    clone.querySelectorAll('react-partial').forEach((el) => el.remove());
    clone.querySelectorAll('[data-show-on-forbidden-error]').forEach((el) => el.remove());
    clone.querySelectorAll('input').forEach((el) => el.remove());

    // remove duplicate links by normalized href (keep first surviving occurrence)
    // const seen = new Set<string>();
    // clone.querySelectorAll('a[href]').forEach((a) => {
    //   const href = a.getAttribute('href')?.trim();
    //   if (!href || seen.has(href)) return href ? void a.remove() : undefined;
    //   seen.add(href);
    // });

    clone.querySelectorAll('svg[aria-label="Loading"], svg[aria-label="Loading..."]').forEach((svg) => {
      const span = svg.closest('span');
      if (span) span.remove();
      else svg.remove();
    });

    // Remove self-link/permalink anchors (hidden hash anchors)
    clone.querySelectorAll('a[href]').forEach((a) => {
      const href = a.getAttribute('href')?.trim();
      if (!href || !href.startsWith('#')) return;
      const containerId = a.closest('[id]')?.getAttribute('id');
      if (containerId && href === `#${containerId}`) {
        a.remove();
      }
    });

    return clone;
  }

  return node;
}

function removeFollowingSiblings(node: Node): void {
  let cur = node.nextSibling;
  while (cur) {
    const next = cur.nextSibling;
    cur.parentNode?.removeChild(cur);
    cur = next;
  }
}

function buildPosts(data: HubResult, targetDoc: Document): HTMLElement {
  const div = h('div', { class: 'posts' });
  data.posts.forEach(function(post, idx) {
    const postNode = h('div', { class: 'post' });
    div.appendChild(postNode);

    const postTitle = h('h2', { class: 'post-title' }, idx === 0 ? 'Initial Post' : `Comment ${idx}`);
    const copyButton = buildCopyButton(targetDoc, data, idx);
    const postHeading = h('div', { class: 'post-heading' }, postTitle, copyButton);
    postNode.appendChild(postHeading);

    postNode.appendChild(buildPostView(post, 'md', targetDoc));
    postNode.appendChild(buildPostView(post, 'html', targetDoc));
  });

  return div;
}

function buildPostView(post: Post, viewMode: 'html' | 'md', targetDoc: Document): HTMLDivElement {
  const modes: Record<'html' | 'md', { key: 'bodyHtml' | 'bodyMd'; class: string; }> = {
    html: { key: 'bodyHtml', class: 'html-view' },
    md:   { key: 'bodyMd',   class: 'md-view'   },
  };
  const mode = modes[viewMode];

  function renderBody(str?: string): Node | string | null {
    switch (viewMode) {
      case 'html': return htmlToElement(str, targetDoc);
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

function buildCopyButton(targetDoc: Document, pageData: HubResult, postIdx = -1) {
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
    copyArr.push('<!-- Extractlet · GitHub -->');
  }

  if (pageData.title) copyArr.push(`<!-- ${pageData.title} -->`);
  const url = isAll ? pageData.permalink : allPosts[postIdx].postId ? `${pageData.permalink}#${allPosts[postIdx].postId}` : pageData.permalink;
  if (url) copyArr.push(`<!-- ${url} -->`, '');

  allPosts.forEach((post, idx) => {
    if (!isAll && idx !== postIdx) return;
    copyArr.push(''); // postN \n postN+1

    const postType = idx === 0 ? 'Post' : `Comment ${idx}`;
    const heading = isAll ? `## ${postType}` : `# ${postType}`;

    copyArr.push(heading);
    copyArr.push((post.bodyMd ?? '').trim());

    const cl = contribLine(post);
    if (cl) copyArr.push('', cl);

    copyArr.push('');
  });

  const copyTxt = `${copyArr.join('\n').trim()}\n`;
  return createCopyButton(() => copyTxt, () => responseTxt, () => hintTxt, { doc: targetDoc });
}

export function extractFromDoc(srcDoc: Document, ctxs?: XletContexts): HubResult | undefined {
  const permalink = scrapePermaUrl(srcDoc);
  if (!permalink) {
    console.debug('[extractFromDoc] No base URL found in the document');
    return;
  }

  const domain = detectGhDomain(permalink);
  if (!domain) {
    console.debug('[extractFromDoc] Unable to detect GitHub domain for', permalink);
    return;
  }

  const title  = scrapeTitle(srcDoc, domain) ?? '???';
  const first  = scrapeFirstPost(srcDoc, domain, ctxs);
  const others = scrapePosts(srcDoc, domain, ctxs);

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
  attachStickyHeader(root, viewToggle);

  const output = buildPosts(pageData, targetDoc);
  root.appendChild(output);
  viewToggle.init(); // init at the end to ensure all dom elements used by onToggle are present
};
