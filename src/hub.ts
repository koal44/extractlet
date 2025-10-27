/* eslint-disable @typescript-eslint/no-unused-vars */
// TODO: Add support for PRs and Discussions
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

import { h, injectCss, createMultiToggle, multiToggleCss, createCopyButton, copyButtonCss, isText, isElement, isAnchor, isScript, htmlToElementK, htmlToElement, formatDateWithRelative } from './utils.js';
import { toHtml as _toHtml, ToHtmlOptions, toMd as _toMd, ToMdElementHandler, ToMdContext } from './core.js';

export type HubResult = {
  permaLink: string;
  title: string;
  posts: Post[];
};

export type Post = {
  contributor?: Contributor;
  bodyHtml?: string;
  bodyMd?: string;
  postId?: string;
}

export type Contributor = {
  author?: string;
  timestamp?: string;
  editor?: string;
};

type SectionId = 'permaLink' | 'title' | 'firstPost' | 'posts';
type DomainId = 'issue' | 'pr' | 'disc' | 'all';
type MapFn = (v: string, doc: Document, scope?: ParentNode) => string;
type Locator = { sel: string; attr?: string; map?: MapFn };
type ByDomain = Partial<Record<DomainId, Locator[]>>;
type FieldSection = Record<string, ByDomain>;

const SCRAPERS: { [S in SectionId]: FieldSection } = {
  // scrapePermaUrl()
  permaLink: {
    link: {
      all: [
        { sel: 'head > link[rel="canonical"]', attr: 'href' },
        // { sel: 'meta[property="og:url"]', attr: 'content' }, // unverified
        { sel: '#repo-content-turbo-frame', attr: 'src' },
        // { sel: 'react-app[initial-path]', attr: 'initial-path' }, // unverified
      ],
    },
  },

  // scrapeTitle()
  title: {
    title: {
      issue: [{ sel: 'bdi[data-testid="issue-title"]', attr: 'textContent' }],
      all: [
        { sel: 'h1.gh-header-title > bdi.markdown-title', attr: 'textContent' },
        { sel: 'head > title', attr: 'textContent' },
      ],
    },
  },

  // scrapeFirstPost()
  firstPost: {
    author: {
      issue: [
        { sel: 'div[data-testid="issue-viewer-issue-container"] [data-testid="issue-body-header-author"]' },
      ],
      pr: [
        { sel: 'div[id^="issue-"] a.author', attr: 'textContent' },
      ],
      disc: [
        { sel: 'div[id^="discussion-"] a[data-hovercard-type="user"]', attr: 'href',
          map: v => v.split('/').filter(Boolean).pop() || v },
      ],
    },
    postId: {
      issue: [
          { 
            sel: 'div[data-testid="issue-viewer-issue-container"] a[data-testid="issue-body-header-link"]',
            attr: 'href', map: s => (s.includes('#') ? s.split('#')[1] : s),
          },
        ],
      pr: [
        { sel: 'div[id^="issue-"]', attr: 'id' },
      ],
      disc: [
        { sel: 'div[id^="discussion-"]', attr: 'id' },
      ],
    },
    createdAt: {
      issue: [
        { sel: 'div[data-testid="issue-viewer-issue-container"] a[data-testid="issue-body-header-link"] relative-time', attr: 'datetime' },
      ],
      pr: [
        { sel: 'div[id^="issue-"] .timeline-comment-header relative-time', attr: 'datetime' },
      ],
      disc: [
        { sel: 'div[id^="discussion-"] h2 relative-time', attr: 'datetime' },
      ],
    },
    editedBy: {
      issue: [
        { sel: 'div[data-testid="issue-viewer-issue-container"] a[data-testid="issue-body-header-link"] + span a' },
      ],
    },
    bodyViewer: {
      issue: [
        { sel: 'div[data-testid="issue-viewer-issue-container"] div[data-testid="issue-body-viewer"]' },
      ],
      pr: [
        { sel: 'div[id^="issue-"] .comment-body' },
      ],
      disc: [
        { sel: 'div[id^="discussion-"] .comment-body' },
      ],
    },
  },

  // scrapePosts()
  posts: {
    items: {
      issue: [
        { sel: 'div[data-testid="issue-timeline-container"] > *' },
      ],
      pr: [
        { sel: 'div[id^="issuecomment-"]' },
      ],
      disc: [
        { sel: 'div[id^="discussioncomment-"]' },
      ],
    },
    author: {
      issue: [
        { sel: ':scope div[data-testid="comment-header"] a[data-testid="avatar-link"]', attr: 'textContent' },
      ],
      pr: [
        { sel: ':scope .timeline-comment-header a.author', attr: 'textContent' },
      ],
      disc: [
        { sel: ':scope a[data-hovercard-type="user"]', attr: 'href',
          map: v => v.split('/').filter(Boolean).pop() || v },
      ],
    },
    createdAt: {
      issue: [
        { sel: ':scope div[data-testid="comment-header"] relative-time', attr: 'datetime' },
      ],
      pr: [
        { sel: ':scope .timeline-comment-header relative-time', attr: 'datetime' },
      ],
      disc: [
        { sel: ':scope relative-time', attr: 'datetime' },
      ],
    },
    postId: {
      issue: [
        { sel: ':scope div[data-testid="comment-header"]', attr: 'id' },
      ],
      pr: [
        { sel: ':scope', attr: 'id' },
      ],
      disc: [
        { sel: ':scope', attr: 'id' },
      ],
    },
    bodyViewer: {
      issue: [
        { sel: ':scope div[data-testid="markdown-body"]' },
      ],
      pr: [
        { sel: ':scope .comment-body' },
      ],
      disc: [
        { sel: ':scope .comment-body' },
      ],
    },
  },
};

