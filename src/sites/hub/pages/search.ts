import { setPreserve } from '../../../normalize';
import type { CreatePage } from '../../../snapshot-loader';
import { h, isAnchor, isList } from '../../../utils/dom';
import { extractBlocks, type BlockSpec } from '../../../utils/extract';
import { toHtml, toMd } from '../convert';
import { brWrap, joinWrap, normalizeCodeTable, scrapePermaUrl } from '../dom';

const blocks: BlockSpec[] = [
  {
    name: 'search-header',
    select: { kind: 'root' },
    normalize: (_root, [count, pages]) => {
      return h('div', {},
        h('h2', {}, 'Search'),
        joinWrap('div', [count, pages], ' · '),
      );
    },
    fields: [
      {
        name: 'results-count',
        select: { kind: 'match', selectors: ['h2#search-results-count'] },
        transforms: [
          { kind: 'replace', with: 'span', selectors: ['h2#search-results-count'] },
        ],
      },
      {
        name: 'pagination',
        select: { kind: 'match', selectors: ['nav[class*="Pagination"]'] },
        normalize: (root) => {
          const current = Number(root.querySelector('a[aria-current]')?.textContent?.trim() || '');
          const pageNums = [...root.querySelectorAll('a[href*="&p="]')].map((a) => Number(a.textContent?.trim() || '')).filter((n) => !isNaN(n));
          const maxPage = Math.max(...pageNums);
          if (isNaN(current) || isNaN(maxPage)) return null;
          return h('span', {},
            `Page ${current} of ${maxPage}`
          );
        },
        transforms: [
          { kind: 'replace', with: 'span', selectors: ['div', 'p'] },
        ],
      },
    ],
  },
  {
    name: 'search-summary',
    select: { kind: 'root' },
    normalize: (root) => {
      const info = getSearchInfo(root.ownerDocument);
      if (!info) return null;
      const { query, type, sort, order } = info;
      if (!query && !type && !sort && !order) return null;

      const makeLi = (label: string, value: string) =>
        value ? h('li', {}, `${label}: `, h('code', {}, value)) : null;

      return h('section', {},
        h('ul', {},
          makeLi('Query', query),
          makeLi('Type', type),
          makeLi('Sort', sort),
          makeLi('Order', order),
        ),
      );
    },
  },
  {
    name: 'filter-by',
    select: { kind: 'match', selectors: ['li[data-testid="kind-group"]'] },
    normalize: (root) => {
      root.querySelectorAll('[data-testid="resolved-count-label"]').forEach((el) => {
        const n = el.textContent?.trim();
        el.textContent = n ? ` (${n})` : '';
      });
      root.querySelectorAll(':scope > ul > li').forEach((li) => {
        if (li.querySelector(':scope > button svg.octicon-chevron-down')) li.remove();
      });
      return h('section', {}, h('h2', {}, 'Filter by'), root);
    },
    transforms: [
      { kind: 'removeNextSiblings', selectors: ['[data-testid="resolved-count-label"]'] },
      { kind: 'unwrap', selectors: ['a'] },
      { kind: 'replace', with: 'div', selectors: ['[data-testid="kind-group"]'] },
    ],
  },
  {
    name: 'languages',
    select: { kind: 'ancestor', selectors: ['li[class*="FacetOption"] > a[class*="ActionList"][href*="language%3A"]'] },
    normalize: (root) => {
      if (!isList(root)) return null;
      return h('section', {}, h('h2', {}, 'Languages'), root);
    },
    transforms: [
      { kind: 'unwrap', selectors: ['a'] },
      {
        kind: 'remove', selectors: [
          'button',
          '[popover]',
          'li[class*="ActionListLinkItem"]',
          'li[class*="Divider"]',
        ],
      },
      { kind: 'replace', with: 'span', selectors: ['div'] },
    ],
  },
  {
    name: 'repositories',
    select: { kind: 'ancestor', selectors: ['li[class*="FacetOption"] > a[class*="ActionList"][href*="repo%3A"]'] },
    normalize: (root) => {
      if (!isList(root)) return null;
      return h('section', {}, h('h2', {}, 'Repositories'), root);
    },
    transforms: [
      { kind: 'unwrap', selectors: ['a'] },
      {
        kind: 'remove', selectors: [
          'img',
          'button',
          '[popover]',
          'li[class*="ActionListLinkItem"]',
          'li[class*="Divider"]',
        ],
      },
      { kind: 'replace', with: 'span', selectors: ['div'] },
    ],
  },
  {
    name: 'paths',
    select: { kind: 'ancestor', selectors: ['li[class*="FacetOption"] > a[class*="ActionList"][href*="path%3A"]'] },
    normalize: (root) => {
      if (!isList(root)) return null;
      return h('section', {}, h('h2', {}, 'Paths'), root);
    },
    transforms: [
      { kind: 'unwrap', selectors: ['a'] },
      {
        kind: 'remove', selectors: [
          'img',
          'button',
          '[popover]',
          'li[class*="ActionListLinkItem"]',
          'li[class*="Divider"]',
        ],
      },
      { kind: 'replace', with: 'span', selectors: ['div'] },
    ],
  },
  {
    name: 'results',
    select: { kind: 'root' },
    normalize: (root, _fields, ctxs) => {
      const info = getSearchInfo(root.ownerDocument);
      if (!info) return null;

      let block: BlockSpec | null = null;
      switch (info.type) {
        case 'code': block = codeResultsBlock; break;
        case 'commits': block = commitResultsBlock; break;
        case 'repositories': block = repoResultsBlock; break;
        case 'issues': block = issueResultsBlock; break;
        case 'pullrequests': block = prResultsBlock; break;
        case 'discussions': block = discussionResultsBlock; break;
        case 'users': block = userResultsBlock; break;
        case 'wikis': block = wikiResultsBlock; break;
        case 'topics': block = topicResultsBlock; break;
        case 'marketplace': block = marketplaceResultsBlock; break;
        case 'registrypackages': block = packageResultsBlock; break;
      }
      if (!block) return null;

      const results = extractBlocks(root, [block], ctxs);
      if (!results.length) return null;

      return h('section', {},
        h('h2', {}, 'Results'),
        h('div', {}, ...results),
      );
    },
  },
];

