import { isCaptionSimilar, isElement, isHTML, isImage, isListItem, isOList, isPre, isTableCell, isTableHeader, isText, isUList, lastUrlSegment, log, toPascalCase } from './utils.js';

export type ToHtmlElementHandler = (node: Element, opts: ToHtmlOptions) => { skip?: boolean; node?: Node };

export type ToHtmlOptions = {
  toHtmlElementHandler?: ToHtmlElementHandler;
  skipHandler?: boolean;
  keepStyles?: KeepStyles;
}
type KeepStyles = boolean | Set<string>;

type GlueMode = 'block' | 'list' | 'li' | 'inline'
type WhitespaceMode = 'normal' | 'pre' | 'pre-line'

type GlueChildrenFn = (
  n: Node,
  glueMode: GlueMode,
  ws?: WhitespaceMode,
  opts?: Partial<ToMdContext>,
  // innerCtx?: ToMdContext
) => string;

export type ToMdElementHandler = (
  node: Element,
  ctx: ToMdContext,
  glueChildren: GlueChildrenFn
) => { skip?: boolean; md?: string };

export type ToMdContext = {
  olStart: number;
  quoteDepth: number;
  lastChar: string;
  isRoot: boolean;
  toMdElementHandler?: ToMdElementHandler;
  skipHandler: boolean;
  dedupeCaption: string;
  inListItem: boolean;
}

export function toHtml(node:Node|null, opts:ToHtmlOptions = {}): Node|null {
  if (!node) return null;
  const {
    toHtmlElementHandler: elementHandler,
    skipHandler = false,
    keepStyles = new Set(),
  } = opts;

  if (isText(node)) {
    return document.createTextNode(node.textContent!);
  }

  if (!isElement(node)) {
    return null;
  }

  // --- handle site-specific elements ---
  const result = !skipHandler && elementHandler
    ? elementHandler(node, opts)
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
          copyStyleAttr(clone, node, keepStyles);
        }
        break;
      }
      default:
        break;
    }
  }

  for (const child of node.childNodes) {
    const childNode = toHtml(child, { ...opts, skipHandler: false });
    if (childNode) clone.appendChild(childNode);
  }

  return clone;
}

export function copyHrefAttr(dest: Element, src: Element) {
  const val = getNormalizedUrl(src, 'href');
  if (val) dest.setAttribute('href', val);
}

export function copySrcAttr(dest: Element, src: Element) {
  const val = getNormalizedUrl(src, 'src');
  if (val) dest.setAttribute('src', val);
}

function getNormalizedUrl(node: Element, attr: 'href'|'src'): string {
  const url = node.getAttribute(attr)?.trim();
  if (!url) return '';
  if (url.startsWith('#')) return url;
  if (url.toLowerCase().startsWith('javascript:')) return '#';
  if (url.startsWith('//')) return `https:${url}`; // assume protocol-relative URLs are HTTPS
  
  // --- resolve relative urls ---
  // prefer browser-resolved property
  const nodeAttr = (node as any)[attr];
  if (typeof nodeAttr === 'string') return nodeAttr.trim();
  // otherwise resolve using doc's base uri
  try {
    return new URL(url, node.ownerDocument?.baseURI).href;
  } catch {
    return url;
  }
}

