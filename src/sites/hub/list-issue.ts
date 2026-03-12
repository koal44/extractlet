import type { CreatePage } from '../../snapshot-loader';
import { h } from '../../utils/dom';
import { extractBlocks, extractMany, type BlockSpec, type ManySpec } from '../../utils/extract';
import { warn } from '../../utils/logging';
import { scrapePermaUrl, toHtml, toMd } from './hub-core';

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

const itemTransforms: ManySpec['transforms'] = [
  {
    kind: 'remove', selectors: [
      // 'img',
      '[popover="auto"]',
      '[role="tooltip"]',
      '.sr-only',
    ],
  },
  {
    kind: 'unwrap', selectors: [
      '[class^="TrailingBadge"] > a',
      '[data-testid="list-row-repo-name-and-number"] a',
      // '[data-testid="list-row-assignees"] a',
      'button',
    ],
  },
  // { kind: 'replace', selectors: ['div', 'p'], tag: 'span' },
  {
    kind: 'replace', tag: 'span', selectors: [
      '[data-testid="list-row-repo-name-and-number"]',
      '[data-testid="list-row-repo-name-and-number"] p',
      '[data-testid="list-row-repo-name-and-number"] div',
      '[data-testid="list-row-linked-pull-requests"]',
      '[data-testid="list-row-linked-pull-requests"] p',
      '[data-testid="list-row-linked-pull-requests"] div',
      '[data-testid="list-row-comments"]',
      '[data-testid="list-row-comments"] p',
      '[data-testid="list-row-comments"] div',
      '[data-listview-component="trailing-badge"]',
      '[data-listview-component="trailing-badge"] p',
      '[data-listview-component="trailing-badge"] div',
    ],
  },
  {
    kind: 'replaceFn',
    selectors: ['[data-testid="list-row-assignees"]'],
    fn: (el) => {
      const names = [...el.querySelectorAll('a img')].map((img) => img.getAttribute('alt')?.trim());
      if (names.length === 0) return null;
      return h('span', {}, `${names.map((n) => `@${n}`).join(', ')}`);
    },
  },
];

const rowSelectorSpec: ManySpec = {
  select: {
    kind: 'matchAll',
    selectors: [
      'div[class^="IssueRow"]',
    ],
  },
  transforms: itemTransforms,
  normalize: normalizeItem,
};

const componentSelectorSpec: ManySpec = {
  select: {
    kind: 'childrenOfMatch',
    selectors: [
      'ul[data-listview-component="items-list"]',
    ],
  },
  transforms: itemTransforms,
  normalize: normalizeItem,
};

// function normalizeItem(root: Element): Element | null {
//   const title = root.querySelector('a[data-testid="issue-pr-title-link"]');
//   const badges = root.querySelectorAll('[data-listview-component="trailing-badge"]');
//   const status = root.querySelector('[data-testid="list-row-state-icon"]')?.textContent?.trim();
//   const description = root.querySelector('[data-testid="list-row-repo-name-and-number"]');
//   const pr = root.querySelector('[data-testid="list-row-linked-pull-requests"]');
//   const commentNo = root.querySelector('[data-testid="list-row-comments"]');
//   const assignees = root.querySelector('[data-testid="list-row-assignees"]');

//   const hasAssigned = !!assignees?.children.length;
//   const prLabel = pr?.querySelector('button[aria-label]')?.getAttribute('aria-label')?.trim() || '';
//   const comLabel = commentNo?.textContent?.trim() || '';

//   // if (!title) return null;

//   return h('li', {},
//     h('span', {}, title),
//     h('br'),
//     h('span', {},
//       description,
//       `${hasAssigned ? ' · assigned to ' : ''}`, assignees),
//     h('br'),
//     h('span', {},
//       status,
//       `${comLabel ? ' · ' : ''}`, comLabel,
//       `${prLabel ? ' · ' : ''}`, prLabel,
//     ),
//     h('br'),
//     h('span', {}, ...[...badges].flatMap((b, i) => i === 0 ? [b] : [h('span', {}, ', '), b])),
//     h('br'), h('br'),
//   );
// }

const itemSpecs: BlockSpec[] = [
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
      return h('span', {}, ` · ${label}`);
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
      return h('span', {}, ` · ${label}`);
    },
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
      if (!root.children.length) return null;
      return h('span', {}, ' · assigned to ', root);
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
  },
];

function normalizeItem(root: Element): Element | null {
  const [title, description, status, comments, prs, assignees, badges] =
    extractBlocks(root, itemSpecs, root.ownerDocument);

  if (!title) return null;

  return h('li', {},
    h('span', {}, title),
    h('br'),
    h('span', {},
      description,
      assignees,
    ),
    h('br'),
    h('span', {},
      status,
      comments,
      prs,
    ),
    h('br'),
    h('span', {}, badges),
    h('br'), h('br'),
  );
}

export const createListIssuePage: CreatePage = ({ sourceDoc, ctxs, state }) => {
  const permalink = scrapePermaUrl(sourceDoc);
  if (!permalink) return warn(undefined, '[xlet:lists-create] Failed to scrape permalink');

  let listItems = extractMany(sourceDoc, rowSelectorSpec);
  if (!listItems.length) listItems = extractMany(sourceDoc, componentSelectorSpec);
  if (!listItems.length) return warn(undefined, '[xlet:lists-create] Failed to extract list items');

  const ul = h('ul', {}, ...listItems);

  const [pagination, counts] = extractBlocks(sourceDoc, metaSpecs);

  const wrapper = h('div', { class: 'hub-list', __doc: sourceDoc },
    h('div', {}, pagination, `${counts ? ' · ' : ''}`, counts),
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
