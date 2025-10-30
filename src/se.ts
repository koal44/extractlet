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

import {
  h, injectCss, createMultiToggle, multiToggleCss, createCopyButton, copyButtonCss, isText, isElement, isScript, htmlToElementK, htmlToElement,
} from './utils.js';
import type { ToMdElementHandler, ToHtmlElementHandler, ToHtmlContext } from './core.js';
import { toHtml as _toHtml, toMd as _toMd } from './core.js';

type Contributor = {
  contributorType: 'author' | 'editor' | 'commenter';
  isOwner: boolean;
  timestamp: string;
  name: string;
  userId: number;
  username: string;
}

type Comment = {
  bodyHtml: string | null;
  bodyMd: string;
  contributors: Contributor[];
  vote: number;
}

type Post = {
  bodyHtml: string | null;
  bodyMd: string;
  contributors: Contributor[];
  comments: Comment[];
  vote: number;
}

export type SEResult = {
  permalink: string;
  title?: string;
  posts: Post[];
}

function shouldSkip(node: Node | null): boolean {
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

const toMdElemHandler: ToMdElementHandler = (node, ctx, gc) => {
  if (shouldSkip(node)) return { skip: true };
  const tagName = node.tagName.toUpperCase();
  switch (tagName) {
    case 'DIV': {
      let md = gc(node, 'inline', 'normal');
      if (node.classList.contains('snippet')) {
        md = md.replace(/\n*$/, '\n\n');
        md = `<!-- begin snippet: -->\n\n${md}<!-- end snippet -->\n\n`;
      }
      return { md };
    }
    case 'PRE': {
      let md = gc(node, 'inline', 'pre');
      md = md.replace(/\n*$/, '\n');

      const lang = [...node.classList].find((cls) => cls.startsWith('lang-'))?.slice(5) || '';
      if (
        lang
        && ['js', 'css', 'html'].includes(lang)
        && node.classList.contains(`snippet-code-${lang}`)
      ) {
        md = `<!-- language: lang-${lang} -->\n\n${md}\n`;
      } else {
        md = `\`\`\`\n${md}\`\`\`\n\n`;
      }
      return { md };
    }
    case 'BLOCKQUOTE': {
      let md = gc(node, 'block', 'normal', { quoteDepth: ctx.quoteDepth + 1 });
      const isSpoiler = node.classList.contains('spoiler');
      const marker = isSpoiler ? '>!' : '>';
      const bqPrefix = md.match(new RegExp('^\\n*'))?.[0] ?? '';
      const bqSuffix = md.match(/\n*$/)?.[0] ?? '';

      md = md.slice(bqPrefix.length, md.length - bqSuffix.length);
      md = md.split('\n').map((line) => `${marker} ${line}`).join('\n');
      md = bqPrefix + md + bqSuffix;
      return { md };
    }
  }

  return {};
};

export function toMd(node: Node | null, opts: Partial<ToHtmlContext> = {}) {
  return _toMd(node, { ...opts, elementHandler: toMdElemHandler });
}

const toHtmlElemHandler: ToHtmlElementHandler = (node, _ctx) => {
  if (shouldSkip(node)) return { skip: true };
  if (!isElement(node)) throw new Error('toHtmlElemHandler called with non-element node');

  // display the original MathJax LaTeX content
  if (isScript(node)) { // non-MathJax scripts have already been filtered out
    const math = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'math');
    math.textContent = node.textContent;
    return { node: math };
  }

  return {};
};

export function toHtml(node: Node | null, opts: Partial<ToHtmlContext> = {}) {
  return _toHtml(node, { ...opts, elementHandler: toHtmlElemHandler });
}

