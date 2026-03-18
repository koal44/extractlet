import { pickVal, asAbsUrl, type Locator } from '../../utils/locator';
import { h, isTable } from '../../utils/dom';
import { warn } from '../../utils/logging';
import { chooseCanonicalUrl } from '../../utils/strings';
import { matchGhUrl } from './route';

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
  const detected = matchGhUrl(link, false);
  if (detected) return detected;
}

export function scrapeTitle(srcDoc: Document): string | undefined {
  const title = pickVal(locators.title, srcDoc);
  return title;
}

export function brWrap(wrapper: keyof HTMLElementTagNameMap, els: (Element | null)[]): [] | [HTMLElement, HTMLElement] {
  const wrapped = joinWrap(wrapper, els);
  return wrapped ? [h('br'), wrapped] : [];
}

export function joinWrap(wrapper: keyof HTMLElementTagNameMap, els: (Element | null)[], separator = ' · '): HTMLElement | null {
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
