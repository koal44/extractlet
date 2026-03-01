import { expect } from 'vitest';
import { extractFromDoc } from '../../../../src/sites/hub';
import type { HubSidecar } from '../../hub.test';

export default {
  baseUrl: 'https://github.com/microsoft/vscode/pull/295817',
  expect: {
    permalink: 'https://github.com/microsoft/vscode/pull/295817',
  },
  test: (doc: Document) => {
    const r = extractFromDoc(doc);
    expect(r).toBeDefined();
    if (!r) return; // for TS

    // const ids = r.posts.map((p) => p.postId ?? '');
    // console.log(
    //   r.posts.map((p, i) => ({
    //     i,
    //     postId: p.postId,
    //     author: p.contributor?.author,
    //     ts: p.contributor?.timestamp,
    //     bodyLen: p.bodyMd?.length ?? 0,
    //     preview: (p.bodyMd ?? '').slice(0, 80),
    //   }))
    // );

    // expect(r.posts.length).toBeGreaterThan(5);
    // expect(ids.some((id) => id.startsWith('pullrequestreview-'))).toBe(true);
  },
} satisfies HubSidecar;
