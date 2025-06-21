/**
 * DOM Reference
 * 
 * div#question-header
 *   a.question-hyperlink                → Question title
 * 
 * div#question
 *   div.post-layout
 *     div.s-prose                        → Question body
 *     div.post-signature.owner           → Contributor (Question Author)
 *       div.user-info
 *         span.relativetime[title]       → Timestamp
 *         div.user-details[itemprop="author"]? > a
 *     div.post-signature                 → Contributor (Editor, optional)
 *       div.user-info
 *         span.relativetime[title]       → Timestamp
 *         div.user-details[itemprop="author"]? > a
 *     ul.comments-list
 *       li#comment-XXXX
 *         div.comment-body
 *           span.comment-copy            → Comment text
 *           a.comment-user               → Contributor (Comment Author)
 *           span.comment-date > span.relativetime-clean[title] → Timestamp
 * 
 * div#answers
 *   div.answer#answer-XXXX
 *     div.post-layout
 *       div.s-prose                      → Answer body
 *       div.post-signature               → Contributor (Answer Author)
 *         div.user-info
 *           span.relativetime[title]     → Timestamp
 *           div.user-details[itemprop="author"] > a
 *       div.post-signature               → Contributor (Editor, optional)
 *         div.user-info
 *           span.relativetime[title]     → Timestamp
 *           div.user-details > a
 *       ul.comments-list
 *         li#comment-XXXX
 *           div.comment-body
 *             span.comment-copy          → Comment text
 *             a.comment-user             → Contributor (Comment Author)
 *             span.comment-date > span.relativetime-clean[title] → Timestamp
 */

/** */

const blockTags = new Set([
    'P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
    'UL', 'OL', 'LI', 'BLOCKQUOTE', 'PRE', 'TABLE', 'HR', 'BR'
]);
const inlineTags = new Set(['SPAN', 'NOBR', 'A', 'B', 'I', 'STRONG', 'EM', 'CODE']);
const flattenTags = new Set(['P', 'DIV', 'SPAN', 'NOBR']);

function toHtml(node) {
    if (!node) return '';

    if (node.nodeType === Node.TEXT_NODE) {
        const str = node.textContent;
        if (str === ' ' && node.nextSibling != null && node.previousSibling != null) return ' '; // Preserve single spaces
        if (/^\s*$/.test(str)) return ''; // all whitespace

        let prefix = node.previousSibling === null ? '' : ' '
        let trimmed = str.trimStart();
        prefix = (trimmed.length == str.length) ? '' : prefix;

        str = trimmed;
        let suffix = node.nextSibling === null ? '' : ' ';
        trimmed = str.trimEnd();
        suffix = (trimmed.length == str.length) ? '' : suffix;

        //console.log(`[TEXT] "${node.textContent}"`);
        //console.log(`→ [TRIMMED] "${prefix + trimmed + suffix}"`);

        return prefix + trimmed + suffix;
    }

    if (node.tagName === 'SCRIPT') return node.textContent;
    //if (node.tagName === 'NOBR') return '';
    if (node.className && /MJX|MathJax/.test(node.className)) return '';
    if (node.id && /MathJax/.test(node.id)) return '';

    if (flattenTags.has(node.tagName)) {
        return [...node.childNodes].map(toHtml).join('');
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
        const tagName = node.tagName.toLowerCase();
        const attributes = node.hasAttributes()
            ? ' ' + [...node.attributes].map(attr => `${attr.name}="${attr.value}"`).join(' ')
            : '';
        const children = [...node.childNodes].map(toHtml).join('');
        return `<${tagName}${attributes}>${children}</${tagName}>`;
    }

    return '';
}

function shouldIgnore(node) {
    if (!node) throw new Error('shouldIgnore called with null or undefined node');
    if (node.nodeType === Node.TEXT_NODE) return false; // Text nodes are never ignored

    if (node.nodeType === Node.ELEMENT_NODE) {
        if (/MathJax/.test(node.id || '') && node.tagName !== 'SPAN') {
            return true; // Ignore MathJax elements except SPAN
        }
        if (node.className && /MJX|MathJax/.test(node.className)) {
            return true; // Ignore MathJax elements by class
        }
        return false;
    }

    return true;
}

// normal - collapse vertical+horizontal ws
// pre - preserve all ws, no collapsing
// pre-line - collapse horizontal ws, preserve vertical ws

