/**
 * Wikipedia DOM Reference (Desktop)
 * 
 * main#content
 *   h1#firstHeading > span                       → Main title
 * 
 *   div#mw-content-text > div
 *     p                                          → Paragraph
 *     h2                                         → Section heading
 *     h3                                         → Subsection heading
 *     ul / ol                                    → Lists
 *     blockquote                                 → Blockquotes (rare)
 *     pre / code                                 → Preformatted/code blocks (e.g., from templates)
 *     table                                      → Tables (infoboxes, navboxes, etc.)
 *     div.reflist                                → Reference list (footnotes)
 *     div.thumb                                  → Inline images/thumbnails
 *     div.gallery                                → Image galleries
 *     sup.reference                              → Inline citation markers
 *     div.hatnote                                → Notes (e.g., disambiguation, summary boxes)
 * 
 */

const STYLE_MAIN = /* css */ `
html {
  --color-base: #202122;

  background: white;
  color: var(--color-base);
  font-family: sans-serif;
  font-size: 1em;
  line-height: 1.625;
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

.tri-toggle,
.tri-toggle-slider {
  --track-width: 50px;
  --track-height: 22px;
  --knob-size: 16px;
  --knob-offset: calc((var(--track-height) - var(--knob-size)) / 2);
  --knob-range: calc(var(--track-width) - var(--knob-size) - var(--knob-offset) * 2);
  --label-text: "view";
}
label.tri-toggle {
  position: relative;
  display: inline-block;
  width: var(--track-width);
  height: var(--track-height);
}
label.tri-toggle::after {
  content: var(--label-text);
  position: absolute;
  left: 100%;
  margin-left: 0.9em;
  white-space: nowrap;
  font-size: 0.9em;
}
input.tri-toggle {
  opacity: 0;
  width: 0;
  height: 0;
}
.tri-toggle-slider {
  position: absolute;
  cursor: pointer;
  background-color: #a3a9b3;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  transition: 0.2s;
  border-radius: var(--track-height);
}
.tri-toggle-slider:before {
  position: absolute;
  content: "";
  height: var(--knob-size);
  width: var(--knob-size);
  left: var(--knob-offset);
  bottom: var(--knob-offset);
  background-color: white;
  transition: 0.2s;
  border-radius: 50%;
}
input.tri-toggle[data-state="0"] + .tri-toggle-slider::before {
  transform: translateX(0);
}
input.tri-toggle[data-state="1"] + .tri-toggle-slider::before {
  transform: translateX(calc(var(--knob-range) / 2));
}
input.tri-toggle[data-state="2"] + .tri-toggle-slider::before {
  transform: translateX(var(--knob-range));
}
.show-html .html-view,
.show-md .md-view,
.show-raw .raw-view {
  display: block;
}
.show-html .md-view,
.show-html .raw-view,
.show-md .html-view,
.show-md .raw-view,
.show-raw .html-view,
.show-raw .md-view {
  display: none;
}
.html-view h1 {
  margin-top: 0;
}
`;

/** */

