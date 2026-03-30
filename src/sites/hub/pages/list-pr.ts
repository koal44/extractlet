import type { CreatePage } from '../../../snapshot-loader';
import { h, isAnchor } from '../../../utils/dom';
import { extractBlocks, type BlockSpec } from '../../../utils/extract';
import { brWrap, joinWrap } from '../dom';
import { toHtml, toMd } from '../convert';

const blocks: BlockSpec[] = [
  {
    name: 'meta',
    select: { kind: 'root' },
    normalize: (_root, [counts, pagination]) => {
      return joinWrap('div', [pagination, counts]);
    },
    fields: [
      {
        name: 'counts',
        select: {
          kind: 'match',
          selectors: [
            '.table-list-filters .states',
          ],
        },
        normalize: (root) => {
          const items = [...root.querySelectorAll('a[href*="/pulls?q="][href*="is%3Apr"]')]
            .filter((a): a is HTMLAnchorElement =>
              isAnchor(a) && (a.href.includes('is%3Aopen') || a.href.includes('is%3Aclosed'))
            );
          if (items.length !== 2) return null;
          return h('span', {}, items[0], ' · ', items[1]);
        },
        transforms: [
          { kind: 'replace', with: 'span', selectors: ['div', 'p'] },
          { kind: 'unwrap', selectors: ['a'] },
        ],
      },
      {
        name: 'pagination',
        select: {
          kind: 'match',
          selectors: [
            '.paginate-container [role="navigation"]',
          ],
        },
        normalize: (root) => {
          const current = Number(root.querySelector('em[aria-current="page"]')?.textContent?.trim() || '');
          const pageNums = [...root.querySelectorAll('a[href*="page"]')]
            .map((a) => Number(a.textContent?.trim() || ''))
            .filter((n) => !isNaN(n));
          const maxPage = pageNums.length ? Math.max(...pageNums) : current;
          if (isNaN(current) || isNaN(maxPage)) return null;
          return h('span', {}, `Page ${current} of ${maxPage}`);
        },
      },
    ],
  },
  {
    name: 'rows',
    select: {
      kind: 'matchAll',
      selectors: [
        '.js-navigation-container > .js-issue-row',
        '.js-navigation-container > [id^="issue_"]',
      ],
    },
    fields: [
      {
        name: 'title',
        select: {
          kind: 'match',
          selectors: [
            'a[id^="issue_"][id$="_link"]',
          ],
        },
      },
      {
        name: 'description',
        select: {
          kind: 'match',
          selectors: [
            '.opened-by',
          ],
        },
        transforms: [
          { kind: 'unwrap', selectors: ['a'] },
        ],
      },
      {
        name: 'assignees',
        select: {
          kind: 'match',
          selectors: [
            '.AvatarStack',
          ],
        },
        normalize: (root) => {
          const names = [...root.querySelectorAll('a.avatar img')]
            .map((img) => img.getAttribute('alt')?.trim())
            .filter((alt): alt is string => !!alt);
          if (names.length === 0) return null;
          return h('span', {}, `assigned to ${names.join(', ')}`);
        },
      },
      {
        name: 'status',
        select: {
          kind: 'match',
          selectors: [
            'span.tooltipped[aria-label]',
          ],
        },
        normalize: (root) => {
          if (!root.querySelector(
            'svg.octicon-git-pull-request, svg.octicon-git-pull-request-draft, svg.octicon-git-pull-request-closed, svg.octicon-git-merge'
          )) return null;
          const label = root.getAttribute('aria-label')?.trim();
          return label ? h('span', {}, label) : null;
        },
      },
      {
        name: 'comments',
        select: {
          kind: 'root',
        },
        normalize: (root) => {
          const svg = root.querySelector('svg.octicon-comment');
          const a = svg?.closest('a[aria-label]');
          const label = a?.getAttribute('aria-label')?.trim();
          return label ? h('span', {}, label) : null;
        },
      },
      {
        name: 'linked-issues',
        select: {
          kind: 'root',
        },
        normalize: (root) => {
          const svg = root.querySelector('svg.octicon-issue-opened');
          const a = svg?.closest('a');
          const label =
            a?.parentElement?.getAttribute('aria-label')?.trim() ??
            a?.getAttribute('aria-label')?.trim() ?? null;
          return label ? h('span', {}, label) : null;
        },
      },
      {
        name: 'badges',
        select: {
          kind: 'ancestor',
          selectors: [
            'a.IssueLabel[id^="label-"]',
          ],
        },
        normalize: (root) => {
          if (![...root.children].every((c) => isAnchor(c) || c.tagName.toLowerCase() === 'tool-tip')) return null;
          const badges = [...root.querySelectorAll(':scope > a.IssueLabel')]
            .map((a) => a.textContent?.trim())
            .filter((t): t is string => !!t);
          return badges.length ? h('span', {}, badges.join(', ')) : null;
        },
      },
    ],
    itemFn: ([title, description, assignees, status, comments, prs, badges]) => {
      if (!title) return null;

      return h('li', {},
        h('span', {}, title),
        ...brWrap('span', [description, assignees]),
        ...brWrap('span', [status, comments, prs]),
        ...brWrap('span', [badges]),
        h('br'),
        h('br'),
      );
    },
    itemsFn: (items) => h('ul', {}, ...items),
  },
];

export const createListPrPage: CreatePage = ({ sourceDoc, ctxs, state }) => {
  const extracted = extractBlocks(sourceDoc, blocks, ctxs);
  const wrapper = h('div', { class: 'hub-list', __doc: sourceDoc }, ...extracted);

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
