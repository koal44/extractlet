import type { CreatePage } from '../../../snapshot-loader';
import { h } from '../../../utils/dom';
import { extractBlocks, type BlockSpec } from '../../../utils/extract';
import { formatElapsedTime } from '../../../utils/strings';
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
      return root;
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
    name: 'main',
    select: { kind: 'root' },
    normalize: (_root, [title, status, summary, diffState]) => {
      return h('section', {},
        ...brWrap('div', [title, status], ' · '),
        ...brWrap('div', [summary]),
        ...brWrap('div', [diffState]),
      );
    },
    fields: [
      {
        name: 'title',
        select: {
          kind: 'match',
          selectors: [
            '[data-component="TitleArea"] h1[data-component="PH_Title"]',
            'h1.gh-header-title',
          ],
        },
        normalize: (h1) => {
          const els = [...h1.querySelectorAll(':scope > span, :scope > bdi')];
          if (els.length >= 2) {
            const first = els[0]?.textContent?.trim();
            const second = els[1]?.textContent?.replace(/\s+/g, ' ').trim();

            if (first && second?.startsWith('#')) {
              return joinWrap('span', [h('span', {}, first), h('span', {}, second)]);
            }
          }

          return h('span', {}, h1.textContent?.replace(/\s+/g, ' ').trim() ?? '');
        },
      },
      {
        name: 'status',
        select: {
          kind: 'match',
          selectors: [
            '[class*="PageHeader-Description"]',
            '[class*="gh-header-meta"]',
          ],
        },
        normalize: (root) => {
          const svg = root.querySelector('.State > svg.octicon');
          let status: string | null = null;
          if (svg?.classList.contains('octicon-git-pull-request')) status = 'Open';
          else if (svg?.classList.contains('octicon-git-pull-request-draft')) status = 'Draft';
          else if (svg?.classList.contains('octicon-git-pull-request-closed')) status = 'Closed';
          else if (svg?.classList.contains('octicon-git-merge')) status = 'Merged';
          return status ? h('span', {}, status) : null;
        },
      },
      {
        name: 'summary',
        select: {
          kind: 'ancestor',
          selectors: [
            '.gh-header-meta a.author',
            '.gh-header-meta .commit-ref',
            '.gh-header-meta .base-ref',
            '.gh-header-meta .head-ref',
          ],
        },
        normalize: (root) => {
          root.querySelectorAll('a').forEach((a) => {
            a.insertAdjacentElement('afterend', h('span', {}, ' '));
            a.insertAdjacentElement('beforebegin', h('span', {}, ' '));
          });
          return root;
        },
        transforms: [
          { kind: 'remove', selectors: ['button', '[popover], .commit-ref-dropdown, react-partial'] },
          { kind: 'replace', with: 'code', selectors: ['a[href*="/tree/"]'] },
          { kind: 'replace', with: 'span', selectors: ['div', 'p'] },
        ],
      },
      {
        name: 'diff-state',
        select: {
          kind: 'match',
          selectors: [
            '[class*="diffStatesWrapper"]',
            '#diffstat',
          ],
        },
        normalize: (root) => {
          root.querySelectorAll('span').forEach((span) => {
            span.insertAdjacentElement('afterend', h('span', {}, ' '));
            span.insertAdjacentElement('beforebegin', h('span', {}, ' '));
          });
          return h('span', {}, root, 'lines changed');
        },
        transforms: [
          { kind: 'remove', selectors: ['.sr-only'] },
          { kind: 'replace', with: 'span', selectors: ['div', 'p'] },
        ],
      },
    ],
  },
  {
    name: 'selected-commit',
    select: {
      kind: 'match',
      selectors: ['.check-page-commit-message-container'],
    },
    normalize: (root) => {
      const message = root.querySelector('h2.check-page-commit-message');
      const sha = root.querySelector(':scope > details > summary');
      if (!message && !sha) return null;
      return joinWrap('span', [h('span', {}, 'Selected commit: ', sha), message?.textContent], ' — ');
    },
    transforms: [
      { kind: 'wrapSection', heading: { level: 2, text: 'Checks' } },
    ],
  },
  {
    name: 'checks',
    // select: { kind: 'matchAll', selectors: ['.actions-grid-container .js-check-suites-sidebar [id^="check_suite_"]'] },
    select: { kind: 'matchAll', selectors: ['[id^="check_suite_"]'] },
    fields: [
      {
        name: 'summary',
        select: { kind: 'match', selectors: [':scope > details > summary'] },
        normalize: (root) => {
          const reportBadge = root.querySelector('svg.octicon-report')?.parentElement;
          const reportCount = reportBadge?.textContent?.trim() ?? '';
          if (reportBadge && /^\d+$/.test(reportCount)) {
            const n = Number(reportCount);
            reportBadge.textContent = `(${n} annotation${n === 1 ? '' : 's'})`;
          }
          return root;
        },
        transforms: [
          { kind: 'replace', with: 'span', selectors: ['div'] },
          { kind: 'replace', with: 'h3', selectors: ['summary'] },
        ],
      },
      {
        name: 'runs',
        // select: { kind: 'match', selectors: [':scope > details > div'] },
        select: { kind: 'matchAll', selectors: [':scope > details > div > div.checks-list-item'] },
        itemFn: ([status, name], root) => {
          const isSelected = root.matches('.selected');
          return h('li', {},
            isSelected ? h('strong', {}, name) : name,
            status
          );
        },
        itemsFn: (items) => h('ul', {}, ...items),
        fields: [
          {
            name: 'status',
            select: { kind: 'match', selectors: ['.checks-list-item-icon'] },
            normalize: (root) => {
              const svg = root.querySelector('svg[aria-label]');
              const status = svg?.getAttribute('aria-label') ?? null;
              const normStatus = normalizeCheckStatus(status);
              return normStatus ? h('div', {}, normStatus) : null;
            },
          },
          {
            name: 'name',
            select: {
              kind: 'match', selectors: [
                'a[href*="/actions/runs/"]',
                'a[href*="checks?check_run_id="]',
                '.text-normal',
              ],
            },
          },
        ],
      },
    ],
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
        return h('section', {}, h('h2', {}, 'Run Log: ', first), second);
      }
      return h('section', {}, h('h2', {}, 'Run Log'), root);
    },
    transforms: [
      { kind: 'replace', with: 'span', selectors: ['div', 'p'] },
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
        // name ? h('code', {}, name) : null,
        name,
        conclusion,
        time,
      ], ' · ');
    },
    itemsFn: (items) => h('ol', {}, ...items),
  },
  {
    name: 'checkrun-summary',
    select: { kind: 'match', selectors: ['[id^="check_run_"]'] },
    transforms: [
      { kind: 'unwrap', selectors: ['sub', 'sup'] },
      { kind: 'wrapSection', heading: { level: 2, text: 'Check Run Summary' }, relevelChildren: true },
    ],
  },
];

export const createPrChecksPage: CreatePage = ({ sourceDoc, ctxs, state }) => {
  const pageBlocks = extractBlocks(sourceDoc, blocks, ctxs);

  const wrapper = h('div', { class: 'hub-pr-checks', __doc: sourceDoc },
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
