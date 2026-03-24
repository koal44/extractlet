import type { CreatePage } from '../../../snapshot-loader';
import { h } from '../../../utils/dom';
import { extractBlocks, type BlockSpec } from '../../../utils/extract';
import { brWrap, scrapePermaUrl } from '../dom';
import { toHtml, toMd } from '../convert';
import { getGhRoute } from '../route';
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

      const route = getGhRoute(permalink);
      if (route?.page !== 'commits') return null;

      const pathInfo = h('div', { class: 'breadcrumb' },
        h('h2', {}, 'Breadcrumb'),
        h('ul', {},
          h('li', {}, 'Repo: ', h('code', {}, `${route.owner}/${route.repo}`)),
          h('li', {}, 'Ref: ', h('code', {}, route.ref)),
          h('li', {}, 'Path: ', h('code', {}, route.pathParts?.join('/') || '/')),
        ),
      );
      return pathInfo;
    },
  },
  {
    name: 'history',
    select: {
      kind: 'matchAll',
      selectors: ['.Timeline-Item'],
    },
    fields:
    [
      {
        name: 'date',
        select: { kind: 'match', selectors: ['[data-testid="commit-group-title"]'] },
      },
      {
        name: 'commits',
        select: {
          kind: 'matchAll',
          selectors: ['li[class*="CommitRow"]'],
        },
        fields:
        [
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
        ],
        itemFn: ([title, shortLink, message, attribution, checks, commentCount]) => {
          return h('div', {},
            ...brWrap('span', [title]),
            ...brWrap('span', [shortLink]),
            ...brWrap('span', [message]),
            ...brWrap('span', [attribution]),
            ...brWrap('span', [checks, commentCount], ' · '),
          );
        },
        itemsFn: (items) => h('div', {}, ...items),
      },
    ],
    itemFn: (fields) => h('div', {}, ...fields),
    itemsFn: (items) => h('section', {}, h('h2', {}, 'History'), ...items),
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
