import { pickVal, asAbsUrl, type Locator, pickEls } from '../../utils/locator';
import { h, type HChild, isAnchor, isTable, isText } from '../../utils/dom';
import { warn } from '../../utils/logging';
import { chooseCanonicalUrl } from '../../utils/strings';
import { getGhRoute } from './route';
import { setLang } from '../../normalize';
import { type BlockSpec, extractBlock } from '../../utils/extract';
import { type XletContexts } from '../../settings';

const locators: Record<string, Locator[]> = {
  permalink: [
    { sel: 'head > link[rel="canonical"]', attr: 'href', valMap: asAbsUrl },
    { sel: '#repo-content-turbo-frame', attr: 'src', valMap: asAbsUrl },
    // { sel: 'meta[property="og:url"]', attr: 'content' }, // unverified
    // { sel: 'react-app[initial-path]', attr: 'initial-path' }, // unverified
  ],
  title: [
    { sel: 'head > title', attr: 'textContent' },
    { sel: 'h1.gh-header-title > bdi.markdown-title', attr: 'textContent' },
  ],
} as const;

export function scrapePermaUrl(srcDoc: Document): string | undefined {
  let link = pickVal(locators.permalink, srcDoc);
  link = chooseCanonicalUrl(link, srcDoc.baseURI);
  if (!link) return warn(undefined, 'scrapePermaUrl: no link found');
  const route = getGhRoute(link);
  return route.url;
}

export function scrapeTitle(srcDoc: Document): string | undefined {
  const title = pickVal(locators.title, srcDoc);
  return title;
}

export function brWrap(wrapper: keyof HTMLElementTagNameMap, els: HChild[], separator = ' · '): [] | [HTMLElement, HTMLElement] {
  const wrapped = joinWrap(wrapper, els, separator);
  return wrapped ? [h('br'), wrapped] : [];
}

export function joinWrap(wrapper: keyof HTMLElementTagNameMap, els: HChild[], separator = ' · '): HTMLElement | null {
  const present = els.filter((el): el is Element => !!el);
  if (!present.length) return null;

  const parts: Element[] = [];
  present.forEach((el, i) => {
    if (i > 0) parts.push(h('span', {}, separator));
    parts.push(el);
  });

  return h(wrapper, {}, ...parts);
}

export function normalizeFileTable(table: Element): Element | null {
  if (!isTable(table)) throw new Error('[xlet:repo-table] Not a table element');
  const headRow = table.tHead?.rows[0];
  if (!headRow) throw new Error('[xlet:repo-table] Missing header row');

  type HeaderCol = { label: string; colSpan: number; active: boolean; };
  const headerCols: HeaderCol[] = [];
  [...headRow.cells].forEach((c) => {
    const hc = {
      label: c.textContent?.replace(/\s+/g, ' ').trim() ?? '',
      colSpan: c.colSpan || 1,
      active: true,
    };
    // keep smallest so far
    const activeMatch = headerCols.find((h) => h.active && h.label === hc.label);
    if (activeMatch) {
      hc.active = hc.colSpan < activeMatch.colSpan;
      activeMatch.active = !hc.active;
    }
    headerCols.push(hc);
  });

  let latestCommit: Element | null = null;
  const filesList = h('ul', { class: 'files-list' });

  const tbody = table.tBodies[0] as HTMLTableSectionElement | undefined;
  if (!tbody) throw new Error('[xlet:repo-table] Missing table body');

  for (const [i, row] of [...table.tBodies[0].rows].entries()) {
    if (i === 0) {
      latestCommit = row.querySelector('[class^="LatestCommit"]');
      if (latestCommit) {
        latestCommit.querySelectorAll('a').forEach((a) => {
          if (!a.textContent?.trim()) a.remove();
        });
        continue;
      }
      const upTreeLink = row.querySelector('a[data-testid="up-tree"]');
      if (upTreeLink) {
        filesList.appendChild(h('li', { class: 'file-item' }, h('code', {}, '../')));
        continue;
      }
    }
    if (i === table.tBodies[0].rows.length - 1 && row.querySelector('button')) {
      // last row with "View all files" button, skip
      continue;
    }
    const cells = [...row.cells];
    const fileItem = h('li', { class: 'file-item' });
    headerCols.forEach((hc, j) => {
      const cell = cells[j] as HTMLTableCellElement | undefined;
      if (!hc.active || !cell) return;
      if (hc.label === 'Name' || cell.className.includes('name')) {
        const link = cell.querySelector('a');
        const isDir = !!(cell.querySelector('svg[class*="directory"]') ?? cell.querySelector('a[href*="/tree/"]'));
        if (link) fileItem.appendChild(h('span', {}, h('code', {}, link.textContent?.trim() ?? '', `${isDir ? '/' : ''}`), ' ('));
      } else if (hc.label === 'Last commit message' || cell.className.includes('commit')) {
        const msg = cell.textContent?.trim() ?? '';
        fileItem.appendChild(h('span', { class: 'commit-message' }, msg, '; '));
      } else if (cell.querySelector('relative-time')) {
        const time = cell.querySelector('relative-time')!;
        fileItem.appendChild(h('span', {}, time.cloneNode(true), ')'));
      } else {
        fileItem.appendChild(h('span', {}, cell.textContent ?? '', ' '));
      }
    });
    if (fileItem.textContent?.trim()) filesList.appendChild(fileItem);
  };

  return h('div', { class: 'file-table' },
    latestCommit ? h('div', { class: 'latest-commit' }, latestCommit) : null,
    h('h2', {}, 'Folders and files'),
    filesList);
}