const codeResultFieldSpecs: BlockSpec[] = [
  {
    name: 'file',
    select: { kind: 'match', selectors: ['.search-title a[data-testid="link-to-search-result"]'] },
  },
  {
    name: 'repo',
    select: { kind: 'match', selectors: ['.search-title a[data-hovercard-type="repository"]'] },
    transforms: [
      { kind: 'replace', with: 'code', selectors: ['a'] },
      { kind: 'unwrap', selectors: ['em'] },
    ],
  },
  {
    name: 'language',
    select: { kind: 'match', selectors: ['[aria-label*="language"]'] },
  },
  {
    name: 'hits',
    select: { kind: 'match', selectors: ['span[class*="CounterLabel"]'] },
    normalize: (root) => {
      const n = Number(root.textContent?.trim());
      if (isNaN(n)) return null;
      return n ? h('span', {}, `${n} ${n === 1 ? 'hit' : 'hits'}`) : null;
    },
  },
  {
    name: 'snippet',
    select: { kind: 'match', selectors: ['.code-list table'] },
    normalize: normalizeCodeTable,
  },
  {
    name: 'grouped-matches',
    select: { kind: 'root' },
    normalize: (root) => {
      const grouped = [...root.querySelectorAll('[data-hovercard-type="repository"]')];
      const count = grouped.length - 1; // exclude the one in the main file/repo field
      if (count <= 0) return null;
      return h('div', {}, `${count} other identical ${count === 1 ? 'match' : 'matches'}`);
    },
  },
];

const codeResultsBlock: BlockSpec = {
  name: 'code-results',
  select: { kind: 'childrenOfMatch', selectors: ['[data-testid="results-list"]'] },
  fields: codeResultFieldSpecs,
  itemFn: ([file, repo, language, hits, snippet, groupedMatches], root) => {
    if (root.querySelector('svg.octicon-info')) return null;
    if (!file || !repo) return null;

    return h('div', {},
      h('h3', {}, file),
      ...brWrap('span', [repo, language, hits], ' · '),
      ...brWrap('div', [snippet]),
      ...brWrap('div', [groupedMatches]),
    );
  },
  itemsFn: (items) => h('div', {}, ...items),
};

