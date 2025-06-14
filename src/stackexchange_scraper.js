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

function serializeNode(node) {
    if (!node || !node.childNodes) return '';
    let result = '';

    node.childNodes.forEach(child => {
        if (child.nodeType === Node.TEXT_NODE || child.tagName === 'SCRIPT') {
            result += child.textContent;
            return;
        }

        if (child.tagName === 'NOBR') return;
        if (child.className && /MJX|MathJax/.test(child.className)) return;
        if (child.id && /MathJax/.test(child.id)) return;

        if (child.tagName === 'P') {
            result += serializeNode(child);
            return;
        }
        if (child.nodeType === Node.ELEMENT_NODE) {
            const tagName = child.tagName.toLowerCase();
            const attributes = child.hasAttributes()
                ? ' ' + [...child.attributes].map(attr => `${attr.name}="${attr.value}"`).join(' ')
                : '';
            result += `<${tagName}${attributes}>${serializeNode(child)}</${tagName}>`;
        }
    });

    return result.trim();
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
        const body = postBodyNode ? serializeNode(postBodyNode) : '';

        // Extract contributors
        const signatureNodes = postLayout.querySelectorAll('.post-signature');
        const contributors = Array.from(signatureNodes).map(sig =>
            scrapeContributorInfo(sig, '.relativetime', '.user-details a')
        );

        // Extract comments
        const commentNodes = postLayout.querySelectorAll('ul.comments-list li div.comment-body');
        const comments = Array.from(commentNodes).map(div => {
            const bodySpan = div.querySelector('span.comment-copy');
            const body = serializeNode(bodySpan);
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
    return serializeNode(qtitle);
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
    doc.title = "Stack Exchange - Scraped Q&A";
    const style = doc.createElement("style");
    style.textContent = `
        body {
            background: white;
            color: black;
            font-family: Georgia, Cambria, "Times New Roman", Times, serif;
            padding: 20px;
        }
        div {
            white-space: pre-line;
            margin-top: 5px;
        }
        h1, h2, h3 { margin-bottom: 0px; }
    `;
    doc.head.appendChild(style);

    doc.body.appendChild(h("h1", {}, `${doc.title}`));
    doc.body.appendChild(h("a", { href: window.location.href }, window.location.href));
    if (data.questionTitle) {
        const questionP = h("p", { style: 'margin: 5px 0;' });
        questionP.innerHTML = `Title: ${data.questionTitle}`;
        doc.body.appendChild(questionP);
    }
    const copyButton = buildCopyButton(data, doc);
    doc.body.appendChild(copyButton);

    const posts = buildPosts(data);
    doc.body.appendChild(posts);
}