export function normalizeCodeTable(root: Element): HTMLPreElement | null {
  if (!isTable(root)) return null;
  if (!root.querySelector('td[data-line-number], .blob-num')) return null;
  if (!root.querySelector('.blob-code-inner, td.blob-code')) return null;

  type DiffOp = '+' | '-' | ' ';
  type Entry = { leftNo: string; rightNo: string; op: DiffOp; code: string; };

  const getSnippetLineNo = (cell: HTMLTableCellElement | undefined): string => {
    if (!cell) return '';
    return cell.getAttribute('data-line-number')?.trim() ?? cell.textContent?.trim() ?? '';
  };

  const entries: Entry[] = [];
  let lang = '';

  const lineNoCols = new Set<number>();
  for (const tr of [...root.rows]) {
    for (const c of [...tr.cells]) {
      if (c.hasAttribute('data-line-number') || c.classList.contains('blob-num')) {
        lineNoCols.add(c.cellIndex);
      }
    }
  }

  if (!lineNoCols.size || lineNoCols.size > 2) return null;

  const leftCol = Math.min(...lineNoCols);
  const rightCol = lineNoCols.has(leftCol + 1) ? leftCol + 1 : null;

  for (const tr of [...root.rows]) {
    const leftTd = tr.cells[leftCol] as HTMLTableCellElement | undefined;
    const rightTd = rightCol !== null
      ? (tr.cells[rightCol] as HTMLTableCellElement | undefined)
      : undefined;

    const leftNo = getSnippetLineNo(leftTd);
    const rightNo = getSnippetLineNo(rightTd);

    const codeTd = tr.querySelector<HTMLElement>('td.blob-code, td.blob-code-inner');
    if (!codeTd) continue;

    let code = '';
    const kids = [...codeTd.childNodes];
    for (let i = 0; i < kids.length; i++) {
      const t = kids[i].textContent ?? '';
      if ((i === 0 || i === kids.length - 1) && isText(kids[i]) && /[\r\n]/.test(t)) continue;
      code += t;
    }

    const classList = [...codeTd.classList, ...tr.classList];
    const op: DiffOp =
      classList.some((c) => /addition/.test(c)) ? '+'
      : classList.some((c) => /deletion/.test(c)) ? '-'
      : ' ';

    entries.push({ leftNo, rightNo, op, code });

    lang ||= classList.find((c) => c.endsWith('-file-line'))?.replace(/-file-line$/, '') ?? '';
  }

  if (!entries.length) return null;

  const maxPropLen = (prop: 'leftNo' | 'rightNo') =>
    entries.reduce((m, e) => Math.max(m, e[prop].length), 0);

  const leftW = maxPropLen('leftNo');
  const rightW = maxPropLen('rightNo');
  const opUse = entries.some((e) => e.op !== ' ');

  const lines = entries.map(({ leftNo, rightNo, op, code }) => {
    let out = leftNo.padStart(leftW, ' ');
    if (rightW > 0) out += ` ${rightNo.padStart(rightW, ' ')}`;
    if (opUse) out += ` ${op}`;
    return code ? `${out} ${code}` : out;
  });

  const pre = h('pre', {}, h('code', {}, lines.join('\n')));
  if (lang) setLang(pre, lang);
  return pre;
}