const commitResultFieldSpecs: BlockSpec[] = [
  {
    name: 'repo',
    select: { kind: 'match', selectors: ['a[data-hovercard-type="repository"]'] },
    normalize: (root) => {
      return h('code', {}, root);
    },
    transforms: [
      { kind: 'unwrap', selectors: ['a', 'em'] },
    ],
  },
  {
    name: 'title',
    select: { kind: 'match', selectors: ['.search-title a[href*="/commit/"]'] },
    normalize: (root) => {
      if (isAnchor(root)) {
        root.title = '';
        return root;
      }
      return null;
    },
  },
  {
    name: 'attribution',
    select: { kind: 'root' },
    normalize: (root) => {
      const li = [...root.querySelectorAll('li')].find((el) => !!el.querySelector('a[href*="/commits?author="]'));
      return li ?? null;
    },
    transforms: [
      { kind: 'remove', selectors: ['img'] },
      { kind: 'unwrap', selectors: ['a'] },
      { kind: 'replace', with: 'span', selectors: ['div', 'li'] },
    ],
  },
  {
    name: 'message',
    select: { kind: 'match', selectors: ['.search-title a[href*="/commit/"]'] },
    normalize: (root) => {
      if (isAnchor(root) && root.title) {
        return h('pre', {}, root.title);
      }
      return null;
    },
  },
];

const commitResultsBlock: BlockSpec = {
  name: 'commit-results',
  select: { kind: 'childrenOfMatch', selectors: ['[data-testid="results-list"]'] },
  fields: commitResultFieldSpecs,
  itemFn: ([repo, title, attribution, message]) => {
    if (!title || !repo) return null;
    return h('div', {},
      h('h3', {}, title),
      ...brWrap('span', [repo], ' · '),
      ...brWrap('div', [message]),
      ...brWrap('div', [attribution]),
    );
  },
  itemsFn: (items) => h('div', {}, ...items),
};

const discussionResultFieldSpecs: BlockSpec[] = [
  {
    name: 'repo',
    select: { kind: 'match', selectors: ['a[data-hovercard-type="repository"]'] },
    normalize: (root) => h('code', {}, root),
    transforms: [
      { kind: 'unwrap', selectors: ['a', 'em'] },
    ],
  },
  {
    name: 'title',
    select: { kind: 'match', selectors: ['.search-title a[href*="/discussions/"]'] },
  },
  {
    name: 'match-line',
    select: { kind: 'match', selectors: ['span.search-match'] },
    normalize: (root) => {
      const bq = h('blockquote', {}, root);
      setPreserve(bq, true);
      return bq;
    },
  },
  {
    name: 'attribution',
    select: { kind: 'root' },
    normalize: (root) => {
      const li = [...root.querySelectorAll('li')]
        .find((el) => !!el.querySelector('img[data-testid="github-avatar"]'));
      if (!li) return null;
      li.querySelectorAll('span').forEach((el) => {
        el.insertAdjacentElement('afterend', h('span', {}, ' '));
        el.insertAdjacentElement('beforebegin', h('span', {}, ' '));
      });
      return li;
    },
    transforms: [
      { kind: 'remove', selectors: ['img'] },
      { kind: 'unwrap', selectors: ['a'] },
      { kind: 'replace', with: 'span', selectors: ['div', 'li'] },
    ],
  },
  {
    name: 'comments',
    select: { kind: 'root' },
    normalize: (root) => {
      const li = [...root.querySelectorAll('li')]
        .find((el) => !!el.querySelector('svg.octicon-comment-discussion'));
      if (!li) return null;

      const raw = li.textContent?.replace(/\s+/g, ' ').trim() ?? '';
      const n = Number(raw);
      if (!Number.isFinite(n)) return null;

      return h('span', {}, `${n} ${n === 1 ? 'comment' : 'comments'}`);
    },
  },
];

