import type { CreatePage } from '../../../snapshot-loader';
import { h } from '../../../utils/dom';
import { extractBlocks, type BlockSpec } from '../../../utils/extract';
import { brWrap } from '../dom';
import { toHtml, toMd } from '../convert';

const blocks: BlockSpec[] = [
  {
    name: 'pagination',
    select: {
      kind: 'match',
      selectors: [
        '.paginate-container [role="navigation"]',
      ],
    },
    normalize: (root) => {
      const current = Number(root.querySelector('[aria-current="page"]')?.textContent?.trim() || '');
      const pageNums = [...root.querySelectorAll('a[href*="page"]')].map((a) => Number(a.textContent?.trim() || '')).filter((n) => !isNaN(n));
      const maxPage = pageNums.length ? Math.max(...pageNums) : current;
      if (isNaN(current) || isNaN(maxPage)) return null;
      return h('div', {}, `Page ${current} of ${maxPage}`);
    },
  },
  {
    name: 'rows',
    select: {
      kind: 'matchAll',
      selectors: [
        'ul.js-navigation-container > li.js-navigation-item',
        '.js-navigation-container > .js-navigation-item',
      ],
    },
    fields:
    [
      {
        name: 'title',
        select: {
          kind: 'match',
          selectors: [
            'a[data-hovercard-type="discussion"]',
            'a[href*="/discussions/"]',
          ],
        },
        transforms: [
          // { kind: 'unwrap', selectors: ['a'] },
          { kind: 'replace', with: 'span', selectors: ['h3'] },
        ],
      },
      {
        name: 'description',
        select: {
          kind: 'ancestor',
          selectors: [
            'a[href*="/discussions/categories/"]',
            'relative-time',
          ],
        },
        transforms: [
          { kind: 'unwrap', selectors: ['a'] },
          { kind: 'replace', with: 'span', selectors: ['div', 'p'] },
        ],
      },
      {
        name: 'participants',
        select: {
          kind: 'match',
          selectors: [
            '.AvatarStack',
          ],
        },
        normalize: (root) => {
          const names = [...root.querySelectorAll('a.avatar img')]
            .map((img) => img.getAttribute('alt')?.trim())
            .filter((alt): alt is string => !!alt);
          if (names.length === 0) return null;
          return h('span', {}, `${names.join(', ')}`); // participants:
        },
      },
      {
        name: 'upvotes',
        select: {
          kind: 'match',
          selectors: [
            'button[id^="discussion-upvote-button-"]',
            '.discussion-vote-form button[aria-label]',
          ],
        },
        normalize: (root) => {
          const label = root.getAttribute('aria-label')?.trim() ?? '';
          const m = label.match(/\d+/);
          if (!m) return null;
          const n = Number(m[0]);
          return h('span', {}, `${n} upvote${n === 1 ? '' : 's'}`);
        },
      },
      {
        name: 'comments',
        select: {
          kind: 'root',
        },
        normalize: (root) => {
          const a = [...root.querySelectorAll('a[href*="/discussions/"][aria-label]')]
            .find((el) => !!el.querySelector(
              'svg.octicon-comment, svg.octicon-check-circle, svg.octicon-check-circle-fill'
            ));
          const label = a?.getAttribute('aria-label')?.trim();
          if (!label) return null;
          const short = label.split(':')[0]?.trim();
          return short ? h('span', {}, short) : null;
        },
      },
    ],
    itemFn: ([title, description, participants, upvotes, comments]) => {
      if (!title) return null;
      return h('li', {},
        h('span', {}, title),
        ...brWrap('span', [description, participants]),
        ...brWrap('span', [comments, upvotes]),
        h('br'),
        h('br'),
      );
    },
    itemsFn: (items) => h('ul', {}, ...items),
  },
];

export const createListDiscPage: CreatePage = ({ sourceDoc, ctxs, state }) => {
  const extracted = extractBlocks(sourceDoc, blocks, ctxs);
  const wrapper = h('div', { class: 'hub-list', __doc: sourceDoc }, ...extracted);

  return {
    views: [],
    state,
    root: {
      content: {
        md: toMd(wrapper, { ...ctxs.md }),
        html: toHtml(wrapper, ctxs.html)?.outerHTML,
      },
    },
  };
};
