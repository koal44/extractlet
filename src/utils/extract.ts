import { findCommonAncestor, h, isDoc, isElement } from './dom';

export type SelectSpec =
  | { kind: 'match'; selectors: string[]; }
  | { kind: 'ancestor'; selectors: string[]; };

export type TransformSpec =
  | { kind: 'remove'; selectors: string[]; }
  | { kind: 'unwrap'; selectors: string[]; }
  | { kind: 'replace'; selectors: string[]; tag: keyof HTMLElementTagNameMap; };

export type BlockSpec = {
  name: string;
  select?: SelectSpec;
  transforms?: TransformSpec[];
  normalize?: (root: Element) => Element | null;
};

export function extractBlocks(root: ParentNode, specs: BlockSpec[], doc?: Document): (Element | null)[] {
  const blocks: (Element | null)[] = [];
  for (const spec of specs) {
    blocks.push(extractBlock(root, spec, doc));
  }
  return blocks;
}

function extractBlock(root: ParentNode, spec: BlockSpec, doc?: Document): Element | null {
  let found: Element | null = null;

  if (spec.select?.kind === 'match') {
    for (const selector of spec.select.selectors) {
      const el = root.querySelector(selector);
      if (el) {
        found = el;
        break;
      }
    }
  } else if (spec.select?.kind === 'ancestor') {
    found = findCommonAncestor(root, spec.select.selectors);
  } else {
    found = resolveRootElement(root);
  }

  if (!found) return null;

  const clone = found.cloneNode(true);
  if (!isElement(clone)) return null;

  const normalized = spec.normalize ? spec.normalize(clone) : clone;
  if (!normalized) return null;

  const transformed = applyTransforms(normalized, spec.transforms, doc);
  if (!transformed) return null;

  return transformed;

  // return spec.normalize ? spec.normalize(transformed) : transformed;
}

function applyTransforms(root: Element, transforms?: TransformSpec[], doc?: Document): Element | null {
  if (!transforms?.length) return root;

  const removeSelectors = transforms
    .filter((f): f is Extract<TransformSpec, { kind: 'remove'; }> => f.kind === 'remove')
    .flatMap((f) => f.selectors);

  const unwrapSelectors = transforms
    .filter((f): f is Extract<TransformSpec, { kind: 'unwrap'; }> => f.kind === 'unwrap')
    .flatMap((f) => f.selectors);

  const replacements = transforms
    .filter((f): f is Extract<TransformSpec, { kind: 'replace'; }> => f.kind === 'replace')
    .flatMap((f) => f.selectors.map((selector) => ({ selector, tag: f.tag })));

  const shouldRemove = (el: Element) => removeSelectors.some((sel) => el.matches(sel));
  const shouldUnwrap = (el: Element) => unwrapSelectors.some((sel) => el.matches(sel));
  // const shouldReplace = (el: Element) => replacements.some((r) => el.matches(r.selector));

  function getReplacementTag(el: Node): keyof HTMLElementTagNameMap | null {
    if (!isElement(el)) return null;
    const tag = replacements.find((r) => el.matches(r.selector))?.tag;
    return tag ?? null;
  }

  if (shouldRemove(root)) return null;

  function walk(node: Node): void {
    let child = node.firstChild;

    while (child) {
      const next = child.nextSibling;

      if (isElement(child) && shouldRemove(child)) {
        child.remove();
        child = next;
        continue;
      }

      if (isElement(child)) {
        walk(child);
      }

      if (child.parentNode !== node) {
        child = next;
        continue;
      }

      const tag = getReplacementTag(child);
      if (tag) {
        const newChild = h(tag, { __doc: doc }, ...Array.from(child.childNodes));
        child.replaceWith(newChild);
        child = newChild;
      }

      if (isElement(child) && shouldUnwrap(child)) {
        while (child.firstChild) {
          node.insertBefore(child.firstChild, child);
        }
        child.remove();
      }

      child = next;
    }
  }

  walk(root);

  const tag = getReplacementTag(root);
  if (tag) return h(tag, { __doc: doc }, ...Array.from(root.childNodes));

  if (shouldUnwrap(root)) return h('div', { __doc: doc }, ...Array.from(root.childNodes));

  return root;
}

function resolveRootElement(root: ParentNode): Element | null {
  if (isElement(root)) return root;
  if (isDoc(root)) return root.body; //root.documentElement;
  return null;
}