const discussionResultsBlock: BlockSpec = {
  name: 'discussion-results',
  select: { kind: 'childrenOfMatch', selectors: ['[data-testid="results-list"]'] },
  fields: discussionResultFieldSpecs,
  itemFn: ([repo, title, matchLine, attribution, comments]) => {
    if (!title || !repo) return null;
    return h('div', {},
      h('h3', {}, title),
      ...brWrap('span', [repo]),
      ...brWrap('div', [matchLine]),
      ...brWrap('div', [attribution, comments], ' · '),
    );
  },
  itemsFn: (items) => h('div', {}, ...items),
};

const issueResultFieldSpecs: BlockSpec[] = [
  {
    name: 'repo',
    select: { kind: 'match', selectors: ['a[data-hovercard-type="repository"]'] },
    normalize: (root) => h('code', {}, root),
    transforms: [
      { kind: 'unwrap', selectors: ['a', 'em'] },
    ],
  },
  {
    name: 'title',
    select: { kind: 'match', selectors: ['.search-title a[href*="/issues/"]'] },
  },
  {
    name: 'match-line',
    select: { kind: 'match', selectors: [':scope > div > span.search-match'] },
    normalize: (root) => {
      const bq = h('blockquote', {}, root);
      setPreserve(bq, true);
      return bq;
    },
  },
  {
    name: 'attribution',
    select: { kind: 'root' },
    normalize: (root) => {
      const items = [...root.querySelectorAll('li')];
      const authorLi = items.find((el) => !!el.querySelector('img[data-testid="github-avatar"]')) ?? null;
      const dateLi = items.find((el) => !!el.querySelector('span[title*="UTC"]')) ?? null;
      return h('span', {}, joinWrap('span', [authorLi, dateLi], ' · '));
    },
    transforms: [
      { kind: 'remove', selectors: ['img'] },
      { kind: 'unwrap', selectors: ['a'] },
      { kind: 'replace', with: 'span', selectors: ['div', 'li'] },
    ],
  },
  {
    name: 'comments',
    select: { kind: 'root' },
    normalize: (root) => {
      const li = [...root.querySelectorAll('li')]
        .find((el) => !!el.querySelector('svg.octicon-comment-discussion'));
      if (!li) return null;

      const raw = li.textContent?.replace(/\s+/g, ' ').trim() ?? '';
      const n = Number(raw);
      if (!Number.isFinite(n)) return null;

      return h('span', {}, `${n} ${n === 1 ? 'comment' : 'comments'}`);
    },
  },
];

const issueResultsBlock: BlockSpec = {
  name: 'issue-results',
  select: { kind: 'childrenOfMatch', selectors: ['[data-testid="results-list"]'] },
  fields: issueResultFieldSpecs,
  itemFn: ([repo, title, matchLine, attribution, comments]) => {
    if (!title || !repo) return null;
    return h('div', {},
      h('h3', {}, title),
      ...brWrap('span', [repo]),
      ...brWrap('div', [matchLine]),
      ...brWrap('div', [attribution, comments], ' · '),
    );
  },
  itemsFn: (items) => h('div', {}, ...items),
};

const marketplaceResultFieldSpecs: BlockSpec[] = [
  {
    name: 'title',
    select: { kind: 'match', selectors: ['h3 a[href*="/marketplace/"]'] },
    transforms: [
      { kind: 'unwrap', selectors: ['em'] },
    ],
  },
  {
    name: 'description',
    select: { kind: 'root' },
    normalize: (root) => {
      const desc = root.children[1] as Element | undefined ?? null;
      return desc;
    },
  },
  {
    name: 'attribution',
    select: { kind: 'root' },
    normalize: (root) => {
      const ul = root.querySelector(':scope > ul');
      if (!ul) return null;
      const [author, listingType] = [...ul.querySelectorAll('li')] as (HTMLElement | undefined)[];
      return joinWrap('span', [author ?? null, listingType ?? null], ' · ');
    },
    transforms: [
      { kind: 'unwrap', selectors: ['a'] },
      { kind: 'replace', with: 'span', selectors: ['div', 'li'] },
    ],
  },
  {
    name: 'tags',
    select: { kind: 'root' },
    normalize: (root) => {
      const tags = [...root.querySelectorAll('a[href*="/marketplace/category/"]')];
      if (!tags.length) return null;
      return joinWrap('span', tags, ', ');
    },
    transforms: [
      { kind: 'replace', with: 'code', selectors: ['a'] },
    ],
  },
];