function toHtml(node) {
  if (!node || shouldIgnore(node)) return null;

  if (node.nodeType === Node.TEXT_NODE) {
    return document.createTextNode(node.textContent);
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  // display the original MathJax LaTeX content
  if (node.tagName === 'SCRIPT') { // non-MathJax scripts have already been filtered out
    const pre = document.createElement('pre');
    pre.style.display = 'inline';
    pre.textContent = node.textContent;
    return pre;
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
    const childNode = toHtml(child);
    if (childNode) clone.appendChild(childNode);
  }

  return clone;
}

function shouldIgnore(node) {
  if (!node) throw new Error('shouldIgnore called with null or undefined node');
  if (node.nodeType === Node.TEXT_NODE) return false; // Text nodes are never ignored

  if (node.nodeType === Node.ELEMENT_NODE) {
    // const id = node.id || '';
    // const className = node.className || '';
    // const aType = node.getAttribute('type') || '';

    return false;
  }

  return true;
}

function toMd(node, wsMode = 'normal', olStart = 1, quoteDepth = 0, lastChar = '', isRoot = true) {
  if (!node || shouldIgnore(node) || node.nodeType !== Node.ELEMENT_NODE) return '';

  function glueChildren(n, glueMode, ws = wsMode, os = olStart, qd = quoteDepth, lc = lastChar) {
    const prevLc = lc;
    const result = [];
    log(`toMd.glue: processing node ${n.tagName} with ws=${ws}, os=${os}, qd=${qd}, lc="${lc}", glueMode=${glueMode}`);

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
        md = toMd(child, ws, os, qd, lc, false);
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
    //log(`toMd.glue: glued result before processing: "${glued}"`);
    
    const hasBlockStructure = glueMode === 'block';
    if (isRoot) {
      glued = glued.trim();
    } else if (hasBlockStructure) {
      const prefix = prevLc !== '\n' && !isRoot ? '\n\n' : '';
      glued = prefix + glued.trim() + '\n\n';
    } else if (glueMode === 'list') {
      const prefix = prevLc !== '\n' && !isRoot ? '\n' : '';
      glued = prefix + glued;
    }

    //log(`toMd.glue: final glued result: "${glued}"`);
    return glued;
  }

  let result = '';
  //log(`toMd.elemNode: ${node.tagName}`);
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
      result = glueChildren(node, 'list', 'normal', startIndex);
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
      //log(`toMd.LI.result-split-join: "${result}"`);

      // Reassemble
      result = `${bullet}${leadingWs}${result}${trailingWs}`;
      break;
    }

    case 'PRE': {
      //const langClass = Array.from(node.classList).find(cls => cls.startsWith('lang-'));
      //const lang = langClass ? langClass.slice(5) : '';
      result = glueChildren(node, 'flat', 'pre');
      result = result.endsWith('\n\n') ? result.slice(0, -1) : result;
      result = result.endsWith('\n') ? result : result + '\n';
      result = '```' + '\n' + result + '```\n\n';
      break;
    }

    case 'CODE': {
      const fence = node.parentNode.tagName === 'PRE'? '' : node.textContent.includes('`') ? '``' : '`';
      result = `${fence}${node.textContent}${fence}`;
      break;
    }

    case 'BLOCKQUOTE': {
      result = glueChildren(node, 'block', 'normal', olStart, quoteDepth + 1);
      //log(`toMd: blockquote content before formatting: "${result}"`);
      //log(`toMd.blockquote: quoteDepth=${quoteDepth}`);
      const bqPrefix = result.match(new RegExp('^\\n*'))[0];
      const bqSuffix = result.match(/\n*$/)[0];
      result = result.slice(bqPrefix.length, result.length - bqSuffix.length);
      result = result.split('\n').map(line => '> ' + line).join('\n');
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
          trow.push(toMd(cell).trim());
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
      if (/\n/.test(result)) {
        log('WARNING: multi-line cell content in table:', result);
      }
      result = result.replace(/\n+/g, ' ').replace(/\r+/g, '');

      break;
    }

    default: {
      result = node.outerHTML || '';
      break;
    }
  
  }

  //log(`toMd: result for ${node.tagName} is "${result}"`);
  return result;
}

function h(tag, attrs = {}, ...children) {
  let node;

  if (typeof tag === 'string' && tag.startsWith('svg:')) {
    node = document.createElementNS('http://www.w3.org/2000/svg', tag.slice(4));
  } else {
    node = document.createElement(tag);
  }

  for (const [key, value] of Object.entries(attrs)) {
    node.setAttribute(key, value);
  }
  children.forEach(child => {
    if (typeof child === 'string') {
      node.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      node.appendChild(child);
    }
  });
  return node;
}

function buildTriToggleSwitch({ initState = 0, onToggle = null } = {}) {
  const input = h('input', {
    type: 'checkbox',
    class: 'tri-toggle',
    'aria-label': 'Toggle view mode',
    'data-state': initState,
  });

  const slider = h('span', { class: 'tri-toggle-slider' });
  const label = h('label', { class: 'tri-toggle' }, input, slider);
  label.style.setProperty('--label-text', `"${['html', 'markdown', 'wikitext'][initState]}"`);

  if (typeof onToggle === 'function') {
    onToggle(initState);
  }

  input.addEventListener('change', () => {
    let state = +input.getAttribute('data-state');
    state = (state + 1) % 3;
    input.setAttribute('data-state', state);
    label.style.setProperty('--label-text', `"${['html', 'markdown', 'wikitext'][state]}"`);

    if (typeof onToggle === 'function') {
      onToggle(state);
    }
  });

  return label;
}

