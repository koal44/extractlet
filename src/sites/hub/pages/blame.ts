import type { CreatePage } from '../../../snapshot-loader';
import { h, isDiv } from '../../../utils/dom';
import { extractBlocks, extractMany, type ManySpec, type BlockSpec } from '../../../utils/extract';
import { joinWrap, scrapePermaUrl } from '../dom';
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
      if (!parsed?.owner || !parsed.repo || parsed.kind !== 'blame' || !parsed.id || !parsed.tail.length) return null;

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
    normalize: (root) => h('section', {}, h('h2', {}, 'File Info'), root),
  },
  {
    name: 'blame-content',
    select: {
      kind: 'root',
    },
    normalize: (root) => {
      const blames = extractMany(root, blameManySpec);
      return h('section', {}, h('h2', {}, 'Blame'), ...blames);
    },
  },
];

const blameManySpec: ManySpec = {
  select: {
    kind: 'childrenOfMatch',
    selectors: ['.virtual-blame-wrapper'],
  },
  normalize: (root) => {
    const [time, author, message, code, lines] = extractBlocks(root, fieldSpecs);
    return h('div', {},
      lines,
      message, h('br'),
      joinWrap('span', [author, time]), h('br'),
      code
    );
  },
};

const fieldSpecs: BlockSpec[] = [
  {
    name: 'time',
    select: {
      kind: 'match',
      selectors: ['relative-time'],
    },
  },
  {
    name: 'author',
    select: {
      kind: 'match',
      selectors: ['.author-avatar-wrapper'],
    },
    normalize: (root) => {
      const img = root.querySelector('img');
      const match = img?.src.match(/\/u\/(\d+)/);
      return match ? h('span', {}, `u/${match[1]}`) : null;
    },
  },
  {
    name: 'message',
    select: {
      kind: 'match',
      selectors: ['[class*="commitMessageWrapper"]'],
    },
    transforms: [
      {
        kind: 'replace', with: 'span', selectors: ['div', 'p'],
      },
    ],
  },
  {
    name: 'code',
    select: {
      kind: 'match',
      selectors: ['.react-line-code-pairs'],
    },
    normalize: (root) => {
      const lines: string[] = [];

      for (const row of root.children) {
        if (!isDiv(row)) continue;
        const cell = row.querySelector('[data-testid="code-cell"]');
        lines.push(cell?.textContent?.replace(/[\r\n]/g, '') ?? '');
      }

      return h('pre', {}, lines.join('\n'));
    },
  },
  {
    name: 'lines',
    select: {
      kind: 'match',
      selectors: ['.react-line-code-pairs'],
    },
    normalize: (root) => {
      const fc = root.firstElementChild;
      const lc = root.lastElementChild;
      const fcn = fc?.querySelector('.react-line-numbers')?.textContent?.trim();
      const lcn = lc?.querySelector('.react-line-numbers')?.textContent?.trim();
      if (!fcn || !lcn) return null;
      const label = fcn === lcn ? `Line ${fcn}` : `Lines ${fcn}-${lcn}`;
      return h('h3', {}, label);
    },
  },
];

export const createBlamePage: CreatePage = ({ sourceDoc, ctxs, state }) => {
  const permalink = scrapePermaUrl(sourceDoc);
  if (!permalink) return undefined;

  const main = sourceDoc.querySelector('main');
  if (!main) return;

  const extract = extractBlocks(main, blocks);
  for (const [i, entry] of extract.entries()) {
    if (!entry) console.warn(`Blame page: ${blocks[i].name} not found`);
  }

  const html = h('div', { class: 'blame-root', __doc: sourceDoc }, ...extract);

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
