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
    const contributorType = userNode?.getAttribute('itemprop') === 'author'? 'author' : 'editor';

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
                ...userInfo
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
    const qtitle = root.querySelector('#question-header a.question-hyperlink')?.textContent.trim() ?? '';
    return qtitle;
}

function runBookmarklet(rootNode = document) {
    const scrapedPosts = scrapePosts(rootNode);
    const questionTitle = scrapeQuestionTitle(rootNode);
    const data = {
        questionTitle: questionTitle,
        question: scrapedPosts[0],
        answers: scrapedPosts.slice(1)
    }

    var w = window.open("", "_blank", "");
    var doc = w.document;
    doc.title = "Stack Exchange - Scraped Q&A";
    var style = doc.createElement("style");
    style.textContent = `
        body { background: white; color: black; font-family: sans-serif; padding: 20px; }
        pre { white-space: pre-wrap; margin-top: 5px; }
        h1, h2, h3 { margin-bottom: 0px; }
        button { margin-top: 10px; padding: 5px 10px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; }
    `;
    doc.head.appendChild(style);

    var h1 = doc.createElement("h1");
    h1.textContent = "Stack Exchange - Scraped Q&A";
    doc.body.appendChild(h1);

    var urlNode = doc.createElement("p");
    urlNode.textContent = `URL: ${window.location.href}`;
    doc.body.appendChild(urlNode);

    var copyButton = doc.createElement("button");
    copyButton.textContent = "Copy to Clipboard";

    copyButton.addEventListener("click", function() {
        var textToCopy = `===== Stack Exchange - Scraped Q&A =====\n`;
        textToCopy += `URL: ${window.location.href}`;
        textToCopy += `\n\n==== Question ====\n${data.question.body}\n`;

        if (data.question.comments.length > 0) {
            data.question.comments.forEach(function(comment, commentIdx) {
                textToCopy += `\nComment ${commentIdx + 1}: ${comment.body}\n`;
            });
        }

        data.answers.forEach(function(answer, idx) {
            textToCopy += `\n\n=== Answer ${idx + 1} ===\n${answer.body}\n`;

            if (answer.comments.length > 0) {
                answer.comments.forEach(function(comment, commentIdx) {
                    textToCopy += `\nComment ${commentIdx + 1}: ${comment.body}\n`;
                });
            }

            textToCopy += `\n`;
        });

        var textAreaNode = doc.getElementById('clipboardHelper');
        textAreaNode.value = textToCopy;
        textAreaNode.select();

        try {
            var successful = doc.execCommand('copy');
            if (successful) {
                copyButton.disabled = true;
                copyButton.style.backgroundColor = "#28a745";
                copyButton.textContent = "Copied!";
                setTimeout(() => {
                    // Reset button to original state
                    copyButton.disabled = false;
                    copyButton.style.backgroundColor = "#007bff";
                    copyButton.textContent = "Copy to Clipboard";
                }, 1500);
            } else {
                alert("Failed to copy content.");
            }
        } catch (err) {
            // Optionally log the error
        }
    });

    doc.body.appendChild(copyButton);

    // Render question
    var questionNode = doc.createElement("div");
    questionNode.style.marginBottom = "20px";
    doc.body.appendChild(questionNode);

    var h1 = doc.createElement("h1");
    h1.textContent = "Question";
    questionNode.appendChild(h1);

    var questionContentNode = doc.createElement("pre");
    questionContentNode.innerHTML = data.question.body;
    questionNode.appendChild(questionContentNode);

    if (data.question.comments.length > 0) {
        var questionCommentsNode = doc.createElement("div");
        questionNode.appendChild(questionCommentsNode);

        data.question.comments.forEach(function(comment, commentIdx) {
            var h3 = doc.createElement("h3");
            h3.textContent = `Comment ${commentIdx + 1}`;
            questionCommentsNode.appendChild(h3);

            var commentContentNode = doc.createElement("pre");
            commentContentNode.innerHTML = comment.body;
            questionCommentsNode.appendChild(commentContentNode);
        });
    }

    // Render answers
    data.answers.forEach(function(answer, answerIdx) {
        var answerNode = doc.createElement("div");
        answerNode.style.marginBottom = "20px";
        doc.body.appendChild(answerNode);

        var h2 = doc.createElement("h2");
        h2.textContent = "Answer " + (answerIdx + 1);
        answerNode.appendChild(h2);

        var answerContentNode = doc.createElement("pre");
        answerContentNode.innerHTML = answer.body;
        answerNode.appendChild(answerContentNode);

        if (answer.comments.length > 0) {
            var commentsNode = doc.createElement("div");
            answerNode.appendChild(commentsNode);

            answer.comments.forEach(function(comment, commentIdx) {
                var h3 = doc.createElement("h3");
                h3.textContent = `Comment ${commentIdx + 1}`;
                commentsNode.appendChild(h3);

                var commentContentNode = doc.createElement("pre");
                commentContentNode.innerHTML = comment.body;
                commentsNode.appendChild(commentContentNode);
            });
        }
    });

    var copyTextArea = doc.createElement("textarea");
    copyTextArea.id = 'clipboardHelper';
    copyTextArea.style.position = 'fixed';
    copyTextArea.style.top = '0';
    copyTextArea.style.left = '0';
    copyTextArea.style.opacity = '0';
    copyTextArea.style.pointerEvents = 'none';
    doc.body.appendChild(copyTextArea);
}