export function statusFromSvg(svg: SVGElement): string | null {
  const values = [
    svg.getAttribute('aria-label')?.toLowerCase() ?? '',
    svg.getAttribute('class')?.toLowerCase() ?? '',
  ];

  const has = (...parts: string[]) =>
    parts.some((part) => values.some((v) => v.includes(part)));

  if (has('run', 'rotat')) return 'running';
  if (has('fail')) return 'failed';
  if (has('cancel')) return 'cancelled';
  if (has('skip')) return 'skipped';
  if (has('succ')) return 'ok';
  if (has('pend', 'queue')) return 'pending';

  return null;
}

export type CheckStatus =
  | 'queued' | 'in progress' | 'waiting' | 'completed' | 'neutral' | 'success' | 'failure'
  | 'cancelled' | 'action required' | 'timed out' | 'skipped' | 'stale';

const CHECK_STATUS_FRAGMENTS: readonly [string, CheckStatus][] = [
  ['action', 'action required'], ['tim', 'timed out'], ['prog', 'in progress'], ['queue', 'queued'],
  ['wait', 'waiting'], ['cancel', 'cancelled'], ['skip', 'skipped'], ['stale', 'stale'],
  ['neut', 'neutral'], ['fail', 'failure'], ['succ', 'success'], ['complet', 'completed'],
  ['pass', 'success'],
];

export function normalizeCheckStatus(raw: string | null): CheckStatus | null {
  if (!raw) return null;
  const s = raw.trim().toLowerCase();

  for (const [frag, status] of CHECK_STATUS_FRAGMENTS) {
    if (s.includes(frag)) return status;
  }
  return null;
}

export function normalizeReactions(root: Element): Element | null {
  type RxnLocs = { match: Locator; buttons: Locator; emoji: Locator; tooltipMatch: Locator; tooltipVal: Locator; };

  const formLocs: RxnLocs = {
    match: { sel: 'form.js-pick-reaction' },
    buttons: { sel: 'button.js-reaction-group-button' },
    emoji: { sel: 'g-emoji', attr: 'textContent', valMap: (v) => v.trim() },
    tooltipMatch: { sel: 'tool-tip' },
    tooltipVal: { sel: ':scope', attr: 'textContent', valMap: (v) => v.trim() },
  };

  const toolbarLocs: RxnLocs = {
    match: { sel: '[role="toolbar"]' },
    buttons: { sel: 'button[class*="ReactionButton-"]' },
    emoji: { sel: '[data-component="leadingVisual"]', attr: 'textContent', valMap: (v) => v.trim() },
    tooltipMatch: { sel: '[role="tooltip"]' },
    tooltipVal: { sel: ':scope', attr: 'textContent', valMap: (v) => v.trim() },
  };

  const locs = [formLocs, toolbarLocs].find(({ match }) => root.matches(match.sel));
  if (!locs) return null;

  const parts: Element[] = [];
  for (const button of pickEls<HTMLElement>(locs.buttons, root)) {
    const emoji = pickVal(locs.emoji, button);
    if (!emoji) continue;
    const tooltip = button.nextElementSibling?.matches(locs.tooltipMatch.sel) ? button.nextElementSibling : null;
    if (!tooltip) continue;
    const msg = pickVal(locs.tooltipVal, tooltip);
    if (!msg) continue;

    const who = msg.split(' reacted with ', 1)[0];

    if (parts.length) parts.push(h('span', {}, ' · '));
    parts.push(h('span', {}, emoji, ' (', who, ')'));
  }

  return parts.length ? h('span', {}, 'Reactions: ', ...parts) : null;
}

export function normalizeReadme(root: Element, ctxs: XletContexts): Element | null {
  if (!root.matches('.markdown-body')) return null;

  const block: BlockSpec = {
    name: 'readme',
    select: { kind: 'root' },
    transforms: [
      { kind: 'remove', selectors: ['.markdown-body > .markdown-heading > a[href^="#"]'] },
      { kind: 'unwrap', selectors: ['article'] },
      { kind: 'replaceFn', selectors: ['animated-image'], fn: (el) => el.querySelector('img') },
      {
        kind: 'replaceFn',
        selectors: ['a:has(> img:only-child)'],
        fn: (a) => {
          const img = a.querySelector<HTMLImageElement>('img');
          if (!img || !isAnchor(a)) return a; // shouldn't happen
          const norm = (s: string) => s.replace('/blob/', '/').replace('/raw/', '/');
          return norm(a.href) === norm(img.src) ? img : a;
        },
      },
    ],
  };

  const extracted = extractBlock(root, block, ctxs);
  return extracted;
}
