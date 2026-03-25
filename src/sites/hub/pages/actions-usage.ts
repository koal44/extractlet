import type { CreatePage } from '../../../snapshot-loader';
import { h } from '../../../utils/dom';
import { extractBlocks, type BlockSpec } from '../../../utils/extract';
import { toHtml, toMd } from '../convert';
import { statusFromSvg } from '../dom';

export const blocks: BlockSpec[] = [
  {
    name: 'header',
    select: {
      kind: 'match',
      selectors: [
        '[data-testid="top-nav-center"] nav',
        '#repository-container-header',
      ],
    },
    normalize: (root) => {
      root.querySelectorAll('li').forEach((li) => {
        if (li.nextElementSibling) {
          li.insertAdjacentElement('afterend', h('span', {}, ' / '));
        }
      });
      return h('section', {}, root);
    },
    transforms: [
      {
        kind: 'remove',
        selectors: [
          '#repository-container-header nav',
          '#repository-details-container',
          'ul.pagehead-actions',
        ],
      },
      { kind: 'replace', with: 'span', selectors: ['ul', 'li', 'nav'] },
      {
        kind: 'replaceFn',
        selectors: ['a'],
        fn: (el) => {
          el.textContent = el.textContent?.trim() ?? '';
          return el;
        },
      },
    ],
  },
  {
    name: 'page-title',
    select: {
      kind: 'match',
      selectors: ['h1.PageHeader-title'],
    },
  },
  {
    name: 'workflow-table',
    select: { kind: 'match', selectors: ['table.actions-workflow-table'] },
    normalize: (root) => {
      // remove 3rd column if empty (contains only whitespace)
      const cells = [...root.querySelectorAll('tr > :nth-child(3)')];
      if (cells.length && cells.every((c) => !(c.textContent ?? '').trim())) cells.forEach((c) => c.remove());
      return root;
    },
    transforms: [
      { kind: 'wrapSection', heading: { level: 2, text: 'Usage' } },
      { kind: 'unwrap', selectors: ['a'] },
    ],
  },
  {
    name: 'all-jobs',
    select: { kind: 'ancestor', selectors: ['ul[class*="GroupList"] a[data-test-selector="job-link"]'] },
    normalize: (root) => {
      if (!root.matches('ul[class*="ActionList"]')) return null;
      root.querySelectorAll<SVGElement>('[class*="Leading"] svg').forEach((svg) => {
        const status = statusFromSvg(svg);
        if (status) {
          const node = svg.closest('a, button');
          node?.appendChild(h('span', {}, ` (${status})`));
        }
      });
      return root;
    },
    transforms: [
      { kind: 'remove', selectors: ['svg'] },
      { kind: 'unwrap', selectors: ['a'] },
      { kind: 'replace', with: 'span', selectors: ['button'] },
      { kind: 'wrapSection', heading: { level: 2, text: 'All Jobs' } },
    ],
  },
];

export const createActionsUsagePage: CreatePage = ({ sourceDoc, ctxs, state }) => {
  const pageBlocks = extractBlocks(sourceDoc, blocks, ctxs);

  const wrapper = h('div', { class: 'hub-actions-usage', __doc: sourceDoc },
    ...pageBlocks,
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
