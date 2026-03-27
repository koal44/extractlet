import { findCommonAncestor, h, isTable, relevelHeadings } from '../../utils/dom';
import { extractBlock, type BlockSpec } from '../../utils/extract';
import { pickEl, pickEls, pickVal, type Locator } from '../../utils/locator';
import { normalizeCodeTable, normalizeReactions } from './dom';

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

const commentClass = 'xlet-comment-heading';

const profiles: DiffProfile[] = [
  {
    // pr-files (older, when not logged in)
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
        const commentHeading = root.querySelector(`.${commentClass}`);
        // promote author associations into the heading line
        root.querySelectorAll('div.timeline-comment-group').forEach((group) => {
          const labels = group.querySelectorAll('.timeline-comment-actions + * .Label');
          const a = group.querySelector('strong > a.author');
          if (labels.length && a) {
            const labelText = [...labels].map((l) => l.textContent?.trim()).join(', ');
            a.parentElement?.insertAdjacentElement('afterend', h('span', {}, ` (${labelText}) • `));
          }
        });
        // render suggested-change mini tables as code diffs
        root.querySelectorAll('table.d-table').forEach((table) => {
          const norm = normalizeCodeTable(table);
          if (norm) table.replaceWith(norm);
        });
        // replace the synthetic fallback heading with GitHub's explicit multiline range label when present.
        const lineNoHeading = findCommonAncestor(root, ['.js-multi-line-preview-start', '.js-multi-line-preview-end']);
        if (lineNoHeading && commentHeading) {
          commentHeading.textContent = lineNoHeading.textContent?.trim() || commentHeading.textContent;
          lineNoHeading.remove();
        }
        // replace GitHub reaction widgets with plain text summaries
        root.querySelectorAll('form.js-pick-reaction').forEach((form) => {
          const norm = normalizeReactions(form);
          if (norm) form.replaceWith(norm);
          else form.remove();
        });
        return root;
      },
      // Flatten UI chrome while preserving the actual review conversation content.
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
  {
    // pr-files (newer, when logged in)
    match: [
      { sel: 'tbody > tr.diff-line-row' },
      { sel: 'td.diff-hunk-cell' },
      { sel: 'td[data-line-number]' },
      { sel: 'td.diff-text-cell' },
      { sel: 'code.diff-text, code .diff-text-inner' },
    ],
    rows: { sel: 'tbody > tr.diff-line-row' },
    cells: { sel: ':scope > td' },
    hunkText: { sel: ':scope > td.diff-hunk-cell code .diff-text-inner', attr: 'textContent', valMap: (v) => v.trim() },
    codeText: { sel: 'code .diff-text-inner', attr: 'textContent', valMap: (v) => v.trimEnd() },
    lineNo: { sel: ':scope', attr: 'data-line-number' },
    diffOp: {
      sel: 'code.diff-text', attr: 'class',
      valMap: (v) => v.includes('addition') ? '+' : v.includes('deletion') ? '-' : ' ',
    },
    comment: { cell: { sel: 'td.diff-text-cell > div' } },
    commentBlock: {
      name: 'comment',
      select: { kind: 'root' },
      normalize: (root) => {
        const commentHeading = root.querySelector(`.${commentClass}`);
        // replace comment heading with a line number version if possible
        const lineNoHeading = root.querySelector('[class*="inlineReviewThreadHeading"]');
        if (commentHeading && lineNoHeading?.textContent.trim()) {
          commentHeading.textContent = lineNoHeading.textContent.trim();
          lineNoHeading.remove();
        }
        // move resolve to main heading
        const resolved = root.querySelector('[class*="ResolvableContainer"]');
        if (commentHeading && resolved?.textContent.trim()) {
          commentHeading.textContent += ` (${resolved.textContent.trim()})`;
          resolved.remove();
        }
        // Move labels next to author
        root.querySelectorAll('[data-testid="comment-header"]').forEach((group) => {
          const labels = group.querySelectorAll('[data-testid="comment-author-association"], [data-testid="comment-subject-author"]');
          const a = group.querySelector('[data-testid="avatar-link"]');
          if (labels.length && a) {
            const labelText = [...labels].map((l) => l.textContent?.trim()).join(', ');
            a.parentElement?.insertAdjacentElement('afterend', h('span', {}, ` (${labelText}) • `));
          }
        });
        // use emojis in reactions instead of text
        root.querySelectorAll('[role="toolbar"]').forEach((toolbar) => {
          const norm = normalizeReactions(toolbar);
          if (norm) toolbar.replaceWith(norm);
          else toolbar.remove();
        });
        // normalize suggested changes tables in comments
        root.querySelectorAll('table.d-table').forEach((table) => {
          const norm = normalizeCodeTable(table);
          if (norm) table.replaceWith(norm);
        });
        return root;
      },
      transforms: [
        {
          kind: 'remove', selectors: [
            'button',
            '[popover]',
            'img',
            'a:has(> img)',
            '[data-testid="comment-header-right-side-items"]',
            '.sr-only',
            '.js-apply-changes',
          ],
        },
        { kind: 'replace', with: 'span', selectors: ['[data-testid^="comment-header-"] :is(div)'] },
        { kind: 'replace', with: 'h3', selectors: ['[data-testid^="comment-header-"]'] },
        { kind: 'unwrap', selectors: ['a[data-testid="avatar-link"]', 'a:has(relative-time)'] },
      ],
    },
  },
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

    const entry = parseHunkRow(row, p) ?? parseUnifiedRow(cells, p) ?? parseSplitRow(cells, p);
    if (entry?.kind === 'hunk') prevLine = { lNo: '', rNo: '' };
    if (entry?.kind === 'unified') prevLine = { lNo: entry.lNo, rNo: entry.rNo };
    if (entry?.kind === 'split') prevLine = { lNo: entry.lNo, rNo: entry.rNo };
    if (entry) entries.push(entry);

    const comment = parseCommentRow(row, p);
    if (comment) {
      const leftNo = prevLine.lNo ? `L${prevLine.lNo}` : '';
      const rightNo = prevLine.rNo ? `R${prevLine.rNo}` : '';
      comment.prepend(h('h2', { class: commentClass }, `Comments near ${[leftNo, rightNo].filter(Boolean).join('/')}`));
      comments.push(comment);
    }
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
