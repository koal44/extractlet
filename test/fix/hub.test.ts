import { describe, it, expect } from 'vitest';
import { createHubPage, extractFromDoc } from '../../src/sites/hub';
import { setupDom } from '../utils/test-utils';
import { join } from 'node:path';
import { loadFixtures, syncMdSpec } from './fix';
import { getCopyText } from '../../src/xlet-page';

// defines global.document, global.window, etc
setupDom();

const fixturesDir = join(__dirname, 'fixtures', 'github');
const allCases = await loadFixtures(fixturesDir);

describe('github: extractFromDoc', () => {
  for (const f of allCases) {
    it(f.name, async () => {
      if (f.test) await f.test(f.dom);
      const r = extractFromDoc(f.dom, { md: { now: f.now } });
      expect(r).toBeDefined();
      if (!r) return; // for TS

      if (f.specMd) {
        const xletPage = createHubPage(r, { viewIdx: 1 }, f.now);
        const md = getCopyText(xletPage.root, xletPage);
        syncMdSpec(fixturesDir, f.name, f.specMd, md);
        expect(md).toBe(f.specMd);
      }

    });
  }
});
