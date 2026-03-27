import { findCommonAncestor, h, isTable, relevelHeadings } from '../../utils/dom';
import { extractBlock, type BlockSpec } from '../../utils/extract';
import { pickEl, pickEls, pickVal, type Locator } from '../../utils/locator';
import { normalizeCodeTable } from './dom';

type DiffOp = '+' | '-' | ' ';
type UnifiedEntry = { kind: 'unified'; lNo: string; rNo: string; op: DiffOp; code: string; };
type SplitEntry = { kind: 'split'; lNo: string; lOp: DiffOp; lCode: string; rNo: string; rOp: DiffOp; rCode: string; };
type HunkEntry = { kind: 'hunk'; code: string; };
type DiffEntry = HunkEntry | UnifiedEntry | SplitEntry;

type DiffProfile = {
  match: Locator[];
  rows: Locator;
  cells: Locator;
  hunkText: Locator;
  codeText: Locator;
  lineNo: Locator;
  diffOp: Locator;
  comment?: CommentProfile;
  commentBlock?: BlockSpec;
};

type CommentProfile = {
  cell: Locator;
};

const profiles: DiffProfile[] = [
  {
    match: [
      { sel: 'tbody > tr.diff-line-row' },
      { sel: 'td.diff-hunk-cell' },
      { sel: 'code.diff-text, code .diff-text-inner' },
    ],
    rows: { sel: 'tbody > tr.diff-line-row' },
    cells: { sel: ':scope > td' },
    hunkText: { sel: ':scope > td.diff-hunk-cell code .diff-text-inner', attr: 'textContent', valMap: (v) => v.trim() },
    codeText: { sel: 'code .diff-text-inner', attr: 'textContent', valMap: (v) => v.trimEnd() },
    lineNo: { sel: 'code', attr: 'textContent', valMap: (v) => v.trim() },
    diffOp: {
      sel: 'code.diff-text', attr: 'class',
      valMap: (v) => v.includes('addition') ? '+' : v.includes('deletion') ? '-' : ' ',
    },
  },
  {
    match: [
      { sel: 'tbody > tr[data-hunk]' },
      { sel: 'td.blob-code-hunk' },
      { sel: 'td[data-line-number]' },
      { sel: '.blob-code-inner[data-code-marker]' },
    ],
    rows: { sel: 'tbody > tr' },
    cells: { sel: ':scope > td' },
    hunkText: { sel: ':scope > td.blob-code-hunk', attr: 'textContent', valMap: (v) => v.trim() },
    codeText: { sel: '.blob-code-inner', attr: 'textContent', valMap: (v) => v.trimEnd() },
    lineNo: { sel: ':scope', attr: 'data-line-number' },
    diffOp: {
      sel: '.blob-code-inner[data-code-marker]',
      attr: 'data-code-marker',
      valMap: (v) => (v === '+' || v === '-' || v === ' ' ? v : ' '),
    },
    comment: { cell: { sel: 'td.line-comments' } },
    commentBlock: {
      name: 'comment',
      select: { kind: 'root' },
      normalize: (root) => {
        // Move labels next to author
        root.querySelectorAll('div.timeline-comment-group').forEach((group) => {
          const labels = group.querySelectorAll('.timeline-comment-actions + * .Label');
          const a = group.querySelector('strong > a.author');
          if (labels.length && a) {
            const labelText = [...labels].map((l) => l.textContent?.trim()).join(', ');
            a.parentElement?.insertAdjacentElement('afterend', h('span', {}, ` (${labelText}) • `));
          }
        });
        root.querySelectorAll('table.d-table').forEach((table) => {
          const norm = normalizeCodeTable(table);
          if (norm) table.replaceWith(norm);
        });
        const lineNoHeading = findCommonAncestor(root, ['.js-multi-line-preview-start', '.js-multi-line-preview-end']);
        if (lineNoHeading) {
          const h4 = root.querySelector('.xlet-comment-heading');
          if (h4) {
            h4.textContent = lineNoHeading.textContent?.trim() || h4.textContent;
            lineNoHeading.remove();
          }
        }
        root.querySelectorAll('form.js-pick-reaction').forEach((form) => {
          const msg = form.querySelector('tool-tip')?.textContent?.trim();
          const emoji = form.querySelector('g-emoji')?.textContent?.trim();
          form.replaceWith(h('span', {}, msg && emoji && msg.includes('reacted with ')
            ? msg.replace(/reacted with .*$/, `reacted with ${emoji}`)
            : (msg ?? '')));
        });
        return root;
      },
      transforms: [
        {
          kind: 'remove', selectors: [
            'details-menu', 'form', '.js-minimize-comment', 'img',
            '[class*="Details-content"]', '.Label',
          ],
        },
        { kind: 'replace', with: 'span', selectors: ['.js-comment-edit-history :is(details, summary, div)'] },
        { kind: 'replace', with: 'div', selectors: ['td', 'summary'] },
        { kind: 'unwrap', selectors: ['a.author', 'a.js-timestamp', 'js-comment-reactions-options > tool-tip'] },
      ],
    },
  },
];