const marketplaceResultsBlock: BlockSpec = {
  name: 'marketplace-results',
  select: { kind: 'childrenOfMatch', selectors: ['[data-testid="results-list"]'] },
  fields: marketplaceResultFieldSpecs,
  itemFn: ([title, description, attribution, tags]) => {
    if (!title) return null;

    return h('div', {},
      h('h3', {}, title),
      ...brWrap('span', [description]),
      ...brWrap('span', [tags]),
      ...brWrap('span', [attribution]),
    );
  },
  itemsFn: (items) => h('div', {}, ...items),
};

const packageResultFieldSpecs: BlockSpec[] = [
  {
    name: 'repo',
    select: { kind: 'match', selectors: ['a[data-hovercard-type="repository"]'] },
    normalize: (root) => h('code', {}, root),
    transforms: [
      { kind: 'unwrap', selectors: ['a', 'em'] },
    ],
  },
  {
    name: 'title',
    select: { kind: 'match', selectors: ['h3 .search-title a[href*="/package/"], h3 .search-title a[href*="/packages/"]'] },
  },
  {
    name: 'description',
    select: { kind: 'root' },
    normalize: (root) => {
      const desc = root.querySelector(':scope > div');
      return desc;
    },
  },
  {
    name: 'package-type',
    select: { kind: 'root' },
    normalize: (root) => {
      const items = [...root.querySelectorAll(':scope > ul > li')];
      return items[0] ?? null;
    },
    transforms: [
      { kind: 'remove', selectors: ['svg'] },
      { kind: 'replace', with: 'span', selectors: ['div', 'li'] },
    ],
  },
  {
    name: 'downloads',
    select: { kind: 'root' },
    normalize: (root) => {
      const items = [...root.querySelectorAll(':scope > ul > li')];
      return items[2] ?? null;
    },
    transforms: [
      { kind: 'remove', selectors: ['svg'] },
      { kind: 'replace', with: 'span', selectors: ['div', 'li'] },
    ],
  },
  {
    name: 'updated',
    select: { kind: 'root' },
    normalize: (root) => {
      const items = [...root.querySelectorAll(':scope > ul > li')];
      return items[3] ?? null;
    },
    transforms: [
      { kind: 'replace', with: 'span', selectors: ['div', 'li'] },
    ],
  },
];

const packageResultsBlock: BlockSpec = {
  name: 'package-results',
  select: { kind: 'childrenOfMatch', selectors: ['[data-testid="results-list"]'] },
  fields: packageResultFieldSpecs,
  itemFn: ([repo, title, description, packageType, downloads, updated]) => {
    if (!title || !repo) return null;
    return h('div', {},
      h('h3', {}, title),
      ...brWrap('span', [repo]),
      ...brWrap('div', [description]),
      ...brWrap('span', [packageType, downloads, updated], ' · '),
    );
  },
  itemsFn: (items) => h('div', {}, ...items),
};

