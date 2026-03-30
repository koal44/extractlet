import type { CreatePage } from '../../../snapshot-loader';
import { buildCalendar, type Month } from '../../../utils/date';
import { findCommonAncestor, h } from '../../../utils/dom';
import { extractBlocks, type BlockSpec } from '../../../utils/extract';
import { toHtml, toMd } from '../convert';
import { brWrap, joinWrap } from '../dom';
import { normalizeReadme } from '../dom';

const blocks: BlockSpec[] = [
  {
    name: 'profile',
    select: { kind: 'match', selectors: ['[itemscope][itemtype="http://schema.org/Person"]'] },
    fields: [],
    normalize: (root, _fields, _ctx) => root,
    transforms: [
      {
        kind: 'remove', selectors: [
          '.user-profile-sticky-bar',
          'a[itemprop="image"]',
          'button',
          'dialog-helper',
          '.user-following-container',
          '#sponsor-profile-button',
          '.d-md-none', // duplicate achievements
        ],
      },
      {
        kind: 'unwrap', selectors: [
          'a[href$="tab=followers"]',
          'a[href$="tab=following"]',
          'a[href$="tab=achievements"]',
        ],
      },
      {
        kind: 'replaceFn',
        selectors: ['a:has(> img.avatar:only-child)'],
        fn: (a) => {
          const img = a.querySelector<HTMLImageElement>('img.avatar');
          if (!img) return a;
          return img.alt ? h('span', { class: 'avatar-label' }, img.alt) : null;
        },
      },
      { kind: 'unwrap', selectors: ['div:has(> span.avatar-label:only-child)'] },
      {
        kind: 'replaceFn',
        selectors: ['a[href$="tab=achievements"]:has(> img[alt])'],
        fn: (a) => {
          const img = a.querySelector<HTMLImageElement>('img[alt]');
          if (!img) return a;

          const name = img.alt.replace(/^Achievement:\s*/, '').trim();
          const count = a.querySelector('span.achievement-tier-label')?.textContent?.trim() ?? '';
          const text = count ? `${name} ${count.replace(/^x/, '×')}` : name;

          return h('li', {}, text);
        },
      },
    ],
  },

  {
    name: 'readme',
    select: { kind: 'match', selectors: ['#user-profile-frame .profile-readme article'] },
    normalize: (root, ctxs, _fields) => normalizeReadme(root, ctxs),
    transforms: [
      { kind: 'wrapSection', heading: { level: 2, text: 'README' }, relevelChildren: true },
    ],
  },

  {
    name: 'pinned',
    select: { kind: 'match', selectors: ['.js-pinned-items-reorder-container'] },
    fields: [],
    normalize: (root, _ctx, _fields) => {
      for (const p of root.querySelectorAll('p:has(> .pinned-item-meta)')) {
        const kids = [...p.children];
        for (let i = 0; i < kids.length - 1; i++) {
          kids[i].insertAdjacentText('afterend', ' · ');
        }
      }
      return root;
    },
    transforms: [
      {
        kind: 'remove', selectors: [
          '.sr-only', 'svg',
        ],
      },
      {
        kind: 'replaceFn', selectors: ['a[href$="/stargazers"]'],
        fn: (a) => {
          const n = a.textContent?.trim();
          return n ? h('span', {}, `${n} stars`) : a;
        },
      },
      {
        kind: 'replaceFn', selectors: ['a[href$="/forks"]'],
        fn: (a) => {
          const n = a.textContent?.trim();
          return n ? h('span', {}, `${n} forks`) : a;
        },
      },
    ],
  },

  {
    name: 'contributions',
    select: { kind: 'match', selectors: ['.js-yearly-contributions'] },
    fields: [],
    normalize: (root) => {
      const graph = root.querySelector('.js-calendar-graph');
      if (graph) {
        const contribs = parseContributions(graph, false);
        const cal = buildCalendarHtml(contribs);
        graph.replaceWith(cal);
      }
      return root;
    },
    transforms: [
      {
        kind: 'remove', selectors: [
          'a[href^="#"]',
          // 'details',
          'img',
        ],
      },
      // { kind: 'unwrap', selectors: ['.js-org-filter-links-container a', 'nav'] },
      {
        kind: 'replaceFn', selectors: ['.js-org-filter-links-container'],
        fn: (el) => el,
        transforms: [
          { kind: 'wrapSection', heading: { level: 3, text: 'Organizations' } },
          { kind: 'unwrap', selectors: ['a', 'nav', 'input', 'ul', 'li', 'details-menu'] },
          { kind: 'remove', selectors: ['summary', '.select-menu-header', '.select-menu-no-results'] },
          { kind: 'replace', with: 'span', selectors: ['div', 'details'] },
        ],
      },
      {
        kind: 'replaceFn', selectors: ['.js-activity-overview-graph-container'],
        fn: (el) => {
          const title = el.querySelector('svg.js-activity-overview-graph > title')?.textContent?.replace(/\s+/g, ' ').trim();
          if (title) {
            const m = /contributions from (.+?) to (.+?)\. The contributions are (.+)\.$/.exec(title);
            if (m) {
              const [, from, to, breakdown] = m;
              return h('div', {}, `Contribution breakdown from ${from} to ${to}: ${breakdown}.`);
            }
            return h('div', {}, title);
          }
          const raw = el.getAttribute('data-percentages') ?? '';
          if (!raw) return null;
          try {
            const obj = JSON.parse(raw) as Record<string, number>;
            const breakdown = Object.entries(obj).map(([k, v]) => `${v}% ${k.toLowerCase()}`).join(', ');
            return h('div', {}, `Contribution breakdown: ${breakdown}.`);
          } catch {
            return null;
          }
        },
      },

    ],
  },

  {
    name: 'activity',
    select: { kind: 'match', selectors: ['#js-contribution-activity'] },
    fields: [],
    normalize: (root, _ctx, _fields) => {
      // fuse sibling date links into the h4 headings
      for (const a of root.querySelectorAll<HTMLAnchorElement>('a[href*="?tab=overview&from="]')) {
        const parent = a.parentElement;
        const h4 = parent?.querySelector(':scope > h4');
        if (!h4 || a.previousElementSibling !== h4) continue;
        h4.appendChild(h('span', {}, ' — ', a.textContent?.trim()));
        a.remove();
      }

      return root;
    },
    transforms: [
      { kind: 'unwrap', selectors: ['a[href*="/commits?author="]'] },
      { kind: 'insertText', selectors: ['a[href*="/commits?author="]'], text: '(', where: 'beforebegin' },
      { kind: 'insertText', selectors: ['a[href*="/commits?author="]'], text: ')', where: 'afterend' },
      { kind: 'relevelHeadings', selectors: ['.TimelineItem-body > .Box'], level: 5 },
      { kind: 'replace', selectors: ['.TimelineItem-body > details-toggle > details > summary'], with: 'h4' },
      { kind: 'replace', selectors: ['.TimelineItem-body details details summary'], with: 'h5' },
      { kind: 'unwrap', selectors: ['.TimelineItem-body details li div'] },
      { kind: 'trim', selectors: ['li', 'a'] },
      { kind: 'replaceFn', selectors: ['time'], fn: (time) => h('span', {}, ' — ', time.textContent?.trim()) },
      { kind: 'remove', selectors: ['.TimelineItem-body details li .sr-only', 'form'] },
      { kind: 'unwrap', selectors: ['.TimelineItem-body details', '.TimelineItem-body details-toggle', '.TimelineItem-body summary'] },
      {
        kind: 'replaceFn', selectors: ['a:has(> img.avatar[alt])'], fn: (a) => {
          const img = a.querySelector('img.avatar[alt]');
          return h('span', {}, img?.getAttribute('alt') ?? '@unknown');
        },
      },
    ],
  },

  {
    name: 'repositories',
    select: { kind: 'root' },
    normalize: (root, _ctx, [repoList]) => {
      if (!repoList) return null;
      const repoCount = root.querySelector('[data-tab-item="repositories"] .Counter')?.textContent?.trim();
      return h('section', {},
        h('h2', {}, 'Repositories', repoCount ? ` (${repoCount})` : ''),
        repoList,
      );
    },
    fields: [
      {
        name: 'repoList',
        select: { kind: 'childrenOfMatch', selectors: ['#user-repositories-list > ul'] },

        itemFn: (_fields, root) => {
          const div = findCommonAncestor(root, [
            'a[itemprop~="name"][itemprop~="codeRepository"]',
            '[itemprop="description"]',
            '[itemprop="programmingLanguage"]',
            'relative-time',
            '.topics-row-container',
          ]);
          if (!div) return root;
          const kids = [...div.children];
          const findKid = (selectors: string[]) => kids.find((el) => selectors.some((sel) => el.matches(sel) || el.querySelector(sel)));

          const name = findKid(['a[itemprop~="name"][itemprop~="codeRepository"]']);
          const desc = findKid(['[itemprop="description"]']);
          const meta = findKid(['relative-time', '[itemprop="programmingLanguage"]']);
          const topics = findKid(['.topics-row-container']);

          if (!name || !meta) return root;

          const fork = name.querySelector('h3 + span');
          if (fork) {
            fork.insertAdjacentElement('beforebegin', h('br'));
          }

          if (topics) {
            const topicKids = [...topics.children];
            for (let i = 0; i < topicKids.length - 1; i++) {
              topicKids[i].insertAdjacentText('afterend', ' · ');
            }
          }

          const metaKids = [...meta.children];
          for (let i = 0; i < metaKids.length - 1; i++) {
            metaKids[i].insertAdjacentText('afterend', ' · ');
          }

          return h('div', {},
            name,
            ...brWrap('div', [desc]),
            ...brWrap('div', [topics]),
            ...brWrap('div', [meta]),
          );
        },

        // itemsFn: (items) =>
        //   h('section', {},
        //     h('h2', {}, 'Repositories'),
        //     ...items,
        //   ),

        transforms: [
          { kind: 'remove', selectors: ['.sr-only', 'svg'] },
          {
            kind: 'replaceFn', selectors: ['a[href$="/stargazers"]'], fn: (a) => {
              const n = a.textContent?.trim();
              return n ? h('span', {}, `${n} stars`) : a;
            },
          },
          {
            kind: 'replaceFn', selectors: ['a[href$="/forks"]'], fn: (a) => {
              const n = a.textContent?.trim();
              return n ? h('span', {}, `${n} forks`) : a;
            },
          },
          { kind: 'unwrap', selectors: ['ul', 'li', 'a[href*="/issues?q=label"]'] },
          { kind: 'replaceFn', selectors: ['a.topic-tag'], fn: (a) => h('span', {}, a.textContent?.trim()) },
        ],
      },
    ],
  },

  {
    name: 'stars',
    select: { kind: 'root' },
    normalize: (root, _ctx, [repoList, topicList]) => {
      if (!repoList && !topicList) return null;
      const starCount = root.querySelector('[data-tab-item="stars"] .Counter')?.textContent?.trim();
      return h('section', {},
        h('h2', {}, 'Stars', starCount ? ` (${starCount})` : ''),
        repoList,
        topicList,
      );
    },
    fields: [
      {
        name: 'repoList',
        select: {
          kind: 'childrenOfMatch',
          selectors: ['#user-starred-repos div:has(> .js-starred-repos-search-results)'],
        },
        itemFn: (_fields, root) => {
          const div = findCommonAncestor(root, [
            'h3:has(> a:only-child)',
            '[itemprop="description"]',
            'relative-time',
          ]);
          if (!div) return root;

          const kids = [...div.children];
          const findKid = (selectors: string[]) =>
            kids.find((el) => selectors.some((sel) => el.matches(sel) || !!el.querySelector(sel)));

          const name = findKid(['h3']);
          const desc = findKid(['[itemprop="description"]']);
          const meta = findKid(['relative-time']);

          if (!name || !meta) return root;

          const fork = name.querySelector('h3 + span');
          if (fork) {
            fork.insertAdjacentElement('beforebegin', h('br'));
          }

          const metaKids = [...meta.children];
          for (let i = 0; i < metaKids.length - 1; i++) {
            metaKids[i].insertAdjacentText('afterend', ' · ');
          }

          return h('div', {},
            name,
            ...brWrap('div', [desc]),
            ...brWrap('div', [meta]),
          );
        },
        itemsFn: (items) => h('section', { class: 'xlet-starred-repos' }, ...items),
        transforms: [
          { kind: 'remove', selectors: ['.sr-only', 'svg', '.paginate-container'] },
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
          { kind: 'unwrap', selectors: ['ul', 'li', 'a[href*="/issues?q=label"]'] },
          { kind: 'relevelHeadings', selectors: ['.xlet-starred-repos'], level: 3 },
        ],
      },
      {
        name: 'topicList',
        select: {
          kind: 'match',
          selectors: ['#user-starred-repos > div > div:has(a[href="/topics"])'],
        },
        normalize: (root) => {
          const heading = root.querySelector('h2:has(a[href="/topics"])');
          const articles = root.querySelectorAll('article');
          return h('section', { class: 'xlet-starred-topics' },
            heading,
            h('ul', {}, ...articles),
          );
        },
        transforms: [
          {
            kind: 'replaceFn', selectors: ['article'], fn: (art) => {
              const h1 = art.querySelector('h1');
              return h1 ? h('li', {}, h1.textContent?.trim()) : art;
            },
          },
          { kind: 'unwrap', selectors: ['a[href$="/topics"]'] },
          { kind: 'relevelHeadings', selectors: ['.xlet-starred-topics'], level: 3 },
        ],
      },
    ],
  },

  {
    name: 'sponsoring',
    select: { kind: 'root' },
    normalize: (root, _ctx, [sponsoringList]) => {
      if (!sponsoringList) return null;
      const sponsoringCount = root.querySelector('[data-tab-item="sponsoring"] .Counter')?.textContent?.trim();
      return h('section', {},
        h('h2', {}, 'Sponsoring', sponsoringCount ? ` (${sponsoringCount})` : ''),
        sponsoringList,
      );
    },
    fields: [
      {
        name: 'sponsoringList',
        select: { kind: 'ancestor', selectors: ['#user-profile-frame[src*="?tab=sponsoring"] svg.icon-sponsor'] },
        fields: [
          {
            name: 'sponsoringItems',
            select: { kind: 'matchAll', selectors: [':scope > div'] },
            itemFn: (_fields, root) => {
              const isSponsee = !!root.querySelector('svg.icon-sponsor');
              const infoDiv = root.querySelector('div:has(a[data-hovercard-type]):not(:has(img))');
              if (isSponsee) {
                if (!infoDiv) return root;
                // const name = infoDiv.querySelector('a > span:first-child');
                // const handle = infoDiv.querySelector('a > span:nth-child(2)');
                return h('li', {}, infoDiv);
              }
              return root;
            },
            transforms: [
              { kind: 'unwrap', selectors: ['a[data-hovercard-type]'] },
              { kind: 'remove', selectors: ['.Label'] },
              { kind: 'replaceFn', selectors: ['span.Link--secondary'], fn: (el) => h('span', {}, ` (@${el.textContent?.trim()})`) },
            ],
            itemsFn: (items) => h('ul', {}, ...items),
          },
        ],
        transforms: [
        ],
      },
    ],
  },

  {
    name: 'followList',
    select: { kind: 'ancestor', selectors: ['#user-profile-frame a[data-hovercard-type]'] },
    normalize: (root, _ctx, [followerItems]) => {
      const doc = root.ownerDocument;
      const selected = doc.querySelector('meta[name="selected-link"]')?.getAttribute('value');
      const controller = doc.querySelector('meta[name="route-controller"]')?.getAttribute('content');

      const heading =
        selected === 'followers' || controller === 'profiles_followers' ? 'Followers'
        : selected === 'following' || controller === 'profiles_following' ? 'Following'
        : null;

      if (!heading || !followerItems) return null;

      return h('section', {}, h('h2', {}, heading), followerItems );
    },
    fields: [
      {
        name: 'followerItems',
        select: { kind: 'matchAll', selectors: [':scope > div'] },
        itemFn: (_fields, root) => {
          const infoDiv = root.querySelector('div:has(a[data-hovercard-type]):not(:has(img))');
          if (!infoDiv) return null;
          return h('li', {}, infoDiv);
        },
        transforms: [
          { kind: 'unwrap', selectors: ['a[data-hovercard-type]'] },
          {
            kind: 'replaceFn', selectors: ['a[data-hovercard-type]'], fn: (a) => {
              if (a.querySelector('img')) return a; // not the info div, skip
              const name = a.querySelector('span.Link--primary')?.textContent?.trim();
              const handle = a.querySelector('span.Link--secondary')?.textContent?.trim();
              const title = name && handle ? `${name} (@${handle})` : handle ? `@${handle}` : name ?? '';
              return title ? h('span', {}, title) : a;
            },
          },
        ],
        itemsFn: (items) => h('ul', {}, ...items),
      },
    ],
  },

  {
    name: 'achievements',
    select: { kind: 'root' },
    normalize: (root, _ctx, [items]) => {
      const doc = root.ownerDocument;
      const selected = doc.querySelector('meta[name="selected-link"]')?.getAttribute('value');
      const controller = doc.querySelector('meta[name="route-controller"]')?.getAttribute('content');

      if (selected !== 'achievements' && controller !== 'profiles_achievements') return null;
      if (!items) return null;

      return h('section', {},
        h('h2', {}, 'Achievements'),
        items,
      );
    },
    fields: [
      {
        name: 'items',
        select: { kind: 'matchAll', selectors: ['#user-profile-frame details.js-achievement-card-details'] },
        itemFn: (_fields, root) => {
          const summary = root.querySelector('summary.achievement-card');
          if (!summary) return root;

          const title = summary.querySelector('h3');
          const tier = summary.querySelector('.achievement-tier-label');

          return joinWrap('li', [title, tier]);
        },
        itemsFn: (items) => h('ul', {}, ...items),
        transforms: [
          { kind: 'replace', selectors: ['h3'], with: 'span' },
        ],
      },
    ],
  },

  {
    name: 'sponsors',
    select: { kind: 'match', selectors: [] },
    fields: [],
    normalize: (root, _fields, _ctx) => root,
    transforms: [],
  },
];

