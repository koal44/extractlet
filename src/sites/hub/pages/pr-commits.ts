import type { CreatePage } from '../../../snapshot-loader';
import { h } from '../../../utils/dom';
import { extractBlocks, extractMany, type BlockSpec, type ManySpec } from '../../../utils/extract';
import { toHtml, toMd } from '../convert';
import { brWrap, joinWrap } from '../dom';
import { formatDateWithRelative } from '../../../utils/strings';

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
    name: 'main',
    select: { kind: 'root' },
    normalize: (root, ctxs) => {
      const [title, status, summary, diffState] = extractBlocks(root, mainFieldSpecs, ctxs);
      return h('section', {},
        ...brWrap('div', [title, status], ' · '),
        ...brWrap('div', [summary]),
        ...brWrap('div', [diffState]),
      );
    },
  },
  {
    name: 'history',
    select: { kind: 'root' },
    normalize: (root, ctxs) => {
      const history = extractMany(root, historyManySpec, ctxs);
      if (!history.length) return null;
      return h('section', {}, ...history);
    },
  },
];

const mainFieldSpecs: BlockSpec[] = [
  {
    name: 'title',
    select: {
      kind: 'match',
      selectors: [
        '[data-component="TitleArea"]',
      ],
    },
    normalize: (root) => {
      const h1 = root.querySelector('h1[data-component="PH_Title"]');
      if (!h1) return null;

      const spans = [...h1.querySelectorAll(':scope > span')];
      if (spans.length >= 2) {
        const first = spans[0]?.textContent?.trim();
        const second = spans[1]?.textContent?.replace(/\s+/g, ' ').trim();

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
      ],
    },
    normalize: (root) => {
      const statusEl = root.querySelector('[data-status]');
      const raw = statusEl?.getAttribute('data-status')?.trim();
      if (!raw) return null;
      const status = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
      return h('span', {}, status);
    },
  },
  {
    name: 'summary',
    select: {
      kind: 'match',
      selectors: [
        '[class*="PullRequestHeaderSummary"]',
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
      { kind: 'remove', selectors: ['button', '[popover]'] },
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
];

const historyFieldSpecs: BlockSpec[] = [
  {
    name: 'date',
    select: {
      kind: 'match',
      selectors: ['[data-testid="commit-group-title"]'],
    },
  },
  {
    name: 'commits',
    select: { kind: 'root' },
    normalize: (root, ctxs) => {
      const commits = extractMany(root, commitManySpec, ctxs);
      return commits.length ? h('div', {}, ...commits) : null;
    },
  },
];

const historyManySpec: ManySpec = {
  select: {
    kind: 'matchAll',
    selectors: [
      '.Timeline-Item',
      // '[data-testid="commit-group"]',
    ],
  },
  normalize: (root, ctxs) => {
    const [date, commits] = extractBlocks(root, historyFieldSpecs, ctxs);
    if (!date && !commits) return null;
    return h('div', {}, ...(date ? [date] : []), ...(commits ? [commits] : []));
  },
};

const commitManySpec: ManySpec = {
  select: {
    kind: 'matchAll',
    // selectors: ['li[class*="CommitRow"]'],
    selectors: ['li[data-testid="commit-row-item"]'],
  },
  normalize: (root, ctxs) => {
    const [title, shortLink, message, attribution, checks, commentCount] =
      extractBlocks(root, commitFieldSpecs, ctxs);

    return h('div', {},
      ...brWrap('span', [title]),
      ...brWrap('span', [shortLink]),
      ...brWrap('span', [message]),
      ...brWrap('span', [attribution]),
      ...brWrap('span', [checks, commentCount], ' · '),
    );
  },
};

const commitFieldSpecs: BlockSpec[] = [
  {
    name: 'title',
    select: {
      kind: 'match',
      selectors: ['h4[class*="ListItemTitle"]'],
    },
    transforms: [
      { kind: 'unwrap', selectors: ['a'] },
    ],
  },
  {
    name: 'short-link',
    select: {
      kind: 'ancestor',
      selectors: [
        '[data-testid="commit-row-view-code"]',
        '[data-testid="commit-row-browse-repo"]',
        'svg.octicon-copy',
        'svg.octicon-code',
      ],
    },
    normalize: (root) => {
      const link = root.querySelector('a[href*="/commit/"], a[href*="/commits/"]');
      return link ? h('span', {}, link) : null;
    },
  },
  {
    name: 'message',
    select: {
      kind: 'match',
      selectors: ['h4[class*="ListItemTitle"]'],
    },
    normalize: (root) => {
      const a = root.querySelector('a');
      return a?.title ? h('pre', {}, a.title) : null;
    },
  },
  {
    name: 'attribution',
    select: {
      kind: 'match',
      selectors: ['[class^="CommitAttribution"]', '[class*="CommitAttribution"]'],
    },
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
    select: {
      kind: 'match',
      selectors: ['[data-testid="checks-status-badge-button"]'],
    },
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
    select: {
      kind: 'match',
      selectors: ['a[data-testid="commit-row-comments"]'],
    },
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

export const createPrCommitsPage: CreatePage = ({ sourceDoc, ctxs, state }) => {
  const pageBlocks = extractBlocks(sourceDoc, blocks, ctxs);

  const wrapper = h('div', { class: 'hub-pr-commits', __doc: sourceDoc },
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
