import type { CreatePage } from '../../../snapshot-loader';
import { h } from '../../../utils/dom';
import { extractBlocks, type BlockSpec } from '../../../utils/extract';
import { toHtml, toMd } from '../convert';
import { brWrap, joinWrap, normalizeCheckStatus } from '../dom';

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
    name: 'workflow-runs-summary',
    select: { kind: 'match', selectors: ['page-header'] },
    normalize: (root) => root,
    transforms: [
      {
        kind: 'remove', selectors: [
          'button',
          'modal-dialog',
          'actions-workflow-filter',
          // '.PageHeader-actions',
          // '.PageHeader-navigation',
        ],
      },
      { kind: 'replace', with: 'div', selectors: ['page-header'] },
    ],
  },
  {
    name: 'pagination',
    select: {
      kind: 'match',
      selectors: ['.paginate-container [role="navigation"]'],
    },
    normalize: (root) => {
      const current = Number(root.querySelector('em[aria-current="page"]')?.textContent?.trim() || '');
      const pageNums = [...root.querySelectorAll('a[href*="page"]')]
        .map((a) => Number(a.textContent?.trim() || ''))
        .filter((n) => !isNaN(n));
      const maxPage = pageNums.length ? Math.max(...pageNums) : current;
      if (isNaN(current) || isNaN(maxPage)) return null;
      return h('span', {}, `Page ${current} of ${maxPage}`);
    },
  },
  // {
  //   name: 'workflow-runs',
  //   // select: { kind: 'childrenOfMatch', selectors: ['#partial-actions-workflow-runs'] },
  //   select: { kind: 'matchAll', selectors: ['[id^="check_suite_"]'] },
  //   fields: [
  //     {
  //       name: 'all',
  //       select: { kind: 'root' },
  //       normalize: (root) => {
  //         // extract status from svg aria-label and insert somewhere visible
  //         const svg = root.querySelector('svg[aria-label]');
  //         const status = svg?.getAttribute('aria-label') ?? null;
  //         const normStatus = normalizeCheckStatus(status);
  //         if (normStatus) {
  //           root.querySelectorAll('relative-time').forEach((el) => {
  //             el.insertAdjacentElement('beforebegin', h('span', {}, normStatus, ' · '));
  //           });
  //         }
  //         return root;
  //       },
  //       transforms: [
  //         { kind: 'remove', selectors: ['details', '.d-md-none'] },
  //         { kind: 'replace', with: 'h4', selectors: ['.d-table-cell > a[href*="/actions/runs/"]'] },
  //         {
  //           kind: 'replaceFn', selectors: ['.d-table-cell > a[href*="/actions/runs/"]'],
  //           fn: (el) => h('h4', {}, el),
  //         },
  //         { kind: 'unwrap', selectors: ['a[data-hovercard-type="user"]'] },
  //       ],
  //     },
  //   ],
  // },
  {
    name: 'workflow-runs',
    select: { kind: 'matchAll', selectors: ['[id^="check_suite_"]'] },
    fields: [
      {
        name: 'title',
        select: { kind: 'match', selectors: ['.d-table-cell > a[href*="/actions/runs/"]'] },
      },
      {
        name: 'info',
        select: { kind: 'match', selectors: ['.d-table-cell > a[href*="/actions/runs/"] + *'] },
        transforms: [
          { kind: 'unwrap', selectors: ['a[data-hovercard-type="user"]'] },
        ],
      },
      {
        name: 'branch',
        select: { kind: 'match', selectors: ['a.branch-name'] },
      },
      {
        name: 'status',
        select: { kind: 'root' },
        normalize: (root) => {
          const svg = root.querySelector('svg[aria-label]');
          const status = svg?.getAttribute('aria-label') ?? null;
          const normStatus = normalizeCheckStatus(status);
          return normStatus ? h('span', {}, normStatus) : null;
        },
      },
      {
        name: 'time',
        select: { kind: 'match', selectors: ['relative-time'] },
      },
      {
        name: 'duration',
        select: {
          kind: 'match',
          selectors: [
            'svg.octicon-stopwatch + span',
            '[aria-label="Run duration"] + span',
          ],
        },
      },
    ],
    itemFn: ([title, info, branch, status, time, duration]) => {
      return h('section', {},
        joinWrap('h4', [title]),
        ...brWrap('div', [info, branch], ' · '),
        ...brWrap('div', [status, time, duration], ' · '),
      );
    },
  },
];

export const createActionsPage: CreatePage = ({ sourceDoc, ctxs, state }) => {
  const pageBlocks = extractBlocks(sourceDoc, blocks, ctxs);

  const wrapper = h('div', { class: 'hub-actions', __doc: sourceDoc },
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
