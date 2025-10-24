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
 *         href                                    → contains fragment "#issue-<N>" (used to compute pageId)
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
 *         id                                      → "issuecomment-<N>" (stored as pageId; combine with canonical URL for fragment link)
 *         a[data-testid="avatar-link"]            → Comment author handle (textContent)
 *         relative-time[datetime]                 → Comment timestamp (ISO in @datetime)
 *
 *       /* Comment body (rendered Markdown HTML) * /
 *       div[data-testid="markdown-body"]          → Markdown render root for this comment
 *         ...                                     → Rendered HTML content of the comment
 *
 * Notes:
 * - pageId mapping (what the scraper persists):
 *   - OP: extracted from a[data-testid="issue-body-header-link"].href fragment (e.g., "issue-1651242529").
 *   - Comment: taken from div[data-testid="comment-header"].id (e.g., "issuecomment-1493698400").
 * - All timestamps are read from <relative-time datetime="...">; prefer @datetime over text.
 * - Author/editor names are read as plain textContent from the designated testid anchors/spans.
 * - Body HTML/MD: the scraper passes the whole viewer/body node to converters (no inner text scraping).
 * - Canonical URL: link[rel="canonical"] is resolved against document.baseURI for absolute form.
 */




import { h, injectCss, createMultiToggle, multiToggleCss, createCopyButton, copyButtonCss, isText, isElement, isAnchor, isScript, htmlToElementK, htmlToElement, formatDateWithRelative } from './utils.js';
import { toHtml as _toHtml, ToHtmlOptions, toMd as _toMd, ToMdElementHandler } from './core.js';

export type HubResult = {
  permaLink: string;
  issueTitle: string | null;
  authorPost: Post;
  posts: Post[];
};

export type Post = {
  contributor: Contributor | null;
  bodyHtml: string | null;
  bodyMd: string;
  pageId?: string;
}

export type Contributor = {
  author: string | null;
  timestamp: string | null;
  editor: string | null;
};

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
  const tagName = node.tagName.toUpperCase();
  // switch (tagName) {
  // }

  return {};
};

export function toMd(node: Node|null) {
  return _toMd(node, { toMdElementHandler: toMdElemHandler });
}

function toHtmlElemHandler(node:Element, _ctx:ToHtmlOptions): { skip?: boolean; node?: Node } {
  if (shouldSkip(node)) return { skip: true };
  if (!isElement(node)) throw new Error('toHtmlElemHandler called with non-element node');

  return {};
}

export function toHtml<T extends Node>(node: Node|null): T {
  return _toHtml(node, { toHtmlElementHandler: toHtmlElemHandler }) as T;
}

function getPermaUrl(doc: Document): string | null {
  const canonical = doc.querySelector('head > link[rel="canonical"]') as HTMLLinkElement|null;
  return canonical ? new URL(canonical.href, doc.baseURI).href : null;
}

function scrapeIssueTitle(doc: Document): string | null {
  const t1 = doc.querySelector('bdi[data-testid="issue-title"]')?.textContent?.trim();
  if (t1) return t1;
  return null;
}

function scrapeAuthorPost(doc: Document): Post | null {
  const issueContainer = doc.querySelector('div[data-testid="issue-viewer-issue-container"]');
  if (!issueContainer) return null;
  const authorElem = issueContainer.querySelector('[data-testid="issue-body-header-author"]');
  const author = authorElem?.textContent?.trim() || null;
  const linkElem = issueContainer.querySelector<HTMLAnchorElement>('a[data-testid="issue-body-header-link"]');
  // href="https://github.com/antlr/antlr4/issues/4218#issue-1651242529"
  // want #issue-1651242529
  const pageId = linkElem?.href.split('#')[1];

  const createdAt = linkElem?.querySelector('relative-time')?.getAttribute('datetime') || null;
  let editedBy: string | null = null;
  const siblingSpan = linkElem?.nextElementSibling;
  if (siblingSpan) {
    const editorAnchor = siblingSpan.querySelector('a');
    if (editorAnchor) {
      editedBy = editorAnchor.textContent?.trim() || null;
    }
  }
  const contributor: Contributor = {
    author,
    timestamp: createdAt,
    editor: editedBy,
  };
  const bodyViewer = issueContainer.querySelector('div[data-testid="issue-body-viewer"]');
  const bodyHtml = toHtml<Element>(bodyViewer).outerHTML || null;
  const bodyMd = toMd(bodyViewer);
  return {
    contributor,
    bodyHtml,
    bodyMd,
    pageId,
  };
}

