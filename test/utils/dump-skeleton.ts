type AttrRule = string | RegExp;

export type SkeletonOptions = {
  maxDepth?: number;             // stop after this depth (default: Infinity)
  maxChildren?: number;          // cap children visited per node (default: Infinity)
  includeAttrs?: AttrRule[];     // attributes to print (default: ['id','data-testid','role'])
  excludeTags?: string[];        // tag names (lowercase) to skip entirely (default: ['script','style','link','meta','noscript'])
  textSample?: number;           // chars of text to show (default: 0 => hide text nodes)
  collapseWhitespace?: boolean;  // collapse/trim text before sampling (default: true)
};

function attrIncluded(name: string, rules: AttrRule[]): boolean {
  return rules.some((r) => (typeof r === 'string' ? r === name : r.test(name)));
}

function fmtAttrs(el: Element, include: AttrRule[]): string {
  const out: string[] = [];
  for (const { name, value } of Array.from(el.attributes)) {
    if (!attrIncluded(name, include)) continue;
    const v = value.length > 100 ? `${value.slice(0, 97)}…` : value;
    out.push(`${name}="${v}"`);
  }
  return out.length ? ` ${out.join(' ')}` : '';
}

function skipTag(el: Element, excludeTags: string[]): boolean {
  const tag = el.tagName.toLowerCase();
  return excludeTags.includes(tag);
}

function textPreview(text: string, sample: number, collapse: boolean): string | null {
  let t = text;
  if (collapse) t = t.replace(/\s+/g, ' ').trim();
  if (!t || sample <= 0) return null;
  if (t.length > sample) t = `${t.slice(0, sample)}…`;
  return t;
}

const DEF: Required<SkeletonOptions> = {
  maxDepth: Infinity,
  maxChildren: Infinity,
  includeAttrs: ['id', /^data-testid/], //,'role',
  excludeTags: ['script', 'style', 'link', 'meta', 'noscript'],
  textSample: 0,
  collapseWhitespace: true,
};
/**
 * Pretty-print a compact DOM skeleton: tag names and selected attributes, with optional text snippets.
 * Works with JSDOM Documents or Elements.
 */
export function dumpSkeleton(root: Document | Element, opts: SkeletonOptions = {}): string {
  const opt: Required<SkeletonOptions> = { ...DEF, ...opts };
  const lines: string[] = [];
  const start: Element = root instanceof Document ? root.documentElement : root;

  const visit = (node: Element, depth: number) => {
    if (depth > opt.maxDepth) return;
    if (skipTag(node, opt.excludeTags)) return;

    const indent = '  '.repeat(depth);
    const tag = node.tagName.toLowerCase();
    const attrs = fmtAttrs(node, opt.includeAttrs);
    // lines.push(`${indent}<${tag}${attrs}>`);
    if ([...node.attributes].some((attr) => opt.includeAttrs.length && opt.includeAttrs.includes(attr.name))) {
      lines.push(`${indent}<${tag}${attrs}>`);
    }

    const kids = Array.from(node.childNodes);
    let shown = 0;

    for (const c of kids) {
      if (shown >= opt.maxChildren) {
        lines.push(`${indent}  …`);
        break;
      }
      if (c.nodeType === 1) {
        visit(c as Element, depth + 1);
        shown++;
      } else if (c.nodeType === 3) {
        const pv = textPreview(c.textContent ?? '', opt.textSample, opt.collapseWhitespace);
        if (pv) lines.push(`${indent}  " ${pv} "`);
      }
    }
  };

  visit(start, 0);
  return lines.join('\n');
}