export function normalizeDiffTable(root: Element): Element | null {
  if (!isTable(root)) return null;

  const p = detectDiffProfile(root);
  if (!p) return null;

  const rows = pickEls<HTMLTableRowElement>(p.rows, root); // 'tbody > tr.diff-line-row'
  if (!rows.length) return null;

  const entries: DiffEntry[] = [];
  const comments: Element[] = [];
  let prevLine = { lNo: '', rNo: '' };

  for (const row of rows) {
    const cells = pickEls<HTMLTableCellElement>(p.cells, row); // ':scope > td'
    if (!cells.length) continue;

    const comment = parseCommentRow(row, p);
    if (comment) {
      const leftNo = prevLine.lNo ? `L${prevLine.lNo}` : '';
      const rightNo = prevLine.rNo ? `R${prevLine.rNo}` : '';
      comment.prepend(h('h2', { class: 'xlet-comment-heading' }, `Comments near ${[leftNo, rightNo].filter(Boolean).join('/')}`));
      comments.push(comment);
      continue;
    }

    const entry = parseHunkRow(row, p) ?? parseUnifiedRow(cells, p) ?? parseSplitRow(cells, p);
    if (entry?.kind === 'unified' || entry?.kind === 'split') prevLine = { lNo: entry.lNo, rNo: entry.rNo };
    if (entry?.kind === 'hunk') prevLine = { lNo: '', rNo: '' };
    if (entry) entries.push(entry);
  }

  if (!entries.length) return null;

  const uEntries = diffToUnified(entries);
  const lines = renderUnifiedEntries(uEntries);

  const text = lines.join('\n');

  const extractedComments = comments
    .map((c) => extractBlock(c, p.commentBlock ?? { name: 'default', select: { kind: 'root' } }, {}))
    .filter((c): c is Element => !!c);
  extractedComments.forEach((c) => relevelHeadings(c, 4));

  const commentsNode = comments.length
    ? h('section', {}, ...extractedComments) // h('h4', {}, 'Comments')
    : null;

  return h('section', {},
    h('pre', {}, h('code', {}, text)),
    commentsNode,
  );
}

function detectDiffProfile(root: HTMLTableElement): DiffProfile | null {
  for (const p of profiles) {
    if (p.match.every((loc) => pickEl(loc, root))) return p;
  }
  return null;
}

function getCodeText(cell: HTMLTableCellElement, p: DiffProfile): string {
  return pickVal(p.codeText, cell) ?? '';
};

function getLineNo(cell: HTMLTableCellElement, p: DiffProfile): string {
  return pickVal(p.lineNo, cell) ?? '';
};

