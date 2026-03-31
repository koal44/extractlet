import type { CreatePage } from '../../../snapshot-loader';
import { h } from '../../../utils/dom';
import { extractBlocks, type BlockSpec } from '../../../utils/extract';
import { toHtml, toMd } from '../convert';
import { brWrap, joinWrap, normalizeReadme } from '../dom';

const blocks: BlockSpec[] = [
  {
    name: 'profile',
    select: { kind: 'match', selectors: ['.pagehead > div:first-child'] },
    fields: [],
    transforms: [
      { kind: 'remove', selectors: ['img'] },
      { kind: 'unwrap', selectors: ['a[href$="/followers"]'] },
      { kind: 'remove', selectors: ['ul:has(summary[title*="erified"])'] },
    ],
  },

  {
    name: 'readme',
    select: { kind: 'match', selectors: ['main article.markdown-body.entry-content'] },
    normalize: (root, _fields, ctxs) => normalizeReadme(root, ctxs),
    transforms: [
      { kind: 'wrapSection', heading: { level: 2, text: 'README' }, relevelChildren: true },
    ],
  },

  {
    name: 'pinned',
    select: { kind: 'match', selectors: ['.js-pinned-items-reorder-container:has(> .js-pinned-items-reorder-list)'] },
    fields: [],
    normalize: (root) => {
      for (const p of root.querySelectorAll('p:has(> .pinned-item-meta)')) {
        const kids = [...p.children];
        for (let i = 0; i < kids.length - 1; i++) {
          kids[i].insertAdjacentText('afterend', ' · ');
        }
      }
      return root;
    },
    transforms: [
      { kind: 'remove', selectors: ['.sr-only', 'svg'] },
      {
        kind: 'replaceFn',
        selectors: ['a[href$="/stargazers"]'],
        fn: (a) => {
          const n = a.textContent?.trim();
          return n ? h('span', {}, `${n} stars`) : a;
        },
      },
      {
        kind: 'replaceFn',
        selectors: ['a[href$="/forks"]'],
        fn: (a) => {
          const n = a.textContent?.trim();
          return n ? h('span', {}, `${n} forks`) : a;
        },
      },
    ],
  },

  {
    name: 'repositories',
    select: { kind: 'match', selectors: ['#org-repositories .org-repos.repo-list'] },
    transforms: [
      { kind: 'wrapSection', heading: { level: 2, text: 'Repositories' }, relevelChildren: true },
    ],
    fields: [
      {
        name: 'stats',
        select: { kind: 'match', selectors: ['[data-autosearch-results]'] },
      },
      {
        name: 'repoList',
        select: { kind: 'childrenOfMatch', selectors: ['ul'] },
        fields: [
          { name: 'name', select: { kind: 'match', selectors: ['a[itemprop~="name"][itemprop~="codeRepository"]'] } },
          {
            name: 'label', select: { kind: 'match', selectors: ['a[itemprop~="name"][itemprop~="codeRepository"] + span.Label'] },
            transforms: [{ kind: 'trim', selectors: ['span.Label'] }],
          },
          { name: 'description', select: { kind: 'match', selectors: ['[itemprop="description"]'] } },
          {
            name: 'meta', select: {
              kind: 'ancestor', selectors: [
                'relative-time', '[itemprop="programmingLanguage"]', '.octicon-star', '.octicon-law',
                '.octicon-repo-forked', '.octicon-issue-opened', '.octicon-git-pull-request',
              ],
            },
            normalize: (root) => {
              const metaKids = [...root.children];
              for (let i = 0; i < metaKids.length - 1; i++) {
                if (metaKids[i].matches('a[href*="/issues?q=label"]')) continue;
                metaKids[i].insertAdjacentText('afterend', ' · ');
              }
              return root;
            },
            transforms: [
              { kind: 'replaceTemplate', selectors: ['a[href$="/stargazers"]'], template: '{value} star{s}' },
              { kind: 'replaceTemplate', selectors: ['a[href$="/forks"]'], template: '{value} fork{s}' },
              { kind: 'replaceTemplate', selectors: ['a[href$="/issues"]'], template: '{value} issue{s}' },
              { kind: 'replaceTemplate', selectors: ['a[href$="/pulls"]'], template: '{value} PR{s}' },
              { kind: 'remove', selectors: ['a[href*="/issues?q=label"]'] },
            ],
          },
        ],
        itemFn: ([name, label, desc, meta], root) => {
          if (!name || !meta) return root;
          return h('div', {},
            joinWrap('h3', [name, label]),
            ...brWrap('div', [desc]),
            ...brWrap('div', [meta]),
          );
        },
      },
    ],
  },

  {
    name: 'people',
    select: { kind: 'match', selectors: ['a[href$="/people"] + div'] },
    transforms: [
      { kind: 'wrapSection', heading: { level: 2, text: 'People' }, relevelChildren: true },
      { kind: 'replaceTemplate', selectors: ['img[alt]'], from: 'alt' },
      { kind: 'unwrap', selectors: ['a'] },
    ],
  },

  {
    name: 'sponsoring',
    select: { kind: 'match', selectors: ['h4#sponsoring-heading + div'] },
    transforms: [
      { kind: 'wrapSection', heading: { level: 2, text: 'Sponsoring' }, relevelChildren: true },
      { kind: 'replaceTemplate', selectors: ['img[alt]'], from: 'alt' },
      { kind: 'unwrap', selectors: ['a', 'li > div', 'li', 'ul'] },
    ],
  },

  {
    name: 'languages',
    select: { kind: 'ancestor', selectors: ['a[href*="/repositories?language="]'] },
    normalize: (root) => h('ol', {}, root),
    transforms: [
      { kind: 'wrapSection', heading: { level: 2, text: 'Top languages' }, relevelChildren: true },
      { kind: 'replace', selectors: ['a'], with: 'li' },
      { kind: 'remove', selectors: ['h4'] },
      { kind: 'unwrap', selectors: ['div'] },
      { kind: 'trim', selectors: ['span'] },
    ],
  },

  {
    name: 'topics',
    select: { kind: 'ancestor', selectors: ['a[href*="/search?q=topic%3A"]'] },
    transforms: [
      { kind: 'wrapSection', heading: { level: 2, text: 'Topics' }, relevelChildren: true },
      { kind: 'insertText', selectors: ['a:not(:last-child)'], where: 'afterend', text: ',' },
      { kind: 'replace', selectors: ['a'], with: 'code' },
    ],
  },
];

export const createOrgPage: CreatePage = ({ sourceDoc, ctxs, state }) => {
  const wrapper = h('div', { class: 'xlet-owner-org', __doc: sourceDoc },
    ...extractBlocks(sourceDoc, blocks, ctxs),
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