function pickEl(doc: Document, section: SectionId, field: string, domain: DomainId, scope?: Element): Element | undefined {
    // domain-first, then 'all'
  const byDomain = SCRAPERS[section]?.[field]?.[domain] ?? [];
  const byAll = SCRAPERS[section]?.[field]?.all ?? [];
  const specs = domain === 'all' ? [...byDomain] : [...byDomain, ...byAll];

  for (const { sel } of specs) {
    if (sel === ':scope') {
      if (scope) return scope;
      else continue;
    }
    const el = (scope ?? doc).querySelector(sel);
    if (el) return el;
  }
  return undefined;
}

function pickEls(doc: Document, section: SectionId, field: string, domain: DomainId, scope?: Element): Element[] {
    // domain-first, then 'all'
  const byDomain = SCRAPERS[section]?.[field]?.[domain] ?? [];
  const byAll = SCRAPERS[section]?.[field]?.all ?? [];
  const specs = domain === 'all' ? [...byDomain] : [...byDomain, ...byAll];

  for (const { sel } of specs) {
    if (sel === ':scope') {
      if (scope) return [scope];
      else continue;
    }
    const els = (scope ?? doc).querySelectorAll(sel);
    if (els.length > 0) return [...els];
  }
  return [];
}

function pickVal(doc: Document, section: SectionId, field: string, domain: DomainId, scope?: Element): string | undefined {
    // domain-first, then 'all'
  const byDomain = SCRAPERS[section]?.[field]?.[domain] ?? [];
  const byAll = SCRAPERS[section]?.[field]?.all ?? [];
  const specs = domain === 'all' ? [...byDomain] : [...byDomain, ...byAll];

  for (const { sel, attr, map } of specs) {
    const el = sel === ':scope' ? scope : (scope ?? doc).querySelector(sel);
    if (!el) continue;
    let val = attr === 'textContent' || attr === undefined // defaults to textContent
      ? el.textContent?.trim() ?? undefined
      : el.getAttribute(attr)?.trim() ?? undefined;
    if (!val) continue;
    val = map ? map(val, doc, scope).trim() : val;
    if (val) return val;
  }
  return undefined;
}