export function copyStyleAttr(dest: HTMLElement, src: HTMLElement, keepStyles: KeepStyles) {
  if (!src.hasAttribute('style')) return; // check only one of these?
  if (keepStyles === false) return;
  if (keepStyles === true) {
    dest.setAttribute('style', src.getAttribute('style')!);
    return;
  }

  const keep = new Set([
    ...keepStyles,
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

export function toMd(node: Node | null, initCtx: Partial<ToMdContext> = {} ): string {
  const ctx: ToMdContext = {
    ...initCtx,
    isRoot: initCtx.isRoot ?? true,
    skipHandler: initCtx.skipHandler ?? false,
    olStart: initCtx.olStart ?? 1,
    quoteDepth: initCtx.quoteDepth ?? 0,
    lastChar: initCtx.lastChar ?? '',
    dedupeCaption: initCtx.dedupeCaption ?? '',
    inListItem: initCtx.inListItem ?? false,
  };

  const glueChildren: GlueChildrenFn = (node, glueMode, wsMode = 'normal', extrCtx = {}) => {
    const gcx: ToMdContext = { ...ctx, ...extrCtx };

    const parts: string[] = [];
    const entryChar: string = gcx.lastChar;
    let ch = gcx.lastChar;

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
          default: throw new Error(`Unsupported whitespace mode: ${wsMode}`);
        }
      }
      else if (isElement(child)) {
        md = toMd(child, { ...gcx, isRoot: false, lastChar: ch });
      }

      const curIsBlock = md.startsWith('\n');
      const prevPart = parts.length > 0 ? parts[parts.length - 1] : '';
      const prevIsBlock = prevPart.endsWith('\n');
      const keepStartIndent = glueMode === 'li' || glueMode === 'list';

      const trimCurStart = !keepStartIndent && (prevIsBlock || (!curIsBlock && /\s/.test(ch)));
      const trimPrevEnd = !trimCurStart && curIsBlock && parts.length > 0;

      if (trimCurStart) md = md.trimStart();
      if (trimPrevEnd) parts[parts.length - 1] = parts[parts.length - 1].trimEnd();

      parts.push(md);
      ch = md.length > 0 ? md[md.length - 1] : ch;
    }
    
    const layoutRules = {
      block: gcx.inListItem
            ? { prefix: '\n\n', suffix: '\n',   trimStart: true,  trimEnd: true }
            : { prefix: '\n\n', suffix: '\n\n', trimStart: true,  trimEnd: true },
      list: gcx.inListItem
            ? { prefix: '\n',   suffix: '',     trimStart: true,  trimEnd: true }
            : { prefix: '\n',   suffix: '\n\n', trimStart: true,  trimEnd: true },
      li:     { prefix: '',     suffix: '',     trimStart: false, trimEnd: false },
      inline: { prefix: '',     suffix: '',     trimStart: false, trimEnd: false },
    };
    const { prefix, suffix, trimStart, trimEnd } = layoutRules[glueMode];
    const safePrefix = entryChar === '\n' ? '' : prefix;

    let glued = parts.join('');
    if (trimStart) glued = glued.trimStart();
    if (trimEnd) glued = glued.trimEnd();

    return glued ? `${safePrefix}${glued}${suffix}` : '';
  };

  if (!node || !isElement(node)) return '';

  // --- handle site-specific elements ---
  const siteResult = !ctx.skipHandler && ctx.toMdElementHandler
    ? ctx.toMdElementHandler(node, ctx, glueChildren)
    : null;
  if (siteResult?.skip) return '';
  let result = '';
  if (siteResult?.md) {
    result = siteResult.md;
  } else { // --- default handling for HTML elements ---
    // log(`toMd.elemNode: ${node.tagName}`);
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
        let linkText = glueChildren(node, 'inline', 'normal', (toolTip ? { dedupeCaption: toolTip } : {})).trim();

        // dedupe. text—Markdown is final output; LLMs/humans don’t need repeated info. (prefer figcaption > href > aText > title)
        const toolTipIsDupe = [linkText, ctx.dedupeCaption, lastSeg, href].some(o => isCaptionSimilar(toolTip, o));
        const linkTextIsDupe = [ctx.dedupeCaption, lastSeg, href].some(o => isCaptionSimilar(linkText, o));

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
        const bullet =
          isOList(node.parentNode) ? `${index}. ` :
          isUList(node.parentNode) ? '- ' :
          '- ';
        const pad = ' '.repeat(bullet.length);

        result = glueChildren(node, 'li', 'normal', { inListItem: true });

        //log(`toMd.LI node=${node.tagName}, index=${index}, listType=${listType}, olStart=${olStart}`);
        //log(`toMd.LI.result-before: "${result}"`);
        // Normalize leading/trailing newlines
        result = result.startsWith('\n\n') ? result.slice(2) : result;
        result = result.endsWith('\n') ? result : result + '\n';

        const leadingWs = result.match(/^(\n*)/)?.[0] ?? '';
        const trailingWs = result.match(/(\n*)$/)?.[0] ?? '';
        result = result.slice(leadingWs.length, result.length - trailingWs.length);

        // Split and compact layout
        const lines = result.split(/(\n+)/);
        //log(`toMd.LI.result-split: ${JSON.stringify(lines)}`);

        // Collapse \n\n before nested list bullets. (REVIEW: stylistic choice)
        for (let i = 0; i < lines.length - 1; i++) {
          if (lines[i].endsWith('\n\n') && /^(\d+\.\s|- )/.test(lines[i + 1])) {
            //log(`toMd.LI: collapsing \\n\\n before nested list bullet at index ${i}`);
            lines[i] = lines[i].slice(0, -1); // trim one newline
          }
        }

        // Indent all lines after line breaks
        result = lines.map(line =>
          line.startsWith('\n') ? line + pad : line
        ).join('');
        // log(`toMd.LI.result-split-join: "${result}"`);

        // Reassemble
        result = `${bullet}${leadingWs}${result}${trailingWs}`;
        break;
      }

      case 'PRE': {
        // const lang = [...node.classList].find(cls => cls.startsWith('lang-'))?.slice(5) || '';
        result = glueChildren(node, 'inline', 'pre');
        result = result.replace(/\n*$/, '\n');
        result = `\`\`\`\n${result}\`\`\`\n\n`;
        break;
      }

      case 'CODE': {
        const fence = 
          isPre(node.parentNode) ? '' :
          node.textContent?.includes('`') ? '``' :
          '`';
        result = `${fence}${node.textContent}${fence}`;
        break;
      }

      case 'BLOCKQUOTE': {
        result = glueChildren(node, 'block', 'normal', { quoteDepth: ctx.quoteDepth + 1 });
        //log(`toMd: blockquote content before formatting: "${result}"`);
        //log(`toMd.blockquote: quoteDepth=${quoteDepth}`);
        const bqPrefix = result.match(new RegExp('^\\n*'))?.[0] ?? '';
        const bqSuffix = result.match(/\n*$/)?.[0] ?? '';

        result = result.slice(bqPrefix.length, result.length - bqSuffix.length);
        result = result.split('\n').map(line => `> ${line}`).join('\n');
        result = bqPrefix + result + bqSuffix;
        break;
      }

      case 'IMG': {
        //let src = (node as HTMLImageElement).src || node.getAttribute('src') || '';
        let src = getNormalizedUrl(node, 'src');
        src = decodeURIComponent(src);
        const srcSeg = lastUrlSegment(src);
        let alt = (node.getAttribute('alt') || '').replace(/\s+/g, ' ').trim();
        let title = (node.getAttribute('title') || '').replace(/\s+/g, ' ').trim();

        // dedupe. text—Markdown is final output; LLMs/humans don’t need repeated info. (prefer figcaption > src > alt > title)
        const isTitleDupe = isCaptionSimilar(title, alt) || isCaptionSimilar(title, ctx.dedupeCaption) || isCaptionSimilar(title, srcSeg);
        const isAltDupe = isCaptionSimilar(alt, ctx.dedupeCaption) || isCaptionSimilar(alt, srcSeg); // TODO: consider not deduping alt
        title = isTitleDupe ? '' : title;
        alt = isAltDupe ? '' : alt;

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
        const table = [];
        const rows = [...node.querySelectorAll('tr')];
        const nCols = Math.max(...rows.map(row => row.children.length));
        const headerRow = rows.find(r => [...r.children].some(cell => isTableHeader(cell)));
        const minColWidth = 3; // Minimum column width for table cells

        // add header row
        if (headerRow) {
          table.push([...headerRow.children].filter(c => isTableHeader(c) || isTableCell(c)).map(c => toMd(c, ctx).trim()));
        } else {
          table.push(new Array(nCols).fill(''));
        }

        // add separator row
        table.push(new Array(nCols).fill(''));

        // add data rows
        for (const row of rows) {
          if (row === headerRow) continue; // skip header row as it's already added
          table.push([...row.children].filter(c => isTableHeader(c) || isTableCell(c)).map(c => toMd(c, ctx).trim()));
        }

        //log('DEBUG table array of arrays:', table);

        const colWidths = table.reduce((widths, row) => {
          row.forEach((cell, i) => {
            widths[i] = Math.max(widths[i], cell.length);
          });
          return widths;
        }, new Array(nCols).fill(minColWidth));

        for (let i = 0; i < table.length; i++) {
          const row = table[i];
          if (row.length !== nCols) {
            log(`WARNING: Row ${i} has ${row.length} columns, expected ${nCols}`);
          }

          for (let j = 0; j < nCols; j++) {
            let cell = row[j] ?? 'ERR';
            const width = colWidths[j];

            let leftMark = ' ';
            let rightMark = ' ';
            const endWall = j === nCols - 1 ? '|\n' : '';

            if (i === 1) { // separator row
              const style = headerRow?.children[j]?.getAttribute('style') ?? '';
              leftMark = style.includes('left') || style.includes('center') ? ':' : ' ';
              rightMark = style.includes('right') || style.includes('center') ? ':' : ' ';
              cell = '-'.repeat(width);
            }

            if (cell.length < width) {
              cell = cell.padEnd(width, ' ');
            }

            //log(`toMd.TABLE: cell[${i}][${j}](width=${cell.length}, expected=${width}) = "${cell}" `);
            result += `|${leftMark}${cell}${rightMark}${endWall}`;
          }
        }

        result = `\n\n${result}\n\n`;
        break;
      }

      case 'TH':
      case 'TD': {
        result = glueChildren(node, 'inline', 'normal');

        // norm vertical breaks; inline whitespace is valid in GFM tables
        if (/[\n\f\v\r\u0085\u2028\u2029]/.test(result)) { // u085 = next line, u2028 = line separator, u2029 = paragraph separator. NEL is not considered ws in JS though..
          log('WARNING: vertical whitespace in table cell content:', result);
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
          parts.push(toMd(child, { ...ctx, dedupeCaption: caption }));
        }

        // data-mw attribute handling (e.g. for PDF pages in Wikimedia Commons)
        const dataAttr = node.getAttribute('data-mw') || '{}';
        let data;
        try {
          data = JSON.parse(dataAttr);
        } catch (e) {
          log(`WARNING: Failed to parse data-mw attribute: ${dataAttr}`, e);
        }

        const fullCaption = [];
        if (data?.page) fullCaption.push(`page ${data.page} preview`);
        if (caption) fullCaption.push(caption);

        const body = [];
        body.push('\n\n:::figure');
        if (parts.length) body.push(parts.filter(Boolean).join('\n'));
        if (fullCaption.length) body.push('\n' + fullCaption.join('\n'));
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

  // log(`toMd: result for ${node.tagName} is "${result}"`);
  return ctx.isRoot
    ? result.trim()
    : result;
}