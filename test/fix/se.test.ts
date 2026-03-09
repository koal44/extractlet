import { describe, it, expect } from 'vitest';
import { createSePage, extractFromDoc } from '../../src/sites/se';
import { setupDom } from '../utils/test-utils';
import { join } from 'node:path';
import { loadFixtures, syncMdSpec } from './fix';
import { getCopyText } from '../../src/xlet-page';

// Boot JSDOM globals
setupDom();

const fixturesDir = join(__dirname, 'fixtures', 'stackexchange');
const allCases = await loadFixtures(fixturesDir);

describe('stackexchange: extractFromDoc', () => {
  for (const f of allCases) {
    it(f.name, async () => {
      if (f.test) await f.test(f.dom);
      const r = extractFromDoc(f.dom, { html: { mathView: 'tex' } });
      expect(r).toBeDefined();
      if (!r) return; // narrow for TS

      if (f.specMd) {
        const xletPage = createSePage(r, { viewIdx: 0 }, f.now);
        const md = getCopyText(xletPage.root, xletPage);
        syncMdSpec(fixturesDir, f.name, f.specMd, md);
        expect(md).toBe(f.specMd);
      }
    });
  }
});