const prResultFieldSpecs: BlockSpec[] = [
  {
    name: 'repo',
    select: { kind: 'match', selectors: ['a[data-hovercard-type="repository"]'] },
    normalize: (root) => h('code', {}, root),
    transforms: [
      { kind: 'unwrap', selectors: ['a', 'em'] },
    ],
  },
  {
    name: 'title',
    select: { kind: 'match', selectors: ['.search-title a[href*="/pull/"]'] },
  },
  {
    name: 'match-line',
    select: { kind: 'match', selectors: [':scope > div > span.search-match'] },
    normalize: (root) => {
      const bq = h('blockquote', {}, root);
      setPreserve(bq, true);
      return bq;
    },
  },
  {
    name: 'attribution',
    select: { kind: 'root' },
    normalize: (root) => {
      const items = [...root.querySelectorAll('li')];
      const authorLi = items.find((el) => !!el.querySelector('img[data-testid="github-avatar"]')) ?? null;
      const dateLi = items.find((el) => el.querySelector('span[title*="UTC"]'))
        ?? items.find((el) => el.querySelector('div[class*="Truncate"]'))
        ?? null;
      return h('span', {}, joinWrap('span', [authorLi, dateLi], ' · '));
    },
    transforms: [
      { kind: 'remove', selectors: ['img'] },
      { kind: 'unwrap', selectors: ['a'] },
      { kind: 'replace', with: 'span', selectors: ['div', 'li'] },
    ],
  },
  {
    name: 'comments',
    select: { kind: 'root' },
    normalize: (root) => {
      const li = [...root.querySelectorAll('li')]
        .find((el) => !!el.querySelector('svg.octicon-comment-discussion'));
      if (!li) return null;

      const raw = li.textContent?.replace(/\s+/g, ' ').trim() ?? '';
      const n = Number(raw);
      if (!Number.isFinite(n)) return null;

      return h('span', {}, `${n} ${n === 1 ? 'comment' : 'comments'}`);
    },
  },
  {
    name: 'status',
    select: { kind: 'root' },
    normalize: (root) => {
      const svg = root.querySelector('.search-title > svg.octicon');
      let status: string | null = null;
      if (svg?.classList.contains('octicon-git-pull-request')) status = 'Open';
      else if (svg?.classList.contains('octicon-git-pull-request-draft')) status = 'Draft';
      else if (svg?.classList.contains('octicon-git-pull-request-closed')) status = 'Closed';
      else if (svg?.classList.contains('octicon-git-merge')) status = 'Merged';
      return status ? h('span', {}, status) : null;
    },
  },
];

const prResultsBlock: BlockSpec = {
  name: 'pr-results',
  select: { kind: 'childrenOfMatch', selectors: ['[data-testid="results-list"]'] },
  fields: prResultFieldSpecs,
  itemFn: ([repo, title, matchLine, attribution, comments, status]) => {
    if (!title || !repo) return null;
    return h('div', {},
      h('h3', {}, title),
      ...brWrap('span', [repo]),
      ...brWrap('div', [matchLine]),
      ...brWrap('div', [attribution, status, comments], ' · '),
    );
  },
  itemsFn: (items) => h('div', {}, ...items),
};

const repoResultFieldSpecs: BlockSpec[] = [
  {
    name: 'repo',
    select: { kind: 'match', selectors: [':scope h3 .search-title a'] },
    transforms: [
      { kind: 'unwrap', selectors: ['em'] },
    ],
  },
  {
    name: 'description',
    select: { kind: 'ancestor', selectors: ['h3', 'ul'] },
    normalize: (root) => {
      const firstDiv = root.querySelector(':scope > div');
      if (!firstDiv) return null;
      if (firstDiv.querySelector('a[href*="/topics/"]')) return null;
      const bq = h('blockquote', {}, firstDiv.textContent?.trim());
      setPreserve(bq, true);
      return bq;
    },
  },
  {
    name: 'topics',
    select: { kind: 'root' },
    normalize: (root) => {
      const tags = [...root.querySelectorAll('a[href*="/topics/"]')];
      if (!tags.length) return null;
      return joinWrap('span', tags, ', ');
    },
    transforms: [
      { kind: 'replace', with: 'code', selectors: ['a'] },
    ],
  },
  {
    name: 'language',
    select: { kind: 'ancestor', selectors: ['h3', 'ul'] },
    normalize: (root) => {
      const items = [...root.querySelectorAll(':scope > ul > li')];
      return items[0] ?? null;
    },
    transforms: [
      { kind: 'replace', with: 'span', selectors: ['div', 'li'] },
    ],
  },
  {
    name: 'stars',
    select: { kind: 'ancestor', selectors: ['h3', 'ul'] },
    normalize: (root) => {
      const items = [...root.querySelectorAll(':scope > ul > li')];
      const stars = items[1] as Element | undefined;
      return stars ? h('span', {}, stars, ' stars') : null;
    },
    transforms: [
      { kind: 'remove', selectors: ['svg'] },
      { kind: 'unwrap', selectors: ['a'] },
      { kind: 'replace', with: 'span', selectors: ['div', 'li'] },
    ],
  },
  {
    name: 'updated',
    select: { kind: 'ancestor', selectors: ['h3', 'ul'] },
    normalize: (root) => {
      const items = [...root.querySelectorAll(':scope > ul > li')];
      return items[2] ?? null;
    },
    transforms: [
      { kind: 'replace', with: 'span', selectors: ['div', 'li'] },
    ],
  },
];

