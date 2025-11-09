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
} from '../utils';
import type { ToMdElementHandler, ToHtmlElementHandler, ToHtmlContext, ToMdContext } from '../core';
import { toHtml as _toHtml, toMd as _toMd } from '../core';
import { asAbsUrl, Locator, pickEl, pickEls, pickVal } from '../locator';

type Contributor = {
  contributorType: 'author' | 'editor' | 'commenter';
  isOwner: boolean;
  timestamp: string;
  name: string;
  userId: number;
  userSlug: string;
}

type Comment = {
  bodyHtml: string | undefined;
  bodyMd: string;
  contributors: Contributor[];
  vote: number;
}

type Post = {
  bodyHtml: string | undefined;
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
      let md = gc(node, 'inline');
      if (node.classList.contains('snippet')) {
        md = md.replace(/\n*$/, '\n\n');
        md = `<!-- begin snippet: -->\n\n${md}<!-- end snippet -->\n\n`;
      }
      return { md };
    }
    case 'PRE': {
      let md = gc(node, 'inline', { wsMode: 'pre' });
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
      let md = gc(node, 'block');
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

  // handle MathJax scripts
  if (isScript(node)) {
    if (!node.matches('script[type^="math/tex"], [id^="MathJax" i]')) { // never: shouldSkip() should've filtered
      console.warn('Unexpected script node in toHtmlElemHandler:', node);
      return {};
    }

    const isDisplayByType = node.matches('script[type*="mode=display" i]');
    const isDisplayByWrapper = !!node.parentElement?.matches('div[class~=MathJax i]');

    const math = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'math');
    math.toggleAttribute('data-xlet', true);
    math.setAttribute('display', isDisplayByType || isDisplayByWrapper ? 'block' : 'inline');
    math.textContent = node.textContent?.trim() ?? '';

    const md = toMd(math, ctx);

    return { md };
  }

  return {};
};

export function toMd(node: Node | null, opts: Partial<ToMdContext> = {}) {
  return _toMd(node, { ...opts, elementHandler: toMdElemHandler });
}

const toHtmlElemHandler: ToHtmlElementHandler = (node, _ctx) => {
  if (shouldSkip(node)) return { skip: true };
  if (!isElement(node)) throw new Error('toHtmlElemHandler called with non-element node');

  // display the original MathJax LaTeX content
  if (isScript(node)) {
    if (!node.matches('script[type^="math/tex"], [id^="MathJax" i]')) { // never: shouldSkip() should've filtered
      console.warn('Unexpected script node in toHtmlElemHandler:', node);
      return {};
    }

    const isDisplayByType = node.matches('script[type*="mode=display" i]');
    const isDisplayByWrapper = !!node.parentElement?.matches('div[class~=MathJax i]');

    const math = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'math');
    math.toggleAttribute('data-xlet', true);
    math.setAttribute('display', isDisplayByType || isDisplayByWrapper ? 'block' : 'inline');
    math.textContent = node.textContent?.trim() ?? '';

    return { node: math };
  }

  return {};
};

export function toHtml(node: Element | null | undefined, opts?: Partial<ToHtmlContext>): Element | null
export function toHtml(node: Node | null | undefined, opts?: Partial<ToHtmlContext>): Element | null
export function toHtml(node: Node | null | undefined, opts: Partial<ToHtmlContext> = {}) {
  if (!node) return null;
  return _toHtml(node, { ...opts, elementHandler: toHtmlElemHandler });
}

type seVarKey =
  'permalink' | 'title' |
  'posts_items' | 'post_body' | 'sig_items' |
  'comment_items' | 'comment_body' |
  'poster_name' | 'poster_id' | 'poster_slug' | 'poster_time' | 'poster_isOwner' | 'poster_type' | 'poster_voteCount' |
  'commenter_name' | 'commenter_id' | 'commenter_slug' | 'commenter_time' | 'commenter_voteCount'
  ;

const seTable: Record<seVarKey, Locator[]> = {
  permalink: [
    { sel: '#question-header a.question-hyperlink', attr: 'href', valMap: asAbsUrl },
    { sel: 'link[rel="canonical"]', attr: 'href', valMap: asAbsUrl },
  ],
  title: [{ sel: '#question-header a.question-hyperlink', attr: 'textContent' }],

  // posts
  posts_items: [{ sel: '.post-layout' }],
  post_body:   [{ sel: ':scope .s-prose' }],
  sig_items:   [{ sel: ':scope .post-signature' }],

  // comments
  comment_items: [{ sel: ':scope ul.comments-list > li' }],
  comment_body:  [{ sel: ':scope .comment-body > span.comment-copy' }],

  // poster info
  poster_time: [{ sel: ':scope .relativetime', attr: 'title', valMap: (v) => v.split(',')[0].trim() }],
  poster_isOwner: [{ sel: ':scope', attr: 'class', valMap: (v) => v.split(' ').includes('owner') ? 'true' : 'false' }],
  poster_type: [{ sel: ':scope .user-details', attr: 'itemprop', valMap: (v) => v === 'author' ? 'author' : 'editor' }],
  poster_name: [
    { sel: ':scope .user-details a', attr: 'textContent' },
    { sel: ':scope .user-details > span[itemprop="name"]', attr: 'textContent' }, // fallback
  ],
  poster_id: [{ sel: ':scope .user-details a', attr: 'href', valMap: (v) => { const match = v.match(/\/users\/(\d+)/); return match ? match[1] : '-1'; } }],
  poster_slug: [{ sel: ':scope .user-details a', attr: 'href', valMap: (v) => { const parts = v.split('/'); return parts.pop()?.split('?')[0] || ''; } }],
  poster_voteCount: [
    { sel: ':scope .votecell [itemprop="upvoteCount"]', attr: 'data-value' },
    { sel: ':scope .votecell [itemprop="upvoteCount"]', attr: 'textContent' },
  ],

  // commenter info
  commenter_name: [{ sel: ':scope a.comment-user', attr: 'textContent' }],
  commenter_id: [{ sel: ':scope a.comment-user', attr: 'href', valMap: (v) => { const match = v.match(/\/users\/(\d+)/); return match ? match[1] : '-1'; } }],
  commenter_slug: [{ sel: ':scope a.comment-user', attr: 'href', valMap: (v) => { const parts = v.split('/'); return parts.pop()?.split('?')[0] || ''; } }],
  commenter_time: [{ sel: ':scope .relativetime-clean', attr: 'title', valMap: (v) => v.split(',')[0].trim() }],
  commenter_voteCount: [{ sel: ':scope div.comment-score span', attr: 'textContent' }],
} as const;

