/**
 * DOM Reference
 * 
 * div#question-header
 *   a.question-hyperlink                         → Question title
 * 
 * div#question
 * div#answers > div.answer#answer-XXXX
 *   div.post-layout
 *     div.votecell
 *       div[itemprop="upvoteCount"][data-value]  → Upvote count
 *     div.s-prose                                → Post body (question or answer)
 *     div.post-signature.owner                   → Contributor (Question Author) 
 *     div.post-signature                         → Contributor (Answer Author or Editor)
 *       div.user-info
 *         span.relativetime[title]               → Timestamp
 *         div.user-details[itemprop="author"]?
 *           a                                    → Author/Editor name/id
 *     ul.comments-list
 *       li#comment-XXXX
 *         div.comment-score
 *           span                                 → Comment score
 *         div.comment-body
 *           span.comment-copy                    → Comment text
 *           a.comment-user                       → Contributor (Comment Author)
 *           span.comment-date
 *             span.relativetime-clean[title]     → Timestamp
 * 
 */

/** */

const STYLE_MAIN = /* css */ `
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
  .multi-toggle {
    --track-width: 50px;
    --track-height: 22px;
    --knob-size: 16px;
    --knob-offset: calc((var(--track-height) - var(--knob-size)) / 2);
    --knob-range: calc(var(--track-width) - var(--knob-size) - var(--knob-offset) * 2);
    --knob-progress: 0;
  }
  .multi-toggle-switchbody {
    position: relative;
    display: inline-block;
    vertical-align: middle;
    width: var(--track-width);
    height: var(--track-height);
  }
  .multi-toggle-checkbox {
    opacity: 0;
    width: 0;
    height: 0;
  }
  .multi-toggle-slider {
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
  .multi-toggle-slider:before {
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
  .multi-toggle-slider::before {
    transform: translateX(calc(var(--knob-range) * var(--knob-progress)));
  }
  .multi-toggle-label-left,
  .multi-toggle-label-right {
    display: inline-block;
    font-size: 0.9em;
    vertical-align: middle;
  }
  .multi-toggle-label-left {
    margin-right: 0.7em;
  }
  .multi-toggle-label-right {
    margin-left: 0.7em;
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
    const childNode = toHtml(child);
    if (childNode) clone.appendChild(childNode);
  }

  return clone;
}

function shouldIgnore(node) {
  if (!node) throw new Error('shouldIgnore called with null or undefined node');
  if (node.nodeType === Node.TEXT_NODE) return false; // Text nodes are never ignored

  if (node.nodeType === Node.ELEMENT_NODE) {
    const id = node.id || '';
    const className = node.className || '';
    const aType = node.getAttribute('type') || '';

    if (node.tagName === 'SCRIPT') {
      const isLateX = /MathJax/.test(id) || aType.startsWith('math/tex');
      if (isLateX) return false;
      return true; 
    }

    if (/MathJax/.test(id) || /MJX|MathJax/.test(className)) {
      return true;
    }

    if (node.classList.contains('snippet-result')) return true; // ignore snippet results

    return false;
  }

  return true;
}

function toMd(node, wsMode = 'normal', olStart = 1, quoteDepth = 0, lastChar = '', isRoot = true) {
  if (!node || shouldIgnore(node) || node.nodeType !== Node.ELEMENT_NODE) return '';

  function glueChildren(n, glueMode, ws = wsMode, os = olStart, qd = quoteDepth, lc = lastChar) {
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
    // log(`toMd.glue: glued result before processing: "${glued}"`);
    
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
  // log(`toMd.elemNode: ${node.tagName}`);
  switch (node.tagName) {
    case 'DIV': {
      result = glueChildren(node, 'flat', 'normal');
      if (node.classList.contains('snippet')) {
        result = result.replace(/\n*$/, '\n\n');
        result = `<!-- begin snippet: -->\n\n${result}<!-- end snippet -->\n\n`;
      }
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
      // log(`toMd.LI.result-split-join: "${result}"`);

      // Reassemble
      result = `${bullet}${leadingWs}${result}${trailingWs}`;
      break;
    }

    case 'PRE': {
      result = glueChildren(node, 'flat', 'pre');
      result = result.replace(/\n*$/, '\n');
      
      const lang = [...node.classList].find(cls => cls.startsWith('lang-'))?.slice(5) || '';
      if (
        lang
        && ['js', 'css', 'html'].includes(lang)
        && node.classList.contains(`snippet-code-${lang}`)
      ) {
        result = `<!-- language: lang-${lang} -->\n\n${result}\n`;
      } else {
        result = `\`\`\`\n${result}\`\`\`\n\n`;
      }
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
      const isSpoiler = node.classList.contains('spoiler');
      const marker = isSpoiler ? '>!' : '>';
      const bqPrefix = result.match(/^\n*/)[0];
      const bqSuffix = result.match(/\n*$/)[0];

      result = result.slice(bqPrefix.length, result.length - bqSuffix.length);
      result = result.split('\n').map(line => `${marker} ${line}`).join('\n');
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

  // log(`toMd: result for ${node.tagName} is "${result}"`);
  return result;
}