const repoResultsBlock: BlockSpec = {
  name: 'repo-results',
  select: { kind: 'childrenOfMatch', selectors: ['[data-testid="results-list"]'] },
  fields: repoResultFieldSpecs,
  itemFn: ([repo, description, topics, language, stars, updated]) => {
    if (!repo) return null;
    return h('div', {},
      h('h3', {}, repo),
      ...brWrap('div', [description]),
      ...brWrap('span', [topics]),
      ...brWrap('span', [language, stars, updated], ' · '),
    );
  },
  itemsFn: (items) => h('div', {}, ...items),
};

const topicResultFieldSpecs: BlockSpec[] = [
  {
    name: 'title',
    select: { kind: 'match', selectors: ['h3 .search-title a'] },
  },
  {
    name: 'repo-count',
    select: { kind: 'root' },
    normalize: (root) => {
      const li = root.querySelector('ul li');
      if (!li) return null;

      const countEl = li.querySelector('[aria-label]');
      return countEl ? h('span', {}, countEl.getAttribute('aria-label')) : null;
    },
  },
];

const topicResultsBlock: BlockSpec = {
  name: 'topic-results',
  select: { kind: 'childrenOfMatch', selectors: ['[data-testid="results-list"]'] },
  fields: topicResultFieldSpecs,
  itemFn: ([title, repoCount]) => {
    if (!title) return null;
    return h('div', {},
      h('h3', {}, title),
      ...brWrap('span', [repoCount]),
    );
  },
  itemsFn: (items) => h('div', {}, ...items),
};

const userResultFieldSpecs: BlockSpec[] = [
  {
    name: 'name',
    select: { kind: 'root' },
    normalize: (root) => {
      const anchors = [...root.querySelectorAll('h3 .search-title a')];
      return anchors[0] ?? null;
    },
  },
  {
    name: 'handle',
    select: { kind: 'root' },
    normalize: (root) => {
      const anchors = [...root.querySelectorAll('h3 .search-title a')];
      const handle = anchors[1] as Element | undefined;
      if (!handle) return null;
      return h('span', {}, '@', handle);
    },
    transforms: [
      { kind: 'unwrap', selectors: ['a'] },
    ],
  },
  {
    name: 'bio',
    select: { kind: 'ancestor', selectors: ['h3', '.search-match', 'ul'] },
    normalize: (root) => {
      if (root.firstElementChild?.tagName !== 'H3') return null;
      const divs = [...root.querySelectorAll(':scope > div')];
      const bioDiv = divs.find((el) => !!el.querySelector('span.search-match')) ?? null;
      const bq = bioDiv ? h('blockquote', {}, bioDiv) : null;
      if (bq) setPreserve(bq, true);
      return bq;
    },
    transforms: [
      { kind: 'unwrap', selectors: ['em'] },
    ],
  },
  {
    name: 'location',
    select: { kind: 'ancestor', selectors: ['h3', '.search-match', 'ul'] },
    normalize: (root) => {
      if (root.firstElementChild?.tagName !== 'H3') return null;
      const items = [...root.querySelectorAll(':scope > ul > li')];
      const firstLi = items[0] as Element | undefined ?? null;
      if (!firstLi) return null;
      if (firstLi.querySelector('svg')) return null;
      return firstLi;
    },
    transforms: [
      { kind: 'replace', with: 'span', selectors: ['li'] },
    ],
  },
  {
    name: 'repos',
    select: { kind: 'ancestor', selectors: ['h3', '.search-match', 'ul'] },
    normalize: (root) => {
      if (root.firstElementChild?.tagName !== 'H3') return null;
      const li = [...root.querySelectorAll('ul li')]
        .find((el) => !!el.querySelector('svg.octicon-repo'));
      if (!li) return null;
      const countEl = li.querySelector('[aria-label*="repositories"]');
      const count = countEl?.getAttribute('aria-label')?.trim() ?? '';
      return count ? h('span', {}, count) : null;
    },
  },
  {
    name: 'followers',
    select: { kind: 'ancestor', selectors: ['h3', '.search-match', 'ul'] },
    normalize: (root) => {
      if (root.firstElementChild?.tagName !== 'H3') return null;
      const li = [...root.querySelectorAll('ul li')]
        .find((el) => !!el.querySelector('svg.octicon-people'));
      if (!li) return null;
      const countEl = li.querySelector('[aria-label*="followers"]');
      const count = countEl?.getAttribute('aria-label')?.trim() ?? '';
      return count ? h('span', {}, count) : null;
    },
  },
];

