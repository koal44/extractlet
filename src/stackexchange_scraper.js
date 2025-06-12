function serializeNode(node) {
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

function scrapePage(rootNode) {
    // Page DOM Outline:
    //
    // div#question-header
    //   a.question-hyperlink → question title
    //
    // div#question
    //   div.s-prose.js-post-body → question body paragraphs
    //   div.post-signature.owner
    //     div.user-info
    //       span.relative-time[title] → question creation date
    //       div.user-details > a → question author username + href
    //   div.post-signature (optional, editor)
    //     div.user-info
    //       span.relative-time[title] → last edit date
    //       div.user-details > a → editor username + href
    //   ul.comments-list
    //     li#comment-XXXX
    //       span.comment-copy → comment text
    //       a.comment-user → comment username + href
    //       span.comment-date > span.relative-time-clean[title] → comment timestamp (parse up to first comma)
    //
    // div#answers
    //   div.answer#answer-XXXX
    //     div.s-prose.js-post-body → answer body paragraphs
    //     div.post-signature.owner
    //       div.user-info
    //         span.relative-time[title] → answer creation date
    //         div.user-details > a → answer author username + href
    //     div.post-signature (optional, editor)
    //       div.user-info
    //         span.relative-time[title] → last edit date
    //         div.user-details > a → editor username + href
    //     ul.comments-list
    //       li#comment-XXXX
    //         span.comment-copy → comment text
    //         a.comment-user → comment username + href
    //         span.comment-date > span.relative-time-clean[title] → comment timestamp (parse up to first comma)

    var allBodies = rootNode.querySelectorAll('.s-prose.js-post-body');
    var allComments = rootNode.querySelectorAll('ul.comments-list');

    var questionObj = { response: '', comments: [] };
    var answersData = [];

    // Process question (first element)
    if (allBodies.length > 0 && allComments.length > 0) {
        var questionBody = allBodies[0];
        var questionParts = [];

        var cleaned = serializeNode(questionBody);
        if (cleaned.length > 0) {
            questionParts.push(cleaned);
        }

        questionObj.response = questionParts.join('\n\n');

        var questionCommentSpans = allComments[0].querySelectorAll('li span.comment-copy');
        questionCommentSpans.forEach(function(span) {
            var cleaned = serializeNode(span);
            if (cleaned.length > 0) {
                questionObj.comments.push(cleaned);
            }
        });
    }

    // Process answers (remaining elements)
    for (var i = 1; i < allBodies.length; i++) {
        var answerObj = { response: '', comments: [] };
        var responseParts = [];
        var answerBody = allBodies[i];
        var cleaned = serializeNode(answerBody);
        if (cleaned.length > 0) {
            responseParts.push(cleaned);
        }

        answerObj.response = responseParts.join('\n\n');

        if (i < allComments.length) {
            var answerCommentSpans = allComments[i].querySelectorAll('li span.comment-copy');
            answerCommentSpans.forEach(function(span) {
                var cleaned = serializeNode(span);
                if (cleaned.length > 0) {
                    answerObj.comments.push(cleaned);
                }
            });
        }

        answersData.push(answerObj);
    }

    return {
        question: questionObj,
        answers: answersData
    }
}

function runBookmarklet(rootNode = document) {
    var data = scrapePage(rootNode);
    var answersData = data.answers;

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
        textToCopy += `\n\n==== Question ====\n${data.question.response}\n`;

        if (data.question.comments.length > 0) {
            data.question.comments.forEach(function(comment, commentIdx) {
                textToCopy += `\nComment ${commentIdx + 1}: ${comment}\n`;
            });
        }

        data.answers.forEach(function(answer, idx) {
            textToCopy += `\n\n=== Answer ${idx + 1} ===\n${answer.response}\n`;

            if (answer.comments.length > 0) {
                answer.comments.forEach(function(comment, commentIdx) {
                    textToCopy += `\nComment ${commentIdx + 1}: ${comment}\n`;
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
    questionContentNode.innerHTML = data.question.response;
    questionNode.appendChild(questionContentNode);

    if (data.question.comments.length > 0) {
        var questionCommentsNode = doc.createElement("div");
        questionNode.appendChild(questionCommentsNode);

        data.question.comments.forEach(function(comment, commentIdx) {
            var h3 = doc.createElement("h3");
            h3.textContent = `Comment ${commentIdx + 1}`;
            questionCommentsNode.appendChild(h3);

            var commentContentNode = doc.createElement("pre");
            commentContentNode.innerHTML = comment;
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
        answerContentNode.innerHTML = answer.response;
        answerNode.appendChild(answerContentNode);

        if (answer.comments.length > 0) {
            var commentsNode = doc.createElement("div");
            answerNode.appendChild(commentsNode);

            answer.comments.forEach(function(comment, commentIdx) {
                var h3 = doc.createElement("h3");
                h3.textContent = `Comment ${commentIdx + 1}`;
                commentsNode.appendChild(h3);

                var commentContentNode = doc.createElement("pre");
                commentContentNode.innerHTML = comment;
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