/*
function buildCopyButton(data, doc, postIdx = -1) {
  const color = '#4ca5f2';
  const bg = '#f2f4f7';

  // hidden helper to hold the text to be copied
  let ta = doc.getElementById('copy-textarea');
  if (!ta) {
    ta = h('textarea', {
      id: 'copy-textarea',
      style: 'position: fixed; top: 0; left: 0; opacity: 0; pointer-events: none;',
    });
    doc.body.appendChild(ta);
  }

  const responseTxt = postIdx === -1 ? 'Copied All!' : postIdx === 0 ? 'Copied Question!' : `Copied Answer ${postIdx}!`;
  const response = h('span', {
    style: `
      display: none;
      color: ${color};
      background-color: ${bg};
      border: 1px solid currentColor;
      border-radius: 6px;
      padding: 4px 8px;
      font-size: 15px;
      align-content: center;
      margin-left: 5px;
    `.trim(),
  }, responseTxt);

  const button = h('button', {
    style: `
      cursor: pointer;
      margin-left: 20px;
      padding: 6px 8px;
      background-color: ${bg};
      border: 1px solid currentColor;
      border-radius: 6px;
      color: ${color};
      transition: background-color 0.1s linear;
    `.trim(),
  });

  const buttonSvg = h('svg:svg', {
    width: '20px',
    height: '20px',
    viewBox: '0 0 20 20',
    fill: 'none',
    role: 'img',
    'aria-label': 'copy',
    focusable: 'false',
  });

  const buttonPath = h('svg:path', { 
    d: 'M4.16667 12.5H3.33333C2.89131 12.5 2.46738 12.3244 2.15482 12.0118C1.84226 11.6993 1.66667 11.2754 1.66667 10.8333V3.33332C1.66667 2.8913 1.84226 2.46737 2.15482 2.15481C2.46738 1.84225 2.89131 1.66666 3.33333 1.66666H10.8333C11.2754 1.66666 11.6993 1.84225 12.0118 2.15481C12.3244 2.46737 12.5 2.8913 12.5 3.33332V4.16666M9.16667 7.49999H16.6667C17.5871 7.49999 18.3333 8.24618 18.3333 9.16666V16.6667C18.3333 17.5871 17.5871 18.3333 16.6667 18.3333H9.16667C8.24619 18.3333 7.5 17.5871 7.5 16.6667V9.16666C7.5 8.24618 8.24619 7.49999 9.16667 7.49999Z',
    stroke: 'currentColor',
    'stroke-width': '1.66667',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  });
  
  buttonSvg.appendChild(buttonPath);
  button.appendChild(buttonSvg);

  button.addEventListener('click', function() {
    let txt = '';

    if (postIdx === -1) {
      txt = `
===========================================
        Wiki Sharing Bookmarklet
===========================================
      `.trim() + '\n';

      if (data.questionLink) {
        txt += '\n';
        txt += `Title: ${data.questionLink.textContent.trim()}\n`;
        txt += `URL:   ${data.questionLink.getAttribute('href')}\n`;
      }
    }

    data.posts.forEach(function(post, idx) {
      if (postIdx !== -1 && idx !== postIdx) return;
      
      const postHeader = idx === 0 ? 'Question' : `Answer ${idx}`;
      txt += `\n\n❖❖ ${postHeader} ❖❖\n\n${post.bodyMd}`;
      const contributors = displayContributorsAndVotes(post.contributors, post.vote);
      if (contributors) {
        txt += `\n\n${contributors}`;
      }
      txt += '\n';

      if (post.comments.length > 0) {
        post.comments.forEach(function(comment, commentIdx) {
          txt += `\nComment ${commentIdx + 1}:\n${comment.bodyMd}`;
          const contributors = displayContributorsAndVotes(comment.contributors, comment.vote);
          if (contributors) {
            txt += ` ${contributors}`;
          }
          txt += '\n';
        });
      }

      txt = txt.trimEnd() + '\n';
    });

    ta.value = txt.trim();
    ta.select();

    try {
      const successful = doc.execCommand('copy');
      if (successful) {
        button.disabled = true;
        response.style.display = 'inline-block';
        setTimeout(() => {
          // Reset button to original state
          button.disabled = false;
          response.style.display = 'none';
        }, 1000);
      } else {
        alert('Failed to copy content.');
      }
    } catch (err) {
      console.error('Copy error:', err);
    }
  });

  return h('div', {
    style: 'display: inline-flex;',
  }, button, response);
}
*/

class WikiNode {
  constructor(title, level, section) {
    this.title = title;
    this.level = level; // 2 = <h2>, 3 = <h3>, etc.
    this.section = section;
    this.html = h('div', { class: 'wiki-node' });
    this.md = '';
    this.raw = '';
    this.children = [];
  }

