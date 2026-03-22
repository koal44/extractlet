import type { XletContexts } from '../../../settings';
import type { CreatePage } from '../../../snapshot-loader';
import { h } from '../../../utils/dom';
import { asIdFrag, pickVal } from '../../../utils/locator';
import { warn } from '../../../utils/logging';
import { scrapePermaUrl } from '../dom';
import type { NormTimeline, Post, PostLocators } from '../posts';
import { buildContribText, scrapeFirstPost, scrapePosts } from '../posts';

const locators: PostLocators = {
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
    { sel: 'div[data-testid="issue-timeline-container"] [data-wrapper-timeline-id]' },
    { sel: 'div[data-testid="issue-timeline-container"] > *' },
  ],
  posts_author: [
    { sel: ':scope div[data-testid="comment-header"] a[data-testid="avatar-link"]', attr: 'textContent' },
    { sel: ':scope .TimelineBody a[data-testid="actor-link"]', attr: 'textContent' },
  ],
  posts_createdAt: [
    { sel: ':scope div[data-testid="comment-header"] relative-time', attr: 'datetime' },
    { sel: ':scope .TimelineBody relative-time', attr: 'datetime' },
  ],
  posts_postId: [
    { sel: ':scope div[data-testid="comment-header"]', attr: 'id' },
  ],
  posts_bodyViewer: [
    { sel: ':scope div[data-testid="markdown-body"]' },
  ],
};

const normalizeTimeline: NormTimeline = (el) => {
  // TODO(perf): rework
  if (!el) return undefined;
  if (!el.closest('[data-testid="issue-timeline-container"]')) return el;

  const clone = el.cloneNode(true) as HTMLElement;

  clone.querySelectorAll('a[data-testid="actor-link"]').forEach((a) => a.remove());
  clone.querySelectorAll('button').forEach((a) => a.remove());

  clone.querySelectorAll('a').forEach((a) => {
    if (a.querySelector('relative-time')) a.remove();
  });

  clone.querySelectorAll('a[href]').forEach((a) => {
    if (a.textContent?.trim()) return;
    if (a.querySelector('img, svg')) return;
    a.remove();
  });

  clone.querySelectorAll('[data-testid="issue-timeline-load-more-container-load-top"]').forEach((el) => {
    const label = (el.textContent ?? '').replace(/\s+/g, ' ').trim();
    if (!/\bremaining\s+items\b/i.test(label)) return;
    el.replaceWith(h('div', {}, `[xlet: ${label}; load on GitHub]`));
  });

  return clone;
};

export function extractPosts(srcDoc: Document, ctxs?: XletContexts): Post[] {
  const first  = scrapeFirstPost(srcDoc, locators, ctxs);
  const others = scrapePosts(srcDoc, locators, normalizeTimeline, ctxs);

  return [
    ...(first ? [first] : []),
    ...others,
  ];
}


export const createIssuePage: CreatePage = ({ sourceDoc, ctxs, state }) => {
  const permalink = scrapePermaUrl(sourceDoc);
  if (!permalink) return warn(undefined, '[xlet:issue-create] Failed to scrape permalink');

  const posts = extractPosts(sourceDoc, ctxs);
  if (!posts.length) return warn(undefined, '[xlet:issue-create] Failed to extract data from document');

  const title = pickVal(locators.title, sourceDoc);
  return {
    title,
    views: [],
    state,
    root: {
      permalink,
      children: posts.map((post, idx) => ({
        label: idx === 0 ? 'Initial Post' : `Comment ${idx}`,
        permalink: post.postId && permalink ? `${permalink}#${post.postId}` : permalink,
        copyable: true,
        content: {
          md: post.bodyMd,
          html: post.bodyHtml,
        },
        contrib: buildContribText(post, ctxs.md?.now),
      })),
    },
  };
};
