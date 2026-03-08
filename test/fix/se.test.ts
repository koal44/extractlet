import { describe, it, expect } from 'vitest';
import { createSePage, extractFromDoc, type SEResult } from '../../src/sites/se';
import { setupDom } from '../utils/test-utils';
import { join } from 'node:path';
import type { BaseSidecar } from './fix';
import { loadFixtures } from './fix';
import fs from 'node:fs';
import { getCopyText } from '../../src/xlet-page';

// Boot JSDOM globals
setupDom();

type SEExpect = Partial<SEResult> & {
  totalPosts?: number;
};
export type SESidecar = BaseSidecar<SEExpect>;

function syncMdSpec(dir: string, name: string, expected: string, actual: string): void {
  const path = join(dir, `${name}.spec.new.md`);

  if (expected !== actual) {
    fs.writeFileSync(path, actual, 'utf8');
    // eslint-disable-next-line no-restricted-properties
    console.log(`[fixtures] ${name}: spec mismatch; wrote ${path}. Review and replace '${name}.spec.md' if expected.`);
    return;
  }

  if (fs.existsSync(path)) fs.unlinkSync(path);
}

const fixturesDir = join(__dirname, 'fixtures', 'stackexchange');
const allCases = await loadFixtures<SEExpect>(fixturesDir);

describe('stackexchange: extractFromDoc', () => {
  for (const f of allCases) {
    it(f.name, async () => {
      if (f.test) await f.test(f.dom);
      const r = extractFromDoc(f.dom, { html: { mathView: 'tex' } });
      expect(r).toBeDefined();
      if (!r) return; // narrow for TS

      const e = f.expect;

      if (e.permalink) expect(r.permalink).toBe(e.permalink);

      // posts length: prefer explicit totalPosts, else expected.posts length
      if (e.totalPosts !== undefined) expect(r.posts.length).toBe(e.totalPosts);
      else if (e.posts) expect(r.posts.length).toBe(e.posts.length);

      // walk expected posts (only compare what was provided)
      (e.posts ?? []).forEach((ep, i) => {
        const rp = r.posts[i];
        expect(rp).toBeDefined();

        expect(rp.vote).toBe(ep.vote);

        if (ep.bodyHtml) expect(rp.bodyHtml).toContain(ep.bodyHtml);
        if (ep.bodyMd)   expect(rp.bodyMd).toContain(ep.bodyMd);

        // length check only if sidecar provided contributors array
        expect(Array.isArray(rp.contributors)).toBe(true);
        // compare contributor scalar fields where present
        ep.contributors.forEach((ec, j) => {
          const rc = rp.contributors[j];
          expect(rc.name).toBe(ec.name);
          expect(rc.userSlug).toBe(ec.userSlug);
          expect(rc.userId).toBe(ec.userId);
          expect(rc.contributorType).toBe(ec.contributorType);
          expect(rc.timestamp).toBe(ec.timestamp);
          expect(rc.isOwner).toBe(ec.isOwner);
        });

        expect(Array.isArray(rp.comments)).toBe(true);
        ep.comments.forEach((ec, k) => {
          const rc = rp.comments[k];
          expect(rc.vote).toBe(ec.vote);
          expect(rc.bodyHtml).toContain(ec.bodyHtml);
          expect(rc.bodyMd).toContain(ec.bodyMd);

          ec.contributors.forEach((ecc, m) => {
            const rcc = rc.contributors[m];
            expect(rcc.name).toBe(ecc.name);
            expect(rcc.userSlug).toBe(ecc.userSlug);
            expect(rcc.userId).toBe(ecc.userId);
            expect(rcc.contributorType).toBe(ecc.contributorType);
            expect(rcc.timestamp).toBe(ecc.timestamp);
            expect(rcc.isOwner).toBe(ecc.isOwner);
          });
        });

        if (f.specMd) {
          const xletPage = createSePage(r, { viewIdx: 0 }, f.now);
          const md = getCopyText(xletPage.root, xletPage);
          syncMdSpec(fixturesDir, f.name, f.specMd, md);
          expect(md).toBe(f.specMd);
        }
      });
    });
  }
});