  static buildFromHTML(root) {
    if (!root || !root.querySelector) {
      throw new Error('Invalid root element provided for WikiNode.buildFromHTML');
    }
    const title = root.querySelector('h1#firstHeading > span')?.textContent.trim() || '';
    if (!title) {
      throw new Error('No title found in the provided root element');
    }
    const rootNode = new WikiNode(title, 1, -1);
    let curSection = 0;
    let currentNode = rootNode;

    for (const htmlNode of root.querySelector('div#mw-content-text > div').childNodes) {
      const firstChild = htmlNode.children?.[0];
      if (htmlNode.tagName === 'DIV' && /^H[2-6]$/.test(firstChild?.tagName)) {
        const level = parseInt(firstChild.tagName[1]);
        const title = firstChild.textContent.trim();
        curSection++;
        currentNode = new WikiNode(title, level, curSection);

        // Find correct parent based on level
        let parentLevel = level - 1;
        let parentNode = null;
        while (parentLevel > 0) {
          parentNode = rootNode.getLastNodeByLevel(parentLevel);
          if (parentNode) break;
          parentLevel--;
        }
        if (!parentNode) { throw new Error(`Impossible. No parent found for section "${title}" at level ${level}`); }
        parentNode.addChild(currentNode);
      } else {
        const htmlFrag = toHtml(htmlNode);
        if (htmlFrag) {
          currentNode.html.appendChild(toHtml(htmlNode));
          currentNode.md += toMd(htmlNode);
        }
      }
    }
    return rootNode;
  }
  
  addChild(section) {
    this.children.push(section);
  }

  *[Symbol.iterator]() {
    yield this;
    for (const child of this.children) {
      yield* child;
    }
  }

  find(fn) {
    for (const node of this) {
      if (fn(node)) return node;
    }
    return null;
  }

  getNodeBySection(section) {
    return this.find(n => n.section === section);
  }

  getNodeByTitle(title) {
    return this.find(n => n.title === title);
  }

  getLastNodeByLevel(level) {
    if (this.level === level) return this;
    for (let i = this.children.length - 1; i >= 0; i--) {
      const found = this.children[i].getLastNodeByLevel(level);
      if (found) return found;
    }
    return null;
  }

  // Pretty-print the tree (for debugging)
  toString(indent = 0) {
    let out = `${'  '.repeat(indent)}- ${this.title} (H${this.level})\n`;
    for (const child of this.children) {
      out += child.toString(indent + 1);
    }
    return out;
  }

  getHtml() {
    const titleElem = h(`h${this.level}`, {}, this.title);
    const container = h('div', { class: 'wikinode-html' }, titleElem);
    if (this.html) {
      container.appendChild(this.html);
    }
    for (const child of this.children) {
      container.appendChild(child.getHtml());
    }
    return container;
  }

  getMd() {
    let out = `${'='.repeat(this.level)} ${this.title.trim()} ${'='.repeat(this.level)}\n\n`;
    out += this.md ? this.md + '\n\n' : '';
    for (const child of this.children) {
      out += child.getMd();
    }
    return out;
  }

  getRaw() {
    let out = this.raw ? this.raw + '\n\n' : '';
    for (const child of this.children) {
      out += child.getRaw();
    }
    return out;
  }