const userResultsBlock: BlockSpec = {
  name: 'user-results',
  select: { kind: 'childrenOfMatch', selectors: ['[data-testid="results-list"]'] },
  fields: userResultFieldSpecs,
  itemFn: ([name, handle, bio, location, repos, followers]) => {
    if (!name) return null;
    return h('div', {},
      h('h3', {}, name),
      ...brWrap('div', [handle, location, repos, followers], ' · '),
      ...brWrap('div', [bio]),
    );
  },
  itemsFn: (items) => h('div', {}, ...items),
};

const wikiResultFieldSpecs: BlockSpec[] = [
  {
    name: 'repo',
    select: { kind: 'match', selectors: ['a[data-hovercard-type="repository"]'] },
    normalize: (root) => h('code', {}, root),
    transforms: [
      { kind: 'unwrap', selectors: ['a'] },
    ],
  },
  {
    name: 'title',
    select: { kind: 'match', selectors: ['.search-title a[href*="/wiki/"]'] },
    transforms: [
      { kind: 'unwrap', selectors: ['em'] },
    ],
  },
  {
    name: 'snippet',
    select: { kind: 'match', selectors: [':scope > div > span.search-match'] },
    normalize: (root) => {
      const bq = h('blockquote', {}, root);
      setPreserve(bq, true);
      return bq;
    },
    transforms: [
      { kind: 'unwrap', selectors: ['em'] },
    ],
  },
  {
    name: 'updated',
    select: { kind: 'match', selectors: [':scope > ul'] },
    transforms: [
      { kind: 'replace', with: 'span', selectors: ['ul', 'li', 'div'] },
    ],
  },
];

const wikiResultsBlock: BlockSpec = {
  name: 'wiki-results',
  select: { kind: 'childrenOfMatch', selectors: ['[data-testid="results-list"]'] },
  fields: wikiResultFieldSpecs,
  itemFn: ([repo, title, snippet, updated]) => {
    if (!title || !repo) return null;
    return h('div', {},
      h('h3', {}, title),
      ...brWrap('span', [repo]),
      ...brWrap('div', [snippet]),
      ...brWrap('span', [updated]),
    );
  },
  itemsFn: (items) => h('div', {}, ...items),
};

type SearchInfo = { query: string; type: string; sort: string; order: string; };
function getSearchInfo(doc: Document): SearchInfo | null {
  const permalink = scrapePermaUrl(doc);
  if (!permalink) return null;

  let url: URL;
  try {
    url = new URL(permalink);
  } catch {
    return null;
  }

  return {
    query: url.searchParams.get('q')?.trim() ?? '',
    type: url.searchParams.get('type')?.trim() ?? '',
    sort: url.searchParams.get('s')?.trim() ?? '',
    order: url.searchParams.get('o')?.trim() ?? '',
  };
}

export const createSearchPage: CreatePage = ({ sourceDoc, ctxs, state }) => {
  const main = sourceDoc.querySelector('main');
  if (!main) return;

  const extract = extractBlocks(main, blocks, ctxs);
  if (extract.length === 0) {
    console.warn('Search page: no content extracted');
  }
  const html = h('div', { class: 'search-root', __doc: sourceDoc }, ...extract);

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
