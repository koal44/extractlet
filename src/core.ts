import { getLang } from './normalize.js';
import { hasOfType, isNumberish, isString, parseJsonAs } from './utils/typing.js';

import { mathVendorToHtml, mathVendorToMd } from './math-vendor';
import { log } from './utils/logging.js';
import {
  isBlockquote, isBreak, isElement, isHTML, isImage, isInput, isListItem,
  isOList, isParagraph, isPre, isTableCell, isTableHeader, isText, isTextArea,
  isUList, nodeName, parseHeadingLevel, safeDecode,
} from './utils/dom.js';
import { alphaLabel, filterGenericLabel, isLabelGeneric, isLabelRedundant, toPascalCase } from './utils/strings.js';

void log; // lint hack
void nodeName; // lint hack

export type ToHtmlElementHandler = (
  elem: Element,
  ctx: ToHtmlContext
) => { skip?: boolean; node?: Node; };

export type MathView = 'tex' | 'svg' | 'mathml';

export type ToHtmlContext = {
  elementHandler?: ToHtmlElementHandler;       // optional per-element override handler
  skipCustomHandler: boolean;                  // skip custom handling for this subtree
  allowStyles: ReadonlySet<string> | boolean;  // style allowlist or true/false for all/none
  mathView: MathView;                          // how to render math
};

export const DefaultToHtmlContext: ToHtmlContext = {
  skipCustomHandler: false,
  allowStyles: false,
  mathView: 'tex',
};

type GlueMode = 'block' | 'list' | 'listItem' | 'inline';
type GlueChildren = (
  node: Element,
  glueMode: GlueMode,
  opts?: Partial<ToMdContext>,
) => string;

export type ToMdElementHandler = (
  elem: Element,
  ctx: ToMdContext,
  glueChildren: GlueChildren
) => { skip?: boolean; md?: string; };

export type BrMode = 'escape' | 'hard' | 'soft';
export type MathFenceStyle = 'dollar' | 'bracket';

export type ToMdContext = {
  elementHandler?: ToMdElementHandler;  // optional per-element override handler
  skipCustomHandler: boolean;           // skip custom handling for this subtree
  isRoot: boolean;                      // true only for top-level call (whitespace handling)
  mathFence: MathFenceStyle;            // $$ or \[\] for block math, $ or \(\) for inline
  filterRedundantLabels: boolean;       // dedupe captions/alt text/etc by removing redundant labels
  filterGenericLabels: boolean;         // remove generic labels like "click here" or "this", etc.
  deCaption: string;                    // caption dedupe token for figures/tables
  inListItem: boolean;                  // inside a list item (<li>)
  compact: boolean;                     // inside a table (<table>), so no linefeeds
  anchorRefs: string[] | null;          // collect in table and print below
  imageRefs: string[] | null;           // collect in table and print below
  olStart: number;                      // starting index for ordered list
  lastChar: string;                     // last emitted char (spacing state, internal)
  wsMode: 'normal' | 'pre';             // whitespace handling mode  // | 'pre-line'
  brMode: BrMode;                       // how to treat <br> tags
};

export const DefaultToMdContext: ToMdContext = {
  skipCustomHandler: false,
  isRoot: true,
  mathFence: 'bracket',
  filterRedundantLabels: true,
  filterGenericLabels: false,
  deCaption: '',
  inListItem: false,
  compact: false,
  anchorRefs: null,
  imageRefs: null,
  olStart: 1,
  lastChar: '',
  wsMode: 'normal',
  brMode: 'soft',
};

