import type { CreatePage } from '../../../snapshot-loader';
import { h, relevelHeadings, removeCommentNodes, scrubBidiText } from '../../../utils/dom';
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
          { kind: 'insertText', selectors: ['span'], text: ' ', where: 'beforeend' },
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
          const svg = root.querySelector('[class*="State"] > svg.octicon');
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
          kind: 'match',
          selectors: ['[class*="PageHeader-Description"] [class*="PullRequestHeaderSummary"]'],
        },
        transforms: [
          {
            kind: 'remove', selectors: [
              'button',
              '[popover]',
              // '.commit-ref-dropdown',
              // 'react-partial',
            ],
          },
          { kind: 'insertText', selectors: ['a'], text: ' ', where: 'beforebegin' },
          { kind: 'insertText', selectors: ['a'], text: ' ', where: 'afterend' },
          { kind: 'replace', with: 'code', selectors: ['a[href*="/tree/"]'] },
          { kind: 'replace', with: 'span', selectors: ['div'] },
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
      const tree = root.querySelector('#pr-file-tree ul[role="tree"]');
      if (!tree) return null;
      relevelHeadings(tree, 3);
      const fileCount = root.querySelector('#prs-files-anchor-tab [class*="prc-CounterLabel"]')?.textContent?.trim();
      return h('section', {}, h('h2', {}, 'Files changed', fileCount ? ` (${fileCount})` : null), tree);
    },
    transforms: [
      // { kind: 'wrapSection', heading: { level: 2, text: 'Files changed' }, relevelChildren: true },
      { kind: 'unwrap', selectors: ['a'] },
      { kind: 'replace', with: 'span', selectors: ['button'] },
      { kind: 'remove', selectors: ['span[data-filterable-item-text]', '[class*="TreeViewItemVisual"]'] },
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
          selectors: ['h3[id^="heading-"] a[href^="#diff-"]'],
        },
        normalize: (root) => {
          scrubBidiText(root);
          removeCommentNodes(root);
          root.querySelectorAll('svg.octicon-arrow-right').forEach((svg) => {
            svg.replaceWith(h('span', {}, ' → '));
          });
          return root;
        },
        transforms: [
          // { kind: 'trim', selectors: ['code'] },
          { kind: 'unwrap', selectors: ['a'] },
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
            if (nums.length !== 2 && nums.length !== 3) continue;

            const [_, adds, dels] = nums.length === 3 ? nums : ['', ...nums];
            return h('span', {}, `+${adds} -${dels}`);
          }

          return null;
        },
      },
      {
        name: 'diff-table',
        select: { kind: 'root' },
        normalize: (root) => {
          const table = root.querySelector('table');
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

export const createPrChangesPage: CreatePage = ({ sourceDoc, ctxs, state }) => {
  const pageBlocks = extractBlocks(sourceDoc, blocks, ctxs);

  const wrapper = h('div', { class: 'xlet-hub-pr-changes', __doc: sourceDoc },
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
