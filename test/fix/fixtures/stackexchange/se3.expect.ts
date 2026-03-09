import { expect } from 'vitest';
import type { Sidecar } from '../../fix';
import { extractFromDoc } from '../../../../src/sites/se';

export default {
  baseUrl: 'https://math.stackexchange.com/questions/2793701/lambda-kv-is-spanned-by-a-basis-mathcalb?rq=1',
  now: new Date('2026-03-09T00:00:00Z'),
  test: (doc) => {
    const clone = doc.cloneNode(true) as Document; // avoid mutating original doc for other tests (including md specs)
    clone.querySelector('head > meta[property="og:title"]')?.remove();

    let r = extractFromDoc(clone, { md: { mathFence: 'bracket' } });
    expect(r?.title).toBe('\\({\\Lambda}_k(V)\\) is spanned by a basis \\(\\mathcal{B}\\)');

    r = extractFromDoc(clone, { md: { mathFence: 'dollar' } });
    expect(r?.title).toBe('${\\Lambda}_k(V)$ is spanned by a basis $\\mathcal{B}$');
  },
} satisfies Sidecar;