function toMd(node, wsMode = 'normal', listDepth = 0, quoteDepth = 0, lastChar = '', isRoot = true) {
    if (!node || shouldIgnore(node) || node.nodeType !== Node.ELEMENT_NODE) return '';

    function glueChildren(n, glueMode, ws = wsMode, ld = listDepth, qd = quoteDepth, lc = lastChar) {
        const prevLc = lc;
        const result = [];
        console.log(`toMd.glue: processing node ${n.tagName} with ws=${ws}, ld=${ld}, qd=${qd}, lc="${lc}", glueMode=${glueMode}`);

        const children = n.childNodes;
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            console.log(`toMd.glue: processing child ${child.nodeName} with ws=${ws}, ld=${ld}, qd=${qd}, lc="${lc}"`);
            let md = '';
            if (child.nodeType === Node.TEXT_NODE) {
                md = child.textContent;
                //console.log(`toMd.glue.child.md.pre-ws: "${md}"`);
                if (/^\s*$/.test(md)) continue; // all whitespace

                switch (ws) {
                case 'normal': md = md.replace(/\s+/g, ' '); break;
                case 'pre': md = md; break;
                case 'pre-line': md = md.replace(/[ \t]+/g, ' '); break;
                default: throw new Error(`Unsupported whitespace mode: ${ws}`);
                }
                //console.log(`tomd.glue.text.md.post-ws: "${md}"`);
            }
            else if (child.nodeType === Node.ELEMENT_NODE) {
                md = toMd(child, ws, ld, qd, lc, false);
            }

            const isCurBlock = md.startsWith('\n');
            const prevChild = result.length > 0 ? result[result.length - 1] : '';
            const isPrevBlock = prevChild.endsWith('\n');
            const hasLeadingSemanticIndentation = glueMode === 'li' || glueMode === 'list'

            const shouldTrimCurStart =
                !hasLeadingSemanticIndentation
                && (isPrevBlock || (!isCurBlock && /\s/.test(lc)));
            const shouldTrimPrevEnd = !shouldTrimCurStart && isCurBlock && result.length > 0;

            console.log(`toMd.glue.logic: parentNode=${n.tagName} isCurBlock=${isCurBlock}, isPrevBlock=${isPrevBlock}, shouldTrimCurStart=${shouldTrimCurStart}, shouldTrimPrevEnd=${shouldTrimPrevEnd}, hasLeadingSemanticIndentation=${hasLeadingSemanticIndentation}`);
            
            if (shouldTrimCurStart) {
                md = md.trimStart();
            }
            if (shouldTrimPrevEnd) {
                //console.log(`toMd.glue is trimming prev!`);
                //console.log(`toMd.glue.prev-before: "${result[result.length - 1]}"`);
                result[result.length - 1] = result[result.length - 1].trimEnd();
                //console.log(`toMd.glue.prev-after: "${result[result.length - 1]}"`);
            }

            console.log(`toMd.glue.push.md: "${md}"`);
            result.push(md);
            lc = md.length > 0 ? md[md.length - 1] : lc;
        }

        let glued = result.join('');
        console.log(`toMd.glue: glued result before processing: "${glued}"`);
        
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

        //console.log(`toMd.glue: final glued result: "${glued}"`);
        return glued;
    }

    let result = '';
    console.log(`toMd.elemNode: ${node.tagName}`);
    switch (node.tagName) {
    case 'DIV':
        result = glueChildren(node, 'flat', 'normal');
        break;

    case 'P':
        result = glueChildren(node, 'block', 'normal');
        break;

    case 'SPAN':
    case 'NOBR':
        result = glueChildren(node, 'inline', 'normal');
        result = lastChar === ' ' ? result.trimStart() : result;
        break;

    case 'EM':
    case 'I':
        result = `*${glueChildren(node, 'inline', 'normal')}*`;
        break;

    case 'B':
    case 'STRONG':
        result = `**${glueChildren(node, 'inline', 'normal')}**`;
        break;

    case 'SCRIPT':
        result = node.textContent;
        break;

    case 'BR':
        result = '  \n';
        break;

    case 'A':
        const href = node.getAttribute('href');
        const inn = glueChildren(node, 'inline', 'normal');
        result = href ? `[${inn}](${href})` : inn;
        break;

    case 'H1':
    case 'H2':
    case 'H3':
    case 'H4':
    case 'H5':
    case 'H6':
        const level = +node.tagName[1];
        const hashes = '#'.repeat(level);
        result = `\n\n${hashes} ${glueChildren(node, 'inline', 'normal')} ${hashes}\n\n`;
        break;

    case 'HR':
        result = '\n\n---\n\n';
        break;
    
    case 'UL':
    case 'OL':
        result = glueChildren(node, 'list', 'normal', listDepth + 1);
        break;

    case 'LI':
        const listType = node.parentNode.tagName;
        if (listType !== 'UL' && listType !== 'OL') throw new Error('LI must be child of UL or OL');

        let index = 0;
        let sibling = node;
        while ((sibling = sibling.previousSibling)) {
            if (sibling.nodeType === Node.ELEMENT_NODE && sibling.tagName === 'LI') {
                index++;
            }
        }

        

        console.log(`toMd: LI index=${index}, listType=${listType}, listDepth=${listDepth}`);
        const bullet = listType === 'OL' ? `${index + 1}.` : '-';
        //const indent = '    '.repeat(Math.max(0, listDepth - 1));
        result = glueChildren(node, 'li', 'normal'); //.trimStart();

        console.log(`toMd.LI node=${node.tagName}, index=${index}, listType=${listType}, listDepth=${listDepth}`);
        console.log(`toMd.LI.result-before: "${result}"`);


        result = result.startsWith('\n\n') ? result.slice(2) : result; // <li><p>
        result = result.endsWith('\n') ? result : result + '\n'; // <li><p>
        //result = result.trimEnd() + '\n';

        const indent = listDepth > 1 ? '    ' : '  '; // 2 spaces for top-level lists, 4 for nested

        const liPrefix = result.match(/^\n*/)[0];
        const liSuffix = result.match(/\n*$/)[0];
        result = result.slice(liPrefix.length, result.length - liSuffix.length);
        result = result.split('\n').join('\n' + indent + '  ');
        result = liPrefix + result + liSuffix;


        result = `${indent}${bullet} ${result}`;
        break;

    case 'PRE':
        const langClass = Array.from(node.classList).find(cls => cls.startsWith('lang-'));
        const lang = langClass ? langClass.slice(5) : '';
        result = glueChildren(node, 'flat', 'pre');
        result = result.endsWith('\n\n') ? result.slice(0, -1) : result;
        result = result.endsWith('\n') ? result : result + '\n';
        result = '```' + lang + '\n' + result + '```\n\n';
        break;

    case 'CODE':
        const fence = node.parentNode.tagName === 'PRE'? '' : node.textContent.includes('`') ? '``' : '`';
        result = `${fence}${node.textContent}${fence}`;
        break;

    case 'BLOCKQUOTE':
        result = glueChildren(node, 'block', 'normal', listDepth, quoteDepth + 1);
        console.log(`toMd: blockquote content before formatting: "${result}"`);
        console.log(`toMd.blockquote: quoteDepth=${quoteDepth}`);
        const bqPrefix = result.match(/^\n*/)[0];
        const bqSuffix = result.match(/\n*$/)[0];
        result = result.slice(bqPrefix.length, result.length - bqSuffix.length);
        //const bqIndenter = '> '.repeat(quoteDepth + 1);
        result = result.split('\n').map(line => '> ' + line).join('\n');
        result = bqPrefix + result + bqSuffix;
        break;

    default:
        result = '';
        break;
    }

    console.log(`toMd: result for ${node.tagName} is "${result}"`);
    return result;
}

