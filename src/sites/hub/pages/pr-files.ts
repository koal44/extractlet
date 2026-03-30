import type { CreatePage } from '../../../snapshot-loader';
import { h, isAnchor, relevelHeadings } from '../../../utils/dom';
import { extractBlocks, type BlockSpec } from '../../../utils/extract';
import { toHtml, toMd } from '../convert';
import { normalizeDiffTable } from '../diff-table';
import { brWrap, joinWrap } from '../dom';

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
        joinWrap('h1', [title, status], ' · '),
        summary,
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
        transforms: [
          { kind: 'replace', with: 'span', selectors: ['h1'] },
        ],
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
          // { kind: 'replace', with: 'span', selectors: ['div'] },
          { kind: 'unwrap', selectors: ['a.author', 'a[data-hovercard-type="user"]'] },
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
    name: 'tree',
    select: { kind: 'root' },
    normalize: (root) => {
      const tree = root.querySelector('file-tree ul[role="tree"]');
      if (!tree) return null;
      relevelHeadings(tree, 3);
      const fileCount = root.querySelector('#files_tab_counter')?.textContent?.trim();
      return h('section', {}, h('h2', {}, 'Files changed', fileCount ? ` (${fileCount})` : null), tree);
    },
    transforms: [
      // { kind: 'wrapSection', heading: { level: 2, text: 'Files changed' }, relevelChildren: true },
      { kind: 'unwrap', selectors: ['a'] },
      { kind: 'replace', with: 'span', selectors: ['button'] },
      { kind: 'remove', selectors: ['span[data-filterable-item-text]'] },
    ],
  },
  {
    name: 'files',
    select: {
      kind: 'matchAll', selectors: [
        '#files div[id^="diff-"]',
        '[data-testid="progressive-diffs-list"] div[id^="diff-"]',
      ],
    },
    fields:
    [
      {
        name: 'path',
        select: {
          kind: 'match',
          // selectors: ['.file-header .file-info a[href^="#diff-"]'],
          selectors: ['.file-header .file-info'],
        },
        // normalize: (root) => {
        //   root.querySelectorAll('svg.octicon-arrow-right').forEach((svg) => {
        //     svg.replaceWith(h('span', {}, ' → '));
        //   });
        //   // scrubBidiText(root);
        //   return root;
        // },
        transforms: [
          {
            kind: 'replaceFn', selectors: ['a'], fn: (a) => {
              if (!isAnchor(a)) return null;
              return h('span', {}, a.title.trim() || a.textContent?.trim());
            },
          },
          {
            kind: 'remove', selectors: [
              'button',
              '.sr-only',
              '.diffstat',
            ],
          },
        ],
      },
      {
        name: 'info',
        select: { kind: 'root' },
        normalize: (root) => {
          for (const el of root.querySelectorAll('span.sr-only')) {
            const text = el.textContent;
            if (!text) continue;

            const nums = [...text.matchAll(/\d+/g)].map((m) => m[0]);
            if (nums.length !== 3) continue;

            const [, adds, dels] = nums;
            return h('span', {}, `+${adds} -${dels}`);
          }

          return null;
        },
      },
      {
        name: 'diff-table',
        select: { kind: 'root' },
        normalize: (root) => {
          const table = root.querySelector('table.diff-table');
          if (table) return normalizeDiffTable(table);

          const reason = root.querySelector('[id^="hidden-diff-reason"]')?.textContent?.trim();
          if (reason) return h('p', {}, reason);

          return null;
        },
      },
    ],
    itemFn: ([path, info, table]) => {
      return h('section', { class: 'xlet-diff-table' },
        joinWrap('h3', [path]),
        info,
        table,
      );
    },
    itemsFn: (items) => h('section', { class: 'xlet-diff-tables' }, ...items),
  },
];

export const createPrFilesPage: CreatePage = ({ sourceDoc, ctxs, state }) => {
  const pageBlocks = extractBlocks(sourceDoc, blocks, ctxs);

  const wrapper = h('div', { class: 'xlet-hub-pr-files', __doc: sourceDoc },
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
