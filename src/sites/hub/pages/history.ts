import type { CreatePage } from '../../../snapshot-loader';
import { h } from '../../../utils/dom';
import { extractBlocks, extractMany, type ManySpec, type BlockSpec } from '../../../utils/extract';
import { brWrap, scrapePermaUrl } from '../dom';
import { toHtml, toMd } from '../convert';
import { parseGhPath } from '../route';
import { formatDateWithRelative } from '../../../utils/strings';

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

      const parsed = parseGhPath(permalink);
      if (!parsed?.owner || !parsed.repo || parsed.kind !== 'commits' || !parsed.id || !parsed.tail.length) return null;

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
    name: 'history',
    select: {
      kind: 'root',
    },
    normalize: (root, ctxs) => {
      const history = extractMany(root, historyManySpec, ctxs);
      return h('section', {}, h('h2', {}, 'History'), ...history);
    },
  },
];

const historyManySpec: ManySpec = {
  select: {
    kind: 'matchAll',
    selectors: ['.Timeline-Item'],
  },
  normalize: (root, ctxs) => {
    return h('div', {}, ...extractBlocks(root, historyFieldSpecs, ctxs));
  },
};

const historyFieldSpecs: BlockSpec[] = [
  {
    name: 'date',
    select: { kind: 'match', selectors: ['[data-testid="commit-group-title"]'] },
  },
  {
    name: 'commits',
    select: { kind: 'root' },
    normalize: (root, ctxs) => {
      const commits = extractMany(root, commitManySpec, ctxs);
      return h('div', {}, ...commits);
    },
  },
];

const commitManySpec: ManySpec = {
  select: {
    kind: 'matchAll',
    selectors: ['li[class*="CommitRow"]'],
  },
  normalize: (root, ctxs) => {
    const [title, shortLink, message, attribution, checks, commentCount] = extractBlocks(root, commitFieldSpecs, ctxs);
    return h('div', {},
      ...brWrap('span', [title]),
      ...brWrap('span', [shortLink]),
      ...brWrap('span', [message]),
      ...brWrap('span', [attribution]),
      ...brWrap('span', [checks, commentCount], ' · '),
    );
    // return h('div', {}, ...extractBlocks(root, commitFieldSpecs));
  },
};

const commitFieldSpecs: BlockSpec[] = [
  {
    name: 'title',
    select: { kind: 'match', selectors: ['h4[class*="ListItemTitle"]'] },
    transforms: [
      { kind: 'unwrap', selectors: ['a'] },
    ],
  },
  {
    name: 'short-link',
    select: {
      kind: 'ancestor', selectors: [
        '[data-testid="commit-row-view-code"]',
        '[data-testid="commit-row-browse-repo"]',
        'svg.octicon-copy',
        'svg.octicon-code',
      ],
    },
    normalize: (root) => {
      const link = root.querySelector('a[href*="/commit/"]');
      return link ? h('span', {}, link) : null;
    },
  },
  {
    name: 'message',
    select: { kind: 'match', selectors: ['h4[class*="ListItemTitle"]'] },
    normalize: (root) => {
      const a = root.querySelector('a');
      return a ? h('pre', {}, a.title) : null;
    },
  },
  {
    name: 'attribution',
    select: { kind: 'match', selectors: ['[class^="CommitAttribution"]'] },
    normalize: (root) => {
      root.querySelectorAll('[data-testid="author-link"], [data-testid="author-avatar"], relative-time').forEach((el) => {
        el.insertAdjacentElement('afterend', h('span', {}, ' '));
        el.insertAdjacentElement('beforebegin', h('span', {}, ' '));
      });
      return root;
    },
    transforms: [
      { kind: 'remove', selectors: ['img'] },
      { kind: 'removeNextSiblings', selectors: ['relative-time'] },
      { kind: 'unwrap', selectors: ['a'] },
      { kind: 'replace', with: 'span', selectors: ['div', 'p'] },
      {
        kind: 'replaceFn',
        selectors: ['relative-time'],
        fn: (el, ctxs) => {
          const iso = el.getAttribute('datetime');
          const text = formatDateWithRelative(iso, { utc: true, now: ctxs.md?.now });
          return h('span', {}, text);
        },
      },
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
    name: 'comment-count',
    select: { kind: 'match', selectors: ['a[data-testid="commit-row-comments"]'] },
    normalize: (root) => {
      const raw = root.textContent?.replace(/\s+/g, ' ').trim() ?? '';
      const n = Number(raw);
      if (!Number.isFinite(n)) return null;
      return h('span', {}, `${n} ${n === 1 ? 'comment' : 'comments'}`);
    },
    transforms: [
      { kind: 'unwrap', selectors: ['a'] },
    ],
  },
];

export const createHistoryPage: CreatePage = ({ sourceDoc, ctxs, state }) => {
  const main = sourceDoc.querySelector('main');
  if (!main) return;

  const extract = extractBlocks(main, blocks, ctxs);
  for (const [i, entry] of extract.entries()) {
    if (!entry && blocks[i].name !== 'breadcrumbs') {
      console.warn(`History page: ${blocks[i].name} not found`);
    }
  }
  const html = h('div', { class: 'history-root', __doc: sourceDoc }, ...extract);

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
