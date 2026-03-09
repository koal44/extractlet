import { describe, it, expect } from 'vitest';
import { createWikiPage, extractFromDoc } from '../../src/sites/wiki';
import { setupDom } from '../utils/test-utils';
import { join } from 'node:path';
import { loadFixtures, syncMdSpec } from './fix';
import { getCopyText } from '../../src/xlet-page';

// Boot JSDOM globals
setupDom();

const fixturesDir = join(__dirname, 'fixtures', 'wiki');
const allCases = await loadFixtures(fixturesDir);

describe('wiki: extractFromDoc', () => {
  for (const f of allCases) {
    it(f.name, async () => {
      if (f.test) await f.test(f.dom);
      const r = extractFromDoc(f.dom);
      expect(r).toBeDefined();
      if (!r) return;

      if (f.specMd) {
        const page = await createWikiPage(r, { general: { fetchMissingContent: false } });
        if (!page) throw new Error('Failed to create page from wiki result');
        const md = getCopyText(page.root, page);
        syncMdSpec(fixturesDir, f.name, f.specMd, md);
        expect(md).toBe(f.specMd);
      }
    });
  }
});
