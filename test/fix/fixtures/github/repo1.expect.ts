import type { Sidecar } from '../../fix';
// import { expect } from 'vitest';
// import { extractFromDoc } from '../../../../src/sites/hub/repo';

export default {
  baseUrl: 'https://github.com/koal44/extractlet',
  now: new Date('2026-03-10T00:00:00Z'),
  // test: (doc: Document) => {
  //   const summary = extractFromDoc(doc);
  //   expect(summary).toBeDefined();
  //   expect(summary).toMatchObject({
  //     owner: 'koal44',
  //     name: 'extractlet',
  //     about: 'Browser extension that extracts GitHub, Stack Exchange, and MediaWiki pages into normalized Markdown',
  //   });
  // },
} satisfies Sidecar;
