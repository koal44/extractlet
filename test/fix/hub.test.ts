import { describe, it, expect } from 'vitest';
import type { HubResult } from '../../src/sites/hub';
import { createHubPage, extractFromDoc } from '../../src/sites/hub';
import { setupDom } from '../utils/test-utils';
import { join } from 'node:path';
import type { BaseSidecar } from './fix';
import { loadFixtures } from './fix';
import fs from 'node:fs';
import { getCopyText } from '../../src/xlet-page';

// defines global.document, global.window, etc
setupDom();

type HubExpect = Partial<HubResult> & { totalPosts?: number; };
export type HubSidecar = BaseSidecar<HubExpect>;

const fixturesDir = join(__dirname, 'fixtures', 'github');
const allCases = await loadFixtures<HubExpect>(fixturesDir);

// emit a review artifact only while the spec is failing
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

describe('github: extractFromDoc', () => {
  for (const f of allCases) {
    it(f.name, async () => {
      if (f.test) await f.test(f.dom);
      const r = extractFromDoc(f.dom, { md: { now: f.now } });
      expect(r).toBeDefined();
      if (!r) return; // for TS
      const e = f.expect;

      if (e.permalink) expect(r.permalink).toBe(e.permalink);
      if (e.title) expect(r.title).toContain(e.title);
      if (e.totalPosts !== undefined) expect(r.posts.length).toBe(e.totalPosts);

      (e.posts ?? []).forEach((ep, i) => {
        const rp = r.posts[i];
        expect(rp).toBeDefined();
        const rpc = rp.contributor;
        const epc = ep.contributor;
        if (epc?.author) expect(rpc?.author ?? '').toContain(epc.author);
        if (epc?.timestamp) expect(rpc?.timestamp ?? '').toBe(epc.timestamp);
        if (ep.postId) expect((rp.postId ?? '')).toBe(ep.postId);
        if (ep.bodyHtml) expect((rp.bodyHtml ?? '')).toContain(ep.bodyHtml);
        if (ep.bodyMd) expect((rp.bodyMd ?? '')).toContain(ep.bodyMd);
      });

      if (f.specMd) {
        const xletPage = createHubPage(r, { viewIdx: 1 }, f.now);
        const md = getCopyText(xletPage.root, xletPage);
        syncMdSpec(fixturesDir, f.name, f.specMd, md);
        expect(md).toBe(f.specMd);
      }

    });
  }
});
