import { type XletContexts } from '../settings';
import {
  findCommonAncestor, h, isDiv, isDoc, isElement, isInlineElement, isSpan,
} from './dom';

export type SelectSpec =
  | { kind: 'match'; selectors: string[]; } // fallbacks
  | { kind: 'ancestor'; selectors: string[]; }
  | { kind: 'root'; };

export type TransformSpec =
  | { kind: 'remove'; selectors: string[]; }
  | { kind: 'removeNextSiblings'; selectors: string[]; }
  | { kind: 'unwrap'; selectors: string[]; }
  | { kind: 'replace'; selectors: string[]; with: keyof HTMLElementTagNameMap; }
  | { kind: 'replaceFn'; selectors: string[]; fn: (el: Element, ctxs: XletContexts) => Element | null; }

export type BlockSpec = {
  name: string;
  select?: SelectSpec;
  transforms?: TransformSpec[];
  normalize?: (root: Element, ctxs: XletContexts) => Element | null;
};

export type ManySelectSpec =
  | { kind: 'matchAll'; selectors: string[]; }  // fallbacks
  | { kind: 'childrenOfMatch'; selectors: string[]; };

export type ManySpec = {
  select: ManySelectSpec;
  transforms?: TransformSpec[];
  normalize?: (root: Element, ctxs: XletContexts) => Element | null;
};

export function extractBlocks(root: ParentNode, specs: BlockSpec[], ctxs: XletContexts): (Element | null)[] {
  const blocks: (Element | null)[] = [];
  for (const spec of specs) {
    blocks.push(extractBlock(root, spec, ctxs));
  }
  return blocks;
}

export function extractMany(root: ParentNode, spec: ManySpec, ctxs: XletContexts): Element[] {
  let matches: Element[] = [];
  switch (spec.select.kind) {
    case 'matchAll': {
      for (const selector of spec.select.selectors) {
        matches = [...root.querySelectorAll(selector)];
        if (matches.length > 0) break;
      }
      break;
    }
    case 'childrenOfMatch': {
      for (const selector of spec.select.selectors) {
        const el = root.querySelector(selector);
        if (el) {
          matches = [...el.children];
          break;
        }
      }
      break;
    }
  }

  const out: Element[] = [];
  for (const match of matches) {
    const item = extractBlock(
      match,
      {
        name: `${spec.select.kind}-item`,
        select: { kind: 'root' },
        transforms: spec.transforms,
        normalize: spec.normalize,
      },
      ctxs,
    );

    if (item) out.push(item);
  }
  return out;
}

function extractBlock(root: ParentNode, spec: BlockSpec, ctxs: XletContexts): Element | null {
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
  } else if (spec.select?.kind === 'root') {
    found = resolveRootElement(root);
  } else {
    found = resolveRootElement(root);
  }

  if (!found) return null;

  const clone = found.cloneNode(true);
  if (!isElement(clone)) return null;

  const normalized = spec.normalize ? spec.normalize(clone, ctxs) : clone;
  if (!normalized) return null;

  const transformed = applyTransforms(normalized, spec.transforms ?? [], ctxs);
  if (!transformed) return null;

  const cleaned = clean(transformed);
  return cleaned;
}

function applyTransforms(root: Element, transforms: TransformSpec[], ctxs: XletContexts): Element | null {
  if (!transforms.length) return root;

  const removeSelectors = transforms
    .filter((f): f is Extract<TransformSpec, { kind: 'remove'; }> => f.kind === 'remove')
    .flatMap((f) => f.selectors);

  const removeNextSiblingSelectors = transforms
    .filter((f): f is Extract<TransformSpec, { kind: 'removeNextSiblings'; }> => f.kind === 'removeNextSiblings')
    .flatMap((f) => f.selectors);

  const unwrapSelectors = transforms
    .filter((f): f is Extract<TransformSpec, { kind: 'unwrap'; }> => f.kind === 'unwrap')
    .flatMap((f) => f.selectors);

  const replacements = transforms
    .filter((f): f is Extract<TransformSpec, { kind: 'replace'; }> => f.kind === 'replace')
    .flatMap((f) => f.selectors.map((selector) => ({ selector, tag: f.with })));

  const replaceFns = transforms
    .filter((f): f is Extract<TransformSpec, { kind: 'replaceFn'; }> => f.kind === 'replaceFn')
    .flatMap((f) => f.selectors.map((selector) => ({ selector, fn: f.fn })));

  const shouldRemove = (el: Element) => removeSelectors.some((sel) => el.matches(sel));
  const shouldRemoveNextSiblings = (el: Element) => removeNextSiblingSelectors.some((sel) => el.matches(sel));
  const shouldUnwrap = (el: Element) => unwrapSelectors.some((sel) => el.matches(sel));
  // const shouldReplace = (el: Element) => replacements.some((r) => el.matches(r.selector));

  function getReplacementTag(n: Node): keyof HTMLElementTagNameMap | null {
    if (!isElement(n)) return null;
    const tag = replacements.find((r) => n.matches(r.selector))?.tag;
    return tag ?? null;
  }

  function getReplacementFn(n: Node): ((el: Element, ctxs: XletContexts) => Element | null) | null {
    if (!isElement(n)) return null;
    const fn = replaceFns.find((r) => n.matches(r.selector))?.fn;
    return fn ?? null;
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

      if (isElement(child) && shouldRemoveNextSiblings(child)) {
        let cur = child.nextSibling;
        while (cur) {
          const next = cur.nextSibling;
          cur.parentNode?.removeChild(cur);
          cur = next;
        }
      }

      if (isElement(child)) {
        walk(child);
      }

      if (child.parentNode !== node) {
        child = next;
        continue;
      }

      const replaceFn = getReplacementFn(child);
      if (isElement(child) && replaceFn) {
        const newChild = replaceFn(child, ctxs);
        if (newChild) {
          child.replaceWith(newChild);
          child = newChild;
        } else {
          child.remove();
          child = next;
          continue;
        }
      }

      const tag = getReplacementTag(child);
      if (tag) {
        const newChild = h(tag, {}, ...child.childNodes);
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

  const replaceFn = getReplacementFn(root);
  if (replaceFn) return replaceFn(root, ctxs);

  const tag = getReplacementTag(root);
  if (tag) return h(tag, {}, ...root.childNodes);

  if (shouldUnwrap(root)) {
    const wrapper = isInlineElement(root) ? 'span' : 'div';
    return h(wrapper, {}, ...root.childNodes);
  }

  return root;
}

function resolveRootElement(root: ParentNode): Element | null {
  if (isElement(root)) return root;
  if (isDoc(root)) return root.body; //root.documentElement;
  return null;
}

function clean(root: Element): Element | null {
  function isDisposable(node: Node): boolean {
    return (isDiv(node) || isSpan(node)) && node.children.length === 0 && !(node.textContent);
  }

  function walk(node: Node): void {
    let child = node.firstChild;
    while (child) {
      const next = child.nextSibling;
      if (isElement(child)) {
        walk(child);
        if (isDisposable(child)) child.remove();
      }
      child = next;
    }
  }

  walk(root);
  return isDisposable(root) ? null : root;
}
