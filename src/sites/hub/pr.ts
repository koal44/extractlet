import type { XletContexts } from '../../settings';
import type { CreatePage } from '../../snapshot-loader';
import { h, isAnchor, isText } from '../../utils/dom';
import { warn } from '../../utils/logging';
import { scrapePermaUrl } from './hub-core';
import { buildContribText, scrapeFirstPost, scrapePosts } from './posts';
import type { PostLocators, NormTimeline, Post } from './posts';

const locators: PostLocators = {
  title: [],
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
};

const normalizeTimeline: NormTimeline = (el) => {
  // TODO(perf): rework
  if (!el) return undefined;
  if (!el.matches('.TimelineItem-body')) return el;

  const clone = el.cloneNode(true) as HTMLElement;

  // ---------------------------------------------------------------------------
  // Phase 1: Remove/replace larger structures first (order-sensitive)
  // ---------------------------------------------------------------------------

  // Remove inline review-comment header strips (header row + actions)
  clone.querySelectorAll('h3').forEach((h3) => {
    if (!h3.querySelector('img.avatar, a.author')) return;
    const row = h3.parentElement;
    if (!row) return;

    const hasActionSibling = [...row.children].some(
      (el) => el !== h3 && el.querySelector('.timeline-comment-actions'),
    );
    if (!hasActionSibling) return;

    row.remove();
  });

  // Replace hidden-conversations load-more form with compact marker
  // (must run before generic button/form cleanup)
  clone.querySelectorAll('form.js-review-hidden-comment-ids').forEach((form) => {
    const label = (form.querySelector('button')?.textContent ?? '').replace(/\s+/g, ' ').trim();
    if (!/^\d+\s+hidden\s+conversation(s)?$/i.test(label)) return;
    form.replaceWith(h('div', {}, `▸ [xlet: ${label}; load on GitHub]`));
  });

  // Remove relative-time and everything after it in the same header area
  const rt = clone.querySelector('relative-time');
  if (rt) {
    const timeAnchor = rt.closest('a');
    const cutPoint = (timeAnchor && clone.contains(timeAnchor)) ? timeAnchor : rt;
    removeFollowingSiblings(cutPoint);
    cutPoint.remove();
  }

  // ---------------------------------------------------------------------------
  // Phase 2: Remove noisy UI/controls/containers
  // ---------------------------------------------------------------------------

  // Leading avatar/icon anchors
  clone.querySelectorAll('span.avatar, img.avatar-user, img.avatar').forEach((el) => {
    const a = el.closest('a');
    if (a && clone.contains(a)) a.remove();
  });

  // Reaction summaries (remove wrapper when present)
  clone.querySelectorAll('div.comment-reactions').forEach((reactions) => {
    const p = reactions.parentElement;
    if (p?.matches('div.edit-comment-hide')) p.remove();
  });

  // General UI noise
  // clone.querySelectorAll('.minimized-comment').forEach((el) => el.remove());
  clone.querySelectorAll('.AvatarStack').forEach((el) => el.remove());
  clone.querySelectorAll('.hidden-text-expander').forEach((el) => el.remove());
  clone.querySelectorAll('dialog-helper').forEach((el) => el.remove());
  clone.querySelectorAll('button').forEach((el) => el.remove());

  // Commit status / actions / forms / hidden panels / partials
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

  // Loading spinners
  clone.querySelectorAll('svg[aria-label="Loading"], svg[aria-label="Loading..."]').forEach((svg) => {
    const span = svg.closest('span');
    if (span) span.remove();
    else svg.remove();
  });

  // ---------------------------------------------------------------------------
  // Phase 3: Text/attribute cleanup
  // ---------------------------------------------------------------------------

  // Slice anchor titles to first line (GH sometimes stuffs commit title + body)
  clone.querySelectorAll('a[title]').forEach((a) => {
    const title = a.getAttribute('title');
    if (!title) return;
    const firstLine = title.split(/\r?\n/, 1)[0]?.trimEnd() ?? '';
    // eslint-disable-next-line no-restricted-syntax
    a.setAttribute('title', firstLine);
  });

  // ---------------------------------------------------------------------------
  // Phase 4: Code/link normalization (order-sensitive)
  // ---------------------------------------------------------------------------

  // Remove code links that are likely duplicate commit hashes
  clone.querySelectorAll('code > a[href]').forEach((a) => {
    const txt = (a.textContent ?? '').trim();
    if (/^[0-9a-f]{6,9}$/i.test(txt)) {
      a.closest('code')?.remove();
    }
  });

  // Unwrap code wrappers that are just links (anchors + optional whitespace)
  clone.querySelectorAll('code').forEach((code) => {
    const nodes = [...code.childNodes];
    const canUnwrap =
      nodes.some(isAnchor) &&
      nodes.every((n) => isAnchor(n) || (isText(n) && !n.textContent?.trim()));

    if (canUnwrap) code.replaceWith(...nodes);
  });

  // ---------------------------------------------------------------------------
  // Phase 5: Final anchor cleanup
  // ---------------------------------------------------------------------------

  // Remove self-link/permalink anchors (hidden hash anchors)
  clone.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href')?.trim();
    if (!href || !href.startsWith('#')) return;

    const containerId = a.closest('[id]')?.getAttribute('id');
    if (containerId && href === `#${containerId}`) {
      a.remove();
    }
  });

  // remove duplicate links by normalized href (keep first surviving occurrence)
  // const seen = new Set<string>();
  // clone.querySelectorAll('a[href]').forEach((a) => {
  //   const href = a.getAttribute('href')?.trim();
  //   if (!href || seen.has(href)) return href ? void a.remove() : undefined;
  //   seen.add(href);
  // });

  return clone;
};

function removeFollowingSiblings(node: Node): void {
  let cur = node.nextSibling;
  while (cur) {
    const next = cur.nextSibling;
    cur.parentNode?.removeChild(cur);
    cur = next;
  }
}

export function extractPosts(srcDoc: Document, ctxs?: XletContexts): Post[] {
  const first  = scrapeFirstPost(srcDoc, locators, ctxs);
  const others = scrapePosts(srcDoc, locators, normalizeTimeline, ctxs);

  return [
    ...(first ? [first] : []),
    ...others,
  ];
}

export const createPrPage: CreatePage = ({ sourceDoc, ctxs, state }) => {
  const permalink = scrapePermaUrl(sourceDoc);
  if (!permalink) return warn(undefined, '[xlet:hub-create] Failed to scrape permalink');

  const posts = extractPosts(sourceDoc, ctxs);
  if (!posts.length) return warn(undefined, '[xlet:hub-create] Failed to extract data from document');

  return {
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