export function matchGithubUrl(str: string, withHash = false): string | null {
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

function detectDomain(str: string): Exclude<DomainId, 'all'> | undefined  {
  //   /owner/repo/issues/123
  //   /owner/repo/pull/456
  //   /owner/repo/discussions/789
  const u = new URL(str);
  if (u.pathname.includes('/pull/')) return 'pr';
  if (u.pathname.includes('/issues/')) return 'issue';
  if (u.pathname.includes('/discussions/')) return 'disc';
}

function scrapePermaUrl(doc: Document): string | undefined {
  const link = pickVal(doc, 'permaLink', 'link', 'all') ?? doc.baseURI;
  const href = new URL(link, doc.baseURI).href;
  const detected = matchGithubUrl(href, false);
  if (detected) return detected;
}

function scrapeTitle(doc: Document, domain: DomainId): string | undefined {
  const title = pickVal(doc, 'title', 'title', domain);
  return title;
}

function scrapeFirstPost(doc: Document, domain: DomainId): Post {
  const author    = pickVal(doc, 'firstPost', 'author',    domain);
  const postId    = pickVal(doc, 'firstPost', 'postId',    domain);
  const createdAt = pickVal(doc, 'firstPost', 'createdAt', domain);
  const editedBy  = pickVal(doc, 'firstPost', 'editedBy',  domain);

  const contributor: Contributor = {
    author,
    timestamp: createdAt,
    editor: editedBy,
  };

  const bodyViewer = pickEl(doc, 'firstPost', 'bodyViewer', domain);
  const bodyHtml   = bodyViewer ? toHtml(bodyViewer)?.outerHTML : undefined;
  const bodyMd     = bodyViewer ? toMd(bodyViewer) : undefined;

  return { contributor, bodyHtml, bodyMd, postId: postId };
}

function scrapePosts(doc: Document, domain: DomainId): Post[] {
  const items = pickEls(doc, 'posts', 'items', domain);

  const posts: Post[] = [];
  for (const item of items) {
    const author    = pickVal(doc, 'posts', 'author',     domain, item);
    const createdAt = pickVal(doc, 'posts', 'createdAt',  domain, item);
    const postId    = pickVal(doc, 'posts', 'postId',     domain, item);
    const bodyEl    = pickEl(doc,  'posts', 'bodyViewer', domain, item);

    const isComment = author || createdAt || bodyEl;
    if (!isComment) continue;

    const contributor: Contributor = { author, timestamp: createdAt, editor: undefined };
    const bodyHtml = bodyEl ? toHtml(bodyEl)?.outerHTML : undefined;
    const bodyMd   = bodyEl ? toMd(bodyEl) : undefined;

    posts.push({ contributor, bodyHtml, bodyMd, postId: postId });
  }

  return posts;
}

function shouldSkip(node: Node|null): boolean {
  if (!node) throw new Error('shouldSkip called with null or undefined node');
  if (isText(node)) return false; // Text nodes are never skipped

  if (isElement(node)) {
    const id = node.id || '';
    const className = node.className || '';
    const aType = node.getAttribute('type') || '';
    const tagName = node.tagName.toUpperCase();

    if (tagName.includes('CLIPBOARD')) return true;
    if (node.matches('tool-bar, tool-tip')) return true;
    if (['toolbar','tooltip'].includes(node.getAttribute('role') ?? '')) return true;

    return false;
  }

  return true;
}

const toMdElemHandler: ToMdElementHandler = (node, ctx, gc) => {
  if (shouldSkip(node)) return { skip: true };
  const tag = node.tagName.toUpperCase();
  if (node.matches?.('td.comment-body')) {
    const md = gc(node, 'block', 'normal');
    return { md };
  }
  if (node.matches?.('em, i')) {
    return { md:`_${gc(node, 'inline', 'normal')}_` }; // use _..._ rather than *...*
  }
  if (node.matches?.('br')) return { md: '\n' }; // ???
  if (node.matches('input[type="checkbox"]')) {
    return { md: node.hasAttribute('checked') ? '[x] ' : '[ ] ' };
  }

  if (node.matches?.('a.user-mention, a.issue-link')) {
    return { md: node.textContent ?? '' };
  }



  // if (node.matches('ol, ul')) {
  //   const startIndex = +(node.getAttribute('start') || '1');
  //   const md = gc(node, 'list', 'normal', { os: startIndex }) + '\n\n';
  //   return { md };
  // }
  // if (node.matches?.('ul, ol')) {
  //   // Let core compute full list formatting (bullets, indentation, nested items)
  //   let md = gc(node, 'list', 'normal');

  //   // If this list sits at block scope (parent not LI), make sure there is a blank line after.
  //   if (node.parentElement?.tagName.toUpperCase() !== 'LI') {
  //     if (!/\n\n$/.test(md)) md = md.replace(/\n?$/, '\n\n');
  //   }

  //   return { md };
  // }

  return {};
};

export function toMd(node: Node | null, ctx: Partial<ToMdContext> = {}): string {
  return _toMd(node, { ...ctx, toMdElementHandler: toMdElemHandler });
}
// export function toMd(node: Node|null) {
//   return _toMd(node, { toMdElementHandler: toMdElemHandler });
// }

function toHtmlElemHandler(node:Element, _ctx:ToHtmlOptions): { skip?: boolean; node?: Node } {
  if (shouldSkip(node)) return { skip: true };
  if (!isElement(node)) throw new Error('toHtmlElemHandler called with non-element node');

  // td.comment-body => convert to div to avoid table context issues
  if (node.matches?.('td.comment-body')) {
    const tmp = toHtml(node, { ..._ctx, skipHandler: true }) as Element;
    const div = document.createElement('div');
    while (tmp.firstChild) div.appendChild(tmp.firstChild);
    return { node: div };
  }

  return {};
}

export function toHtml(node: Element, opts?: ToHtmlOptions): Element | null;
export function toHtml(node: Node | null, opts: ToHtmlOptions = {}): Node | null {
  return _toHtml(node, { ...opts, toHtmlElementHandler: toHtmlElemHandler });
}

function buildPosts(data: HubResult, doc: Document): HTMLElement {
  const div = h('div', { class: 'posts' }) as HTMLDivElement;
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

function buildPostView(post:Post, viewMode:'html'|'md', doc:Document): HTMLDivElement {
  const modes:Record<'html'|'md', { key:'bodyHtml'|'bodyMd'; class:string }> = {
    html: { key: 'bodyHtml', class: 'html-view' },
    md:   { key: 'bodyMd',   class: 'md-view'   },
  };
  const mode = modes[viewMode];

  function renderBody(str?: string): Node | string | null {
    switch (viewMode) {
      case 'html': return htmlToElement(str, doc);
      case 'md': return str ?? null;
      default: throw new Error(`Unknown mode: ${viewMode}`);
    }
  }

  const postBodyStr = post[mode.key];
  const postBody = renderBody(postBodyStr);
  const bodyDiv = h('div', { class: 'post-body' }, postBody);

  return h('div', { class: mode.class }, bodyDiv, contribLine(post)) as HTMLDivElement;
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
    throw new Error('Invalid postIdx: ' + postIdx);
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
      '===========================================\n'
    );
  }

  if (pageData.title) copyArr.push(`Title: ${pageData.title ?? '(untitled)'}`);
  const url = isAll ? pageData.permaLink : allPosts[postIdx].postId ? `${pageData.permaLink}#${allPosts[postIdx].postId}` : pageData.permaLink;
  if (url) copyArr.push(`URL: ${url}`);

  allPosts.forEach((post, idx) => {
    if (!isAll && idx !== postIdx) return;
    if (isAll && idx === 0) copyArr.push(''); // pre-amble \n post0
    if (isAll) copyArr.push(''); // postN \n postN+1

    const postType = idx === 0 ? 'Post' : `Comment ${idx}`;
    const heading = isAll ? `❖❖ ${postType} ❖❖` : `Post: ${postType}`;

    copyArr.push(heading, '');
    copyArr.push(post.bodyMd ?? '');

    const cl = contribLine(post);
    if (cl) copyArr.push('', cl);

    copyArr.push('');
  });

  const copyTxt = copyArr.join('\n').trimEnd() + '\n';
  return createCopyButton(copyTxt, responseTxt, hintTxt);
}