function scrapeFallbackName(userNode: Element | null) {
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

function scrapeUserInfo(userNode: Element | null) {
  const name = userNode?.textContent?.trim() ?? '';
  const href = userNode?.getAttribute('href');
  const match = href?.match(/\/users\/(\d+)/);
  const userId = match ? parseInt(match[1], 10) : -1;
  const username = (href?.split('/').pop() ?? '').split('?')[0];

  return { name, userId, username };
}

export function scrapePostContributor(signatureNode: Element | null): Contributor {
  const timestamp = signatureNode?.querySelector('.relativetime')?.getAttribute('title')?.split(',')[0].trim() ?? '';
  const isOwner = signatureNode?.classList.contains('owner') ?? false; // OP of the entire post
  const contributorType = signatureNode?.querySelector('.user-details')?.getAttribute('itemprop') === 'author' ? 'author' : 'editor';
  const userNode = signatureNode?.querySelector('.user-details a');
  const userInfo = userNode
    ? scrapeUserInfo(userNode)
    : scrapeFallbackName(signatureNode?.querySelector('.user-details') ?? null);

  return { contributorType, isOwner, timestamp, ...userInfo };
}

function scrapeCommentContributor(commentItem: Element): Contributor {
  const timestamp = commentItem.querySelector('.relativetime-clean')?.getAttribute('title')?.split(',')[0].trim() ?? '';
  const userNode = commentItem.querySelector('a.comment-user');
  const { name, userId, username } = scrapeUserInfo(userNode);

  return { contributorType: 'commenter', isOwner: false, timestamp, name, userId, username };
}

function scrapePostVote(postLayout: Element) {
  const voteNode = postLayout.querySelector<HTMLDivElement>('div.votecell div[itemprop="upvoteCount"]');
  const vote = voteNode?.dataset.value ?? voteNode?.textContent ?? '';
  const n = parseInt(vote.trim(), 10);

  return Number.isFinite(n) ? n : 0;
}

function scrapeCommentVote(commentItem: Element) {
  const scoreNode = commentItem.querySelector('div.comment-score span');
  const vote = scoreNode?.textContent ?? '';
  const n = parseInt(vote.trim(), 10);

  return Number.isFinite(n) ? n : 0;
}

function scrapePosts(root: Document): Post[] {
  const postLayouts = root.querySelectorAll('.post-layout');
  const posts: Post[] = [];

  postLayouts.forEach((postLayout) => {
    // Extract post body
    const postBodyNode = toHtml(postLayout.querySelector('.s-prose'));
    const bodyHtml = postBodyNode instanceof Element  ? postBodyNode.outerHTML : null;
    const bodyMd = postBodyNode ? toMd(postBodyNode) : '';

    // Extract contributors
    const signatureNodes = postLayout.querySelectorAll('.post-signature');
    const contributors = Array.from(signatureNodes).map((sig) =>
      scrapePostContributor(sig)
    );

    const vote = scrapePostVote(postLayout);

    // Extract comments
    const commentNodes = postLayout.querySelectorAll('ul.comments-list li');
    const comments = Array.from(commentNodes).map((li) => {
      const bodySpan = toHtml(li.querySelector('div.comment-body > span.comment-copy'));
      const bodyHtml = bodySpan instanceof Element ? bodySpan.outerHTML : null;
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

function scrapePermalink(root: Document): string | undefined {
  const a = root.querySelector<HTMLAnchorElement>('#question-header a.question-hyperlink');
  return a?.href;
}

function scrapeTitle(root: Document): string | undefined {
  const a = root.querySelector<HTMLAnchorElement>('#question-header a.question-hyperlink');
  return a?.textContent?.trim();
}

function buildCopyButton(doc: Document, pageData: SEResult, postIdx = -1) {
  if (postIdx < -1 || postIdx >= pageData.posts.length) {
    throw new Error(`Invalid postIdx: ${postIdx}`);
  }
  const isAll = postIdx === -1;
  const isQuestion = postIdx === 0;
  const isAnswer = postIdx >= 1;

  const responseTxt =
    isAll      ? 'Copied All!' :
    isQuestion ? 'Copied Question!' :
    isAnswer   ? `Copied Answer ${postIdx}!` : '';

  const hintTxt =
    isAll      ? 'Copy all posts' :
    isQuestion ? 'Copy question' :
    isAnswer   ? `Copy answer ${postIdx}` : '';

  const copyArr = [];

  if (isAll) {
    copyArr.push(
      '===========================================',
      '        Extractlet · Stack Exchange',
      '===========================================\n'
    );

    if (pageData.permalink) {
      const permalinkNode = htmlToElementK(`<a href="${pageData.permalink}">${pageData.title}</a>`, 'a', doc);
      copyArr.push(
        `Title: ${permalinkNode?.textContent?.trim()}`,
        `URL:   ${permalinkNode?.getAttribute('href')}\n`);
    }
  }

  pageData.posts.forEach((post, idx) => {
    if (!isAll && idx !== postIdx) return;

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

  const copyTxt = `${copyArr.join('\n').trimEnd()}\n`;
  return createCopyButton(copyTxt, responseTxt, hintTxt);
}

function buildContribsAndVotes(contributors: Contributor[], voteCount: number): string {
  if (contributors.length === 0) return '';

  // Sort once, newest first
  const contribsSorted = contributors.slice().sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const selected: Contributor[] = [];

  // Find most recent owner (if any), and treat as author
  const owner = contribsSorted.find((c) => c.isOwner);
  if (owner) {
    selected.push(owner);
  }

  // If no owner, find most recent author
  if (!owner) {
    const author = contribsSorted.find((c) => c.contributorType === 'author' && !c.isOwner);
    if (author) {
      selected.push(author);
    }
  }

  // Find most recent editor (if any), regardless of owner/author
  const editor = contribsSorted.find((c) => c.contributorType === 'editor' && !c.isOwner);
  if (editor) {
    selected.push(editor);
  }

  // If any commenter present, override with just most recent commenter
  const commenter = contribsSorted.find((c) => c.contributorType === 'commenter');
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
    const date = c.timestamp.trim() ? c.timestamp.split(' ')[0] : 'unknown-date';
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

function buildPosts(data: SEResult, doc: Document): HTMLElement {
  const div = h('div', { class: 'posts' }) as HTMLDivElement;
  data.posts.forEach(function(post, idx) {
    const postNode = h('div', { class: 'post' });
    div.appendChild(postNode);

    const postTitle = h('h2', { class: 'post-title' }, idx === 0 ? 'Question' : `Answer ${idx}`);
    const copyButton = buildCopyButton(doc, data, idx);
    const postHeading = h('div', { class: 'post-heading' }, postTitle, copyButton);
    postNode.appendChild(postHeading);

    postNode.appendChild(buildPostView(post, 'md', doc));
    postNode.appendChild(buildPostView(post, 'html', doc));
  });

  return div;
}

function buildPostView(post: Post, viewMode: 'html' | 'md', doc: Document): HTMLDivElement {
  const modes: Record<'html' | 'md', { key: 'bodyHtml' | 'bodyMd'; class: string; }> = {
    html: { key: 'bodyHtml', class: 'html-view' },
    md:   { key: 'bodyMd',   class: 'md-view'   },
  };
  const mode = modes[viewMode];

  function renderBody(str: string): Node | string | null {
    switch (viewMode) {
      case 'html': return htmlToElement(str, doc);
      case 'md': return str;
      default: throw new Error(`Unknown mode: ${String(viewMode)}`);
    }
  }


  const postBodyStr = post[mode.key] ?? '';
  const postBody = renderBody(postBodyStr);
  const bodyDiv = h('div', { class: 'post-body' }, postBody);
  const postContribs = buildContribsAndVotes(post.contributors, post.vote);
  const postContribsDiv = h('div', { class: 'post-contribs' }, `${postContribs}`);

  const commentsDiv = h('div', { class: 'comments' });
  post.comments.forEach((comment, commentIdx) => {
    const commentHeading = h('h4', { class: 'comment-heading' }, `Comment ${commentIdx + 1}`);
    const commentContrib = buildContribsAndVotes(comment.contributors, comment.vote);
    const commentContribSpan = h('span', { class: 'comment-contrib' }, ` ${commentContrib}`);

    const commentBodyStr = comment[mode.key] ?? '';
    const commentBody = renderBody(commentBodyStr);
    const commentBodyDiv = h('div', { class: 'comment-body' }, commentBody, commentContribSpan);

    commentsDiv.appendChild(commentHeading);
    commentsDiv.appendChild(commentBodyDiv);
  });

  return h('div', { class: mode.class }, bodyDiv, postContribsDiv, commentsDiv) as HTMLDivElement;
}

export function extractFromDoc(root: Document = document): SEResult | undefined {
  const posts = scrapePosts(root);
  if (posts.length === 0) {
    alert('No posts found on this page.');
    return;
  }

  const permalink = scrapePermalink(root) || '';
  const title = scrapeTitle(root);
  const result: SEResult = {
    permalink,
    title,
    posts,
  };

  return result;
}

export function createPage(pageData: SEResult, doc: Document): void {
  injectCss(multiToggleCss, { id: 'multi-toggle-css', doc });
  injectCss(copyButtonCss, { id: 'copy-button-css', doc });
  const topHeading = h('h1', { class: 'top-heading' }, 'Extractlet · Stack Exchange');
  const copyAllButton = buildCopyButton(doc, pageData);
  const topBar = h('div', { class: 'top-bar' }, topHeading, copyAllButton);
  doc.body.appendChild(topBar);

  if (pageData.permalink) {
    const permalinkNode = htmlToElementK(`<a href="${pageData.permalink}">${pageData.title}</a>`, 'a', doc);
    const permalinkDiv = h('div', { class: 'perma-link' }, permalinkNode);
    doc.body.appendChild(permalinkDiv);
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
  const viewToggleContainer = h('div', { class: 'view-toggle' }, viewToggle);
  doc.body.appendChild(viewToggleContainer);

  const output = buildPosts(pageData, doc);
  doc.body.appendChild(output);
  viewToggle.init(); // init at the end to ensure all dom elements used by onToggle are present
}
