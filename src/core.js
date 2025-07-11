import { log } from './utils.js';

export const baseCss = /* css */ `
html {
  --color-base: #0c0d0e;

  background: white;
  color: var(--color-base);
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  font-size: 1em;
  line-height: 1.4;
}
body {
  margin: 0 auto;
  padding: 1.5em;
}
h1, h2, h3, h4, h5, h6 {
  font-weight: 600;
  margin: 1em 0 0.25em 0;
}
p, ul, ol, blockquote, pre {
  margin: 0.5em 0;
}
a {
  color: var(--color-base);
  text-decoration: underline;
}
b, strong {
  font-weight: 600;
}
ul, ol {
  padding-left: 1.4em;
  margin: 0.3em 0;
}
ul li {
  margin: 0.2em 0;
  color: #333;
}
ul li::marker {
  color: #777;
  font-size: 0.8em;
}
blockquote {
  border-left: 2px solid #999;
  margin: 0.5em 0;
  padding-left: 0.8em;
  color: #333;
}
pre, code {
  font-family: "SFMono-Regular", Consolas, Menlo, monospace;
  background: #eee;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  overflow-x: auto;
}
pre code {
  background: none;
  padding: 0;
  border-radius: 0;
}
textarea {
  font-family: inherit;
}
button {
  margin-left: 10px;
  background: #f2f4f7;
  border: 1px solid currentColor;
  color: #4ca5f2;
  cursor: pointer;
}
table {
  border-collapse: collapse;
  border-spacing: 0;
  margin: 1em 0;
  width: 100%;
  font-size: 1em;
}
th, td {
  border: 1px solid #ccc;
  padding: 0.2em 0.4em;
}
td {
    text-align: left;
    vertical-align: top;
} 
th {
  text-align: center;
  vertical-align: middle;
  font-weight: bold;
  background: #f5f5f5;
}
table caption {
  font-weight: bold;
  margin-top: 0.5em;
}
img {
  vertical-align: text-bottom;
  max-width: 100%;
}
figure {
  display: inline-flex;
  flex-direction: column;
  margin: 1.5em 0;
  padding: 0;
}
figure figcaption {
  font-size: 0.9em;
}
`;

