// test/fix/wiki.test.ts
import { describe, it, expect } from 'vitest';
import { extractFromDoc, type WikiResult, WikiNode } from '../../src/wiki';
import { setupDom } from '../utils/test-utils';
import { join } from 'node:path';
import { BaseSidecar, loadFixtures } from './fix';

// Boot JSDOM globals
setupDom();

// Fields that survive serialize()
type SKeys = 'title' | 'level' | 'sectionNum' | 'htmlStr' | 'md' | 'raw';

type WikiNodePojo = Partial<Pick<WikiNode, SKeys>> & {
  html?: null;
  children?: WikiNodePojo[];
};

type WikiExpect = Partial<Omit<WikiResult, 'data'>> & { data?: WikiNodePojo | null; };

export type WikiSidecar = BaseSidecar<WikiExpect>;

const fixturesDir = join(__dirname, 'fixtures', 'wiki');
const allCases = await loadFixtures<WikiExpect>(fixturesDir);

describe('wiki: extractFromDoc', () => {
  for (const f of allCases) {
    it(f.name, () => {
      const r = extractFromDoc(f.dom);
      expect(r).toBeDefined();
      if (!r) return;

      const e = f.expect;

      // Base/Raw URLs (exact if provided)
      if (e.baseUrl !== undefined) expect(r.baseUrl).toBe(e.baseUrl);
      if (e.rawUrl  !== undefined) expect(r.rawUrl).toBe(e.rawUrl);

      // Tree comparison (partial; only fields present in sidecar are asserted)
      if ('data' in e) {
        compareNode(r.data, e.data);
      }
    });
  }
});

/** Compare only fields provided by `expected`; recurse children positionally. */
function compareNode(actual: WikiResult['data'], expected: WikiNodePojo | null | undefined): void {
  if (expected === undefined) return; // nothing to assert

  if (expected === null) {            // explicitly expecting no tree
    expect(actual).toBeNull();
    return;
  }

  // otherwise we expect an actual node
  expect(actual).not.toBeNull();
  if (!actual) return;

  // Scalars (assert only if provided)
  if (expected.title !== undefined)      expect(actual.title).toContain(expected.title);
  if (expected.level !== undefined)      expect(actual.level).toBe(expected.level);
  if (expected.sectionNum !== undefined) expect(actual.sectionNum).toBe(expected.sectionNum);
  if (expected.htmlStr !== undefined)    expect(actual.htmlStr).toContain(expected.htmlStr ?? '');
  if (expected.md !== undefined)         expect(actual.md).toContain(expected.md);
  if (expected.raw !== undefined)        expect(actual.raw).toContain(expected.raw);

  // Children
  expect(Array.isArray(actual.children)).toBe(true);

  const expKids = expected.children ?? [];
  for (let i = 0; i < expKids.length; i++) {
    compareNode(actual.children[i] ?? null, expKids[i]);
  }
}
