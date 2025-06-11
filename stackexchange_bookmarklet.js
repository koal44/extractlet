// Stack Exchange Q&A Scraper (Bookmarklet version)
// Extracts question, answers, and comments from Stack Exchange pages
// Author: koal44
// License: MIT
// Usage: Save as bookmarklet, visit any StackExchange page and open the bookmark.

javascript:(function() {
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

    function cleanNodeList(nodeList) {
        var result = '';

        nodeList.forEach(function(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                result += node.textContent;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.tagName === 'SCRIPT') {
                    result += node.textContent;
                } else if (node.className && node.className.match(/MathJax/)) {
                    // Skip MathJax elements
                } else {
                    const tagName = node.tagName.toLowerCase();
                    result += `<${tagName}`;
                    if (node.hasAttributes()) {
                        Array.from(node.attributes).forEach(attr => {
                            result += ` ${attr.name}="${attr.value}"`;
                        });
                    }
                    result += `>`;
                    result += cleanNodeList(Array.from(node.childNodes));
                    result += `</${tagName}>`;
                }
            }
        });

        return result.trim();
    }

    var allBodies = document.querySelectorAll('.s-prose.js-post-body');
    var allComments = document.querySelectorAll('ul.comments-list');

    var questionObj = { response: '', comments: [] };
    var answersData = [];

    // Process question (first element)
    if (allBodies.length > 0 && allComments.length > 0) {
        var questionBody = allBodies[0];
        var questionParagraphs = questionBody.querySelectorAll('p');
        var questionParts = [];

        questionParagraphs.forEach(function(p) {
            var cleaned = cleanNodeList(p.childNodes);
            if (cleaned.length > 0) {
                questionParts.push(cleaned);
            }
        });

        questionObj.response = questionParts.join('\n\n');

        var questionCommentSpans = allComments[0].querySelectorAll('li span.comment-copy');
        questionCommentSpans.forEach(function(span) {
            var cleaned = cleanNodeList(span.childNodes);
            if (cleaned.length > 0) {
                questionObj.comments.push(cleaned);
            }
        });
    }

    // Process answers (remaining elements)
    for (var i = 1; i < allBodies.length; i++) {
        var answerObj = { response: '', comments: [] };

        var answerBody = allBodies[i];
        var answerParagraphs = answerBody.querySelectorAll('p');
        var responseParts = [];

        answerParagraphs.forEach(function(p) {
            var cleaned = cleanNodeList(p.childNodes);
            if (cleaned.length > 0) {
                responseParts.push(cleaned);
            }
        });

        answerObj.response = responseParts.join('\n\n');

        if (i < allComments.length) {
            var answerCommentSpans = allComments[i].querySelectorAll('li span.comment-copy');
            answerCommentSpans.forEach(function(span) {
                var cleaned = cleanNodeList(span.childNodes);
                if (cleaned.length > 0) {
                    answerObj.comments.push(cleaned);
                }
            });
        }

        answersData.push(answerObj);
    }

    // Open popup window
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

    // problematic because of content security policy. in firefox the popup didn't have focus which
    // caused "NotAllowedError: Clipboard write was blocked due to lack of user activation"

    //copyButton.addEventListener("click", function() {
    //    window.focus();
    //    var textToCopy = `Question:\n${questionObj.response}\n\nComments:\n${questionObj.comments.join('\n')}\n\nAnswers:\n`;
    //    answersData.forEach(function(answer, idx) {
    //        textToCopy += `Answer ${idx + 1}:\n${answer.response}\nComments:\n${answer.comments.join('\n')}\n\n`;
    //    });
    //    navigator.clipboard.writeText(textToCopy).then(function() {
    //        //alert("Content copied to clipboard!");
    //    }, function(err) {
    //        let dbginfo = "=== Debug Info ===";
    //        dbginfo += "\nw.opener: " + w.opener;
    //        dbginfo += "\nwindow.isSecureContext: " + w.isSecureContext;
    //        dbginfo += "\nnavigator.clipboard: " + navigator.clipboard;
    //        dbginfo += "\ndocument.hasFocus(): " + document.hasFocus();
    //        dbginfo += "\nopener.document.hasFocus(): " + w.opener.document.hasFocus();
    //        dbginfo += "\ndocument.visibilityState: " + document.visibilityState;
    //        dbginfo += "\n=== End Debug Info ===";
    //        alert("Failed to copy content: " + err + "\n" + dbginfo);
    //    });
    //});

    copyButton.addEventListener("click", function() {
        var textToCopy = `===== Stack Exchange - Scraped Q&A =====\n`;
        textToCopy += `URL: ${window.location.href}`;
        textToCopy += `\n\n==== Question ====\n${questionObj.response}\n`;

        if (questionObj.comments.length > 0) {
            questionObj.comments.forEach(function(comment, commentIdx) {
                textToCopy += `\nComment ${commentIdx + 1}: ${comment}\n`;
            });
        }

        answersData.forEach(function(answer, idx) {
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
    questionContentNode.innerHTML = questionObj.response;
    questionNode.appendChild(questionContentNode);

    if (questionObj.comments.length > 0) {
        var questionCommentsNode = doc.createElement("div");
        questionNode.appendChild(questionCommentsNode);

        questionObj.comments.forEach(function(comment, commentIdx) {
            var h3 = doc.createElement("h3");
            h3.textContent = `Comment ${commentIdx + 1}`;
            questionCommentsNode.appendChild(h3);

            var commentContentNode = doc.createElement("pre");
            commentContentNode.innerHTML = comment;
            questionCommentsNode.appendChild(commentContentNode);
        });
    }

    // Render answers
    answersData.forEach(function(answer, answerIdx) {
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

})();