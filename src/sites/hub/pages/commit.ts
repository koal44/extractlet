import type { CreatePage } from '../../../snapshot-loader';
import { h, isTable } from '../../../utils/dom';
import { extractBlocks, extractMany, type BlockSpec, type ManySpec } from '../../../utils/extract';
import { toHtml, toMd } from '../convert';
import { normalizeDiffTable } from '../dom';

const specs: BlockSpec[] = [
  {
    name: 'header',
    select: {
      kind: 'match', selectors: [
        '[data-testid="top-nav-center"] nav',
        '#repository-container-header',
      ],
    },
    normalize: (root) => {
      root.querySelectorAll('li').forEach((li) => {
        if (li.nextElementSibling) {
          li.insertAdjacentElement('afterend', h('span', {}, ' / '));
        }
      });
      return h('section', {}, root);
    },
    transforms: [
      {
        kind: 'remove', selectors: [
          '#repository-container-header nav',
          '#repository-details-container',
          'ul.pagehead-actions',
        ],
      },
      { kind: 'replace', with: 'span', selectors: ['ul', 'li', 'nav'] },
    ],
  },
  {
    name: 'short',
    select: {
      kind: 'match',
      selectors: ['[data-component="TitleArea"]'],
    },
    normalize: (root) => {
      return h('section', {}, root);
    },
  },
  {
    name: 'attribution',
    select: {
      kind: 'match',
      selectors: [
        '[class*="CommitAttribution-"]',
      ],
    },
    normalize: (root) => {
      const author = root.querySelector('a[aria-label^="commits by"]') ?? root.querySelector('a[class*="AuthorAvatar"]') ?? root.querySelector('a');
      if (author?.textContent?.trim()) {
        author.insertAdjacentElement('afterend', h('span', {}, ' · '));
      }
      const date = root.querySelector('relative-time');
      date?.insertAdjacentElement('beforebegin', h('span', {}, ' on '));
      return h('section', {}, root);
    },
    transforms: [
      {
        kind: 'remove', selectors: [
          'button',
          'img',
        ],
      },
      { kind: 'unwrap', selectors: ['a'] },
      { kind: 'replace', with: 'span', selectors: ['div', 'p'] },
    ],
  },
  {
    name: 'message',
    select: {
      kind: 'match',
      selectors: ['[class*="commitMessageContainer"]'],
    },
  },
  {
    name: 'branch',
    select: {
      kind: 'match',
      selectors: ['[class*="commitBranchContainer"]'],
    },
    normalize: (root) => {
      root.querySelectorAll('pre').forEach((pre) => {
        const parentAnchor = pre.querySelector('a[href*="/commit/"]');
        if (!parentAnchor) return;
        let node = parentAnchor.nextSibling;
        while (node) {
          const next = node.nextSibling;
          node.remove();
          node = next;
        }
      });
      root.querySelectorAll('span').forEach((span) => {
        if (span.textContent?.trim() === '·') {
          span.textContent = ' · ';
        }
      });
      root.querySelectorAll('a').forEach((a) => {
        const next = a.nextSibling;
        if (next?.nodeType === Node.TEXT_NODE && next.textContent?.startsWith('(')) {
          next.textContent = ` ${next.textContent}`;
        }
      });
      return h('section', {}, root);
    },
    transforms: [
      {
        kind: 'remove', selectors: [
          'button',
          '[popover]',
          'a[href*="/releases/tag/"]',
        ],
      },
      { kind: 'unwrap', selectors: ['pre', 'a'] },
      { kind: 'replace', with: 'span', selectors: ['div', 'p'] },
    ],
  },
  {
    name: 'info',
    select: {
      kind: 'ancestor',
      selectors: [
        '#diff-content-parent [data-testid="expand-file-tree-button"]',
        '#diff-content-parent [data-testid="collapse-file-tree-button"]',
      ],
    },
    normalize: (root) => {
      root.querySelectorAll('div, span').forEach((el) => {
        if (el.textContent?.trim()) {
          el.insertAdjacentElement('afterend', h('span', {}, ' '));
        }
      });
      root.querySelectorAll('h2').forEach((el) => {
        el.insertAdjacentElement('afterend', h('span', {}, ' · '));
      });
      return h('section', {}, root);
    },
    transforms: [
      {
        kind: 'remove', selectors: [
          'button',
          '[popover]',
        ],
      },
      { kind: 'replace', with: 'span', selectors: ['div', 'p', 'h2'] },
    ],
  },
  {
    name: 'tree',
    select: {
      kind: 'match',
      selectors: ['#diff_file_tree ul[role="tree"]'],
    },
    normalize: (root) => {
      return h('section', {}, h('h2', {}, 'Files changed'), root);
    },
    transforms: [
      { kind: 'unwrap', selectors: ['a'] },
    ],
  },
];

const diffFieldSpecs: BlockSpec[] = [
  {
    name: 'path',
    select: {
      kind: 'match',
      selectors: ['h3[id^="heading-"]'],
    },
    normalize: (root) => {
      root.querySelectorAll('svg.octicon-arrow-right').forEach((svg) => {
        svg.replaceWith(h('span', {}, ' → '));
      });
      scrubBidiText(root);
      return root;
    },
    transforms: [
      { kind: 'remove', selectors: ['.sr-only'] },
      { kind: 'replace', with: 'span', selectors: ['a', 'code'] },
    ],
  },
  {
    name: 'info',
    select: {
      kind: 'root',
    },
    normalize: (root) => {
      const texts = [...root.querySelectorAll('span')]
        .map((el) => el.textContent?.trim())
        .filter((t): t is string => !!t);

      const plus = texts.find((t) => /^\+\d+$/.test(t));
      const minus = texts.find((t) => /^-\d+$/.test(t));

      if (!plus && !minus) return null;

      return h('span', {}, [plus, minus].filter(Boolean).join(' '));
    },
  },
  {
    name: 'body',
    select: {
      kind: 'match',
      // selectors: ['table'],
      selectors: ['[data-diff-anchor]'],
    },
    normalize: (root) => {
      if (isTable(root)) return normalizeDiffTable(root);
      return root;
    },
  },
];

function scrubBidiText(node: Node): void {
  for (const child of node.childNodes) {
    if (child.nodeType === Node.TEXT_NODE && child.textContent) {
      child.textContent = child.textContent.replace(/[\u200e\u200f\u202a-\u202e]/g, '');
    } else {
      scrubBidiText(child);
    }
  }
}

const diffManySpec: ManySpec = {
  select: {
    kind: 'matchAll',
    selectors: ['#diff-content-parent [role="region"]'],
  },
  normalize: (root) => {
    const [path, info, body] = extractBlocks(root, diffFieldSpecs, root.ownerDocument);
    return h('section', {},
      ...(path ? [path] : []),
      ...(info ? [info] : []),
      ...(body ? [body] : []),
    );
  },
};

export const createCommitPage: CreatePage = ({ sourceDoc, ctxs, state }) => {
  const commitBlocks = extractBlocks(sourceDoc, specs, sourceDoc);
  const diffRoots = extractMany(sourceDoc, diffManySpec);

  const wrapper = h('div', { class: 'hub-commit', __doc: sourceDoc },
    ...commitBlocks,
    ...diffRoots,
  );

  return {
    views: [],
    state,
    root: {
      content: {
        md: toMd(wrapper, { ...ctxs.md }),
        html: toHtml(wrapper, ctxs.html)?.outerHTML,
      },
    },
  };
};