function scrapePosts(doc: Document): Post[] {
  const timelineContainer = doc.querySelector('div[data-testid="issue-timeline-container"]');
  if (!timelineContainer) return [];
  const posts: Post[] = [];
  const commentItems = timelineContainer.children;
  for (const item of commentItems) {
    const header = item.querySelector('div[data-testid="comment-header"]');
    if (!header) continue;
    const authorAnchor = header.querySelector('a[data-testid="avatar-link"]');
    const author = authorAnchor?.textContent?.trim() || null;
    const createdAt = header.querySelector('relative-time')?.getAttribute('datetime') || null;
    const contributor: Contributor = {
      author,
      timestamp: createdAt,
      editor: null,
    };
    const bodyViewer = item.querySelector('div[data-testid="markdown-body"]');
    const bodyHtml = toHtml<Element>(bodyViewer).outerHTML || null;
    const bodyMd = toMd(bodyViewer);
    posts.push({
      contributor,
      bodyHtml,
      bodyMd,
      pageId: header.id,
    });
  }
  return posts;
}

function buildPosts(data: HubResult, doc: Document): HTMLElement {
  const div = h('div', { class: 'posts' }) as HTMLDivElement;
  [data.authorPost, ...data.posts].forEach(function(post, idx) {
    const postNode = h('div', { class: 'post' });
    div.appendChild(postNode);

    const postTitle = h('h2', { class: 'post-title' }, idx === 0 ? 'Issue' : `Response ${idx}`);
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

  function renderBody(str: string): Node|string|null {
    switch (viewMode) {
      case 'html': return htmlToElement(str, doc);
      case 'md': return str;
      default: throw new Error(`Unknown mode: ${viewMode}`);
    }
  }

  const postBodyStr = post[mode.key] ?? '';
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
  // postIdx: -1 = all, 0 = Issue (authorPost), >=1 = Response N from pageData.posts (1-based in label)
  const allPosts: Post[] = [pageData.authorPost, ...pageData.posts];

  if (postIdx < -1 || postIdx >= allPosts.length) {
    throw new Error('Invalid postIdx: ' + postIdx);
  }

  const isAll = postIdx === -1;
  const isIssue = postIdx === 0;
  const isResponse = postIdx >= 1;

  const responseTxt =
    isAll      ? 'Copied All!' :
    isIssue    ? 'Copied Issue!' :
    isResponse ? `Copied Response ${postIdx}!` : '';

  const hintTxt =
    isAll      ? 'Copy all posts' :
    isIssue    ? 'Copy issue' :
    isResponse ? `Copy response ${postIdx}` : '';

  const copyArr: string[] = [];

  if (isAll) {
    copyArr.push(
      '===========================================',
      '        Extractlet · GitHub Issue',
      '===========================================\n'
    );
  }

  if (pageData.issueTitle) copyArr.push(`Title: ${pageData.issueTitle ?? '(untitled)'}`);
  const url = isAll ? pageData.permaLink : allPosts[postIdx].pageId ? `${pageData.permaLink}#${allPosts[postIdx].pageId}` : pageData.permaLink;
  if (url) copyArr.push(`URL: ${url}`);

  allPosts.forEach((post, idx) => {
    if (!isAll && idx !== postIdx) return;
    if (isAll && idx === 0) copyArr.push(''); // pre-amble \n post0
    if (isAll) copyArr.push(''); // postN \n postN+1

    const postType = idx === 0 ? 'Issue' : `Response ${idx}`;
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
  const permaUrl = getPermaUrl(root);
  if (!permaUrl) {
    console.warn('[extractFromDoc] No base URL found in the document');
    return;
  }

  const issueTitle = scrapeIssueTitle(root);

  const authorPost = scrapeAuthorPost(root);
  if (!authorPost) {
    console.warn('[extractFromDoc] No author post data found in the document');
    return;
  }

  const posts = scrapePosts(root);

  return {
    permaLink: permaUrl,
    issueTitle: issueTitle,
    authorPost: authorPost,
    posts: posts,
  };
}

export function createPage(pageData: HubResult, doc: Document): void {
  injectCss(multiToggleCss, { id: 'multi-toggle-css', doc });
  injectCss(copyButtonCss, { id: 'copy-button-css', doc });
  const topHeading = h('h1', { class: 'top-heading' }, 'Extractlet · GitHub Issue');
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
