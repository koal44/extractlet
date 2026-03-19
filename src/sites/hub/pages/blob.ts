import type { CreatePage } from '../../../snapshot-loader';
import { h } from '../../../utils/dom';
import { extractBlocks, type BlockSpec } from '../../../utils/extract';
import { scrapePermaUrl } from '../dom';
import { toHtml, toMd } from '../convert';
import { parseGhPath } from '../route';

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
    ],
  },
  {
    name: 'breadcrumbs',
    select: { kind: 'root' },
    normalize: (el) => {
      const permalink = scrapePermaUrl(el.ownerDocument);
      if (!permalink) return null;

      const parsed = parseGhPath(permalink);
      if (!parsed?.owner || !parsed.repo || parsed.kind !== 'blob' || !parsed.id || !parsed.tail.length) return null;

      const pathInfo = h('div', { class: 'breadcrumb' },
        h('h2', {}, 'Breadcrumb'),
        h('ul', {},
          h('li', {}, 'Repo: ', h('code', {}, `${parsed.owner}/${parsed.repo}`)),
          h('li', {}, 'Ref: ', h('code', {}, parsed.id)),
          h('li', {}, 'Path: ', h('code', {}, parsed.tail.join('/') || '/')),
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
    name: 'blob-info',
    select: {
      kind: 'match',
      selectors: ['[data-testid="blob-size"]'],
    },
    normalize: (root) => h('section', {}, h('h2', {}, 'File Content'), root),
  },
  {
    name: 'blob-content',
    select: {
      kind: 'match',
      selectors: [
        '[data-testid="read-only-cursor-text-area"]',
        '[class*="codeBlobInner"] textarea',
      ],
    },
    normalize: (root) => {
      return h('section', {}, root);
    },
    transforms: [
      {  kind: 'replace', with: 'pre', selectors: ['textarea'] },
    ],
  },
  // {
  //   name: 'repo-tree',
  //   select: {
  //     kind: 'match', selectors: ['[data-testid="repos-file-tree-container"]'],
  //   },
  //   normalize: (root) => {
  //     root.querySelectorAll('li[role="treeitem"]').forEach((li) => {
  //       const fc = li.firstElementChild;
  //       if (!fc || !isDiv(fc)) return;
  //       const isDir = !!fc.querySelector('svg[class*="directory"]');
  //       if (!isDir) return;
  //       fc.insertAdjacentElement('afterend', h('span', {}, '/'));
  //     });

  //     return h('div', { class: 'repo-tree' }, h('h2', {}, 'Repository Tree'), root);
  //   },
  //   transforms: [
  //     { kind: 'replace', with: 'div', selectors: ['nav'] },
  //     { kind: 'replace', with: 'span', selectors: ['div', 'p'] },
  //   ],
  // },
];

export const createBlobPage: CreatePage = ({ sourceDoc, ctxs, state }) => {
  const permalink = scrapePermaUrl(sourceDoc);
  if (!permalink) return undefined;

  const main = sourceDoc.querySelector('main');
  if (!main) return;

  const extract = extractBlocks(main, blocks);
  for (const [i, entry] of extract.entries()) {
    if (!entry) console.warn(`Blob page: ${blocks[i].name} not found`);
  }

  const html = h('div', { class: 'blob-root', __doc: sourceDoc }, ...extract);

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
