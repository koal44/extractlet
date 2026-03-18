import type { CreatePage } from '../../snapshot-loader';
import { h } from '../../utils/dom';
import { extractBlocks, type BlockSpec } from '../../utils/extract';
import { normalizeFileTable, toHtml, toMd } from './hub-core';

const blocks: BlockSpec[] = [
  {
    name: 'header',
    select: {
      kind: 'match', selectors: ['#repository-container-header'],
    },
    transforms: [
      {
        kind: 'remove', selectors: [
          'nav',
          '#repository-details-container',
          'ul.pagehead-actions',
        ],
      },
    ],
  },
  {
    name: 'meta',
    select: {
      kind: 'ancestor', selectors: [
        'rails-partial a[href="#readme-ov-file"]', // About section
        'rails-partial a[href^="/contact/report-content"]', // About section (alternate)
        'rails-partial a[href$="/releases"]', // Releases section
        'rails-partial a[href*="/graphs/contributors"]', // Contributors section
      ],
    },
    normalize: normalizeMeta,
    transforms: [
      {
        kind: 'remove', selectors: [
          'include-fragment',
          'img.avatar',
          'a[data-hovercard-type="user"] > img',
        ],
      },
      { kind: 'unwrap', selectors: ['a', 'strong'] },
    ],
  },
  {
    name: 'branch-info',
    select: {
      kind: 'ancestor', selectors: [
        'button.overview-ref-selector',
        'a[class*="OverviewContent"][href$="/branches"]',
        'a[class*="OverviewContent"][href$="/tags"]',
      ],
    },
    normalize: (el) => {
      const current = el.querySelector('button.overview-ref-selector')?.textContent?.trim() ?? '??';
      const branches = [...el.querySelectorAll('a[class*="OverviewContent"][href$="/branches"]')].reduce((acc, a) => acc || (a.textContent?.trim() ?? ''), '');
      const tags = [...el.querySelectorAll('a[class*="OverviewContent"][href$="/tags"]')].reduce((acc, a) => acc || (a.textContent?.trim() ?? ''), '');
      return h('div', { class: 'branch-info' }, h('h2', {}, 'Ref info'), h('ul', {}, h('li', {}, 'Ref: ', h('code', {}, current)), h('li', {}, branches), h('li', {}, tags)));
    },
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
    name: 'resources',
    select: { kind: 'match', selectors: ['[class^="OverviewRepoFiles"] nav'] },
    normalize: (nav) => {
      return h('div', { class: 'resource-tabs' }, h('h2', {}, 'Resources'), nav);
    },
    transforms: [
      { kind: 'replace', selectors: ['a[aria-current="page"]'], tag: 'strong' },
      { kind: 'replace', selectors: ['nav'], tag: 'div' },
      { kind: 'unwrap', selectors: ['li > a'] },
    ],
  },
  {
    name: 'active-resource',
    select: {
      kind: 'match', selectors: [
        '[class^="OverviewRepoFiles"] .plain',
        '[class^="OverviewRepoFiles"] .markdown-body',
      ],
    },
    transforms: [
      { kind: 'remove', selectors: ['article a[href^="#"]'] },
      { kind: 'unwrap', selectors: ['article'] },
    ],
  },
];

function walkAbout(el: Element): { label: Element | null; item: Element | null; } {
  const remove = [
    'h3', 'svg', 'include-fragment', 'a[href="#readme-ov-file"]',
    'a[href$="/activity"]', 'a[href*="report-content"]',
  ];
  if (el.matches(remove.join(', '))) return { label: null, item: null };
  if (el.matches('div')) {
    if (el.children.length === 0) return { label: null, item: null };
    if (el.children.length === 1) return walkAbout(el.children[0]);
    if (el.querySelector(':scope > a.topic-tag')) {
      const topics = [...el.querySelectorAll(':scope > a.topic-tag')];
      const parts: (Element | string)[] = [];
      topics.forEach((a, i) => {
        if (i > 0) parts.push(', ');
        a.textContent = a.textContent?.trim() ?? '';
        parts.push(a);
      });
      return { label: null, item: h('div', {}, ...parts) };
    }

    let ul: Element | null = null;
    const items: Element[] = [];
    for (const child of el.children) {
      const result = walkAbout(child);
      if (result.label) {
        if (ul) items.push(ul);
        ul = null;
        items.push(result.label);
      }
      if (result.item) {
        if (!ul) ul = h('ul', { });
        ul.appendChild(h('li', {}, result.item));
      }
    }
    if (ul) {
      if (ul.children.length > 1) items.push(ul);
      if (ul.children.length === 1) items.push(ul.children[0].children[0]);
    }
    return { label: null, item: h('div', {}, ...items) };
  }
  if (el.matches('p, h2')) return { label: el, item: null };
  return { label: null, item: el };
}

function normalizeMeta(meta: Element): Element | null {
  const sections: (Element | null)[] = [];
  for (const group of meta.children) {
    if (group.querySelector('a[href="#readme-ov-file"]')) { // About section
      const about = walkAbout(group);
      sections.push(about.label ?? about.item);
    } else if (group.querySelector('a[href$="/releases"]')) { // Releases section
      sections.push(group);
    } else if (group.querySelector('a[href*="/graphs/contributors"]')) { // Contributors section
      group.querySelectorAll('li').forEach((li) => {
        const span = li.querySelector(':scope > span');
        const alt = li.querySelector(':scope > a > img[alt]')?.getAttribute('alt');
        if (!span && alt) li.appendChild(h('span', {}, alt.replace(/^@/, '')));
      });
      sections.push(group);
    } else if (group.querySelector('.Progress')) { // Languages section
      sections.push(group);
    } else {
      sections.push(group);
    }
  }
  return h('div', { class: 'repo-meta' }, ...sections);
}

export const createRepoPage: CreatePage = ({ sourceDoc, ctxs, state }) => {
  const main = sourceDoc.querySelector('main');
  if (!main) return;

  const extract = extractBlocks(main, blocks);
  for (const [i, entry] of extract.entries()) {
    if (!entry) console.warn(`Repo page: ${blocks[i].name} not found`);
  }

  const html = h('div', { class: 'repo-root', __doc: sourceDoc }, ...extract);

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
