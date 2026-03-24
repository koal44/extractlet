import type { CreatePage } from '../../../snapshot-loader';
import { h } from '../../../utils/dom';
import { extractBlocks, type BlockSpec } from '../../../utils/extract';
import { formatElapsedTime } from '../../../utils/strings';
import { toHtml, toMd } from '../convert';
import { joinWrap } from '../dom';

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
    name: 'page-title', // pr trigger or some other trigger?
    select: {
      kind: 'match',
      selectors: ['h1.PageHeader-title'],
    },
    normalize: (h1) => {
      const els = [...h1.querySelectorAll(':scope > span, :scope > bdi')];
      if (els.length >= 2) {
        const first = els[0]?.textContent?.trim();
        const second = els[1]?.textContent?.replace(/\s+/g, ' ').trim();

        if (first && second?.startsWith('#')) {
          return joinWrap('h1', [h('span', {}, first), h('span', {}, second)]);
        }
      }

      return h1;
    },
  },
  {
    name: 'log-header',
    select: {
      kind: 'match',
      selectors: [
        '#logs [class*="CheckRun-header"]',
      ],
    },
    normalize: (root) => {
      const time = root.querySelector('relative-time');
      if (time) {
        time.insertAdjacentElement('beforebegin', h('span', {}, 'on '));
      }
      const title = root.querySelector('.CheckRun-log-title');
      const first = title?.children[0];
      const second = title?.children[1];
      if (first?.matches('div') && second?.querySelector('relative-time')) {
        return h('section', {}, h('h2', {}, 'Job: ', first), second);
      }
      return h('section', {}, h('h2', {}, 'Job Log'), root);
    },
    transforms: [
      { kind: 'replace', with: 'span', selectors: ['div', 'p'] },
      { kind: 'remove', selectors: ['h4'] },
      { kind: 'unwrap', selectors: ['a'] },
    ],
  },
  {
    name: 'log-entries',
    // select: { kind: 'match', selectors: ['#logs .js-full-logs-container'] },
    select: { kind: 'matchAll', selectors: ['#logs .js-full-logs-container check-steps check-step'] },
    itemFn: (_fields, root) => {
      const name = root.getAttribute('data-name');
      const conclusion = root.getAttribute('data-conclusion');
      const start = root.getAttribute('data-started-at');
      const end = root.getAttribute('data-completed-at') ?? new Date();
      const time = start ? formatElapsedTime(start, end) : null;
      return joinWrap('li', [
        name,
        conclusion,
        time,
      ], ' · ');
    },
    itemsFn: (items) => h('ol', {}, ...items),
  },
  {
    name: 'all-jobs',
    select: { kind: 'ancestor', selectors: ['ul[class*="GroupList"] a[data-test-selector="job-link"]'] },
    normalize: (root) => {
      if (!root.matches('ul[class*="ActionList"]')) return null;
      root.querySelectorAll('a[data-test-selector="job-link"]').forEach((a) => {
        if (a.matches('[aria-current]') || a.closest('li')?.matches('[data-active]')) {
          a.replaceWith(h('strong', {}, a));
        }
      });
      // root.querySelectorAll('svg.octicon').forEach((svg) => {
      //   let status: string | null = null;
      //   const cls = svg.getAttribute('class')?.toLowerCase() ?? '';
      //   if (cls.includes('success')) status = 'ok';
      //   if (cls.includes('skip')) status = 'skipped';
      //   if (cls.includes('fail')) status = 'failed';
      //   if (cls.includes('pending')) status = 'pending';
      //   if (cls.includes('cancel')) status = 'cancelled';
      //   if (status) {
      //     svg.replaceWith(h('span', {}, status, ' · '));
      //   }
      // });
      return h('section', {}, h('h2', {}, 'All Jobs'), root);
    },
    transforms: [
      { kind: 'unwrap', selectors: ['a'] },
      { kind: 'replace', with: 'span', selectors: ['button'] },
    ],
  },
];

export const createActionsJobPage: CreatePage = ({ sourceDoc, ctxs, state }) => {
  const pageBlocks = extractBlocks(sourceDoc, blocks, ctxs);

  const wrapper = h('div', { class: 'hub-actions-job', __doc: sourceDoc },
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
