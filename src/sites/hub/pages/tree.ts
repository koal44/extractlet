import type { CreatePage } from '../../../snapshot-loader';
import { h, isDiv } from '../../../utils/dom';
import { extractBlocks, type BlockSpec } from '../../../utils/extract';
import { normalizeFileTable, scrapePermaUrl } from '../dom';
import { toHtml, toMd } from '../convert';
import { getGhRoute } from '../route';

const blocks: BlockSpec[] = [
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
    name: 'breadcrumbs',
    select: { kind: 'root' },
    normalize: (el) => {
      const permalink = scrapePermaUrl(el.ownerDocument);
      if (!permalink) return null;

      const route = getGhRoute(permalink);
      if (route?.page !== 'tree') return null;

      const pathInfo = h('div', { class: 'breadcrumb' },
        h('h2', {}, 'Breadcrumb'),
        h('ul', {},
          h('li', {}, 'Repo: ', h('code', {}, `${route.owner}/${route.repo}`)),
          h('li', {}, 'Ref: ', h('code', {}, route.ref)),
          h('li', {}, 'Path: ', h('code', {}, route.pathParts.join('/') || '/')),
        ),
      );
      return pathInfo;
    },
  },
  {
    name: 'latest-commit',
    select: {
      kind: 'ancestor', selectors: [
        '[data-testid="latest-commit"]',
        '[data-testid="latest-commit-details"]',
      ],
    },
    normalize: (root) => {
      root.querySelectorAll('a[href*="commits"]').forEach((a) => {
        if (!a.textContent?.trim()) a.remove();
      });
      return root;
    },
    transforms: [
      {
        kind: 'remove', selectors: [
          '[data-testid="author-avatar"]',
          '[popover]',
          'button',
          '[data-testid="latest-commit-details"]',
        ],
      },
    ],
  },
  {
    name: 'files-table',
    select: {
      kind: 'match', selectors: [
        'table[aria-labelledby="folders-and-files"]',
        'div[class^="OverviewContent"] table',
      ],
    },
    transforms: [
      {
        kind: 'remove', selectors: [
          'a[data-testid="avatar-icon-link"]',
          '[popover]',
          'button',
          '[data-testid="latest-commit"] relative-time',
        ],
      },
      { kind: 'unwrap', selectors: ['[data-testid="latest-commit-html"] a'] },
      { kind: 'unwrap', selectors: ['a[href*="author="]'] },
    ],
    normalize: normalizeFileTable,
  },
  {
    name: 'repo-tree',
    select: {
      kind: 'match', selectors: ['[data-testid="repos-file-tree-container"]'],
    },
    normalize: (root) => {
      root.querySelectorAll('li[role="treeitem"]').forEach((li) => {
        const fc = li.firstElementChild;
        if (!fc || !isDiv(fc)) return;
        const isDir = !!fc.querySelector('svg[class*="directory"]');
        if (!isDir) return;
        fc.insertAdjacentElement('afterend', h('span', {}, '/'));
      });

      return h('div', { class: 'repo-tree' }, h('h2', {}, 'Repository Tree'), root);
    },
    transforms: [
      { kind: 'replace', with: 'div', selectors: ['nav'] },
      { kind: 'replace', with: 'span', selectors: ['div', 'p'] },
    ],
  },
  {
    name: 'readme',
    select: {
      kind: 'match', selectors: ['#readme'],
    },
    transforms: [
      {
        kind: 'remove', selectors: [
          'button',
          '[popover]',
          'article > .markdown-heading > a[href^="#"]',
        ],
      },
      { kind: 'replace', with: 'div', selectors: ['article'] },
    ],
  },
];

export const createTreePage: CreatePage = ({ sourceDoc, ctxs, state }) => {
  const permalink = scrapePermaUrl(sourceDoc);
  if (!permalink) return undefined;

  const main = sourceDoc.querySelector('main');
  if (!main) return;

  const extract = extractBlocks(main, blocks, ctxs);
  for (const [i, entry] of extract.entries()) {
    if (!entry) console.warn(`Tree page: ${blocks[i].name} not found`);
  }

  const html = h('div', { class: 'tree-root', __doc: sourceDoc }, ...extract);

  return {
    views: [],
    state,
    root: {
      content: {
        html: toHtml(html, ctxs.html)?.outerHTML ?? undefined,
        md: toMd(html, ctxs.md),
      },
    },
  };
};
