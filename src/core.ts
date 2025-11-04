import { hasOfType, isNumberish, isString, parseJsonAs } from './typing.js';
import {
  alphaLabel,
  isCaptionSimilar, isElement, isHTML, isImage, isInput, isListItem, isOList, isPre, isTableCell, isTableHeader, isText, isTextArea, isUList, lastUrlSegment, log, toPascalCase,
} from './utils.js';

void log; // lint hack

export type ToHtmlElementHandler = (
  elem: Element,
  ctx: ToHtmlContext
) => { skip?: boolean; node?: Node; };

export type ToHtmlContext = {
  elementHandler?: ToHtmlElementHandler;       // optional per-element override handler
  skipCustomHandler: boolean;                  // skip custom handling for this subtree
  allowStyles: ReadonlySet<string> | boolean;  // style allowlist or true/false for all/none
};

type GlueChildren = (
  node: Node,
  glueMode: 'block' | 'list' | 'listItem' | 'inline',
  wsMode?: 'normal' | 'pre' | 'pre-line',
  opts?: Partial<ToMdContext>,
) => string;

export type ToMdElementHandler = (
  elem: Element,
  ctx: ToMdContext,
  glueChildren: GlueChildren
) => { skip?: boolean; md?: string; };

export type ToMdContext = {
  elementHandler?: ToMdElementHandler;  // optional per-element override handler
  skipCustomHandler: boolean;           // skip custom handling for this subtree
  isRoot: boolean;                      // true only for top-level call (whitespace handling)
  dedupe: boolean;                      // dedupe captions/alt text/etc.
  deCaption: string;                    // caption dedupe token for figures/tables
  inListItem: boolean;                  // inside a list item (<li>)
  compact: boolean;                     // inside a table (<table>)
  anchorRefs: string[] | null;          // collect in table and print below
  imageRefs: string[] | null;           // collect in table and print below
  olStart: number;                      // starting index for ordered list
  // quoteDepth: number;                   // current blockquote nesting level
  lastChar: string;                     // last emitted char (spacing state, internal)
};

