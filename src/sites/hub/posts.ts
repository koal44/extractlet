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

import type { XletContexts } from '../../settings';
import type { Locator } from '../../utils/locator';
import { pickEl, pickEls, pickVal } from '../../utils/locator';
import { formatDateWithRelative } from '../../utils/strings';
import { toHtml, toMd } from './hub-core';

export type PostKey =
  | 'title'
  | 'firstPost_author'
  | 'firstPost_postId'
  | 'firstPost_createdAt'
  | 'firstPost_editedBy'
  | 'firstPost_bodyViewer'
  | 'posts_items'
  | 'posts_author'
  | 'posts_createdAt'
  | 'posts_postId'
  | 'posts_bodyViewer';

export type PostLocators = Record<PostKey, Locator[]>;
export type NormTimeline = (node?: Element) => Element | undefined;

type Contributor = {
  author?: string;
  timestamp?: string;
  editor?: string;
};

export type Post = {
  contributor?: Contributor;
  bodyHtml?: string;
  bodyMd?: string;
  postId?: string;
}

export function scrapeFirstPost(srcDoc: Document, locators: PostLocators, ctxs?: XletContexts): Post | undefined {
  const author    = pickVal(locators.firstPost_author, srcDoc);
  const postId    = pickVal(locators.firstPost_postId, srcDoc);
  const createdAt = pickVal(locators.firstPost_createdAt, srcDoc);
  const editedBy  = pickVal(locators.firstPost_editedBy, srcDoc);

  if (!author && !createdAt && !postId) return undefined;

  const contributor: Contributor = {
    author,
    timestamp: createdAt,
    editor: editedBy,
  };

  const bodyViewer = pickEl(locators.firstPost_bodyViewer, srcDoc);
  const bodyHtml   = bodyViewer ? toHtml(bodyViewer, ctxs?.html)?.outerHTML : undefined;
  const bodyMd     = bodyViewer ? toMd(bodyViewer, ctxs?.md) : undefined;

  return { contributor, bodyHtml, bodyMd, postId };
}

export function scrapePosts(srcDoc: Document, locators: PostLocators, norm?: NormTimeline, ctxs?: XletContexts): Post[] {
  const items = pickEls(locators.posts_items, srcDoc);

  const posts: Post[] = [];
  for (const item of items) {
    const author    = pickVal(locators.posts_author, srcDoc, item);
    const createdAt = pickVal(locators.posts_createdAt, srcDoc, item);
    const postId    = pickVal(locators.posts_postId, srcDoc, item);
    let bodyEl      =  pickEl(locators.posts_bodyViewer, srcDoc, item);
    bodyEl ??= item;
    if (norm) bodyEl = norm(bodyEl);

    const isComment = author || createdAt || bodyEl;
    if (!isComment) continue;

    const contributor: Contributor = { author, timestamp: createdAt, editor: undefined };
    const bodyHtml = bodyEl ? toHtml(bodyEl, ctxs?.html)?.outerHTML : undefined;
    const bodyMd   = bodyEl ? toMd(bodyEl, ctxs?.md) : undefined;

    posts.push({ contributor, bodyHtml, bodyMd, postId });
  }

  return posts;
}

export function buildContribText(post: Post, now?: Date | null): string {
  const author = post.contributor?.author ?? 'unknown';
  const authorTime = post.contributor?.timestamp;
  const editor = post.contributor?.editor;
  const editorTime = undefined;

  const when = (time?: string) =>
    time ? ` on ${formatDateWithRelative(time, { now })}` : '';

  const authored = `${author}${when(authorTime)}`;
  const edited = editor ? `; edited by ${editor}${when(editorTime)}` : '';

  return `[[ ${authored}${edited} ]]`;
}