function scrapeFallbackName(userNode) {
  const span = userNode.querySelector(':scope > span[itemprop="name"]');
  let name = span ? span.textContent.trim() : '';

  // fallback to text content if still no name
  if (!name) {
    for (const node of userNode.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        name = node.textContent.trim();
        if (name) break;
      }
    }
  }

  return { name, userId: -1, username: '' };
}

function scrapeUserInfo(userNode) {
  const name = userNode?.textContent.trim() ?? '';
  const href = userNode?.getAttribute('href');
  const match = href?.match(/\/users\/(\d+)/);
  const userId = match ? parseInt(match[1], 10) : -1;
  const username = (href?.split('/').pop() ?? '').split('?')[0];

  return { name, userId, username };
}

function scrapePostContributor(signatureNode) {
  const timestamp = signatureNode.querySelector('.relativetime')?.getAttribute('title')?.split(',')[0].trim() ?? '';
  const isOwner = signatureNode.classList.contains('owner'); // OP of the entire post
  const contributorType = signatureNode.querySelector('.user-details')?.getAttribute('itemprop') === 'author' ? 'author' : 'editor';
  const userNode = signatureNode.querySelector('.user-details a');
  const userInfo = userNode
    ? scrapeUserInfo(userNode)
    : scrapeFallbackName(signatureNode.querySelector('.user-details'));

  return { contributorType, isOwner, timestamp, ...userInfo };
}

function scrapeCommentContributor(commentItem) {
  const timestamp = commentItem.querySelector('.relativetime-clean')?.getAttribute('title')?.split(',')[0].trim() ?? '';
  const userNode = commentItem.querySelector('a.comment-user');
  const { name, userId, username } = scrapeUserInfo(userNode);

  return { contributorType: 'commenter', isOwner: false, timestamp, name, userId, username };
}

function scrapePostVote(postLayout) {
  const voteNode = postLayout.querySelector('div.votecell div[itemprop="upvoteCount"]');
  const vote = voteNode?.dataset?.value ?? voteNode?.textContent ?? '';
  const n = parseInt(vote.trim(), 10);

  return Number.isFinite(n) ? n : 0;
}

function scrapeCommentVote(commentItem) {
  const scoreNode = commentItem.querySelector('div.comment-score span');
  const vote = scoreNode?.textContent ?? '';
  const n = parseInt(vote.trim(), 10);

  return Number.isFinite(n) ? n : 0;
}

function scrapePosts(root) {
  const postLayouts = root.querySelectorAll('.post-layout');
  const posts = [];

  postLayouts.forEach(postLayout => {
    // Extract post body
    const postBodyNode = postLayout.querySelector('.s-prose');
    const bodyHtml = postBodyNode ? toHtml(postBodyNode) : null;
    const bodyMd = postBodyNode ? toMd(postBodyNode) : '';

    // Extract contributors
    const signatureNodes = postLayout.querySelectorAll('.post-signature');
    const contributors = Array.from(signatureNodes).map(sig =>
      scrapePostContributor(sig)
    );

    const vote = scrapePostVote(postLayout);

    // Extract comments
    const commentNodes = postLayout.querySelectorAll('ul.comments-list li');
    const comments = Array.from(commentNodes).map(li => {
      const bodySpan = li.querySelector('div.comment-body > span.comment-copy');
      const bodyHtml = toHtml(bodySpan);
      const bodyMd = toMd(bodySpan);
      const contributors = [scrapeCommentContributor(li)];
      const vote = scrapeCommentVote(li);
      return { bodyHtml, bodyMd, contributors, vote };
    });

    // Assemble post object
    posts.push({ bodyHtml, bodyMd, contributors, comments, vote });
  });

  return posts;
}