function scrapeContributorInfo(baseNode, timestampSelector, userSelector) {
    const timestamp = (baseNode.querySelector(timestampSelector)?.getAttribute('title') ?? '').split(',')[0].trim();
    const userNode = baseNode.querySelector(userSelector);
    const name = userNode?.textContent.trim() ?? '';
    const href = userNode?.getAttribute('href');
    const userId = href?.match(/\/users\/(\d+)/)?.[1] ?? '-1';
    const username = (href?.split('/').pop() ?? '').split('?')[0];
    const isOwner = baseNode.classList.contains('owner'); // OP of the entire post
    const userDetailsNode = baseNode.querySelector('.user-details');
    const contributorType = userDetailsNode?.getAttribute('itemprop') === 'author'? 'author' : 'editor';

    return {
        contributorType,
        isOwner,
        timestamp,
        name,
        userId,
        username
    };
}

function scrapePosts(root) {
    const postLayouts = root.querySelectorAll('.post-layout');
    const posts = [];

    postLayouts.forEach(postLayout => {
        // Extract post body
        const postBodyNode = postLayout.querySelector('.s-prose');
        const body = postBodyNode ? toHtml(postBodyNode) : '';

        // Extract contributors
        const signatureNodes = postLayout.querySelectorAll('.post-signature');
        const contributors = Array.from(signatureNodes).map(sig =>
            scrapeContributorInfo(sig, '.relativetime', '.user-details a')
        );

        // Extract comments
        const commentNodes = postLayout.querySelectorAll('ul.comments-list li div.comment-body');
        const comments = Array.from(commentNodes).map(div => {
            const bodySpan = div.querySelector('span.comment-copy');
            const body = toHtml(bodySpan);
            const userInfo = scrapeContributorInfo(div, '.relativetime-clean', 'a.comment-user');
            userInfo.contributorType = 'commenter';
            return {
                body,
                contributors: [userInfo]
            };
        });

        // Assemble post object
        posts.push({
            body,
            contributors,
            comments
        });
    });

    return posts;
}