export function toHtml(node: Node | null, opts: Partial<ToHtmlContext> = {}): Node | null {
  const ctx: ToHtmlContext = { ...DefaultToHtmlContext, ...opts };

  if (!node) return null;

  if (isText(node)) {
    return document.createTextNode(node.textContent!);
  }

  if (!isElement(node)) {
    return null;
  }

  // --- handle site-specific elements ---
  const result = !ctx.skipCustomHandler && ctx.elementHandler
    ? ctx.elementHandler(node, ctx)
    : null;
  if (result?.skip) return null;
  if (result?.node) return result.node;

  // --- handle possible mathjax or katex elements ---
  const mathResult = mathVendorToHtml(node, ctx);
  if (mathResult?.skip) return null;
  if (mathResult?.node) return mathResult.node;

  // --- default handling for HTML elements ---
  const clone = document.createElementNS(node.namespaceURI || 'http://www.w3.org/1999/xhtml', node.tagName.toLowerCase());

  for (const attr of node.attributes) {
    const name = attr.name.toLowerCase();

    switch (name) {
      case 'href': {
        copyHrefAttr(clone, node);
        break;
      }
      case 'src': {
        copySrcAttr(clone, node);
        break;
      }
      case 'title': {
        clone.setAttribute('title', attr.value.replace(/\s+/g, ' ').trim());
        break;
      }
      case 'xmlns':
      case 'rowspan':
      case 'colspan':
      case name.startsWith('data-') && name: {
        clone.setAttribute(name, attr.value);
        break;
      }
      case 'width':
      case 'height': {
        if (isImage(node)) {
          clone.setAttribute(name, attr.value);
        }
        break;
      }
      case 'style': {
        if (isHTML(node) && isHTML(clone)) {
          copyStyleAttr(clone, node, ctx.allowStyles);
        }
        break;
      }

      // Input controls
      case 'type':
      case 'value':
      case 'checked':
      case 'disabled':
      case 'readonly': {
        if (isInput(node)) clone.setAttribute(name, attr.value);
        break;
      }

      // Textarea
      case 'rows':
      case 'cols': {
        if (isTextArea(node)) clone.setAttribute(name, attr.value);
        break;
      }
      default:
        break;
    }
  }

  for (const child of node.childNodes) {
    const childNode = toHtml(child, { ...ctx, skipCustomHandler: false });
    if (childNode) clone.appendChild(childNode);
  }

  return clone;
}

function copyHrefAttr(dest: Element, src: Element) {
  const val = getNormalizedUrl(src, 'href');
  if (val) dest.setAttribute('href', val);
}

function copySrcAttr(dest: Element, src: Element) {
  const val = getNormalizedUrl(src, 'src');
  if (val) dest.setAttribute('src', val);
}

function getNormalizedUrl(node: Element, attr: 'href' | 'src'): string {
  const url = node.getAttribute(attr)?.trim();
  if (!url) return '';
  if (url.startsWith('#')) return url;
  if (url.toLowerCase().startsWith('javascript:')) return '#';
  if (url.startsWith('//')) return `https:${url}`; // assume protocol-relative URLs are HTTPS

  // --- resolve relative urls ---
  // prefer browser-resolved property
  if (hasOfType(node, attr, isString)) {
    return node[attr].trim();
  }
  // otherwise resolve using doc's base uri
  try {
    return new URL(url, node.ownerDocument.baseURI).href;
  } catch {
    return url;
  }
}

function copyStyleAttr(dest: HTMLElement, src: HTMLElement, allowStyles: boolean | ReadonlySet<string>) {
  if (!src.hasAttribute('style')) return; // check only one of these?
  if (allowStyles === false) return;
  if (allowStyles === true) {
    dest.setAttribute('style', src.getAttribute('style')!);
    return;
  }

  const keep = new Set([
    ...allowStyles,
    'display', 'clear',
    ...(isImage(src) ? ['width', 'height'] : []),
  ]);

  let styleString = '';
  for (const k of keep) {
    const v = src.style.getPropertyValue(k);
    if (v) styleString += `${k}: ${v}; `;
  }
  styleString = styleString.trim();

  if (styleString) dest.setAttribute('style', styleString);
}

