import { setLang } from '../../../normalize';
import type { CreatePage } from '../../../snapshot-loader';
import { h } from '../../../utils/dom';
import { extractBlocks, type BlockSpec } from '../../../utils/extract';
import { toHtml, toMd } from '../convert';
import { normalizeCodeTable, statusFromSvg } from '../dom';

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
    name: 'workflow-info',
    select: { kind: 'root' },
    normalize: (root) => {
      const blob = root.querySelector('.blob-wrapper');
      const prev = blob?.previousElementSibling;
      if (prev?.querySelector('a[href*="/blob/"]')) {
        return prev;
      }
      return null;
    },
    transforms: [
      { kind: 'replace', with: 'h2', selectors: ['h4'] },
    ],
  },
  {
    name: 'file',
    select: {
      kind: 'match',
      selectors: ['.blob-wrapper'],
    },
    normalize: (root) => {
      const table = root.querySelector('table');
      if (!table) return null;
      const norm = normalizeCodeTable(table);
      if (!norm) return null;
      setLang(norm, 'yaml');
      return norm;
    },
    transforms: [
      { kind: 'remove', selectors: ['template'] },
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

export const createActionsWorkflowPage: CreatePage = ({ sourceDoc, ctxs, state }) => {
  const pageBlocks = extractBlocks(sourceDoc, blocks, ctxs);

  const wrapper = h('div', { class: 'hub-actions-workkflow', __doc: sourceDoc },
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