function scrapeQuestionTitle(root) {
    const qtitle = root.querySelector('#question-header a.question-hyperlink');
    return toHtml(qtitle);
}

function h(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
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

function buildCopyButton(data, doc) {
    // hidden helper to hold the text to be copied
    const textArea = h('textarea');
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.opacity = '0';
    textArea.style.pointerEvents = 'none';

    // button
    const button = h('button', {
        style: 'margin-top: 10px; padding: 10px 20px; font-size: 16px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;'
    }, 'Copy to Clipboard');

    button.addEventListener("click", function() {
        let txt = `===== Stack Exchange - Scraped Q&A =====\n`;
        txt += `URL: ${window.location.href}\n`;

        if (data.questionTitle) {
            txt += `Title: ${data.questionTitle}\n`;
        }

        data.posts.forEach(function(post, idx) {
            const postHeader = idx === 0 ? 'Question' : `Answer ${idx}`;
            txt += `\n\n==== ${postHeader} ====\n${post.body}`;
            const contributors = stringifyContributors(post.contributors);
            if (contributors) {
                txt += ` ${contributors}`;
            }
            txt += `\n`;

            if (post.comments.length > 0) {
                post.comments.forEach(function(comment, commentIdx) {
                    txt += `\nComment ${commentIdx + 1}:\n${comment.body}`;
                    const contributors = stringifyContributors(comment.contributors);
                    if (contributors) {
                        txt += ` ${contributors}`;
                    }
                    txt += `\n`;
                });
            }

            txt += `\n`;
        });

        textArea.value = txt;
        textArea.select();

        try {
            const successful = doc.execCommand('copy');
            if (successful) {
                button.disabled = true;
                button.style.backgroundColor = "#28a745";
                button.textContent = "Copied!";
                setTimeout(() => {
                    // Reset button to original state
                    button.disabled = false;
                    button.style.backgroundColor = "#007bff";
                    button.textContent = "Copy to Clipboard";
                }, 1000);
            } else {
                alert("Failed to copy content.");
            }
        } catch (err) {
            console.error("Copy error:", err);
        }
    });

    return h('div', {}, button, textArea);
}

function stringifyContributors(contributors) {
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

    // Format output string
    const parts = selected.map(c => {
        const safeName = c.name.replace(/\s+/g, '-');
        const dateStr = (c.timestamp?.split?.(' ')[0]) ?? 'unknown-date';
        return `${safeName} on ${dateStr}`;
    });

    if (parts.length === 1) {
        return `[[ ${parts[0]} ]]`;
    } else if (parts.length === 2) {
        return `[[ ${parts[0]}; edited by ${parts[1]} ]]`;
    } else {
        return '';
    }
}

function buildPosts(data) {
    const div = h('div');
    data.posts.forEach(function(post, idx) {
        const postNode = h('div', { style: 'margin-bottom: 20px;' });
        div.appendChild(postNode);

        const postHeader = idx === 0 ? 'Question' : `Answer ${idx}`;
        const h2 = h('h2', {}, postHeader);
        postNode.appendChild(h2);

        const contentNode = h('div', {});
        contentNode.innerHTML = post.body;
        postNode.appendChild(contentNode);

        const contributors = stringifyContributors(post.contributors);
        const contributorsSpan = h('span', {}, ` ${contributors}`);
        contentNode.appendChild(contributorsSpan);

        if (post.comments.length > 0) {
            const commentsNode = h('div');
            postNode.appendChild(commentsNode);

            post.comments.forEach(function(comment, commentIdx) {
                const h3 = h('h3', {}, `Comment ${commentIdx + 1}`);
                commentsNode.appendChild(h3);

                const commentContentNode = h('div', {});
                commentContentNode.innerHTML = comment.body;
                commentsNode.appendChild(commentContentNode);

                const contributors = stringifyContributors(comment.contributors);
                const contributorsSpan = h('span', {}, ` ${contributors}`);
                commentContentNode.appendChild(contributorsSpan);
            });
        }
    });

    return div;
}

function runBookmarklet(root = document) {
    const scrapedPosts = scrapePosts(root);
    const questionTitle = scrapeQuestionTitle(root);
    const data = {
        questionTitle: questionTitle,
        posts: scrapedPosts,
    }

    const doc = window.open("", "_blank", "").document;
    doc.title = "Bookmarklet";
    const style = doc.createElement("style");
    style.textContent = `
        body {
            background: white;
            color: black;
            font-family: Georgia, Cambria, "Times New Roman", Times, serif;
            padding: 20px;
        }
        div {
            margin-top: 5px;
            white-space: pre-line;
        }
        h1, h2, h3 { margin-bottom: 0px; }
    `;
    doc.head.appendChild(style);

    doc.body.appendChild(h("h1", {}, 'Stack Exchange - Scraped Q&A'));
    if (data.questionTitle) {
        const questionP = h("p", { style: 'margin: 5px 0;' });
        questionP.innerHTML = `${data.questionTitle}`;
        doc.body.appendChild(questionP);
    }
    const copyButton = buildCopyButton(data, doc);
    doc.body.appendChild(copyButton);

    const posts = buildPosts(data);
    doc.body.appendChild(posts);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { toHtml, toMd };
}

/*
function isLastSibling(node) {
    let current = node.nextSibling;
    while (current) {
        if (current.nodeType === Node.TEXT_NODE && /\S/.test(current.textContent)) return false;
        if (current.nodeType === Node.ELEMENT_NODE && blockTags.has(current.tagName)) return false;
        current = current.nextSibling;
    }
    return true;
}

function isFirstSibling(node) {
    let sibling = node.previousSibling;
    while (sibling) {
        if (sibling.nodeType === Node.TEXT_NODE && /\S/.test(sibling.textContent)) return false;
        if (sibling.nodeType === Node.ELEMENT_NODE && blockTags.has(sibling.tagName)) return false;
        sibling = sibling.previousSibling;
    }
    return true;
}

function isRenderable(node) {
    if (!node) throw new Error('isRenderable called with null or undefined node');

    if (node.nodeType === Node.TEXT_NODE) return /\S/.test(node.textContent);
    if (shouldIgnore(node)) return false;
    if (node.nodeType !== Node.ELEMENT_NODE) return false;

    for (const child of node.childNodes) {
        if (isRenderable(child)) return true;
    }

    return false;
}

function isFirstRenderable(node, mode = 'strict') {
    if (!node) throw new Error('isFirstRenderable called with null or undefined node');
    let current = node;
    //console.log(`isFirstRenderable: checking node ${current.nodeName}`);
    if (current.nodeType === Node.TEXT_NODE && /^\s*$/.test(current.textContent)) return false;
    while (current = current.previousSibling) {
        //console.log(`isFirstRenderable: checking sibling ${current.nodeName}`);
        if (current.nodeType === Node.TEXT_NODE && /\S/.test(current.textContent)) return false;
        //console.log(`isFirstRenderable: checking tagname ${current.tagName}`);
        if (isRenderable(current)) return mode === 'block' && blockTags.has(current.tagName);
    }
    current = node;
    while (current = current.parentNode) {
        //console.log(`isFirstRenderable: checking parent ${current.nodeName}`);
        if (current.nodeType === Node.ELEMENT_NODE && current.tagName === 'BODY') return true;
        if (current.nodeType === Node.ELEMENT_NODE) {
            return isFirstRenderable(current, mode);
        }
    }
    throw new Error('isFirstInFlow: ??');
}

function isLastRenderable(node, mode = 'strict') {
    if (!node) throw new Error('isLastRenderable called with null or undefined node');
    let current = node;

    if (current.nodeType === Node.TEXT_NODE && /^\s*$/.test(current.textContent)) return false;

    while (current = current.nextSibling) {
        if (current.nodeType === Node.TEXT_NODE && /\S/.test(current.textContent)) return false;
        if (isRenderable(current)) return mode === 'block' && blockTags.has(current.tagName);
    }

    current = node;
    while (current = current.parentNode) {
        if (current.nodeType === Node.ELEMENT_NODE && current.tagName === 'BODY') return true;
        if (current.nodeType === Node.ELEMENT_NODE) {
            return isLastRenderable(current, mode);
        }
    }

    throw new Error('isLastRenderable: ??');
}

function hasDirectContent(node) {
    if (!node) throw new Error('hasDirectContent called with null or undefined node');
    if (shouldIgnore(node)) return false;

    if (node.nodeType === Node.ELEMENT_NODE) {
        for (const child of node.childNodes) {
            if (child.nodeType === Node.TEXT_NODE && /\S/.test(child.textContent)) return true;
            if (inlineTags.has(child.tagName) && isRenderable(child)) return true;
        }
    }
    return false;
}
*/