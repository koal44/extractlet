import { setPreserve } from '../../../normalize';
import type { CreatePage } from '../../../snapshot-loader';
import { h, isTable, scrubBidiText } from '../../../utils/dom';
import { extractBlocks, type BlockSpec } from '../../../utils/extract';
import { toHtml, toMd } from '../convert';
import { normalizeDiffTable } from '../diff-table';
import { brWrap, joinWrap } from '../dom';

export const blocks: BlockSpec[] = [
  {
    name: 'header',
    select: {
      kind: 'match', selectors: [
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
        kind: 'remove', selectors: [
          '#repository-container-header nav',
          '#repository-details-container',
          'ul.pagehead-actions',
        ],
      },
      { kind: 'replace', with: 'span', selectors: ['ul', 'li', 'nav'] },
      {
        kind: 'replaceFn', selectors: ['a'],
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
    normalize: (_root, [short, attribution, checks, message, branch, info]) => {
      return h('section', {},
        short,
        joinWrap('div', [attribution, checks], ' · '),
        joinWrap('div', [message]),
        joinWrap('div', [branch]),
        ...brWrap('div', [info]),
      );
    },
    fields: [
      {
        name: 'short',
        select: {
          kind: 'match',
          selectors: ['[data-component="TitleArea"]'],
        },
        normalize: (root) => {
          return h('section', {}, root);
        },
      },
      {
        name: 'attribution',
        select: { kind: 'match', selectors: ['[class*="CommitAttribution"]'] },
        normalize: (root) => {
          root.querySelectorAll('[data-testid="author-link"], [data-testid="author-avatar"], relative-time').forEach((el) => {
            el.insertAdjacentElement('afterend', h('span', {}, ' '));
            el.insertAdjacentElement('beforebegin', h('span', {}, ' '));
          });
          const date = root.querySelector('relative-time');
          date?.insertAdjacentElement('beforebegin', h('span', {}, ' on '));
          return root;
        },
        transforms: [
          { kind: 'remove', selectors: ['img'] },
          { kind: 'removeNextSiblings', selectors: ['relative-time'] },
          { kind: 'unwrap', selectors: ['a'] },
          { kind: 'replace', with: 'span', selectors: ['div', 'p'] },
        ],
      },
      {
        name: 'checks',
        select: { kind: 'match', selectors: ['[data-testid="checks-status-badge-button"]'] },
        normalize: (root) => {
          const text = root.textContent?.replace(/\s+/g, '').trim();
          return text ? h('span', {}, `${text} checks`) : null;
        },
        transforms: [
          { kind: 'unwrap', selectors: ['button'] },
        ],
      },
      {
        name: 'message',
        select: {
          kind: 'match',
          selectors: ['[class*="commitMessageContainer"]'],
        },
        normalize: (root) => {
          return h('blockquote', { 'data-xlet-preserve': true }, root);
        },
      },
      {
        name: 'branch',
        select: {
          kind: 'match',
          selectors: ['[class*="commitBranchContainer"]'],
        },
        normalize: (root) => {
          root.querySelectorAll('span').forEach((span) => {
            if (span.textContent?.trim() === '·') {
              span.textContent = ' · ';
            }
          });
          root.querySelectorAll('a').forEach((a) => {
            const next = a.nextSibling;
            if (next?.nodeType === Node.TEXT_NODE && next.textContent?.startsWith('(')) {
              next.textContent = ` ${next.textContent}`;
            }
          });
          return h('section', {}, root);
        },
        transforms: [
          {
            kind: 'remove', selectors: [
              'button',
              '[popover]',
              'a[href*="/releases/tag/"]',
            ],
          },
          { kind: 'removeNextSiblings', selectors: ['pre a[href*="/commit/"]'] },
          { kind: 'unwrap', selectors: ['pre', 'a'] },
          { kind: 'replace', with: 'span', selectors: ['div', 'p'] },
        ],
      },
      {
        name: 'info',
        select: {
          kind: 'ancestor',
          selectors: [
            '#diff-content-parent [data-testid="expand-file-tree-button"]',
            '#diff-content-parent [data-testid="collapse-file-tree-button"]',
          ],
        },
        normalize: (root) => {
          root.querySelectorAll('div, span').forEach((el) => {
            if (el.textContent?.trim()) {
              el.insertAdjacentElement('afterend', h('span', {}, ' '));
            }
          });
          root.querySelectorAll('h2').forEach((el) => {
            el.insertAdjacentElement('afterend', h('span', {}, ' · '));
          });
          return h('section', {}, root);
        },
        transforms: [
          {
            kind: 'remove', selectors: [
              'button',
              '[popover]',
            ],
          },
          { kind: 'replace', with: 'span', selectors: ['div', 'p', 'h2'] },
        ],
      },
    ],
  },
  {
    name: 'tree',
    select: {
      kind: 'match',
      selectors: ['#diff_file_tree ul[role="tree"]'],
    },
    normalize: (root) => {
      return h('section', {}, h('h2', {}, 'Files changed'), root);
    },
    transforms: [
      { kind: 'unwrap', selectors: ['a'] },
    ],
  },
  {
    name: 'diffs',
    select: {
      kind: 'matchAll',
      selectors: ['#diff-content-parent [role="region"]'],
    },
    fields:
    [
      {
        name: 'path',
        select: {
          kind: 'match',
          selectors: ['h3[id^="heading-"]'],
        },
        normalize: (root) => {
          root.querySelectorAll('svg.octicon-arrow-right').forEach((svg) => {
            svg.replaceWith(h('span', {}, ' → '));
          });
          scrubBidiText(root);
          return root;
        },
        transforms: [
          { kind: 'remove', selectors: ['.sr-only'] },
          { kind: 'replace', with: 'span', selectors: ['a', 'code'] },
        ],
      },
      {
        name: 'info',
        select: {
          kind: 'root',
        },
        normalize: (root) => {
          const texts = [...root.querySelectorAll('span')]
            .map((el) => el.textContent?.trim())
            .filter((t): t is string => !!t);

          const plus = texts.find((t) => /^\+\d+$/.test(t));
          const minus = texts.find((t) => /^-\d+$/.test(t));

          if (!plus && !minus) return null;

          return h('span', {}, [plus, minus].filter(Boolean).join(' '));
        },
      },
      {
        name: 'body',
        select: {
          kind: 'match',
          // selectors: ['table'],
          selectors: ['[data-diff-anchor]'],
        },
        normalize: (root) => {
          if (isTable(root)) return normalizeDiffTable(root);
          return root;
        },
      },
    ],
    itemFn: ([path, info, body]) => {
      return h('section', {},
        ...(path ? [path] : []),
        ...(info ? [info] : []),
        ...(body ? [body] : []),
      );
    },
    itemsFn: (items) => h('section', {}, ...items),
  },
  {
    name: 'comments',
    select: {
      kind: 'matchAll',
      selectors: ['#comments div[id^="commitcomment-"]'],
    },
    fields:
    [
      {
        name: 'author',
        select: {
          kind: 'match',
          selectors: [
            '[data-testid="avatar-link"]',
          ],
        },
        transforms: [
          { kind: 'unwrap', selectors: ['a'] },
        ],
      },
      {
        name: 'time',
        select: {
          kind: 'match',
          selectors: [
            '[data-testid="comment-header"] relative-time',
          ],
        },
      },
      {
        name: 'body',
        select: {
          kind: 'match',
          selectors: [
            ':scope > div > .markdown-body',
          ],
        },
        normalize: (root) => {
          const bq = h('blockquote', {}, root);
          setPreserve(bq, true);
          return bq;
        },
      },
    ],
    itemFn: ([author, time, body]) => {
      return h('section', {},
        ...brWrap('div', [author, time], ' · '),
        ...brWrap('div', [body]),
      );
    },
    itemsFn: (items) => {
      if (!items.length) return null;
      return h('section', {},
        h('h2', {}, 'Comments'),
        ...items,
      );
    },
  },
];

export const createCommitPage: CreatePage = ({ sourceDoc, ctxs, state }) => {
  const commitBlocks = extractBlocks(sourceDoc, blocks, ctxs);
  // const diffRoots = extractMany(sourceDoc, diffManySpec, ctxs);

  const wrapper = h('div', { class: 'hub-commit', __doc: sourceDoc },
    ...commitBlocks,
    // ...diffRoots,
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