function getDiffOp(cell: HTMLTableCellElement, p: DiffProfile): DiffOp {
  const op = pickVal(p.diffOp, cell);
  return op === '+' || op === '-' || op === ' ' ? op : ' ';
}

function parseCommentRow(row: HTMLTableRowElement, p: DiffProfile): Element | null {
  if (!p.comment) return null;
  return pickEl(p.comment.cell, row) ?? null;
}

function parseHunkRow(row: HTMLTableRowElement, p: DiffProfile): DiffEntry | null {
  const hunkText = pickVal(p.hunkText, row)?.trim();
  if (!hunkText) return null;
  return { kind: 'hunk', code: hunkText };
}

function parseUnifiedRow(cells: HTMLTableCellElement[], p: DiffProfile): DiffEntry | null {
  if (cells.length !== 3) return null;
  const [leftTd, rightTd, codeTd] = cells;
  const lNo = getLineNo(leftTd, p);
  const rNo = getLineNo(rightTd, p);
  const op = getDiffOp(codeTd, p);
  const code = getCodeText(codeTd, p);

  if (!lNo && !rNo && !code) return null;

  return { kind: 'unified', lNo, rNo, op, code };
}

function parseSplitRow(cells: HTMLTableCellElement[], p: DiffProfile): DiffEntry | null {
  if (cells.length !== 4) return null;
  const [leftTd, leftCodeTd, rightTd, rightCodeTd] = cells;
  const lNo = getLineNo(leftTd, p);
  const rNo = getLineNo(rightTd, p);
  const lOp = getDiffOp(leftCodeTd, p);
  const rOp = getDiffOp(rightCodeTd, p);
  const lCode = getCodeText(leftCodeTd, p);
  const rCode = getCodeText(rightCodeTd, p);

  if (!lNo && !rNo && !lCode && !rCode) return null;

  return { kind: 'split', lNo, lOp, lCode, rNo, rOp, rCode };
}

function diffToUnified(entries: DiffEntry[]): UnifiedEntry[] {
  const pushU = (lNo: string, rNo: string, op: DiffOp, code: string) =>
    unified.push({ kind: 'unified', lNo, rNo, op, code });

  const unified: UnifiedEntry[] = [];
  for (const entry of entries) {
    switch (entry.kind) {
      case 'unified': {
        unified.push(entry);
        break;
      }
      case 'hunk': {
        unified.push({ kind: 'unified', lNo: '', rNo: '', op: ' ', code: entry.code });
        break;
      }
      case 'split': {
        const leftHas = !!(entry.lNo || entry.lCode || entry.lOp !== ' ');
        const rightHas = !!(entry.rNo || entry.rCode || entry.rOp !== ' ');

        if (
          !!entry.lNo && !!entry.rNo &&
          entry.lOp === ' ' && entry.rOp === ' ' &&
          entry.lCode === entry.rCode
        ) {
          pushU(entry.lNo, entry.rNo, ' ', entry.lCode);
          break;
        }

        if (leftHas) pushU(entry.lNo, '', entry.lOp, entry.lCode);
        if (rightHas) pushU('', entry.rNo, entry.rOp, entry.rCode);
        break;
      }
    }
  }
  return unified;
}

function renderUnifiedEntries(entries: UnifiedEntry[]): string[] {
  const maxPropLen = (prop: 'lNo' | 'rNo') =>
    entries.reduce((m, e) => Math.max(m, e[prop].length), 0);

  const leftW = maxPropLen('lNo');
  const rightW = maxPropLen('rNo');
  const opUse = entries.some((e) => e.op !== ' ');

  const lines = entries.map(({ lNo, rNo, op, code }) => {
    let out = `${lNo.padStart(leftW, ' ')}`;
    if (rightW > 0) out += ` ${rNo.padStart(rightW, ' ')}`;
    if (opUse) out += ` ${op}`;
    return code ? `${out} ${code}` : out;
  });

  return lines;
}
