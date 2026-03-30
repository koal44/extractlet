import type { CreatePage } from '../../../snapshot-loader';
import { h } from '../../../utils/dom';
import { extractBlocks, type BlockSpec } from '../../../utils/extract';
import { brWrap, joinWrap } from '../dom';
import { toHtml, toMd } from '../convert';
// import { type XletContexts } from '../../../settings';

const blocks: BlockSpec[] = [
  {
    name: 'meta',
    select: { kind: 'root' },
    normalize: (_root, [pagination, counts]) => {
      return joinWrap('div', [pagination, counts]);
    },
    fields: [
      {
        name: 'pagination',
        select: {
          kind: 'match',
          selectors: [
            'nav[aria-label="Pagination"]',
            'nav[class*="Pagination"]',
          ],
        },
        normalize: (root) => {
          const current = Number(root.querySelector('a[aria-current="page"]')?.textContent?.trim() || '');
          const pageNums = [...root.querySelectorAll('a[href*="page"]')].map((a) => Number(a.textContent?.trim() || '')).filter((n) => !isNaN(n));
          const maxPage = pageNums.length ? Math.max(...pageNums) : current;
          if (isNaN(current) || isNaN(maxPage)) return null;
          return h('span', {}, `Page ${current} of ${maxPage}`);
        },
      },
      {
        name: 'counts',
        select: {
          kind: 'ancestor',
          selectors: [
            'a[class^="SectionFilterLink"]',
          ],
        },
        normalize: (root) => {
          if (root.tagName !== 'UL') return null;
          const items = [...root.children].filter((el): el is Element => el.tagName === 'LI');
          if (!items.length) return null;
          for (let i = 0; i < items.length - 1; i++) {
            items[i].after(h('span', {}, ' · '));
          }
          return root;
        },
        transforms: [
          {
            kind: 'remove', selectors: [
              'span[aria-hidden="true"]',
            ],
          },
          { kind: 'replace', with: 'span', selectors: ['div', 'p', 'ul', 'li'] },
          {
            kind: 'unwrap', selectors: [
              'a',
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'rows',
    select: {
      kind: 'matchAll',
      selectors: [
        'div[class^="IssueRow"]',
      ],
    },
    fallbackSelects: [
      {
        kind: 'childrenOfMatch',
        selectors: [
          'ul[data-listview-component="items-list"]',
        ],
      },
    ],
    fields:
    [
      {
        name: 'title',
        select: {
          kind: 'match',
          selectors: [
            'a[data-testid="issue-pr-title-link"]',
          ],
        },
      },
      {
        name: 'description',
        select: {
          kind: 'match',
          selectors: [
            '[data-testid="list-row-repo-name-and-number"]',
          ],
        },
        transforms: [
          { kind: 'remove', selectors: ['.sr-only'] },
          { kind: 'unwrap', selectors: ['a'] },
          { kind: 'replace', with: 'span', selectors: ['div', 'p'] },
        ],
      },
      {
        name: 'assignees',
        select: {
          kind: 'match',
          selectors: [
            '[data-testid="list-row-assignees"]',
          ],
        },
        normalize: (root) => {
          const names = [...root.querySelectorAll('a img')]
            .map((img) => img.getAttribute('alt')?.trim())
            .filter((name): name is string => !!name)
            .map((n) => !n.startsWith('@') ? `@${n}` : n);
          if (names.length === 0) return null;
          return h('span', {}, 'assigned to ', names.join(', '));
        },
      },
      {
        name: 'status',
        select: {
          kind: 'match',
          selectors: [
            '[data-testid="list-row-state-icon"]',
          ],
        },
        normalize: (root) => h('span', {}, root.textContent?.trim() || ''),
      },
      {
        name: 'comments',
        select: {
          kind: 'match',
          selectors: [
            '[data-testid="list-row-comments"]',
          ],
        },
        normalize: (root) => {
          const label = root.textContent?.trim() || '';
          if (!label) return null;
          return h('span', {}, label);
        },
      },
      {
        name: 'prs',
        select: {
          kind: 'match',
          selectors: [
            '[data-testid="list-row-linked-pull-requests"]',
          ],
        },
        normalize: (root) => {
          const label = root.querySelector('button[aria-label]')?.getAttribute('aria-label')?.trim() || '';
          if (!label) return null;
          return h('span', {}, label);
        },
      },
      {
        name: 'badges',
        select: { kind: 'root' },
        normalize: (root) => {
          const badges = [...root.querySelectorAll('[data-listview-component="trailing-badge"]')];
          if (!badges.length) return null;
          return h('span', {}, ...badges.flatMap((b, i) => i === 0 ? [b] : [h('span', {}, ', '), b]));
        },
        transforms: [
          { kind: 'remove', selectors: ['.sr-only'] },
          { kind: 'unwrap', selectors: ['a'] },
          { kind: 'replace', with: 'span', selectors: ['div', 'p'] },
        ],
      },
    ],
    itemFn: ([title, description, assignees, status, comments, prs, badges]) => {
      if (!title) return null;

      return h('li', {},
        h('span', {}, title),
        ...brWrap('span', [description, assignees]),
        ...brWrap('span', [status, comments, prs]),
        ...brWrap('span', [badges]),
        h('br'),
        h('br'),
      );
    },
    itemsFn: (items) => h('ul', {}, ...items),
  },
];

export const createListIssuePage: CreatePage = ({ sourceDoc, ctxs, state }) => {
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
