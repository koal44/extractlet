import type { XletContexts } from '../../../settings';
import type { CreatePage } from '../../../snapshot-loader';
import { asLastPathSeg } from '../../../utils/locator';
import { warn } from '../../../utils/logging';
import { scrapePermaUrl } from '../dom';
import type { PostLocators, Post } from '../posts';
import { buildContribText, scrapeFirstPost, scrapePosts } from '../posts';

const locators: PostLocators = {
  title: [],
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
};

export function extractPosts(srcDoc: Document, ctxs?: XletContexts): Post[] {
  const first  = scrapeFirstPost(srcDoc, locators, ctxs);
  const others = scrapePosts(srcDoc, locators, undefined, ctxs);

  return [
    ...(first ? [first] : []),
    ...others,
  ];
}

export const createDiscPage: CreatePage = ({ sourceDoc, ctxs, state }) => {
  const permalink = scrapePermaUrl(sourceDoc);
  if (!permalink) return warn(undefined, '[xlet:disc-create] Failed to scrape permalink');

  const posts = extractPosts(sourceDoc, ctxs);
  if (!posts.length) return warn(undefined, '[xlet:disc-create] Failed to extract data from document');

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