export function toHtml(node: Node | null, opts: Partial<ToHtmlContext> = {}): Node | null {
  const ctx: ToHtmlContext = {
    ...opts,
    skipCustomHandler: opts.skipCustomHandler ?? false,
    allowStyles: opts.allowStyles ?? new Set(),
  };

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

  // --- default handling for HTML elements ---
  const clone = document.createElementNS(node.namespaceURI || 'http://www.w3.org/1999/xhtml', node.tagName);

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
    const childNode = toHtml(child, { ...opts, skipCustomHandler: false });
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
  const ctx: ToMdContext = {
    ...opts,
    isRoot: opts.isRoot ?? true,
    skipCustomHandler: opts.skipCustomHandler ?? false,
    olStart: opts.olStart ?? 1,
    lastChar: opts.lastChar ?? '',
    dedupe: opts.dedupe ?? true,
    deCaption: opts.deCaption ?? '',
    inListItem: opts.inListItem ?? false,
    compact: opts.compact ?? false,
    anchorRefs: opts.anchorRefs ?? null,
    imageRefs: opts.imageRefs ?? null,
  };

  const glueChildren: GlueChildren = (node, glueMode, wsMode = 'normal', opts = {}) => {
    const gcx: ToMdContext = { ...ctx, ...opts };

    const parts: string[] = [];
    const entryChar: string = gcx.lastChar;
    let ch = gcx.lastChar;

    // --- handle glueing child nodes ---
    const childNodes = node.childNodes;
    for (let i = 0; i < childNodes.length; i++) {
      const child = childNodes[i];
      let md = '';
      if (isText(child)) {
        md = child.textContent!;
        if (/^\s*$/.test(md)) { // all whitespace
          if (!/\s/.test(ch) && (glueMode === 'inline' || i !== childNodes.length - 1)) {
            md = ' ';
            ch = md;
            parts.push(md);
          }
          continue;
        }

        switch (wsMode) {
          case 'normal': md = md.replace(/\s+/g, ' '); break;
          case 'pre': break;
          case 'pre-line': md = md.replace(/[ \t]+/g, ' '); break;
          default: throw new Error(`Unsupported whitespace mode: ${String(wsMode)}`);
        }
      }
      else if (isElement(child)) {
        md = toMd(child, { ...gcx, isRoot: false, lastChar: ch });
      }

      const curIsBlock = md.startsWith('\n');
      const prevPart = parts.length > 0 ? parts[parts.length - 1] : '';
      const prevIsBlock = prevPart.endsWith('\n');
      const keepStartIndent = glueMode === 'listItem' || glueMode === 'list';

      const trimCurStart = !keepStartIndent && (prevIsBlock || (!curIsBlock && /\s/.test(ch)));
      const trimPrevEnd = !trimCurStart && curIsBlock && parts.length > 0;

      if (trimCurStart) md = md.trimStart();
      if (trimPrevEnd) parts[parts.length - 1] = parts[parts.length - 1].trimEnd();

      parts.push(md);
      ch = md.length > 0 ? md[md.length - 1] : ch;
    }

    // --- handle the bookending glue ---
    const glueRules = {
      block: gcx.inListItem
        ? { prefix: '\n\n', suffix: '\n',   trimStart: true,  trimEnd: true }
        : { prefix: '\n\n', suffix: '\n\n', trimStart: true,  trimEnd: true },
      list: gcx.inListItem
        ? { prefix: '\n',   suffix: '',     trimStart: true,  trimEnd: true }
        : { prefix: '\n',   suffix: '\n\n', trimStart: true,  trimEnd: true },
      listItem:
        { prefix: '',     suffix: '',     trimStart: false, trimEnd: false },
      inline:
        { prefix: '',     suffix: '',     trimStart: false, trimEnd: false },
    };

    const { prefix, suffix, trimStart, trimEnd } = glueRules[glueMode];
    const safePrefix = entryChar === '\n' ? '' : prefix;

    let glued = parts.join('');
    if (trimStart) glued = glued.trimStart();
    if (trimEnd) glued = glued.trimEnd();

    return glued ? `${safePrefix}${glued}${suffix}` : '';
  };

  if (!node || !isElement(node)) return '';

  // --- handle site-specific elements ---
  const siteResult = !ctx.skipCustomHandler && ctx.elementHandler
    ? ctx.elementHandler(node, ctx, glueChildren)
    : null;
  if (siteResult?.skip) return '';
  let result = '';
  if (siteResult?.md) {
    result = siteResult.md;
  } else { // --- default handling for HTML elements ---
    switch (node.tagName.toUpperCase()) {
      case 'BODY':
      case 'DIV': {
        result = glueChildren(node, 'block', 'normal');
        break;
      }

      case 'P': {
        result = glueChildren(node, 'block', 'normal');
        break;
      }

      case 'SPAN':
      case 'NOBR': {
        result = glueChildren(node, 'inline', 'normal');
        result = ctx.lastChar === ' ' ? result.trimStart() : result;
        break;
      }

      case 'EM':
      case 'I': {
        result = `*${glueChildren(node, 'inline', 'normal')}*`;
        break;
      }

      case 'B':
      case 'STRONG': {
        result = `**${glueChildren(node, 'inline', 'normal')}**`;
        break;
      }

      case 'SCRIPT': {
        result = node.textContent || '';
        break;
      }

      case 'BR': {
        result = '  \n';
        break;
      }

      case 'A': {
        const safeDecode = (u: string) => { try { return decodeURIComponent(u); } catch { return u; } };
        const href = safeDecode(getNormalizedUrl(node, 'href'));
        const lastSeg = lastUrlSegment(href);
        let toolTip = (node.getAttribute('title') ?? '').replace(/\s+/g, ' ').trim();
        let linkText = glueChildren(node, 'inline', 'normal', (toolTip ? { deCaption: toolTip } : {})).trim();

        // inside tables, collect links for reference list
        if (ctx.anchorRefs && href) {
          const refNum = ctx.anchorRefs.indexOf(href) + 1 || ctx.anchorRefs.push(href);
          linkText = linkText || toolTip || `link ${refNum}`;
          result = `[${linkText}][${refNum}]`; // or [linkText](#refNum)?
          break;
        }

        // dedupe. text—Markdown is final output; LLMs/humans dontt need repeated info. (prefer figcaption > href > aText > title)
        const toolTipIsDupe = ctx.dedupe && [linkText, ctx.deCaption, lastSeg, href].some((o) => isCaptionSimilar(toolTip, o));
        const linkTextIsDupe = ctx.dedupe && [ctx.deCaption, lastSeg, href].some((o) => isCaptionSimilar(linkText, o));

        toolTip = toolTip && !toolTipIsDupe ? ` "${toolTip}"` : '';
        linkText = linkText && !linkTextIsDupe ? linkText : '';
        result = href ? `[${linkText}](${href}${toolTip})` : linkText;

        break;
      }

      case 'H1':
      case 'H2':
      case 'H3':
      case 'H4':
      case 'H5':
      case 'H6': {
        const level = +node.tagName[1];
        const hashes = '#'.repeat(level);
        result = `\n\n${hashes} ${glueChildren(node, 'inline', 'normal')}\n\n`;
        break;
      }

      case 'HR': {
        result = '\n\n---\n\n';
        break;
      }

      case 'UL':
      case 'OL': {
        const startIndex = +(node.getAttribute('start') || '1');
        result = glueChildren(node, 'list', 'normal', { olStart: startIndex });
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

        result = glueChildren(node, 'listItem', 'normal', { inListItem: true });

        // Normalize leading/trailing newlines
        result = result.startsWith('\n\n') ? result.slice(2) : result;
        result = result.endsWith('\n') ? result : `${result}\n`;

        const leadingWs = result.match(/^(\n*)/)?.[0] ?? '';
        const trailingWs = result.match(/(\n*)$/)?.[0] ?? '';
        result = result.slice(leadingWs.length, result.length - trailingWs.length);

        // Split and compact layout
        const lines = result.split(/(\n+)/);

        // Collapse \n\n before nested list bullets. (REVIEW: stylistic choice)
        for (let i = 0; i < lines.length - 1; i++) {
          if (lines[i].endsWith('\n\n') && /^(\d+\.\s|- )/.test(lines[i + 1])) {
            lines[i] = lines[i].slice(0, -1); // trim one newline
          }
        }

        // Indent all lines after line breaks
        result = lines.map((line) =>
          line.startsWith('\n') ? line + pad : line
        ).join('');

        // Reassemble
        result = `${bullet}${leadingWs}${result}${trailingWs}`;
        break;
      }

      case 'PRE': {
        // const lang = [...node.classList].find(cls => cls.startsWith('lang-'))?.slice(5) || '';
        result = glueChildren(node, 'inline', 'pre');
        if (ctx.compact) {
          result = result.replace(/^\n+/, '').replace(/\n+$/, '');
          result = result.replace(/\r?\n/g, '\\n').replace(/\t/g, '\\t');
          const fence = '`'.repeat(1 + Math.max(0, ...(result.match(/`+/g) || []).map((s) => s.length)));
          result = `\n${fence} ${result} ${fence}\n`;
        } else {
          result = result.replace(/\r\n/g, '\n').replace(/\n+$/, '');
          const fence = '```';
          result = `${fence}\n${result}\n${fence}\n\n`;
        }

        break;
      }

      case 'CODE': {
        result = node.textContent;
        const fence = isPre(node.parentNode)
          ? ''
          : '`'.repeat(1 + Math.max(0, ...(result.match(/`+/g) || []).map((s) => s.length)));
        result = `${fence}${result}${fence}`;
        break;
      }

      case 'BLOCKQUOTE': {
        result = glueChildren(node, 'block', 'normal');
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

      case 'IMG': {
        let src = getNormalizedUrl(node, 'src');
        src = decodeURIComponent(src);
        const srcSeg = lastUrlSegment(src);
        let alt = (node.getAttribute('alt') || '').replace(/\s+/g, ' ').trim();
        let title = (node.getAttribute('title') || '').replace(/\s+/g, ' ').trim();

        if (ctx.imageRefs && src) {
          const refNum = ctx.imageRefs.indexOf(src) + 1 || ctx.imageRefs.push(src);
          const refAlpha = alphaLabel(refNum);
          alt = alt || title || `image ${refNum}`;
          result = `![${alt}][${refAlpha}]`;
          break;
        }
        // dedupe. text—Markdown is final output; LLMs/humans don't need repeated info. (prefer figcaption > src > alt > title)
        const isTitleDupe = isCaptionSimilar(title, alt) || isCaptionSimilar(title, ctx.deCaption) || isCaptionSimilar(title, srcSeg);
        const isAltDupe = isCaptionSimilar(alt, ctx.deCaption) || isCaptionSimilar(alt, srcSeg); // TODO: consider not deduping alt
        title = isTitleDupe && ctx.dedupe ? '' : title;
        alt = isAltDupe && ctx.dedupe ? '' : alt;

        title = title ? ` "${title}"` : '';
        result = src ? `![${alt}](${src}${title})` : '';
        break;
      }

      case 'DEL':
      case 'S':
      case 'STRIKE': {
        result = `~~${glueChildren(node, 'inline', 'normal')}~~`;
        break;
      }

      case 'KBD': {
        result = `<kbd>${glueChildren(node, 'inline', 'normal')}</kbd>`;
        break;
      }

      case 'TABLE': {
        const anchorRefs: string[] = [];
        const imageRefs: string[] = [];
        const tctx = { ...ctx, compact: true, anchorRefs, imageRefs };
        const minColWidth = 3; // Minimum column width for table cells
        const stringWidth = (s: string) => s.length; // TODO: better measure for unicode strings
        const innerGap = 3; // spaces between columns ' | '

        class TCol { constructor(public md: string, public span: number) {} }
        class TRow {
          constructor(public cols: TCol[], public isHeader = false) {}
          get nCol() { return this.cols.reduce((a, c) => a + c.span, 0); }
          widthAlloc() {
            return this.cols.flatMap((col) => {
              const len = stringWidth(col.md) - innerGap * (col.span - 1);
              const q = (len / col.span) | 0;
              const r = len - q * col.span;
              return Array.from({ length: col.span }, (_, i) => q + (i < r ? 1 : 0));
            });
          }
        }

        type Align = 'l' | 'c' | 'r';
        const colAligns: (Align | null)[] = []; // filled from the first header row encountered

        const rows = [...node.querySelectorAll('tr')];
        const table: TRow[] = [];

        for (const r of rows) {
          const cells = [...r.children].filter((c) => isTableHeader(c) || isTableCell(c));
          const isHeader = cells.some(isTableHeader);
          const cols = cells.map((c) => new TCol(toMd(c, tctx).trim().replaceAll('|', '\\|'), c.colSpan));
          const trow = new TRow(cols, isHeader);
          table.push(trow);

          // first header row we see defines alignment per *physical* column.
          if (isHeader && colAligns.length === 0) {
            for (const cell of cells) {
              const m = cell.getAttribute('style')?.match(/text-align\s*:\s*(left|center|right)/);
              const a = m ? (m[1][0] as Align) : null;
              for (let i = 0; i < cell.colSpan; i++) colAligns.push(a);
            }
          }
        }

        // Physical columns
        const nCols = Math.max(0, ...table.map((r) => r.nCol));
        if (nCols !== colAligns.length) {
          for (let i = colAligns.length; i < nCols; i++) colAligns.push(null);
        }

        // Ensure header at index 0 (spoof if first author row wasn't header
        if (table.length && !table[0].isHeader) {
          table.unshift(new TRow(Array.from({ length: nCols }, () => new TCol('', 1)), true));
        }

        // add separator row after header
        table.splice(1, 0, new TRow(Array.from({ length: nCols }, () => new TCol('', 1)), false));

        const colWidths = (() => {
          const W = Array<number>(nCols).fill(minColWidth);
          for (const r of table) {
            const a = r.widthAlloc();
            for (let i = 0; i < a.length; i++) if (a[i] > W[i]) W[i] = a[i];
          }
          return W;
        })();

        const rowParts: string[] = [];
        for (let i = 0; i < table.length; i++) {
          const row = table[i];

          const colParts: string[] = [];
          for (let j = 0, k = 0; j < row.cols.length; j++) {
            // collect cell content spanning this physical column
            const tCol = row.cols[j];
            // console.log(`i=${i} j=${j} k=${k} span=${tCol.span} widthAlloc=${colWidths.slice(k, k + tCol.span).join('+')} md="${tCol.md}" `);
            let md = tCol.md;

            let width = colWidths.slice(k, k + tCol.span).reduce((a, b) => a + b, 0);
            width += innerGap * (tCol.span - 1);

            let leftMark = ' ';
            let rightMark = ' ';

            if (i === 1) { // separator row
              if (tCol.span !== 1) throw new Error('separator row cell should not have a colspan');
              leftMark = colAligns[k] === 'l' || colAligns[k] === 'c' ? ':' : ' ';
              rightMark = colAligns[k] === 'r' || colAligns[k] === 'c' ? ':' : ' ';
              md = '-'.repeat(width);
            }

            if (md.length < width) {
              md = md.padEnd(width, ' ');
            }

            colParts.push(`${leftMark}${md}${rightMark}`);
            k += tCol.span;
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

        result = `\n\n${rowParts.join('\n')}\n\n`;
        break;
      }

      case 'TH':
      case 'TD': {
        result = glueChildren(node, 'inline', 'normal');

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
        result = glueChildren(node, 'inline', 'normal').trim();
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

      default: {
        result = glueChildren(node, 'inline', 'normal');
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

export type Locator = { sel: string; attr?: string; map?: MapFn; };
export type MapFn = (v: string, doc: Document, scope?: ParentNode) => string;

export function pickEl(specs: readonly Locator[], doc: Document, scope?: Element): Element | undefined {
  for (const { sel } of specs) {
    if (sel === ':scope') {
      if (scope) return scope;
      else continue;
    }
    const el = (scope ?? doc).querySelector(sel);
    if (el) return el;
  }
  return undefined;
}

export function pickEls(specs: readonly Locator[], doc: Document, scope?: Element): Element[] {
  for (const { sel } of specs) {
    if (sel === ':scope') {
      if (scope) return [scope];
      else continue;
    }
    const els = (scope ?? doc).querySelectorAll(sel);
    if (els.length > 0) return [...els];
  }
  return [];
}

export function pickVal(specs: readonly Locator[], doc: Document, scope?: Element): string | undefined {
  for (const { sel, attr, map } of specs) {
    const el = sel === ':scope' ? scope : (scope ?? doc).querySelector(sel);
    if (!el) continue;
    let val = attr === 'textContent' || attr === undefined // defaults to textContent
      ? el.textContent?.trim() ?? undefined
      : el.getAttribute(attr)?.trim() ?? undefined;
    if (!val) continue;
    val = map ? map(val, doc, scope).trim() : val;
    if (val) return val;
  }
  return undefined;
}
