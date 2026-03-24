import { type XletContexts } from '../settings';
import {
  findCommonAncestor, h, isDiv, isDoc, isElement, isInlineElement, isSpan,
  relevelHeadings,
  type HLevel,
} from './dom';
import { assertNever } from './typing';

export type SelectOneSpec =
  | { kind: 'match'; selectors: string[]; } // fallbacks
  | { kind: 'ancestor'; selectors: string[]; }
  | { kind: 'root'; };

export type SelectManySpec =
  | { kind: 'matchAll'; selectors: string[]; }
  | { kind: 'childrenOfMatch'; selectors: string[]; };

export type TransformSpec =
  | { kind: 'remove'; selectors: string[]; }
  | { kind: 'removeNextSiblings'; selectors: string[]; }
  | { kind: 'unwrap'; selectors: string[]; }
  | { kind: 'replace'; selectors: string[]; with: keyof HTMLElementTagNameMap; }
  | { kind: 'replaceFn'; selectors: string[]; fn: (el: Element, ctxs: XletContexts) => Element | null; }
  | { kind: 'wrapSection'; heading: { level: HLevel; text: string; }; relevelChildren?: boolean; }

type OneBlockSpec = {
  name: string;
  select: SelectOneSpec;
  fallbackSelects?: SelectOneSpec[];
  normalize?: (root: Element, ctxs: XletContexts) => Element | null;
  transforms?: TransformSpec[];

  fields?: never;
  itemFn?: never;
  itemsFn?: never;
};

type ManyBlockSpec = {
  name: string;
  select: SelectManySpec;
  fallbackSelects?: SelectManySpec[];
  fields?: BlockSpec[];
  itemFn?: (fields: (Element | null)[], root: Element, ctxs: XletContexts) => Element | null;
  itemsFn?: (items: Element[], ctxs: XletContexts) => Element | null;
  transforms?: TransformSpec[];

  normalize?: never;
};

export type BlockSpec = OneBlockSpec | ManyBlockSpec;

export function extractBlocks(root: ParentNode, specs: BlockSpec[], ctxs: XletContexts): (Element | null)[] {
  const blocks: (Element | null)[] = [];
  for (const spec of specs) {
    blocks.push(extractBlock(root, spec, ctxs));
  }
  return blocks;
}

function isOneBlockSpec(spec: BlockSpec): spec is OneBlockSpec {
  return spec.select.kind === 'match' || spec.select.kind === 'ancestor' || spec.select.kind === 'root';
}

function extractBlock(root: ParentNode, spec: BlockSpec, ctxs: XletContexts): Element | null {
  const block = isOneBlockSpec(spec)
    ? extractOne(root, spec, ctxs)
    : extractMany(root, spec, ctxs);

  if (!block) return null;

  const transformed = applyTransforms(block, spec.transforms ?? [], ctxs);
  if (!transformed) return null;

  return clean(transformed);
}

function extractOne(root: ParentNode, spec: OneBlockSpec, ctxs: XletContexts): Element | null {
  const selects = [spec.select, ...(spec.fallbackSelects ?? [])];

  let found: Element | null = null;
  for (const select of selects) {
    found = selectOne(root, select);
    if (found) break;
  }
  if (!found) return null;

  const clone = found.cloneNode(true);
  if (!isElement(clone)) return null;

  return spec.normalize ? spec.normalize(clone, ctxs) : clone;
}

function selectOne(root: ParentNode, select: SelectOneSpec): Element | null {
  switch (select.kind) {
    case 'match': {
      for (const selector of select.selectors) {
        const el = root.querySelector(selector);
        if (el) return el;
      }
      return null;
    }
    case 'ancestor':
      return findCommonAncestor(root, select.selectors);
    case 'root':
      return resolveRootElement(root);
    default:
      assertNever(select);
  }
}

function extractMany(root: ParentNode, spec: ManyBlockSpec, ctxs: XletContexts): Element | null {
  const selects = [spec.select, ...(spec.fallbackSelects ?? [])];

  let matches: Element[] = [];
  for (const select of selects) {
    matches = selectMany(root, select);
    if (matches.length) break;
  }

  if (!matches.length) return null;

  const fieldSpecs = spec.fields ?? [{ name: 'item', select: { kind: 'root' } }];
  const chooseWrapper = (nodes: (Element | null)[]): 'span' | 'div' =>
    nodes.some((n) => n && !isInlineElement(n)) ? 'div' : 'span';
  const itemFn = spec.itemFn ?? ((fields) => fields.some(Boolean) ? h(chooseWrapper(fields), {}, ...fields) : null);
  const itemsFn = spec.itemsFn ?? ((els) => h(chooseWrapper(els), {}, ...els));

  const items: Element[] = [];

  for (const match of matches) {
    const fields = extractBlocks(match, fieldSpecs, ctxs);
    const item = itemFn(fields, match, ctxs);
    if (item) items.push(item);
  }

  if (!items.length) return null;

  return itemsFn(items, ctxs);
}

function selectMany(root: ParentNode, select: SelectManySpec): Element[] {
  switch (select.kind) {
    case 'matchAll': {
      for (const selector of select.selectors) {
        const matches = [...root.querySelectorAll(selector)];
        if (matches.length) return matches;
      }
      return [];
    }
    case 'childrenOfMatch': {
      for (const selector of select.selectors) {
        const el = root.querySelector(selector);
        if (el) return [...el.children];
      }
      return [];
    }
    default:
      assertNever(select);
  }
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

  const wrapSpecs = transforms
    .filter((f): f is Extract<TransformSpec, { kind: 'wrapSection'; }> => f.kind === 'wrapSection');

  const shouldRemove = (el: Element) => removeSelectors.some((sel) => el.matches(sel));
  const shouldRemoveNextSiblings = (el: Element) => removeNextSiblingSelectors.some((sel) => el.matches(sel));
  const shouldUnwrap = (el: Element) => unwrapSelectors.some((sel) => el.matches(sel));

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

  const hasContent = root.children.length > 0 || !!root.textContent?.trim();
  if (wrapSpecs.length && hasContent) {
    let section: Element = root;
    for (const wrapSpec of wrapSpecs) {
      if (wrapSpec.relevelChildren) {
        relevelHeadings(section, Math.min(wrapSpec.heading.level + 1, 6) as HLevel);
      }
      section = h('section', {}, h(`h${wrapSpec.heading.level}`, {}, wrapSpec.heading.text), section);
    }
    return section;
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


