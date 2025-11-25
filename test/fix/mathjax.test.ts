import fs from 'fs';
import { describe, it, expect, beforeAll } from 'vitest';
import type { MathView } from '../../src/core';
import { toHtml, toMd } from '../../src/core';
import { readHtmlFile } from './fix';
import { assertNodeEqual, setupDom } from '../utils/test-utils';

setupDom();

type MjxVersion = '2.1.0' | '2.7.9' | '3.2.2' | '4.0.0';
type MjxRenderer = 'chtml' | 'htmlcss' | 'mathml' | 'plainsource' | 'preview' | 'svg';

const SUITES = [
  { version: '2.1.0', renderers: ['htmlcss', 'mathml', 'svg'] },
  { version: '2.7.9', renderers: ['chtml', 'htmlcss', 'mathml', 'plainsource', 'preview', 'svg'] },
  { version: '3.2.2', renderers: ['chtml', 'svg'] },
  { version: '4.0.0', renderers: ['chtml', 'svg'] },
] as const satisfies Array<{ version: MjxVersion; renderers: MjxRenderer[]; }>;

type DebugSingle =
  {
    enabled: boolean;
    version: MjxVersion;
    renderer: MjxRenderer;
    converter: 'toMd' | 'toHtml';
    view?: string;
  } | false;

const dbg: DebugSingle = {
  enabled: true,
  version: '2.1.0',
  renderer: 'htmlcss',
  converter: 'toHtml',
  view: 'tex',
};
dbg.enabled = false;

const FIXTURE_ROOT = 'test/fix/fixtures/mathjax';
const VIEWS: MathView[] = ['tex', 'mathml', 'svg'] as const;

for (const { version, renderers } of SUITES) {
  for (const renderer of renderers) {
    const baseName = `v${version}-${renderer}`;
    const htmlPath = `${FIXTURE_ROOT}/${baseName}.html`;
    const mdPath = `${FIXTURE_ROOT}/${baseName}.expect.md`;

    describe(`MathJax v${version} (${renderer})`, () => {
      let doc: Document;
      let root: Element;

      beforeAll(() => {
        doc = readHtmlFile(htmlPath, {
          baseUrl: `https://example.com/mathjax-v${version}-${renderer}`,
        });

        root = doc.body;
      });

      // --- Markdown golden test ---
      if (!dbg.enabled || (dbg.version === version && dbg.renderer === renderer && dbg.converter === 'toMd')) {
        it('toMd() matches .expect.md golden file', () => {
          const expectedMd = fs.readFileSync(mdPath, 'utf8');
          const actualMd = toMd(root, { mathFence: 'bracket' });

          expect(actualMd).toBe(expectedMd);
        });
      }

      // --- HTML golden tests for each MathView ---
      for (const view of VIEWS) {
        const expectHtmlPath = `${FIXTURE_ROOT}/${baseName}-${view}.expect.html`;
        if (!fs.existsSync(expectHtmlPath)) continue;

        const label = `toHtml(view: '${view}') matches ${baseName}-${view}.expect.html`;

        if (dbg.enabled && !(dbg.version === version && dbg.renderer === renderer && dbg.converter === 'toHtml' && dbg.view === view))
        { continue; }

        it(label, () => {
          const expected = readHtmlFile(expectHtmlPath).body;
          const result = toHtml(root, { mathView: view }) as HTMLElement | null;

          if (!result) throw new Error(`toHtml() returned null for v${version}-${renderer} (${view})`);

          assertNodeEqual(result, expected, { dropWsNodes: false, trimBodyEnd: true });
        });
      }
    });
  }
}
