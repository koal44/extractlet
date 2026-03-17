import type { CreatePage } from '../../snapshot-loader';
import { h } from '../../utils/dom';
import { extractBlocks, extractMany, type BlockSpec, type ManySpec } from '../../utils/extract';
import { warn } from '../../utils/logging';
import { brWrap, joinWrap, scrapePermaUrl, toHtml, toMd } from './hub-core';

const metaSpecs: BlockSpec[] = [
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
      const maxPage = Math.max(...pageNums);
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
      { kind: 'replace', tag: 'span', selectors: ['div', 'p', 'ul', 'li'] },
      {
        kind: 'unwrap', selectors: [
          'a',
        ],
      },
    ],
  },
];

const rowSpec1: ManySpec = {
  select: {
    kind: 'matchAll',
    selectors: [
      'div[class^="IssueRow"]',
    ],
  },
  normalize: normalizeRow,
};

const rowSpec2: ManySpec = {
  select: {
    kind: 'childrenOfMatch',
    selectors: [
      'ul[data-listview-component="items-list"]',
    ],
  },
  normalize: normalizeRow,
};

const fieldSpecs: BlockSpec[] = [
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
      { kind: 'replace', tag: 'span', selectors: ['div', 'p'] },
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
      { kind: 'replace', tag: 'span', selectors: ['div', 'p'] },
    ],
  },
];

function normalizeRow(root: Element): Element | null {
  const [title, description, assignees, status, comments, prs, badges] =
    extractBlocks(root, fieldSpecs, root.ownerDocument);

  if (!title) return null;

  return h('li', {},
    h('span', {}, title),
    ...brWrap('span', [description, assignees]),
    ...brWrap('span', [status, comments, prs]),
    ...brWrap('span', [badges]),
    h('br'), h('br'),
  );
}

export const createListIssuePage: CreatePage = ({ sourceDoc, ctxs, state }) => {
  const permalink = scrapePermaUrl(sourceDoc);
  if (!permalink) return warn(undefined, '[xlet:lists-create] Failed to scrape permalink');

  let listItems = extractMany(sourceDoc, rowSpec1);
  if (!listItems.length) listItems = extractMany(sourceDoc, rowSpec2);
  if (!listItems.length) return warn(undefined, '[xlet:lists-create] Failed to extract list items');

  const ul = h('ul', {}, ...listItems);
  const [pagination, counts] = extractBlocks(sourceDoc, metaSpecs);
  const wrapper = h('div', { class: 'hub-list', __doc: sourceDoc },
    joinWrap('div', [pagination, counts]),
    ul,
  );

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
