import type { PageState } from './snapshot-loader';
import { copyButtonCss, createCopyButton } from './ui/copy-button';
import { createMultiToggle, multiToggleCss } from './ui/multi-toggle';
import { attachStickyHeader } from './ui/sticky';
import { h, htmlToElement, injectCss } from './utils/dom';

export type XletPage = {
  siteLabel?: string; // e.g. "GitHub", "Stack Exchange", "Wikipedia"
  title?: string;
  root: XletNode;
  views: XletView[];
  state: PageState;
  viewFallbacks?: Partial<Record<XletView, string | Element>>;
};

export type XletView = 'html' | 'md' | 'raw';

export type XletNode = {
  label?: string; // e.g. "Question", "Answer", "Comment", "Post", "Contrib"
  permalink?: string;
  content?: {
    md?: string;
    html?: string;
    raw?: string;
  };
  contrib?: string; // e.g. "[[ contributed by user on date ]]"
  copyable?: boolean; // whether this node should have a copy button (if content is present)
  children?: XletNode[];
};

export function renderXletPage(page: XletPage, targetDoc: Document, root: HTMLElement): void {
  injectCss(multiToggleCss, { id: 'multi-toggle-css', doc: targetDoc });
  injectCss(copyButtonCss, { id: 'copy-button-css', doc: targetDoc });
  const topHeading = h('h1', { class: 'top-heading' }, `Extractlet${page.siteLabel ? ` · ${page.siteLabel}` : ''}`);
  const copyAllButton = buildCopyButton(page.root, page, targetDoc);
  const topBar = h('div', { class: 'top-bar' }, topHeading, copyAllButton);
  root.appendChild(topBar);

  if (page.root.permalink) {
    const link = h('a', { href: page.root.permalink }, page.title ?? page.root.permalink);
    root.appendChild(h('div', { class: 'permalink' }, link));
  }

  const viewClasses = page.views.map((v) => `show-${v}`);
  const viewToggle = createMultiToggle({
    initState: page.state.viewIdx,
    onToggle: (newIdx) => {
      page.state.viewIdx = newIdx;
      root.classList.remove(...viewClasses);
      root.classList.add(viewClasses[newIdx]);
    },
    labels: page.views,
    labelSide: 'right',
  });
  attachStickyHeader(root, viewToggle);

  root.appendChild(buildNode(page.root, page, 1, targetDoc));

  page.views.forEach((view) => {
    if (page.viewFallbacks?.[view] && !hasSubtreeContent(page.root, view)) {
      root.appendChild(h('div', { class: `fallback-${view}` }, page.viewFallbacks[view]));
    }
  });

  viewToggle.init(); // init at the end to ensure all dom elements used by onToggle are present
}

function buildCopyButton(node: XletNode, page: XletPage, targetDoc: Document) {
  const isRoot = node === page.root;
  const label = node.label?.trim() ?? 'section';

  return createCopyButton(
    () => getCopyText(node, page),
    () => (isRoot ? 'Copied all!' : `Copied ${label}!`),
    () => (isRoot ? 'Copy all' : `Copy ${label}`),
    { doc: targetDoc },
  );
}

export function getCopyText(node: XletNode, page: XletPage): string {
  const isRoot = node === page.root;
  const preamble: string[] = [];

  if (isRoot) preamble.push('<!-- Extractlet -->');
  if (page.title) preamble.push(`<!-- ${page.title} -->`);
  if (node.permalink) preamble.push(`<!-- ${node.permalink} -->`);
  if (preamble.length) preamble.push('');

  const body = buildCopyBody(node, page, 1).trim();
  const text = [...preamble, body].join('\n').trim();

  return `\n<!-- XLET-BEGIN -->\n\n${text}\n\n<!-- XLET-END -->\n\n`;
}

function buildCopyBody(node: XletNode, page: XletPage, level: number): string {
  const out: string[] = [];
  const view = page.views[page.state.viewIdx];

  if (node.label) out.push('', `${'#'.repeat(Math.min(level, 3))} ${node.label.trim()}`);

  const content: string[] = [];
  switch (view) {
    case 'md':
    case 'html':
      if (node.content?.md) content.push(node.content.md.trim());
      if (node.contrib) content.push('', node.contrib.trim());
      break;
    case 'raw':
      if (node.content?.raw) content.push('', node.content.raw.trim());
      break;
    default: throw new Error(`Unknown view: ${String(view satisfies never)}`);
  }

  if (content.length) out.push(...content, ''); // add spacing after content if there is any

  node.children?.forEach((child) => {
    out.push(buildCopyBody(child, page, level + 1));
  });

  // if (out.length) out.push('c');
  return out.join('\n');
}

function buildNode(node: XletNode, page: XletPage, level: number, targetDoc: Document): HTMLElement {
  const title = node.label ? h(`h${Math.min(level, 3) as 1 | 2 | 3}`, { class: 'node-title' }, node.label.trim()) : null;
  const copyButton = node.copyable ? buildCopyButton(node, page, targetDoc) : null;
  const heading = (title || copyButton) ? h('div', { class: 'node-heading' }, title, copyButton) : null;
  const isShell = !node.content?.html && !node.content?.md && !node.content?.raw && !node.contrib && !node.label;
  const div = h('div', { class: `${page.root === node ? 'node-root' : 'node'}${isShell ? ' shell' : ''}` }, heading);

  const viewSpecs: Array<{ view: XletView; className: string; content: Element | string | null; }> = [
    { view: 'md',   className: 'md-view',   content: node.content?.md ?? null },
    { view: 'html', className: 'html-view', content: node.content?.html ? htmlToElement(node.content.html, targetDoc) : null },
    { view: 'raw',  className: 'raw-view',  content: node.content?.raw ?? null },
  ];

  viewSpecs.forEach(({ view, className, content }) => {
    if (!page.views.includes(view)) return;
    if (!hasSubtreeContent(node, view)) div.classList.add(`empty-${view}`);

    const body = h('div', { class: 'node-body' }, content);
    const contrib = node.contrib ? h('div', { class: 'node-contrib' }, node.contrib) : null;
    const bodyWrapper = h('div', { class: className }, body, contrib);
    div.appendChild(bodyWrapper);
  });

  node.children?.forEach((child) => {
    div.appendChild(buildNode(child, page, level + 1, targetDoc));
  });

  return div;
}

function hasSubtreeContent(node: XletNode, view: XletView): boolean {
  if (node.content?.[view] !== undefined) return true;
  if ((view === 'md' || view === 'html') && node.contrib) return true;
  return !!node.children?.some((child) => hasSubtreeContent(child, view));
}
