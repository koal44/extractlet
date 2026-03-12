import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import { setupDom } from '../utils/test-utils';
import { getCopyText } from '../../src/xlet-page';
import { createHubPage } from '../../src/sites/hub';
import { createSePage } from '../../src/sites/se';
import { createWikiPage } from '../../src/sites/wiki';
import { loadFixtures, syncMdSpec } from './fix';
import type { CreatePage } from '../../src/snapshot-loader';

// defines global.document, global.window, etc
setupDom();

type SiteSpec = {
  key: string;
  createPage: CreatePage;
};

const sites: SiteSpec[] = [
  {
    key: 'github',
    createPage: createHubPage,
  },
  {
    key: 'stackexchange',
    createPage: createSePage,
  },
  {
    key: 'wiki',
    createPage: createWikiPage,
  },
];

for (const site of sites) {
  const fixturesDir = join(__dirname, 'fixtures', site.key);
  const allCases = await loadFixtures(fixturesDir);

  describe(`${site.key} fixtures`, () => {
    for (const f of allCases) {
      it(f.name, async () => {
        if (f.test) await f.test(f.dom);
        if (f.specMd === undefined) return;

        const page = await site.createPage({
          sourceDoc: f.dom,
          ctxs: { md: { now: f.now } },
          state: { viewIdx: 1 },
        });

        if (!page) throw new Error(`${site.key}:${f.name}: createPage returned no data`);

        const md = getCopyText(page.root, page);
        syncMdSpec(fixturesDir, f.name, f.specMd, md);
        expect(md).toBe(f.specMd);
      });
    }
  });
}