type Contribution = { date: Date; count: number; level?: number; };

function parseContributions(root: Element, withLevel = false): Contribution[] {
  if (!root.matches('.js-calendar-graph[data-from][data-to]')) return [];
  const startDate = root.getAttribute('data-from') ?? '';
  const endDate = root.getAttribute('data-to') ?? '';

  const start = new Date(startDate);
  const end = new Date(endDate);

  const startMs = start.getTime();
  const msPerDay = 24 * 60 * 60 * 1000;
  const addDays = (days: number) => new Date(startMs + days * msPerDay);
  // const getDateStr = (date: Date) => date.toISOString().slice(0, 10);

  type Contrib = { dateMs: number; count: number; row: number; col: number; id: string; level?: number; };
  const contribs: Contrib[] = [];
  for (const tip of root.querySelectorAll('tool-tip')) {
    const m = /-(\d+)-(\d+)$/.exec(tip.getAttribute('for') ?? '');
    if (!m) continue;

    const row = +m[1];
    const col = +m[2];
    const count = +(/^(\d+)/.exec(tip.textContent?.trim() ?? '')?.[1] ?? 0);
    const date = addDays(row + col * 7);
    const id = tip.id;

    if (date > end) continue;
    contribs.push({ dateMs: date.getTime(), count, row, col, id });
  }

  if (withLevel) {
    const byTipId: Record<string, Contrib | undefined> = {};
    for (const c of contribs) byTipId[c.id] = c;

    for (const td of root.querySelectorAll<HTMLTableCellElement>('td.ContributionCalendar-day[aria-labelledby][data-level]')) {
      const tipId = td.getAttribute('aria-labelledby') ?? '';
      const c = byTipId[tipId];
      if (!c) continue;

      if (__DEV__) {
        const m = td.id.match(/-(\d+)-(\d+)$/);
        if (!m) throw new Error(`Unexpected aria-labelledby format: ${td.id}`);
        if (c.row !== +m[1] || c.col !== +m[2]) throw new Error(`Row/col mismatch for tip ${tipId}: (${c.row},${c.col}) vs (${m[1]},${m[2]})`);

        const tdDate = td.getAttribute('data-date') ?? '';
        const cDate = new Date(c.dateMs).toISOString();
        if (cDate.slice(0, 10) !== tdDate.slice(0, 10)) throw new Error(`Date mismatch for tip ${tipId}: ${cDate} vs ${tdDate}`);
      }

      const level = Number(td.getAttribute('data-level'));
      if (level >= 0 && level <= 4) c.level = level;
    }
  }

  return contribs
    .sort((a, b) => a.dateMs - b.dateMs)
    .map(({ dateMs: date, count, level }) => ({ date: new Date(date), count, level }));
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function buildCalendarHtml(contribs: Contribution[]): Element {
  const cal = buildCalendar(contribs);
  const html = h('div', { class: 'contribution-calendar' });

  for (const calYear of cal) {
    const yearEl = h('div', { class: 'calendar-year' },
      // h('div', { class: 'year-label' }, `${calYear.year}`),
    );

    for (const calMonth of calYear.months) {
      const monthEl = h('div', { class: 'calendar-month' },
        h('h3', { class: 'month-label' }, `${MONTHS[calMonth.month]} ${calYear.year}`),
        h('br'),
        h('pre', { class: 'calendar-month-grid' }, formatMonthGrid(calMonth)),
      );

      yearEl.appendChild(monthEl);
    }

    html.appendChild(yearEl);
  }

  return html;
}

function formatMonthGrid(calMonth: Month<Contribution>): string {
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
  const fmtCell = (cell: string | number = '-', n: number): string => {
    return String(cell).padStart(n, ' ');
  };

  const lines: string[] = [];
  lines.push([
    fmtCell('Day |', 5),
    ...weekdays.map((d) => fmtCell(d, 4)),
  ].join(' '));

  for (const week of calMonth.weeks) {
    const firstDay = weekdays
      .map((d) => week[d]?.date.getUTCDate())
      .find((d) => !!d);

    const row = [
      fmtCell(`${firstDay} |`, 5),
      ...weekdays.map((d) => fmtCell(week[d]?.count, 4)),
    ];

    lines.push(row.join(' '));
  }

  return lines.join('\n');
}

export const createUserPage: CreatePage = ({ sourceDoc, ctxs, state }) => {
  const pageBlocks = extractBlocks(sourceDoc, blocks, ctxs);

  const wrapper = h('div', { class: 'xlet-owner-user', __doc: sourceDoc },
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
