import { type XletContexts } from '../settings';
import {
  findCommonAncestor, h, isDiv, isDoc, isElement, isInlineElement, isSection, isSpan,
  isText, relevelHeadings, type HLevel,
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
  | {
    kind: 'replaceTemplate'; selectors: string[];
    with?: keyof HTMLElementTagNameMap; // default 'span'
    from?: string;  // default 'textContent'
    template?: string;  // default '{value} forks'
  }
  |
    {
      kind: 'replaceFn'; selectors: string[];
      fn: (el: Element, ctxs: XletContexts) => Element | null;
      transforms?: TransformSpec[];
    }
  | { kind: 'wrapSection'; heading: { level: HLevel; text: string; }; relevelChildren?: boolean; }
  | { kind: 'trim'; selectors: string[]; }
  | { kind: 'insertText'; selectors: string[]; text: string; where: InsertPosition; }
  | { kind: 'insertElement'; selectors: string[]; element: Element; where: InsertPosition; }
  | { kind: 'relevelHeadings';  selectors: string[]; level: HLevel; }

type OneBlockSpec = {
  name: string;
  select: SelectOneSpec;
  fallbackSelects?: SelectOneSpec[];
  normalize?: (root: Element, fields: (Element | null)[], ctxs: XletContexts) => Element | null;
  transforms?: TransformSpec[];
  fields?: BlockSpec[];

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

export function extractBlock(root: ParentNode, spec: BlockSpec, ctxs: XletContexts): Element | null {
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

  let fields: (Element | null)[] = [];
  if (spec.fields) {
    fields = extractBlocks(clone, spec.fields, ctxs);
  }

  return spec.normalize ? spec.normalize(clone, fields, ctxs)
    : fields.length ? h('section', {}, ...fields)
    : clone;
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

type MaybeResult<T> = { result: T | null; } | null;
type TransformResult = MaybeResult<Element>;

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

  const templateReplacements = transforms
    .filter((f): f is Extract<TransformSpec, { kind: 'replaceTemplate'; }> => f.kind === 'replaceTemplate')
    .flatMap((f) => f.selectors.map((selector) => ({ selector, spec: f })));

  const replaceFns = transforms
    .filter((f): f is Extract<TransformSpec, { kind: 'replaceFn'; }> => f.kind === 'replaceFn')
    .flatMap((f) => f.selectors.map((selector) => ({ selector, spec: f })));

  const wrapSpecs = transforms
    .filter((f): f is Extract<TransformSpec, { kind: 'wrapSection'; }> => f.kind === 'wrapSection');

  const relevelSpecs = transforms
    .filter((f): f is Extract<TransformSpec, { kind: 'relevelHeadings'; }> => f.kind === 'relevelHeadings')
    .flatMap((f) => f.selectors.map((selector) => ({ selector, level: f.level })));

  const trimSelectors = transforms
    .filter((f): f is Extract<TransformSpec, { kind: 'trim'; }> => f.kind === 'trim')
    .flatMap((f) => f.selectors);

  const insertTexts = transforms
    .filter((f): f is Extract<TransformSpec, { kind: 'insertText'; }> => f.kind === 'insertText')
    .flatMap((f) => f.selectors.map((selector) => ({ selector, where: f.where, text: f.text })));

  const insertElements = transforms
    .filter((f): f is Extract<TransformSpec, { kind: 'insertElement'; }> => f.kind === 'insertElement')
    .flatMap((f) => f.selectors.map((selector) => ({ selector, where: f.where, element: f.element })));

  const shouldRemove = (el: Element) => removeSelectors.some((sel) => el.matches(sel));
  const shouldRemoveNextSiblings = (el: Element) => removeNextSiblingSelectors.some((sel) => el.matches(sel));
  const shouldUnwrap = (el: Element) => unwrapSelectors.some((sel) => el.matches(sel));
  const shouldTrim = (el: Element) => trimSelectors.some((sel) => el.matches(sel));

  function getReplacementTag(n: Node | null): keyof HTMLElementTagNameMap | null {
    if (!isElement(n)) return null;
    const tag = replacements.find((r) => n.matches(r.selector))?.tag;
    return tag ?? null;
  }

  function templateReplace(n: Node | null): TransformResult {
    if (!isElement(n)) return null;

    const spec = templateReplacements.find((r) => n.matches(r.selector))?.spec;
    if (!spec) return null;

    const tag = spec.with ?? 'span';
    const attr = spec.from ?? 'textContent';
    const template = spec.template ?? '{value}';

    const raw = attr === 'textContent' ? n.textContent : n.getAttribute(attr);
    if (!raw) return { result: null };

    const value = raw.trim();
    const text = template
      .replaceAll('{value}', value)
      .replaceAll('{s}', value === '1' ? '' : 's');

    return { result: h(tag, {}, text) };
  }

  function getReplacementFn(n: Node | null): ((el: Element, ctxs: XletContexts) => Element | null) | null {
    if (!isElement(n)) return null;
    const replacement = replaceFns.find((r) => n.matches(r.selector))?.spec;
    if (!replacement) return null;
    const { fn, transforms = [] } = replacement;
    if (!transforms.length) return fn;
    return (el, ctxs) => {
      const res = fn(el, ctxs);
      return res ? applyTransforms(res, transforms, ctxs) : null;
    };
  }

  function getInsertTexts(n: Node | null): { where: InsertPosition; text: string; }[] {
    if (!isElement(n)) return [];
    return insertTexts.filter((r) => n.matches(r.selector)).map(({ where, text }) => ({ where, text }));
  }

  function getInsertElements(n: Node | null): { where: InsertPosition; element: Element; }[] {
    if (!isElement(n)) return [];
    return insertElements.filter((r) => n.matches(r.selector)).map(({ where, element }) => ({ where, element }));
  }

  function getRelevel(n: Node | null): HLevel | null {
    if (!isElement(n)) return null;
    return relevelSpecs.find((r) => n.matches(r.selector))?.level ?? null;
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

      const insertTexts = getInsertTexts(child);
      if (insertTexts.length && isElement(child)) {
        for (const { where, text } of insertTexts) {
          child.insertAdjacentText(where, text);
        }
      }

      const insertElements = getInsertElements(child);
      if (insertElements.length && isElement(child)) {
        for (const { where, element } of insertElements) {
          child.insertAdjacentElement(where, element);
        }
      }

      const relevel = getRelevel(child);
      if (relevel && isElement(child)) {
        relevelHeadings(child, relevel);
      }

      if (isElement(child) && shouldTrim(child)) {
        trimWsBoundary(child);
      }

      const tr = templateReplace(child);
      if (tr) {
        if (tr.result) child.replaceWith(tr.result);
        else child.remove();
        child = tr.result;
      }

      const tag = getReplacementTag(child);
      if (child && tag) {
        const newChild = h(tag, {}, ...child.childNodes);
        child.replaceWith(newChild);
        child = newChild;
      }

      if (isElement(child) && shouldUnwrap(child)) {
        trimDirectWsBoundary(child);
        while (child.firstChild) {
          node.insertBefore(child.firstChild, child);
        }
        child.remove();
      }

      child = next;
    }
  }

  walk(root);

  let out: Element | null = root;

  // handcrafted replacement first
  const rootReplaceFn = getReplacementFn(out);
  if (rootReplaceFn) out = rootReplaceFn(out, ctxs);
  if (!out) return null;

  // inner-position inserts only
  for (const { where, text } of getInsertTexts(out)) {
    if (where === 'afterbegin' || where === 'beforeend') {
      out.insertAdjacentText(where, text);
    }
  }
  for (const { where, element } of getInsertElements(out)) {
    if (where === 'afterbegin' || where === 'beforeend') {
      out.insertAdjacentElement(where, element);
    }
  }

  // template-based replacement next (which may change the root)
  const tr = templateReplace(out);
  if (tr) {
    if (tr.result) out = tr.result;
    else return null;
  }

  // simpler tag replacement
  const replacementTag = getReplacementTag(out);
  if (replacementTag) {
    out = h(replacementTag, {}, ...out.childNodes);
  }

  // unwrap after replace
  if (shouldUnwrap(out)) {
    const wrapper = isInlineElement(out) ? 'span' : 'div';
    out = h(wrapper, {}, ...out.childNodes);
  }

  // trim the final surviving root
  if (shouldTrim(out)) {
    trimWsBoundary(out);
  }

  // relevel the final surviving root
  const rootRelevel = getRelevel(out);
  if (rootRelevel) {
    relevelHeadings(out, rootRelevel);
  }

  // final outer wrapper
  const hasContent = out.children.length > 0 || !!out.textContent?.trim();
  if (wrapSpecs.length && hasContent) {
    let section: Element = out;
    for (const wrapSpec of wrapSpecs) {
      if (wrapSpec.relevelChildren) {
        relevelHeadings(section, Math.min(wrapSpec.heading.level + 1, 6) as HLevel);
      }
      section = h('section', {}, h(`h${wrapSpec.heading.level}`, {}, wrapSpec.heading.text), section);
    }
    out = section;
  }

  return out;
}

function resolveRootElement(root: ParentNode): Element | null {
  if (isElement(root)) return root;
  if (isDoc(root)) return root.body; //root.documentElement;
  return null;
}

function clean(root: Element): Element | null {
  function isDisposable(node: Node): boolean {
    return (isDiv(node) || isSpan(node) || isSection(node)) && node.children.length === 0 && !(node.textContent);
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

function trimWsBoundary(root: Element): void {
  const trim = (side: 'firstChild' | 'lastChild', fn: 'trimStart' | 'trimEnd') => {
    for (let cur: Node | null = root; ;) {
      const child: ChildNode | null = side === 'firstChild' ? cur.firstChild : cur.lastChild;
      if (!child) return;

      if (child.nodeType !== Node.TEXT_NODE) {
        cur = child;
        continue;
      }

      const text = (child.textContent ?? '')[fn]();
      if (text) {
        child.textContent = text;
        return;
      }

      child.remove();
    }
  };

  trim('firstChild', 'trimStart');
  trim('lastChild', 'trimEnd');
}



function trimDirectWsBoundary(root: Element): void {
  const trim = (node: ChildNode | null, side: 'start' | 'end'): void => {
    if (!node || !isText(node)) return;

    const text = node.textContent ?? '';
    const next = side === 'start' ? text.trimStart() : text.trimEnd();

    if (next) node.textContent = next;
    else node.remove();
  };

  trim(root.firstChild, 'start');
  trim(root.lastChild, 'end');
}
