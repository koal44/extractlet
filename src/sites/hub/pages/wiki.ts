import type { CreatePage } from '../../../snapshot-loader';
import { h, type HLevel, relevelHeadings } from '../../../utils/dom';
import { extractBlocks, type BlockSpec } from '../../../utils/extract';
import { toHtml, toMd } from '../convert';
import { normalizeReadme } from '../dom';

const blocks: BlockSpec[] = [
  {
    name: 'header',
    select: { kind: 'match', selectors: ['#wiki-wrapper .gh-header-title'] },
  },
  {
    name: 'header-meta',
    select: { kind: 'match', selectors: ['#wiki-wrapper .gh-header-meta'] },
  },
  {
    name: 'content',
    select: { kind: 'match', selectors: ['#wiki-body .markdown-body'] },
    normalize: (root, _fields, ctxs) => normalizeReadme(root, ctxs),
  },
  {
    name: 'nav',
    select: { kind: 'match', selectors: ['#wiki-pages-box'] },
    transforms: [
      {
        kind: 'remove',
        selectors: ['button', 'include-fragment', 'input', '.Counter', 'li.wiki-more-pages-link'],
      },
      { kind: 'unwrap', selectors: ['a', 'nav'] },
    ],
  },
];

export const createWikiPage: CreatePage = ({ sourceDoc, ctxs, state }) => {
  const makeCopyBlock = (els: (Element | null)[], label?: string, labelLevel?: HLevel) => {
    const wrapper = h('div', { class: 'xlet-wiki', __doc: sourceDoc }, ...els);
    if (labelLevel) {
      const level = label ? Math.max(6, labelLevel + 1) as HLevel : labelLevel;
      relevelHeadings(wrapper, level);
    }
    return {
      label, labelLevel, copyable: true,
      content: {
        md: toMd(wrapper, { ...ctxs.md }),
        html: toHtml(wrapper, ctxs.html)?.outerHTML,
      },
    };
  };

  const [header, headerMeta, content, nav] = extractBlocks(sourceDoc, blocks, ctxs);

  return {
    views: [],
    state,
    root: {
      children: [
        makeCopyBlock([header, headerMeta, content], undefined, 1),
        makeCopyBlock([nav], undefined, 1),
      ],
    },
  };
};
