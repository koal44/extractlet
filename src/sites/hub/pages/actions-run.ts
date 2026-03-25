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
    name: 'workflow-summary',
    select: {
      kind: 'match',
      selectors: [
        '.actions-workflow-stats',
      ],
    },
    normalize: (root) => root,
    transforms: [
      { kind: 'wrapSection', heading: { level: 2, text: 'Workflow Summary' }, relevelChildren: true },
      { kind: 'remove', selectors: ['img'] },
      { kind: 'replace', with: 'span', selectors: ['.col-triggered-content div'] },
      { kind: 'unwrap', selectors: ['a[href$="usage"]', 'a[href^="#"]', '.col-triggered-content a[data-hovercard-type="user"]'] },
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
  /*
  {
    name: 'workflow-graph',
    select: {
      kind: 'match',
      selectors: [
        'action-graph',
        // '.ActionsWorkflowGraph',
      ],
    },
    // normalize: (root) => root,
    transforms: [
      { kind: 'wrapSection', heading: { level: 2, text: 'Workflow Graph' }, relevelChildren: true },
      { kind: 'replace', with: 'ul', selectors: ['action-graph', '.WorkflowCard'] },
      { kind: 'replace', with: 'li', selectors: ['streaming-graph-job', '.WorkflowCard > *'] },
      { kind: 'replace', with: 'span', selectors: ['a div'] },
      { kind: 'remove', selectors: ['svg', '.WorkflowCard-port'] },
      { kind: 'unwrap', selectors: ['a', '[data-job-id] > button'] },
      {
        kind: 'replaceFn', selectors: ['button'], fn: (b) => {
          if (!b.parentElement?.matches('[data-job-id]')) return null;
          return b;
        },
      },
    ],
  },
  */
  {
    name: 'annotations',
    select: {
      kind: 'match',
      selectors: [
        'div[role="region"][data-url$="annotations_partial"]',
        'div[role="region"][aria-label="Annotations"]',
      ],
    },
    normalize: (root) => root,
    transforms: [
      { kind: 'remove', selectors: ['button'] },
      { kind: 'replace', with: 'span', selectors: ['annotation-message'] },
      { kind: 'unwrap', selectors: ['a'] },
      { kind: 'replace', with: 'div', selectors: ['table', 'td'] },
      { kind: 'replace', with: 'ul', selectors: ['tbody'] },
      { kind: 'replace', with: 'li', selectors: ['tr'] },
      {
        kind: 'replaceFn', selectors: ['[data-target^="annotation-message"]'], fn: (el) => {
          const text = el.textContent?.trim() ?? '';
          return h('blockquote', {}, text.length > 150 ? `${text.slice(0, 150)}…` : text);
        },
      },
    ],
  },
  {
    name: 'artifacts',
    select: { kind: 'match', selectors: ['#artifacts'] },
    normalize: (root) => {
      const cells = [...root.querySelectorAll('tr > :nth-child(4)')];
      if (cells.length && cells.every((c) => !(c.textContent ?? '').trim())) cells.forEach((c) => c.remove());
      return root;
    },
    transforms: [
      // { kind: 'replace', with: 'div', selectors: ['table', 'td'] },
      // { kind: 'replace', with: 'ul', selectors: ['tbody'] },
      // { kind: 'replace', with: 'li', selectors: ['tr'] },
      // { kind: 'remove', selectors: ['thead'] },
    ],
  },
];

export const createActionsRunPage: CreatePage = ({ sourceDoc, ctxs, state }) => {
  const pageBlocks = extractBlocks(sourceDoc, blocks, ctxs);

  const wrapper = h('div', { class: 'hub-actions-run', __doc: sourceDoc },
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