function scrapePermalink(root: Document): string | undefined {
  return pickVal(seTable.permalink, root);
}

function scrapeTitle(root: Document): string | undefined {
  return pickVal(seTable.title, root);
}

function scrapePosts(doc: Document): Post[] {
  const posts: Post[] = [];

  for (const post of pickEls(seTable['posts_items'], doc)) {
    // post body
    // const bodyEl = toHtml(pickEl(seTable['post_body'], doc, post));
    // const bodyHtml = bodyEl?.outerHTML;
    // const bodyMd = toMd(bodyEl);
    const bodyEl = pickEl(seTable['post_body'], doc, post);
    const bodyHtml = bodyEl ? toHtml(bodyEl)?.outerHTML : undefined;
    const bodyMd = bodyEl ? toMd(bodyEl) : '';

    // contributors
    const sigNodes = pickEls(seTable['sig_items'], doc, post);
    const contributors = sigNodes.map((x) => scrapePostContributor(x, doc));

    const vote = scrapePostVote(post, doc);

    // comments
    const comments = pickEls(seTable['comment_items'], doc, post).map((comment) => {
      // const cBodyEl = toHtml(pickEl(seTable['comment_body'], doc, comment));
      // const bodyHtml = cBodyEl?.outerHTML;
      // const bodyMd = toMd(cBodyEl);
      const cBodyEl = pickEl(seTable['comment_body'], doc, comment);
      const bodyHtml = cBodyEl ? toHtml(cBodyEl)?.outerHTML : undefined;
      const bodyMd = cBodyEl ? toMd(cBodyEl) : '';

      const contributors = [scrapeCommentContributor(comment, doc)];
      const vote = scrapeCommentVote(comment, doc);
      return { bodyHtml, bodyMd, contributors, vote };
    });

    posts.push({ bodyHtml, bodyMd, contributors, comments, vote });
  }
  return posts;
}

export function scrapePostContributor(elem: Element | null, doc: Document): Contributor {
  if (!elem) return { contributorType: 'editor', isOwner: false, timestamp: '', name: '', userId: -1, userSlug: '' };

  const timestamp = pickVal(seTable['poster_time'], doc, elem) ?? '';
  const contributorType = pickVal(seTable['poster_type'], doc, elem) === 'author' ? 'author' : 'editor';
  const isOwner = pickVal(seTable['poster_isOwner'], doc, elem) === 'true';

  const name = pickVal(seTable['poster_name'], doc, elem) ?? '';
  const userId = parseInt(pickVal(seTable['poster_id'], doc, elem) ?? '-1', 10);
  const userSlug = pickVal(seTable['poster_slug'], doc, elem) ?? '';

  return { contributorType, isOwner, timestamp, name, userId, userSlug };
}

function scrapePostVote(elem: Element, doc: Document): number {
  const val = pickVal(seTable['poster_voteCount'], doc, elem);
  const n = parseInt(val ?? '', 10);
  return Number.isNaN(n) ? 0 : n;
}

function scrapeCommentContributor(elem: Element, doc: Document): Contributor {
  const timestamp = pickVal(seTable['commenter_time'], doc, elem) ?? '';
  const name = pickVal(seTable['commenter_name'], doc, elem) ?? '';
  const userId = parseInt(pickVal(seTable['commenter_id'], doc, elem) ?? '-1', 10);
  const userSlug = pickVal(seTable['commenter_slug'], doc, elem) ?? '';

  return { contributorType: 'commenter', isOwner: false, timestamp, name, userId, userSlug };
}

function scrapeCommentVote(elem: Element, doc: Document): number {
  const val = pickVal(seTable['commenter_voteCount'], doc, elem);
  const n = parseInt(val ?? '', 10);
  return Number.isNaN(n) ? 0 : n;
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
  const div = h('div', { class: 'posts' });
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

  return h('div', { class: mode.class }, bodyDiv, postContribsDiv, commentsDiv);
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