function scrapeQuestionLink(root) {
  const qLink = root.querySelector('#question-header a.question-hyperlink');
  return toHtml(qLink);
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
      Stack Exchange - Scraped Q&A
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

function displayContributorsAndVotes(contributors, voteCount) {
  if (!contributors || contributors.length === 0) return '';

  // Sort once, newest first
  const contribsSorted = contributors.slice().sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  const selected = [];

  // Find most recent owner (if any), and treat as author
  const owner = contribsSorted.find(c => c.isOwner);
  if (owner) {
    selected.push(owner);
  }

  // If no owner, find most recent author
  if (!owner) {
    const author = contribsSorted.find(c => c.contributorType === 'author' && !c.isOwner);
    if (author) {
      selected.push(author);
    }
  }

  // Find most recent editor (if any), regardless of owner/author
  const editor = contribsSorted.find(c => c.contributorType === 'editor' && !c.isOwner);
  if (editor) {
    selected.push(editor);
  }

  // If any commenter present, override with just most recent commenter
  const commenter = contribsSorted.find(c => c.contributorType === 'commenter');
  if (commenter) {
    selected.length = 0; // Shouldn't be necessary, but just in case
    selected.push(commenter);
  }

  const s = selected.map((c, idx) => {
    const rawName = c.name || '';
    const fallbackName = idx === 1 && !rawName && selected[0]?.name
      ? selected[0].name
      : rawName;
    const name = fallbackName.replace(/\s+/g, '-');
    const date = (c.timestamp?.split?.(' ')[0]) ?? 'unknown-date';
    return { name, date };
  });

  let contributorsText = '';
  if (s.length === 1) {
    contributorsText = `${s[0].name} on ${s[0].date}`;
  } else if (s.length === 2) {
    if (s[0].name === s[1].name) {
      contributorsText = `${s[0].name} on ${s[0].date}; edited on ${s[1].date}`;
    } else {
      contributorsText = `${s[0].name} on ${s[0].date}; edited by ${s[1].name} on ${s[1].date}`;
    }
  } else {
    contributorsText = '';
  }

  const voteText = `${voteCount >= 0 ? '+' : ''}${voteCount}`;

  return `[[ ${contributorsText} | ${voteText} ]]`;
}

function buildPosts(data, doc) {
  const div = h('div');
  data.posts.forEach(function(post, idx) {
    div.appendChild(h('br'));
    div.appendChild(h('br'));
    const postNode = h('div', { style: 'margin-bottom: 0px;' });
    div.appendChild(postNode);

    const h2 = h('h2',
      { style: 'margin: 0; line-height: 1, align-content: center' },
      idx === 0 ? 'Question' : `Answer ${idx}`
    );
    const copyButton = buildCopyButton(data, doc, idx);
    const postHeader = h('div', { style: 'display: flex; margin-top: 0px' }, h2, copyButton);
    postNode.appendChild(postHeader);

    const contentNodeMd = h('div', {
      class: 'md-view',
      style: 'white-space: pre-wrap; line-height: 1.1; margin-top: 0.6em;',
    });
    contentNodeMd.textContent = post.bodyMd;
    postNode.appendChild(contentNodeMd);

    const contentNodeHtml = h('div', { class: 'html-view' });
    if (post.bodyHtml) contentNodeHtml.appendChild(post.bodyHtml);
    postNode.appendChild(contentNodeHtml);

    const postContribs = displayContributorsAndVotes(post.contributors, post.vote);
    const postContribsMd = h('div', { style: 'margin-top: 1.4em;' }, `${postContribs}`);
    contentNodeMd.appendChild(postContribsMd);
    const postContribsHtml = h('div', {}, `${postContribs}`);
    contentNodeHtml.appendChild(postContribsHtml);

    if (post.comments.length > 0) {
      const commentsNode = h('div');
      postNode.appendChild(commentsNode);

      post.comments.forEach(function(comment, commentIdx) {
        const h3 = h('h3', {}, `Comment ${commentIdx + 1}`);
        commentsNode.appendChild(h3);

        const commentContentNodeMd = h('div', {
          class: 'md-view',
          style: 'white-space: pre-wrap; line-height: 1.1;',
        });
        commentContentNodeMd.textContent = comment.bodyMd;
        commentsNode.appendChild(commentContentNodeMd);

        const commentContentNodeHtml = h('div', { class: 'html-view' });
        if (comment.bodyHtml) commentContentNodeHtml.appendChild(comment.bodyHtml);
        commentsNode.appendChild(commentContentNodeHtml);

        const commentContrib = displayContributorsAndVotes(comment.contributors, comment.vote);
        const commentContribMd = h('span', {}, ` ${commentContrib}`);
        commentContentNodeMd.appendChild(commentContribMd);
        const commentContribHtml = h('span', {}, ` ${commentContrib}`);
        commentContentNodeHtml.appendChild(commentContribHtml);
      });
    }
  });

  return div;
}

function buildMultiToggleSwitch({ initState = 0, onToggle, labels = ['a', 'b'], labelSide = 'right' } = {}) {
  if (!Array.isArray(labels) || labels.length === 0) {
    throw new Error('multi-toggle requires at least one label');
  }
  const checkbox = h('input', { type: 'checkbox', class: 'multi-toggle-checkbox', 'aria-label': 'Toggle view mode' });
  const slider = h('span', { class: 'multi-toggle-slider' });
  const switchBody = h('label', { class: 'multi-toggle-switchbody' }, checkbox, slider);
  const stateLabel = h('span', { class: `multi-toggle-label-${labelSide}` }, labels[initState]);
  const wrapper = labelSide === 'left'
    ? h('div', { class: 'multi-toggle' }, stateLabel, switchBody)
    : h('div', { class: 'multi-toggle' }, switchBody, stateLabel);

  const setState = (newState) => {
    state = newState;
    const knobProgress = labels.length === 1 ? 0 : newState / (labels.length - 1);
    wrapper.style.setProperty('--knob-progress', `${knobProgress}`);
    stateLabel.textContent = labels[newState];
    onToggle?.(newState);
  };

  let state = initState;
  setState(state);

  checkbox.addEventListener('change', () => {
    setState((state + 1) % labels.length);
  });

  return wrapper;
}

function runBookmarklet(root = document) {
  const scrapedPosts = scrapePosts(root);
  if (scrapedPosts.length === 0) {
    alert('No posts found on this page.');
    return;
  }
  const questionLink = scrapeQuestionLink(root);
  const data = {
    questionLink,
    posts: scrapedPosts,
  };

  const doc = window.open('', '_blank', '').document;
  doc.title = 'Bookmarklet';
  const style = doc.createElement('style');
  style.textContent = STYLE_MAIN;
  doc.head.appendChild(style);

  const header = h('div', {
    style: 'display: flex;',
  });

  const title = h('h1', { style: 'margin: 0; line-height: 1' }, 'Stack Exchange - Scraped Q&A');
  const copyButton = buildCopyButton(data, doc);

  header.appendChild(title);
  header.appendChild(copyButton);
  doc.body.appendChild(header);

  if (data.questionLink) {
    const qLinkContainer = h('div', { style: 'margin: 0.7em 0;' }, data.questionLink);
    doc.body.appendChild(qLinkContainer);
  }

  const toggle = buildMultiToggleSwitch({
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
    labels: ['View', 'View', 'View'],
    labelSide: 'left',
  });
  doc.body.appendChild(toggle);

  const posts = buildPosts(data, doc);
  doc.body.appendChild(posts);
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
// if (typeof module !== 'undefined' && module.exports) { }
export { toHtml, toMd, scrapePostContributor, runBookmarklet };
/* @debug-end */