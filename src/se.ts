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

import { h, injectCss, createMultiToggle, multiToggleCss, createCopyButton, copyButtonCss, isText, isElement, isAnchor, isScript } from './utils.js';
import { baseCss, toHtml as _toHtml, ToHtmlOptions, toMd as _toMd, ToMdHandler } from './core.js';

function shouldSkip(node: Node|null): boolean {
  if (!node) throw new Error('shouldSkip called with null or undefined node');
  if (isText(node)) return false; // Text nodes are never skipped

  if (isElement(node)) {
    const id = node.id || '';
    const className = node.className || '';
    const aType = node.getAttribute('type') || '';

    if (isScript(node)) {
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

const toMdHandlers: Record<string, ToMdHandler> = {
  DIV(node, ctx, glueChildren) {
    let result;
    result = glueChildren(node, 'flat', 'normal');
    if (node.classList.contains('snippet')) {
      result = result.replace(/\n*$/, '\n\n');
      result = `<!-- begin snippet: -->\n\n${result}<!-- end snippet -->\n\n`;
    }
    return result;
  },
  PRE(node, ctx, glueChildren) {
    let result;
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
    return result;
  },
  BLOCKQUOTE(node, ctx, glueChildren) {
    let result;
    result = glueChildren(node, 'block', 'normal', { qd: (ctx.quoteDepth ?? 0) + 1 });
    const isSpoiler = node.classList.contains('spoiler');
    const marker = isSpoiler ? '>!' : '>';
    const bqPrefix = result.match(new RegExp('^\\n*'))?.[0] ?? '';
    const bqSuffix = result.match(/\n*$/)?.[0] ?? '';

    result = result.slice(bqPrefix.length, result.length - bqSuffix.length);
    result = result.split('\n').map(line => `${marker} ${line}`).join('\n');
    result = bqPrefix + result + bqSuffix;
    return result;
  },
};

function toHtmlElemHandler(node:Element, _ctx:ToHtmlOptions): { skip?: boolean; node?: Node } {
  if (shouldSkip(node)) return { skip: true };
  if (!isElement(node)) throw new Error('toHtmlElemHandler called with non-element node');

  // display the original MathJax LaTeX content
  if (isScript(node)) { // non-MathJax scripts have already been filtered out
    const math = document.createElement('math');
    math.textContent = node.textContent;
    return { node: math };
  }

  return {};
}

export function toMd(node: Node|null) {
  return _toMd(node, { shouldSkip, handlers: toMdHandlers });
}

export function toHtml(node: Node|null) {
  return _toHtml(node, { elementHandler: toHtmlElemHandler });
}

function scrapeFallbackName(userNode:Element|null) {
  let name = userNode?.querySelector(':scope > span[itemprop="name"]')?.textContent?.trim() ?? '';

  // fallback to text content if still no name
  if (!name && userNode) {
    for (const node of userNode.childNodes) {
      if (isText(node)) {
        name = node.textContent!.trim();
        if (name) break;
      }
    }
  }

  return { name, userId: -1, username: '' };
}

function scrapeUserInfo(userNode:Element|null) {
  const name = userNode?.textContent?.trim() ?? '';
  const href = userNode?.getAttribute('href');
  const match = href?.match(/\/users\/(\d+)/);
  const userId = match ? parseInt(match[1], 10) : -1;
  const username = (href?.split('/').pop() ?? '').split('?')[0];

  return { name, userId, username };
}

export function scrapePostContributor(signatureNode:Element|null): Contributor {
  const timestamp = signatureNode?.querySelector('.relativetime')?.getAttribute('title')?.split(',')[0].trim() ?? '';
  const isOwner = signatureNode?.classList.contains('owner') ?? false; // OP of the entire post
  const contributorType = signatureNode?.querySelector('.user-details')?.getAttribute('itemprop') === 'author' ? 'author' : 'editor';
  const userNode = signatureNode?.querySelector('.user-details a');
  const userInfo = userNode
    ? scrapeUserInfo(userNode)
    : scrapeFallbackName(signatureNode?.querySelector('.user-details') ?? null);

  return { contributorType, isOwner, timestamp, ...userInfo };
}

function scrapeCommentContributor(commentItem:Element): Contributor {
  const timestamp = commentItem.querySelector('.relativetime-clean')?.getAttribute('title')?.split(',')[0].trim() ?? '';
  const userNode = commentItem.querySelector('a.comment-user');
  const { name, userId, username } = scrapeUserInfo(userNode);

  return { contributorType: 'commenter', isOwner: false, timestamp, name, userId, username };
}

function scrapePostVote(postLayout:Element) {
  const voteNode = postLayout.querySelector('div.votecell div[itemprop="upvoteCount"]') as HTMLDivElement | null;
  const vote = voteNode?.dataset?.value ?? voteNode?.textContent ?? '';
  const n = parseInt(vote.trim(), 10);

  return Number.isFinite(n) ? n : 0;
}

function scrapeCommentVote(commentItem:Element) {
  const scoreNode = commentItem.querySelector('div.comment-score span');
  const vote = scoreNode?.textContent ?? '';
  const n = parseInt(vote.trim(), 10);

  return Number.isFinite(n) ? n : 0;
}

type Contributor = {
  contributorType: 'author'|'editor'|'commenter';
  isOwner: boolean;
  timestamp: string;
  name: string;
  userId: number;
  username: string;
}

type Comment = {
  bodyHtml: Node | null;
  bodyMd: string;
  contributors: Contributor[];
  vote: number;
}

type Post = {
  bodyHtml: Node | null;
  bodyMd: string;
  contributors: Contributor[];
  comments: Comment[];
  vote: number;
}

function scrapePosts(root:Document): Post[] {
  const postLayouts = root.querySelectorAll('.post-layout');
  const posts:Post[] = [];

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

function scrapePermaLink(root:Document): HTMLAnchorElement|null {
  const qLink = root.querySelector('#question-header a.question-hyperlink');
  const clone = toHtml(qLink);
  return isAnchor(clone) ? clone : null;
}

type PageData = {
  permaLink: HTMLAnchorElement|null;
  posts: Post[];
}

function buildCopyButton(doc:Document, pageData:PageData, postIdx = -1) {
  const responseTxt =
    postIdx === -1 ? 'Copied All!' :
    postIdx ===  0 ? 'Copied Question!' :
    postIdx >=   1 ? `Copied Answer ${postIdx}!` :
    (() => { throw new Error('Invalid postIdx: ' + postIdx); })();

  const copyArr = [];

  if (postIdx === -1) {
    copyArr.push(
      '===========================================',
      '        Extractlet · Stack Exchange',
      '===========================================\n'
    );

    if (pageData.permaLink) {
      copyArr.push(
        `Title: ${pageData.permaLink?.textContent?.trim()}`,
        `URL:   ${pageData.permaLink?.getAttribute('href')}\n`);
    }
  }

  pageData.posts.forEach((post, idx) => {
    if (postIdx !== -1 && idx !== postIdx) return;

    const postHeading = idx === 0 ? 'Question' : `Answer ${idx}`;
    copyArr.push(`\n❖❖ ${postHeading} ❖❖`, '', post.bodyMd);

    const postContrib = buildContribsAndVotes(post.contributors, post.vote);
    if (postContrib) copyArr.push('', postContrib);

    if (post.comments.length > 0) {
      post.comments.forEach((comment, cIdx) => {
        const commentContrib = buildContribsAndVotes(comment.contributors, comment.vote);
        copyArr.push('', `Comment ${cIdx + 1}:`, `${comment.bodyMd}${commentContrib ? ` ${commentContrib}` : ''}`);
      });
    }

    copyArr.push('');
  });

  const copyTxt = copyArr.join('\n').trimEnd() + '\n';
  return createCopyButton(doc, copyTxt, responseTxt);
}

function buildContribsAndVotes(contributors:Contributor[], voteCount:number): string {
  if (!contributors || contributors.length === 0) return '';

  // Sort once, newest first
  const contribsSorted = contributors.slice().sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const selected:Contributor[] = [];

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

  let contribsText = '';
  if (s.length === 1) {
    contribsText = `${s[0].name} on ${s[0].date}`;
  } else if (s.length === 2) {
    if (s[0].name === s[1].name) {
      contribsText = `${s[0].name} on ${s[0].date}; edited on ${s[1].date}`;
    } else {
      contribsText = `${s[0].name} on ${s[0].date}; edited by ${s[1].name} on ${s[1].date}`;
    }
  } else {
    contribsText = '';
  }

  const voteText = `${voteCount >= 0 ? '+' : ''}${voteCount}`;

  return `[[ ${contribsText} | ${voteText} ]]`;
}

function buildPosts(data:PageData, doc:Document): HTMLElement {
  const div = h('div', { class: 'posts' }) as HTMLDivElement;
  data.posts.forEach(function(post, idx) {
    const postNode = h('div', { class: 'post' });
    div.appendChild(postNode);

    const postTitle = h('h2', { class: 'post-title' }, idx === 0 ? 'Question' : `Answer ${idx}`);
    const copyButton = buildCopyButton(doc, data, idx);
    const postHeading = h('div', { class: 'post-heading' }, postTitle, copyButton);
    postNode.appendChild(postHeading);

    postNode.appendChild(buildPostView(post, 'md'));
    postNode.appendChild(buildPostView(post, 'html'));
  });

  return div;
}

function buildPostView(post:Post, viewMode:'html'|'md'): HTMLDivElement {
  const modes:Record<'html'|'md', { key:'bodyHtml'|'bodyMd'; class:string }> = {
    html: { key: 'bodyHtml', class: 'html-view' },
    md:   { key: 'bodyMd',   class: 'md-view'   },
  };
  const mode = modes[viewMode];

  const postBody = post[mode.key] ?? '';
  const bodyDiv = h('div', { class: 'post-body' }, postBody);
  const postContribs = buildContribsAndVotes(post.contributors, post.vote);
  const postContribsDiv = h('div', { class: 'post-contribs' }, `${postContribs}`);

  const commentsDiv = h('div', { class: 'comments' });
  post.comments.forEach((comment, commentIdx) => {
    const commentHeading = h('h4', { class: 'comment-heading' }, `Comment ${commentIdx + 1}`);
    const commentContrib = buildContribsAndVotes(comment.contributors, comment.vote);
    const commentContribSpan = h('span', { class: 'comment-contrib' }, ` ${commentContrib}`);
    const commentBody = comment[mode.key] ?? '';
    const commentBodyDiv = h('div', { class: 'comment-body' }, commentBody, commentContribSpan);

    commentsDiv.appendChild(commentHeading);
    commentsDiv.appendChild(commentBodyDiv);
  });

  return h('div', { class: mode.class }, bodyDiv, postContribsDiv, commentsDiv) as HTMLDivElement;
}

const seCss = /* css */ `
.top-bar {
  display: flex;
}
.top-heading {
  margin: 0;
  line-height: 1
}
.perma-link {
  margin: 0.7em 0;
}
.post {
  margin-top: 2.5em;
  margin-bottom: 0;
}
.post-title {
  margin: 0;
  line-height: 1;
  align-content: center;
}
.post-heading {
  display: flex;
  margin-top: 0px;
}
.comments {
  line-height: 1.2;
  margin-top: 1.5em;
}
.comment-contrib {
  white-space: nowrap;
  margin-left: 0.6em;
  font-size: 0.9em;
}
.md-view {
  white-space: pre-wrap;
  line-height: 1.4;
  margin-top: 0.6em;
}
.md-view > .post-contribs {
  margin-top: 1.1em;
}
.md-view > .comment-body {
  white-space: pre-wrap;
  line-height: 1.1;
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

export function runBookmarklet(root = document) {
  const posts = scrapePosts(root);
  if (posts.length === 0) {
    alert('No posts found on this page.');
    return;
  }
  const permaLink = scrapePermaLink(root);
  const pageData = { permaLink, posts };

  const win = window.open('', '_blank', '');
  if (!win) {
    alert('Failed to open new window. Please allow pop-ups for this site.');
    return;
  }
  const doc = win.document;
  doc.title = 'Bookmarklet';
  injectCss(baseCss, { doc });
  injectCss(seCss, { doc });
  injectCss(multiToggleCss, { id: 'multi-toggle-css', doc });
  injectCss(copyButtonCss, { id: 'copy-button-css', doc });

  const topHeading = h('h1', { class: 'top-heading' }, 'Extractlet · Stack Exchange');
  const copyAllButton = buildCopyButton(doc, pageData);
  const topBar = h('div', { class: 'top-bar' }, topHeading, copyAllButton);
  doc.body.appendChild(topBar);

  if (pageData.permaLink) {
    const permaLinkDiv = h('div', { class: 'perma-link' }, pageData.permaLink);
    doc.body.appendChild(permaLinkDiv);
  }

  const viewToggle = createMultiToggle({
    initState: 0,
    onToggle: (state) => {
      doc.body.classList.remove('show-html', 'show-md', 'show-raw');
      doc.body.classList.add(['show-html', 'show-md', 'show-raw'][state]);
    },
    labels: ['html', 'md'], // , 'raw'
    labelSide: 'right',
  });
  doc.body.appendChild(viewToggle);

  const output = buildPosts(pageData, doc);
  doc.body.appendChild(output);
}