  populateRaw(rawText) {
    const marker = '='.repeat(this.level);
    const title = this.title.trim();

    // Find section start
    let startIdx = 0;
    let headingSkipIdx = 0;
    if (this.level > 1) {
      const headingRegex = new RegExp(`^${marker}\\s*${escapeRegExp(title)}\\s*${marker}\\s*$`, 'm');
      const match = headingRegex.exec(rawText);
      if (!match) {
        console.warn(`[WikiNode.populateRaw] No section match for "${title}"`);
        console.warn(`rawText: "${rawText.slice(0, 100)}..."`);
        this.raw = '';
        return;
      }
      startIdx = match.index;
      headingSkipIdx = startIdx + match[0].length;
    }

    // Find next section end
    const rest = rawText.slice(headingSkipIdx);
    const nextSectionRegex = /^(={1,6})\s*[^=].*?[^=]\s*\1\s*$/gm;
    const nextMatch = nextSectionRegex.exec(rest);
    const endIdx = nextMatch ? headingSkipIdx + nextMatch.index : rawText.length;

    this.raw = rawText.slice(startIdx, endIdx).trim();
  }

}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getBaseAndRawUrl(root) {
  const baseUrl = root.querySelector('link[rel="canonical"]')?.href || '';

  const altLink = root.querySelector('link[rel="alternate"][type="application/x-wiki"]');
  let rawUrl = altLink?.href.includes('action=edit')
    ? altLink.href.replace(/action=edit$/, 'action=raw')
    : '';
  
  if (!rawUrl) {
    const baseTitle = baseUrl.match(/\/wiki\/([^#?]+)/)?.[1] || '';
    const baseDomain = baseUrl.match(/^https?:\/\/[^/]+/)?.[0] || 'https://en.wikipedia.org';
    if (baseTitle) {
      rawUrl = `${baseDomain}/w/index.php?origin=*&title=${baseTitle}&action=raw`; //&origin=*
    }
  }

  return { baseUrl, rawUrl };
}

async function fetchRawPage(rawUrl) {
  // override for local testing
  if (location.protocol === 'file:' && typeof window.exampleRaw === 'string') {
    log('[fetchRawPage] Using local override for exampleRaw');
    return window.exampleRaw;
  }

  try {
    const res = await fetch(rawUrl);
    return res.ok
      ? await res.text()
      : (console.warn(`[fetchRawPage] HTTP ${res.status} for "${rawUrl}"`), '');
  } catch (err) {
    console.warn(`[fetchRawPage] Fetch error for "${rawUrl}":`, err);
    return '';
  }
}

async function runBookmarklet(root = document) {
  const { baseUrl, rawUrl } = getBaseAndRawUrl(root);
  if (!baseUrl) {
    alert('This bookmarklet requires a valid Wikipedia page with a canonical URL.');
    return;
  }

  const doc = window.open('', '_blank', '').document;
  doc.title = 'Bookmarklet';
  const style = doc.createElement('style');
  style.textContent = STYLE_MAIN.trim();
  doc.head.appendChild(style);

  const titleBar = h('div', {
    style: 'display: flex;',
  });

  const intro = h('h1', { style: 'margin-top: 0; line-height: 1' }, 'Wiki Sharing Bookmarklet');
  titleBar.appendChild(intro);
  doc.body.appendChild(titleBar);
  doc.body.appendChild(h('a', { href: baseUrl, target: '_blank', style: 'display: block; margin-bottom: 0.7em' }, baseUrl));

  const viewToggle = buildTriToggleSwitch({
    initState: 0,
    onToggle: (state) => {
      if (state === 0) {
        doc.body.classList.remove('show-md', 'show-raw');
        doc.body.classList.add('show-html');
      } else if (state === 1) {
        doc.body.classList.remove('show-html', 'show-raw');
        doc.body.classList.add('show-md');
      } else if (state === 2) {
        doc.body.classList.remove('show-html', 'show-md');
        doc.body.classList.add('show-raw');
      }
    },
  });

  doc.body.appendChild(viewToggle);

  const tree = WikiNode.buildFromHTML(root);
  // log('WikiNode tree:\n', tree.toString());
  const rawText = await fetchRawPage(rawUrl);
  // log(rawText.slice(0, 1000), '...'); // log first 100 chars of raw text
  for (const node of tree) {
    node.populateRaw(rawText);
  }

  const html = h('div', { class: 'html-view' }, tree.getHtml());
  const md = h('pre', { class: 'md-view' }, tree.getMd());
  const raw = h('pre', { class: 'raw-view' }, tree.getRaw());
  const contentBox = h('div', { style: 'margin-top: 3em;' }, html, md, raw);
  doc.body.appendChild(contentBox);

}


/* @debug-start */
/* exported runBookmarklet */
const DEBUG = typeof process !== 'undefined' && process.env.DEBUG === 'true';
const LOG_JSONIFY_STRINGS = false;
const LOG_ESCAPE_WS = false;
const LOG_INDENT = 2;
function log(...args) {
  if (!DEBUG) return;

  for (const arg of args) {
    let out;
    if (typeof arg === 'string') {
      out = LOG_JSONIFY_STRINGS ? JSON.stringify(arg).slice(1, -1) : arg;
    } else {
      try {
        out = JSON.stringify(arg, null, LOG_INDENT);
      } catch (err) {
        out = `[Unserializable object: ${err.message}]`;
      }
    }
    if (LOG_ESCAPE_WS) {
      out = out.replace(/\n/g, '\\n').replace(/\t/g, '\\t');
    } 
    console.log(out);
  }
}
/* @debug-end */

/* @export-start */
export { toHtml, toMd, runBookmarklet };
/* @export-end */