export function extractFromDoc(root: Document = document): HubResult | undefined {
  const permaLink = scrapePermaUrl(root);
  if (!permaLink) {
    console.debug('[extractFromDoc] No base URL found in the document');
    return;
  }

  const domain = detectDomain(permaLink);
  if (!domain) {
    console.debug('[extractFromDoc] Unable to detect GitHub domain for', permaLink);
    return;
  }

  const title  = scrapeTitle(root, domain) ?? '???';
  const first  = scrapeFirstPost(root, domain);
  const others = scrapePosts(root, domain);

  // NOTE: if `first` is naturally in `others[0]`, then `first` really should be `undefined`. do not de-dupe.
  // actually this might be wrong, as we fallback logic isn't grouped by domain, rather it's simply an array of fallbacks
  // so maybe one DOM variant has a first but another doesn't. so we will prolly need to de-dupe after all.

  const posts = [
    ...(first ? [first] : []),
    ...others,
  ];

  return { permaLink, title, posts };
}

export function createPage(pageData: HubResult, doc: Document): void {
  injectCss(multiToggleCss, { id: 'multi-toggle-css', doc });
  injectCss(copyButtonCss, { id: 'copy-button-css', doc });
  const topHeading = h('h1', { class: 'top-heading' }, 'Extractlet · GitHub Page');
  const copyAllButton = buildCopyButton(doc, pageData);
  const topBar = h('div', { class: 'top-bar' }, topHeading, copyAllButton);
  doc.body.appendChild(topBar);

  if (pageData.permaLink) {
    const permaLink = `<a href="${pageData.permaLink}">${pageData.permaLink}</a>`;
    const permaLinkNode = htmlToElementK(permaLink, 'a', doc);
    const permaLinkDiv = h('div', { class: 'perma-link' }, permaLinkNode);
    doc.body.appendChild(permaLinkDiv);
  }

  const viewToggle = createMultiToggle({
    initState: 0,
    onToggle: (state) => {
      doc.body.classList.remove('show-html', 'show-md', 'show-raw');
      doc.body.classList.add(['show-html', 'show-md', 'show-raw'][state]);
    },
    labels: ['html', 'md'],
    labelSide: 'right',
  });
  const viewToggleContainer = h('div', { class: 'view-toggle' }, viewToggle);
  doc.body.appendChild(viewToggleContainer);

  const output = buildPosts(pageData, doc);
  doc.body.appendChild(output);
  viewToggle.init(); // init at the end to ensure all dom elements used by onToggle are present
}