export function toHtml(node, opts = {}) {
  const {
    shouldIgnore = () => false,
  } = opts;

  if (!node || shouldIgnore(node)) return null;

  if (node.nodeType === Node.TEXT_NODE) {
    return document.createTextNode(node.textContent);
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  // display the original MathJax LaTeX content
  if (node.tagName === 'SCRIPT') { // non-MathJax scripts have already been filtered out
    const math = document.createElement('math');
    math.textContent = node.textContent;
    return math;
  }

  const clone = document.createElement(node.tagName.toLowerCase());

  const allowedStyles = ['display', 'clear']; // img styles for widhth/height???
  for (const attr of node.attributes) {
    const name = attr.name.toLowerCase();
    let val = '';

    switch (name) {
      case 'href':
      case 'src':
        if (attr.value.startsWith('javascript:')) {
          val = '#';  // ignore JavaScript links
        } else if (attr.value.startsWith('//')) { // protocol-relative URL
          val = 'https:' + attr.value;
        }
        else {
          val = node[name] || attr.value; // prefer resolved URL
        }
        break;
      case 'title':
        val = attr.value.replace(/\s+/g, ' ').trim();
        break;
      case 'rowspan':
      case 'colspan':
      case name.startsWith('data-') && name:
        val = attr.value;
        break;
      case 'width':
      case 'height':
        if (node.tagName === 'IMG') val = attr.value;
        break;
      case 'style': {
        const styles = attr.value.split(';').map(s => s.trim().toLowerCase()).filter(Boolean);
        const styleObj = {};
        for (const style of styles) {
          const [key, value] = style.split(':').map(s => s.trim());
          if (!key || !value) continue;
          const isAllowed = allowedStyles.includes(key);
          const isImageSize = node.tagName === 'IMG' && (key === 'width' || key === 'height');
          if (isAllowed || isImageSize) {
            styleObj[key] = value;
          }
        }
        val = Object.entries(styleObj).map(([k, v]) => `${k}: ${v}`).join('; ');
        break;
      }
      default:
        break;
    }

    if (val) {
      clone.setAttribute(attr.name, val);
    }
  }

  for (const child of node.childNodes) {
    const childNode = toHtml(child, opts);
    if (childNode) clone.appendChild(childNode);
  }

  return clone;
}

export function toMd(node, ctx = {}) {
  const {
    olStart = 1,
    quoteDepth = 0,
    lastChar = '',
    isRoot = true,
    shouldIgnore = () => false,
  } = ctx;

  if (!node || shouldIgnore(node) || node.nodeType !== Node.ELEMENT_NODE) return '';

  function glueChildren(n, glueMode, ws = 'normal', { os = olStart, qd = quoteDepth, lc = lastChar } = {}) {
    const prevLc = lc;
    const result = [];
    // log(`toMd.glue: processing node ${n.tagName} with ws=${ws}, os=${os}, qd=${qd}, lc="${lc}", glueMode=${glueMode}`);

    const children = n.childNodes;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      //log(`toMd.glue: processing child ${child.nodeName} with ws=${ws}, os=${os}, qd=${qd}, lc="${lc}"`);
      let md = '';
      if (child.nodeType === Node.TEXT_NODE) {
        md = child.textContent;
        //log(`toMd.glue.child.md.pre-ws: "${md}"`);
        if (/^\s*$/.test(md)) continue; // all whitespace

        switch (ws) {
          case 'normal': md = md.replace(/\s+/g, ' '); break;
          case 'pre': break;
          case 'pre-line': md = md.replace(/[ \t]+/g, ' '); break;
          default: throw new Error(`Unsupported whitespace mode: ${ws}`);
        }
        //log(`tomd.glue.text.md.post-ws: "${md}"`);
      }
      else if (child.nodeType === Node.ELEMENT_NODE) {
        md = toMd(child, { ...ctx, isRoot: false, lastChar: lc, olStart: os, quoteDepth: qd });
      }

      const isCurBlock = md.startsWith('\n');
      const prevChild = result.length > 0 ? result[result.length - 1] : '';
      const isPrevBlock = prevChild.endsWith('\n');
      const hasLeadingSemanticIndentation = glueMode === 'li' || glueMode === 'list';

      const shouldTrimCurStart =
        !hasLeadingSemanticIndentation
        && (isPrevBlock || (!isCurBlock && /\s/.test(lc)));
      const shouldTrimPrevEnd = !shouldTrimCurStart && isCurBlock && result.length > 0;

      //log(`toMd.glue.logic: parentNode=${n.tagName} isCurBlock=${isCurBlock}, isPrevBlock=${isPrevBlock}, shouldTrimCurStart=${shouldTrimCurStart}, shouldTrimPrevEnd=${shouldTrimPrevEnd}, hasLeadingSemanticIndentation=${hasLeadingSemanticIndentation}`);
      
      if (shouldTrimCurStart) {
        md = md.trimStart();
      }
      if (shouldTrimPrevEnd) {
        //log(`toMd.glue is trimming prev!`);
        //log(`toMd.glue.prev-before: "${result[result.length - 1]}"`);
        result[result.length - 1] = result[result.length - 1].trimEnd();
        //log(`toMd.glue.prev-after: "${result[result.length - 1]}"`);
      }

      //log(`toMd.glue.push.md: "${md}"`);
      result.push(md);
      lc = md.length > 0 ? md[md.length - 1] : lc;
    }

    let glued = result.join('');
    // log(`toMd.glue: glued result before processing: "${glued}"`);
    
    const displayModes = {
      block:  { prefix: '\n\n', suffix: '\n\n', trim: true  },
      list:   { prefix: '\n',   suffix: '',     trim: true  },
      inline: { prefix: '',     suffix: '',     trim: false },
    };
    const { prefix, suffix, trim } = displayModes[glueMode] || displayModes.inline;
    glued = `${prevLc === '\n' ? '' : prefix}${trim ? glued.trim() : glued}${suffix}`;

    //log(`toMd.glue: final glued result: "${glued}"`);
    return glued;
  }

  let result = '';
  // log(`toMd.elemNode: ${node.tagName}`);
  if (ctx.handlers?.[node.tagName]) {
    result = ctx.handlers[node.tagName](node, ctx, glueChildren);
  } else {
    switch (node.tagName) {
      case 'DIV': {
        result = glueChildren(node, 'flat', 'normal');
        break;
      }

      case 'P': {
        result = glueChildren(node, 'block', 'normal');
        break;
      }

      case 'SPAN':
      case 'NOBR': {
        result = glueChildren(node, 'inline', 'normal');
        result = lastChar === ' ' ? result.trimStart() : result;
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
        result = node.textContent;
        break;
      }

      case 'BR': {
        result = '  \n';
        break;
      }

      case 'A': {
        const aText = glueChildren(node, 'inline', 'normal');
        const href = (node.href || node.getAttribute('href') || '').trim();
        let title = (node.getAttribute('title') || '').replace(/\s+/g, ' ').trim();
        title = title ? ` "${title}"` : '';
        result = href ? `[${aText}](${href}${title})` : aText;
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
        result = glueChildren(node, 'list', 'normal', { os: startIndex });
        break;
      }

      case 'LI': {
        const listType = node.parentNode.tagName;
        if (listType !== 'UL' && listType !== 'OL') {
          throw new Error('LI must be child of UL or OL');
        }

        // Determine bullet (e.g., "1. ", "- ")
        let index = olStart;
        for (let sibling = node.previousSibling; sibling; sibling = sibling.previousSibling) {
          if (sibling.nodeType === Node.ELEMENT_NODE && sibling.tagName === 'LI') {
            index++;
          }
        }
        const bullet = listType === 'OL' ? `${index}. ` : '- ';
        const pad = ' '.repeat(bullet.length);

        // Glue children content
        result = glueChildren(node, 'li', 'normal');

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
        result = glueChildren(node, 'flat', 'pre');
        result = result.replace(/\n*$/, '\n');
        result = `\`\`\`\n${result}\`\`\`\n\n`;
        break;
      }

      case 'CODE': {
        const fence = node.parentNode.tagName === 'PRE'? '' : node.textContent.includes('`') ? '``' : '`';
        result = `${fence}${node.textContent}${fence}`;
        break;
      }

      case 'BLOCKQUOTE': {
        result = glueChildren(node, 'block', 'normal', { qd: quoteDepth + 1 });
        //log(`toMd: blockquote content before formatting: "${result}"`);
        //log(`toMd.blockquote: quoteDepth=${quoteDepth}`);
        const bqPrefix = result.match(new RegExp('^\\n*'))[0];
        const bqSuffix = result.match(/\n*$/)[0];

        result = result.slice(bqPrefix.length, result.length - bqSuffix.length);
        result = result.split('\n').map(line => `> ${line}`).join('\n');
        result = bqPrefix + result + bqSuffix;
        break;
      }

      case 'IMG': {
        const alt = (node.getAttribute('alt') || '').replace(/\s+/g, ' ').trim();
        const src = node.src || node.getAttribute('src') || '';
        let title = (node.getAttribute('title') || '').replace(/\s+/g, ' ').trim();
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
        const rows = Array.from(node.querySelectorAll('tr'));
        const headerRow =
          rows.find(r => [...r.children].some(cell => cell.tagName === 'TH'))
          || rows[0];
        if (!headerRow) break;

        const nCols = headerRow.children.length;
        const minColWidth = 3; // Minimum column width for table cells

        for (const row of rows) {
          if (row !== headerRow && table.length === 1) {
            // insert separator immediately after header
            table.push(new Array(nCols).fill(''));
          }

          const trow = [];
          for (const cell of row.children) {
            if (cell.tagName !== 'TH' && cell.tagName !== 'TD') continue;
            trow.push(toMd(cell, ctx).trim());
          }

          table.push(trow);
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
              const style = headerRow.children[j]?.getAttribute('style') ?? '';
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

      default: {
        result = node.outerHTML || '';
        break;
      }
    
    }
  }



  // log(`toMd: result for ${node.tagName} is "${result}"`);
  return isRoot
    ? result.trim()
    : result;
}