import type { ToHtmlContext, ToMdElementHandler, ToMdContext, ToHtmlElementHandler } from '../../core';
import { toHtml as _toHtml, toMd as _toMd } from '../../core';
import { h, isElement, isSub, isSup, isText } from '../../utils/dom';
import { formatDateWithRelative } from '../../utils/strings';
import { setLang } from '../../normalize';

function shouldSkip(node: Node | null): boolean {
  if (!node) throw new Error('shouldSkip called with null or undefined node');
  if (isText(node)) return false; // Text nodes are never skipped

  if (isElement(node)) {

    return node.matches([
      'tool-bar', 'tool-tip',
      '[role="toolbar"]', '[role="tooltip"]',
      '.task-list-item .handle', // task-list drag handle
      '.zeroclipboard-container',
      'clipboard-copy',
      'clipboard',
      'svg.octicon',
      'link',
      'copilot-comment-mention-telemetry',
      'themed-picture',
      // '.sr-only', '.visually-hidden', '[hidden]',
    ].join(','));
  }

  return true;
}

const toMdElemHandler: ToMdElementHandler = (node, ctx, gc) => {
  if (shouldSkip(node)) return { skip: true };
  if (node.matches('td.comment-body')) {
    const md = gc(node, 'block');
    return { md };
  }
  if (node.matches('em, i')) {
    return { md: `_${gc(node, 'inline')}_` }; // use _..._ rather than *...*
  }
  // if (node.matches('br')) return { md: '\n' }; // without the double space
  if (node.matches('input[type="checkbox"]')) {
    return { md: node.hasAttribute('checked') ? '[x] ' : '[ ] ' };
  }
  if (node.matches('a.user-mention')) {
    return { md: node.textContent ?? '' };
  }
  if (node.matches('relative-time')) {
    const dt = node.getAttribute('datetime');
    const now = ctx.now;
    return { md: dt ? formatDateWithRelative(dt, { now }) : (node.textContent?.trim() ?? '') };
  }

  // GitHub code table (line-numbered snippet)
  if (
    node.matches('table') &&
    node.querySelector('td[data-line-number]') &&
    node.querySelector('.blob-code-inner, td.blob-code')
  ) {
    const table = node as HTMLTableElement;
    type Entry = { leftNo: string; rightNo: string; op: '+' | '-' | ' '; code: string; };
    const entries: Entry[] = [];
    let lang = '';

    // Detect line number columns (some tables have one for additions and one for deletions, but some have only one shared column)
    const lineNoCols = new Set<number>();
    for (const tr of table.rows) for (const c of tr.cells) if (c.hasAttribute('data-line-number')) lineNoCols.add(c.cellIndex);
    if (lineNoCols.size > 2) return {};
    const leftCol = Math.min(...lineNoCols);
    const rightCol = lineNoCols.has(leftCol + 1) ? leftCol + 1 : null;

    for (const tr of table.rows) {
      const leftTd = tr.cells[leftCol] as HTMLTableCellElement | undefined;
      const rightTd = rightCol ? (tr.cells[rightCol] as HTMLTableCellElement | undefined) : undefined;
      const leftNo = leftTd?.getAttribute('data-line-number')?.trim() ?? '';
      const rightNo = rightTd?.getAttribute('data-line-number')?.trim() ?? '';

      const codeTd = tr.querySelector<HTMLElement>('td.blob-code, td.blob-code-inner');
      if (!codeTd) continue;

      // ignore pretty-print whitespace (alt: .blob-code-inner=pre, .blob-code!=pre)
      let code = '';
      const kids = [...codeTd.childNodes];
      for (let i = 0; i < kids.length; i++) {
        const t = kids[i].textContent ?? '';
        if ((i === 0 || i === kids.length - 1) && isText(kids[i]) && /[\r\n]/.test(t)) continue;
        code += t;
      }

      const classList = [...codeTd.classList, ...tr.classList];
      const op = classList.some((c) => /addition/.test(c)) ? '+'
        : classList.some((c) => /deletion/.test(c)) ? '-'
        : ' ';
      entries.push({ leftNo, rightNo, op, code });
      lang ||= classList.find((c) => c.endsWith('-file-line'))?.replace(/-file-line$/, '') ?? '';
    }

    if (!entries.length) return {};

    const maxPropLen = (prop: 'leftNo' | 'rightNo') =>
      entries.reduce((m, e) => Math.max(m, e[prop].length), 0);
    const leftW = maxPropLen('leftNo');
    const rightW = maxPropLen('rightNo');
    const opUse = entries.some((e) => e.op !== ' ');
    const lines = entries.map(({ leftNo, rightNo, op, code }) => {
      let out = `  ${leftNo.padStart(leftW, ' ')}`;
      if (rightW > 0) out += ` ${rightNo.padStart(rightW, ' ')}`;
      if (opUse) out += ` ${op}`;
      return code ? `${out} ${code}` : out;
    });
    const md = [`\`\`\`${lang}`, ...lines, '```'].join('\n');
    return { md };
  }

  if (node.matches('div.highlight')) {
    const lang = [...node.classList].find((c) => c.startsWith('highlight-source-'))?.replace('highlight-source-', '') ?? '';
    const pre = node.querySelector('pre');
    if (pre) setLang(pre, lang);
  }

  if (node.matches('markdown-accessiblity-table')) {
    const md = gc(node, 'block');
    return { md };
  }

  if (node.matches('td, th')) {
    // handle font-shrinking hacks that wrap full cell content in <sub> or <sup>
    const childs = [...node.childNodes].filter((n) => isElement(n) || (isText(n) && n.textContent?.trim()));
    if (childs.length === 1 && (isSub(childs[0]) || isSup(childs[0]))) {
      const md = gc(childs[0], 'inline');
      return { md };
    }
  }

  if (node.matches('g-emoji')) {
    const txt = node.textContent?.trim();
    if (txt) return { md: txt };

    const alias = node.getAttribute('alias');
    return { md: alias ? `:${alias}:` : '' };
  }

  if (node.matches('include-fragment')) {
    // if (!node.textContent?.trim()) return { md: '[xlet: thread content not loaded; load on GitHub]' };
    return { md: '[xlet: thread content not loaded; load on GitHub]' };
  }

  if (node.matches('task-lists table') && node.querySelectorAll('td').length === 1) {
    const td = node.querySelector('td');
    return { md: td ? gc(td, 'block') : '' };
  }

  if (node.matches('.Details-content--hidden pre')) {
    let body = gc(node, 'inline', { wsMode: 'pre' });
    body = body.replace(/^\[…/, '…[');
    return { md: `:::details\n${body}\n:::` };
  }

  // treat custom els as <div>
  const divLike = [
    'task-lists, turbo-frame, details-collapsible, details-toggle, deferred-diff-lines',
    'section',
  ];
  if (node.matches(divLike.join(','))) return { md: gc(node, 'block') };

  return {};
};

export function toMd(node: Node | null, ctx: Partial<ToMdContext> = {}): string {
  return _toMd(node, { elementHandler: toMdElemHandler, ...ctx });
}

const toHtmlElemHandler: ToHtmlElementHandler = (node, ctx) => {
  if (shouldSkip(node)) return { skip: true };
  if (!isElement(node)) throw new Error('toHtmlElemHandler called with non-element node');

  // td.comment-body => convert to div to avoid table context issues
  if (node.matches('td.comment-body')) {
    const tmp = toHtml(node, { ...ctx })!;
    const div = document.createElement('div');
    while (tmp.firstChild) div.appendChild(tmp.firstChild);
    return { node: div };
  }

  if (node.matches('td[data-line-number]') && !node.textContent?.trim()) {
    const line = node.getAttribute('data-line-number');
    if (line) node.textContent = line;
    node.removeAttribute('data-line-number');
    return {};
  }

  if (node.matches('table.js-file-line-container')) {
    const table = toHtml(node, ctx);
    if (!table) return { skip: true };
    table.classList.add('code-table');
    table.removeAttribute('data-tab-size');
    table.removeAttribute('data-paste-markdown-skip');

    const div = h('div', { class: 'code-table-wrapper' }, table);
    return { node: div };
  }

  if (node.matches('markdown-accessiblity-table')) {
    const table = node.querySelector('table');
    table?.style.removeProperty('width');
  }

  const cleanAttrs = ['data-pjax'];
  for (const attr of cleanAttrs) {
    if (node.hasAttribute(attr)) node.removeAttribute(attr);
  }

  return {}; // default processing
};

export function toHtml(node: Element, opts?: Partial<ToHtmlContext>): Element | null;
export function toHtml(node: Node | null, opts: Partial<ToHtmlContext> = {}): Node | null {
  return _toHtml(node, { elementHandler: toHtmlElemHandler, ...opts });
}
