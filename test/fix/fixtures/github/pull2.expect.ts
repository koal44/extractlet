import { expect } from 'vitest';
import { extractFromDoc } from '../../../../src/sites/hub';
import type { Sidecar } from '../../fix';

export default {
  baseUrl: 'https://github.com/microsoft/vscode/pull/295817',
  now: new Date('2026-03-03T00:00:00Z'),
  test: (doc: Document) => {
    const r = extractFromDoc(doc);
    expect(r).toBeDefined();
    if (!r) return; // for TS

    // const posts = r.posts
    //   .map((p, i) => {
    //     const col = String(i).padStart(2, '0');
    //     const id = p.postId ?? '-';
    //     const author = p.contributor?.author ?? '-';
    //     const ts = p.contributor?.timestamp;
    //     const tsFmt = ts ? new Date(ts).toISOString().slice(0, 10) : '-';
    //     const len = p.bodyMd?.length ?? 0;
    //     const preview = (p.bodyMd ?? '-').replace(/\s+/g, ' ').slice(0, 40);
    //     return `${col} | ${id} | ${author} | ${tsFmt} | len=${len} | ${preview}`;
    //   });
    // for (let i = 0; i < 5; i++) posts.push('---');
    // // eslint-disable-next-line no-restricted-properties
    // console.log(`Posts:\n${posts.join('\n')}`);

    expect(r.posts.length).toBe(82);

    const ids = r.posts.map((p) => p.postId ?? '');
    expect(ids.some((id) => id.startsWith('pullrequestreview-'))).toBe(true);
  },
} satisfies Sidecar;