export function toMd(node: Node | null, opts: Partial<ToMdContext> = {} ): string {
  const ctx: ToMdContext = { ...DefaultToMdContext, ...opts };

  const glueChildren: GlueChildren = (node, glueMode, opts = {}) => {
    // TODO: generalize for nodes other than Element?
    const gcx: ToMdContext = { ...ctx, ...opts };
    const wsMode = gcx.wsMode;

    const parts: string[] = [];
    let ch = gcx.lastChar;

    // --- handle glueing child nodes ---
    const childNodes = node.childNodes;
    // console.log('[glue start]', `${nodeName(node)}`, `length=${childNodes.length}`, `glueMode=${glueMode}`, `wsMode=${wsMode}`);
    for (let i = 0; i < childNodes.length; i++) {
      const child = childNodes[i];
      let md = '';

      // --- text nodes ---
      if (isText(child)) {
        md = child.textContent?.replace(/\r\n?/g, '\n') ?? '';
        // console.log('text node md:', `"${md.replace(/\n/g, '\\n')}"`);

        // handle pure-whitespace text nodes
        if (/^\s+$/.test(md)) { // all whitespace
          if (!/\s/.test(ch) && (glueMode === 'inline' || i !== childNodes.length - 1)) {
            md = wsMode === 'normal' ? ' ' : md;
            ch = md;
            parts.push(md);
            // console.log('[glue child]', `${nodeName(node)} > ${i + 1}:${nodeName(child)}`, `ch="${ch.replace(/\n/, '\\n')}"`);
          }
          continue;
        }

        // normalize internal whitespace
        switch (wsMode) {
          case 'normal': md = md.replace(/\s+/g, ' '); break;
          case 'pre': break;
          // case 'pre-line': md = md.replace(/[ \t]+/g, ' '); break;
          default: throw new Error(`Unsupported whitespace mode: ${String(wsMode)}`);
        }
      }
      // --- element nodes ---
      else if (isElement(child)) {
        md = toMd(child, { ...gcx, isRoot: false, lastChar: ch });
        const raw = (child.textContent ?? '').replace(/\r\n?/g, '\n');

        // ---- handle empty elements (rare case) ----
        if (md === '' && raw === '') continue;
        if (/^\s*$/.test(md) && !isBreak(child)) { // all whitespace
          if (!/\s/.test(ch) && (glueMode === 'inline' || i !== childNodes.length - 1)) {
            md = wsMode === 'normal' ? ' ' : md;
            ch = md;
            parts.push(md);
            // console.log('[glue child]', `${nodeName(node)} > ${i + 1}:${nodeName(child)}`, `ch="${ch.replace(/\n/, '\\n')}"`);
          }
          continue;
        }
      }

      // --- whitespace trimming between children ---
      if (wsMode === 'normal') {
        const curIsBrTag = isBreak(child);
        const curIsBlock = /^[ \t]*\n/.test(md);
        const prevPart = parts.length > 0 ? parts[parts.length - 1] : '';
        const prevIsBlock = prevPart.endsWith('\n');
        const prevIsBrTag = isBreak(childNodes[i - 1]);
        const keepStartIndent = glueMode === 'listItem' || glueMode === 'list'; // has leading semantic indent

        const trimCurStart = !keepStartIndent && (prevIsBlock || (!curIsBlock && /\s/.test(ch))) && !curIsBrTag;
        const trimPrevEnd = !trimCurStart && curIsBlock && !!prevPart && !prevIsBrTag;

        if (trimCurStart) md = md.trimStart();
        if (trimPrevEnd) parts[parts.length - 1] = parts[parts.length - 1].trimEnd();

        // console.log(
        //   '[glue trimming]',
        //   `[${nodeName(node)} > ${i + 1}:${nodeName(child)}]`,
        //   `curIsBlock=${curIsBlock}`,
        //   `prevIsBlock=${prevIsBlock}`,
        //   `trimCurStart=${trimCurStart}`,
        //   `trimPrevEnd=${trimPrevEnd}`,
        //   `md="${md.replace(/\n/g, '\\n')}"`,
        // );
      }

      parts.push(md);
      ch = md.length > 0 ? md[md.length - 1] : ch;
      // console.log('[glue child]', `${nodeName(node)} > ${i + 1}:${nodeName(child)}`, `ch="${ch.replace(/\n/, '\\n')}"`);
    }
    // console.log('[glue loop end]');

    let glued = parts.join('');
    glued = frameMd(glued, glueMode, gcx);

    // console.log('[glue end]', `${nodeName(node)}`, `result="${glued.replace(/\n/g, '\\n')}"`);
    return glued;
  };

  if (!node || !isElement(node)) return '';

  // --- handle site-specific elements ---
  const siteResult = !ctx.skipCustomHandler && ctx.elementHandler
    ? ctx.elementHandler(node, ctx, glueChildren)
    : null;
  if (siteResult?.skip) return '';

  // --- handle possible mathjax or katex elements ---
  const mathResult = mathVendorToMd(node, ctx);
  if (mathResult?.skip) return '';

  let result = '';
  if (siteResult?.md) {
    result = siteResult.md;
  } else if (mathResult?.md) {
    result = mathResult.md;
  } else { // --- default handling for HTML elements ---
    const tagName = node.tagName.toUpperCase();
    switch (tagName) {
      case 'BODY':
      case 'DIV': {
        result = glueChildren(node, 'block');
        break;
      }

      case 'P': {
        result = glueChildren(node, 'block');
        break;
      }

      case 'SPAN': {
        result = glueChildren(node, 'inline');
        break;
      }

      case 'NOBR': {
        result = glueChildren(node, 'inline');
        result = result.replace(/\s+/g, ' ');
        break;
      }

      case 'EM':
      case 'I': {
        result = `*${glueChildren(node, 'inline')}*`;
        break;
      }

      case 'B':
      case 'STRONG': {
        result = `**${glueChildren(node, 'inline')}**`;
        break;
      }

      case 'SCRIPT': {
        result = '';
        // result = node.textContent || '';
        break;
      }

      case 'BR': {
        switch (ctx.brMode) {
          case 'escape': result = '\\\n'; break;
          case 'hard':   result = '\n'; break;
          case 'soft':   result = '  \n'; break;
          // default: throw new Error(`Unsupported brMode: ${ctx.brMode satisfies never as string}`); // exhaustive check
          default: throw new Error(`Unsupported brMode: ${String(ctx.brMode satisfies never)}`); // exhaustive check
        }
        if (ctx.wsMode === 'pre' || ctx.compact) result = '\n';
        break;
      }

      case 'A':
      case 'IMG': {
        const isImg = tagName === 'IMG';

        const urlAttr = isImg ? 'src' : 'href';
        const url = safeDecode(getNormalizedUrl(node, urlAttr));
        let title = node.getAttribute('title')?.replace(/\s+/g, ' ').trim() ?? '';
        let linkText = isImg
          ? node.getAttribute('alt')?.replace(/\s+/g, ' ').trim() ?? ''
          : glueChildren(node, 'inline', (title ? { deCaption: title } : {})).trim();
        const mark = isImg ? '!' : '';

        // inside tables, collect reference-style links/images
        const refs = isImg ? ctx.imageRefs : ctx.anchorRefs;
        if (refs && url) {
          const refNum = refs.indexOf(url) + 1 || refs.push(url);
          const refLabel = isImg ? alphaLabel(refNum) : String(refNum);
          const text = linkText || title || `${isImg ? 'image' : 'link'} ${refLabel}`;
          result = `${mark}[${text}][${refLabel}]`; // or [linkText](#refNum)?
          break;
        }

        const shouldDropLabel = (label: string, refs: string[]) =>
          (ctx.filterGenericLabels && isLabelGeneric(label)) ||
          refs.some((o) =>
            (ctx.filterRedundantLabels && isLabelRedundant(label, o)) ||
            (ctx.filterGenericLabels && ctx.filterRedundantLabels && isLabelRedundant(filterGenericLabel(label), o))
          );

        const dropTitle = shouldDropLabel(title, [linkText, ctx.deCaption, url]);
        const dropLinkText = shouldDropLabel(linkText, [ctx.deCaption, url]);

        title = title && !dropTitle ? title : '';
        linkText = linkText && !dropLinkText ? linkText : '';

        // promote title if empty linkText
        if (!linkText && title) { linkText = title; title = ''; };

        result = url || linkText || title
          ? `${mark}[${linkText}](${url}${(url && title ? ` "${title}"` : '')})`
          : '';
        break;
      }

      case 'H1':
      case 'H2':
      case 'H3':
      case 'H4':
      case 'H5':
      case 'H6': {
        const level = parseHeadingLevel(node as HTMLHeadingElement);
        const hashes = '#'.repeat(level);
        result = frameMd(`${hashes} ${glueChildren(node, 'inline')}`, 'block', ctx);
        break;
      }

      case 'HR': {
        result = frameMd('---', 'block', ctx);
        break;
      }

      case 'UL':
      case 'OL': {
        const startIndex = +(node.getAttribute('start') || '1');
        result = glueChildren(node, 'list', { olStart: startIndex });
        break;
      }

      case 'LI': {
        // Determine bullet (e.g., "1. ", "- ")
        let index = ctx.olStart;
        for (let sibling = node.previousSibling; sibling; sibling = sibling.previousSibling) {
          if (isListItem(sibling)) {
            index++;
          }
        }
        let bullet =
          isOList(node.parentNode) ? `${index}. ` :
          isUList(node.parentNode) ? '- ' :
          '- ';
        bullet = ctx.compact ? '• ' : bullet; // use • for bullets in tables

        const pad = ' '.repeat(bullet.length);

        result = glueChildren(node, 'listItem', { inListItem: true });

        // Normalize leading/trailing newlines
        if (isParagraph(node.firstElementChild) || isBlockquote(node.firstElementChild)) {
          result = result.startsWith('\n\n') ? result.slice(2) : result;
          result = result.startsWith('\n') ? result.slice(1) : result;
        }
        // result = result.startsWith('\n\n') ? result.slice(1) : result;
        result = result.endsWith('\n') ? result : `${result}\n`;

        const trailingLFs = result.match(/(\n*)$/)?.[0] ?? '';
        result = result.slice(0, result.length - trailingLFs.length);

        // Split and compact layout
        const lines = result.split(/(\n+)/);

        // Indent all lines after line breaks
        result = lines.map((line, i) =>
          line.startsWith('\n') && !/^[ \t]+$/.test(lines[i + 1]) ? line + pad : line
        ).join('');

        // Reassemble
        if (/^\s+/.test(result)) bullet = bullet.trimEnd();
        result = `${bullet}${result}${trailingLFs}`;
        // console.log('[toMd LI]', `result="${result.replace(/\n/g, '\\n')}"`);
        break;
      }

      case 'PRE': {
        const lang = getLang(node) ?? '';
        result = glueChildren(node, 'inline', { wsMode: 'pre' });
        if (ctx.compact) {
          result = result.replace(/^\n+/, '').replace(/\n+$/, '');
          result = result.replace(/\r?\n/g, '\\n').replace(/\t/g, '\\t');
          const fence = '`'.repeat(1 + Math.max(0, ...(result.match(/`+/g) || []).map((s) => s.length)));
          const open = lang ? `${fence} ${lang}` : fence;
          result = fence.length > 1
            ? `\n${open} ${result} ${fence}\n`
            : `\n${open}${result}${fence}\n`;
        } else {
          result = result.replace(/\r\n/g, '\n').replace(/\n+$/, '');
          const fence = '`'.repeat(1 + Math.max(2, ...(result.match(/`+/g) || []).map((s) => s.length)));
          const open = lang ? `${fence} ${lang}` : fence;
          result = frameMd(`${open}\n${result}\n${fence}`, 'block', ctx);
        }

        break;
      }

      case 'CODE': {
        result = node.textContent ?? '';
        if (isPre(node.parentNode)) {
          break; // handled by PRE
        }
        const fence = '`'.repeat(1 + Math.max(0, ...(result.match(/`+/g) || []).map((s) => s.length)));
        result = fence.length > 1
          ? `${fence} ${result} ${fence}`
          : `${fence}${result}${fence}`;
        break;
      }

      case 'BLOCKQUOTE': {
        result = glueChildren(node, 'block');
        const bqPrefix = result.match(new RegExp('^\\n*'))?.[0] ?? '';
        const bqSuffix = result.match(/\n*$/)?.[0] ?? '';

        result = result.slice(bqPrefix.length, result.length - bqSuffix.length);
        if (ctx.compact) {
          result = result.split('\n')
            .map((line) => line.match(/^[ \t]*>+[ \t]+/) ? `>${line}` : `> ${line}`)
            .filter((line) => line.match(/^[ \t]*>+[ \t]*$/) === null)
            .join('\n');
        } else {
          result = result.split('\n').map((line) => `> ${line}`).join('\n');
        }
        result = bqPrefix + result + bqSuffix;
        break;
      }

      case 'DEL':
      case 'S':
      case 'STRIKE': {
        result = `~~${glueChildren(node, 'inline')}~~`;
        break;
      }

      case 'KBD': {
        result = `<kbd>${glueChildren(node, 'inline')}</kbd>`;
        break;
      }

      case 'TABLE': {
        const anchorRefs: string[] = [];
        const imageRefs: string[] = [];
        const tctx = { ...ctx, compact: true, anchorRefs, imageRefs };

        class GridCol { constructor(public md: string, public remRowSpan: number) {} }

        type Align = 'l' | 'c' | 'r';
        const colAligns: (Align | null)[] = [];

        const rows = [...node.querySelectorAll('tr')] as HTMLTableRowElement[];
        const grid: GridCol[][] = [];

        let prev: GridCol[] = [];
        let firstRowIsHeader = false;

        for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
          const r = rows[rowIdx];
          const cells = [...r.children].filter((c) => isTableHeader(c) || isTableCell(c));

          // detect header-on-first-row once
          const isHeader = cells.some(isTableHeader);
          if (rowIdx === 0) firstRowIsHeader = isHeader;

          // first header row defines alignment per *physical* column
          if (isHeader && colAligns.length === 0) {
            for (const cell of cells) {
              const m = cell.getAttribute('style')?.match(/text-align\s*:\s*(left|center|right)/);
              const a = m ? (m[1][0] as Align) : null;
              for (let i = 0; i < cell.colSpan; i++) colAligns.push(a);
            }
          }

          const row: GridCol[] = [];
          let colIndex = 0;

          // place cells, skipping carried spans
          for (const cell of cells) {
            while (prev[colIndex]?.remRowSpan > 0) {
              row.push(new GridCol('', prev[colIndex].remRowSpan - 1));
              colIndex++;
            }

            row.push(new GridCol(toMd(cell, tctx), cell.rowSpan - 1));
            colIndex++;

            // same-row placeholders for colSpan>1
            for (let k = 1; k < cell.colSpan; k++) {
              row.push(new GridCol('', cell.rowSpan - 1));
              colIndex++;
            }
          }

          // age trailing carries ONCE per row
          while (prev[colIndex]?.remRowSpan > 0) {
            row.push(new GridCol('', prev[colIndex].remRowSpan - 1));
            colIndex++;
          }

          grid.push(row);
          prev = row;
        }

        // ---- rectangularize + bookkeeping ----
        const nCols = Math.max(0, ...grid.map((r) => r.length));

        // pad colAligns to physical width
        while (colAligns.length < nCols) colAligns.push(null);

        // pad short rows
        for (const r of grid) {
          while (r.length < nCols) r.push(new GridCol('', 0));
        }

        // spoof header row if first isn't header
        if (grid.length && !firstRowIsHeader) {
          grid.unshift(Array.from({ length: nCols }, () => new GridCol('', 0)));
        }

        // insert separator row after header (empty; emitter sets '---' per cell)
        grid.splice(1, 0, Array.from({ length: nCols }, () => new GridCol('', 0)));

        // ---- emit (unchanged policy) ----
        const rowParts: string[] = [];
        for (let i = 0; i < grid.length; i++) {
          const row = grid[i];
          const colParts: string[] = [];
          for (let j = 0; j < nCols; j++) {
            let md = row[j].md.trim().replaceAll('|', '\\|');
            let leftMark = ' ';
            let rightMark = ' ';

            if (i === 1) {
              md = '---';
              leftMark  = colAligns[j] === 'l' || colAligns[j] === 'c' ? ':' : ' ';
              rightMark = colAligns[j] === 'r' || colAligns[j] === 'c' ? ':' : ' ';
            } else if (md === '') {
              md = ' ';
              leftMark = rightMark = '';
            }

            colParts.push(`${leftMark}${md}${rightMark}`);
          }
          rowParts.push(`|${colParts.join('|')}|`);
        }

        const anchorRefsParts = anchorRefs.map((href, idx) => `[${idx + 1}]: ${href}`);
        const imageRefsParts  = imageRefs.map((href, idx) => `[${alphaLabel(idx + 1)}]: ${href}`);

        if (anchorRefsParts.length || imageRefsParts.length) {
          rowParts.push('');
          if (anchorRefsParts.length) rowParts.push(...anchorRefsParts);
          if (imageRefsParts.length)  rowParts.push(...imageRefsParts);
        }

        result = rowParts.join('\n');
        result = frameMd(result, 'block', ctx);
        break;
      }

      case 'TH':
      case 'TD': {
        result = glueChildren(node, 'inline');

        // norm vertical breaks; inline whitespace is valid in GFM tables
        if (/[\n\f\v\r\u0085\u2028\u2029]/.test(result)) { // u085 = next line, u2028 = line separator, u2029 = paragraph separator. NEL is not considered ws in JS though..
          // log('WARNING: vertical whitespace in table cell content:', result);
          result = result.replace(/[\f\v\r\u0085\u2028\u2029]+/g, '').replace(/\n+/g, ' ');
        }

        break;
      }

      case 'FIGURE': {
        const captionNode = node.querySelector('figcaption');
        const caption = captionNode ? toMd(captionNode, ctx).trim() : '';
        const parts = [];
        for (const child of node.childNodes) {
          if (captionNode && child === captionNode) continue;
          parts.push(toMd(child, { ...ctx, deCaption: caption }));
        }

        // data-mw attribute handling (e.g. for PDF pages in Wikimedia Commons)
        const dataAttr = node.getAttribute('data-mw') ?? '{}';
        type MwData = { page?: number; };
        const isMwData = (u: unknown): u is MwData => hasOfType(u, 'page', isNumberish);
        const data = parseJsonAs<MwData>(dataAttr, isMwData);

        const fullCaption = [];
        if (data?.page) fullCaption.push(`page ${data.page} preview`);
        if (caption) fullCaption.push(caption);

        const body = [];
        body.push('\n\n:::figure');
        if (parts.length) body.push(parts.filter(Boolean).join('\n'));
        if (fullCaption.length) body.push(`\n${fullCaption.join('\n')}`);
        body.push(':::\n\n');

        result = body.join('\n');
        break;
      }

      case 'FIGCAPTION': {
        result = glueChildren(node, 'inline').trim();
        break;
      }

      case 'VIDEO':
      case 'AUDIO': {
        result = '';
        const poster = node.getAttribute('poster');
        const sources = [];
        const tracks = [];

        for (const child of node.children) {
          if (child.tagName === 'SOURCE') {
            const src = child.getAttribute('src');
            if (src) {
              const label =
                child.getAttribute('data-shorttitle')
                ?? child.getAttribute('title')
                ?? child.getAttribute('type')?.split(';')[0].replace('video/', '').toUpperCase()
                ?? src.split('.').pop()?.toUpperCase() // e.g. "mp4", "webm"
                ?? 'Video';
              sources.push({ url: src, label });
            }
          } else if (child.tagName === 'TRACK') {
            // Subtitle/track
            const src = child.getAttribute('src');
            if (!src) continue;

            const lang = child.getAttribute('srclang') ?? '';
            const label = child.getAttribute('label')?.trim() ?? (lang || 'Subtitles');

            tracks.push({ alt: label, url: src });
          }
        }

        if (sources.length) {
          const media = toPascalCase(node.tagName);
          result += `**${media} sources:**\n${sources.map((s) => `- [${s.label}](${s.url})`).join('\n')}\n\n`;
        }
        if (poster) {
          result += `**Poster:** ![Poster](${poster})\n\n`;
        }
        if (tracks.length) {
          result += `**Subtitles:**\n${tracks.map((t) => `- [${t.alt}](${t.url})`).join('\n')}\n\n`;
        }

        result = result.trim();
        break;
      }

      // case 'MATH': {
      // }

      default: {
        result = glueChildren(node, 'inline');
        result = `<${node.tagName.toLowerCase()}>${result}</${node.tagName.toLowerCase()}>`;
        // result = node.outerHTML || '';
        break;
      }

    }
  }

  return ctx.isRoot
    ? result.trim()
    : result;
}

export function frameMd(md: string, glueMode: GlueMode, fcx: ToMdContext ): string {
  const glueRules = {
    block: fcx.inListItem
      ? { prefix: '\n', suffix: '\n', trimStart: true, trimEnd: true }
      : { prefix: '\n\n', suffix: '\n\n', trimStart: true, trimEnd: true },
    list: fcx.inListItem
      ? { prefix: '\n', suffix: '', trimStart: true, trimEnd: true }
      : { prefix: '\n', suffix: '\n\n', trimStart: true, trimEnd: true },
    listItem: { prefix: '', suffix: '', trimStart: false, trimEnd: false },
    inline: { prefix: '', suffix: '', trimStart: false, trimEnd: false },
  };

  const { prefix, suffix, trimStart, trimEnd } = glueRules[glueMode];

  let out = md;
  if (trimStart) out = out.trimStart();
  if (trimEnd) out = out.trimEnd();
  return out ? `${prefix}${out}${suffix}` : '';
};
