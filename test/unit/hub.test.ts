import { describe, expect, it, test } from 'vitest';
import { strictEqual } from 'node:assert';
import { toMd } from '../../src/sites/hub';
import { assertNodeEqual, el, setupDom } from '../utils/test-utils';
import { toHtml } from '../../src/sites/hub';

setupDom();

test('toMd converts GitHub comment-body block into expected Markdown', () => {
  const html = `
<div><td class="d-block comment-body markdown-body js-comment-body">
  <p dir="auto">Add non-overlapping ANTLR grammar examples for runtime tests</p>
  <p dir="auto">This commit introduces a set of nine non-obvious, non-overlapping grammars<br>
  under <code class="notranslate">runtime-testsuite/test/org/antlr/v4/test/runtime/antlr_grammars/</code><br>
  to demonstrate and validate diverse ANTLR 4 parsing features.</p>
  <p dir="auto">Included grammars:</p>
  <ul dir="auto">
    <li>Arithmetic.g4 — arithmetic expression parsing</li>
    <li>BooleanExpr.g4 — boolean and logical expressions</li>
    <li>CSVFlexible.g4 — flexible CSV handling with optional quotes</li>
    <li>JSONMini.g4 — minimal JSON subset parser</li>
    <li>MiniConfig.g4 — simple key-value configuration format</li>
    <li>MiniMarkdown.g4 — lightweight markdown-like parser</li>
    <li>MiniQuery.g4 — SQL-inspired query syntax</li>
    <li>UnitExpr.g4 — unit-based mathematical expressions</li>
    <li></li>
  </ul>
  <p dir="auto">All grammars are self-contained and compile successfully with ANTLR 4.<br>
  Removed obsolete GrammarCompilationTest.java to fix build issues</p>
</td></div>`.trim();

  const expected = `
Add non-overlapping ANTLR grammar examples for runtime tests

This commit introduces a set of nine non-obvious, non-overlapping grammars
under \`runtime-testsuite/test/org/antlr/v4/test/runtime/antlr_grammars/\`
to demonstrate and validate diverse ANTLR 4 parsing features.

Included grammars:

- Arithmetic.g4 — arithmetic expression parsing
- BooleanExpr.g4 — boolean and logical expressions
- CSVFlexible.g4 — flexible CSV handling with optional quotes
- JSONMini.g4 — minimal JSON subset parser
- MiniConfig.g4 — simple key-value configuration format
- MiniMarkdown.g4 — lightweight markdown-like parser
- MiniQuery.g4 — SQL-inspired query syntax
- UnitExpr.g4 — unit-based mathematical expressions
-

All grammars are self-contained and compile successfully with ANTLR 4.
Removed obsolete GrammarCompilationTest.java to fix build issues
`.trim();

  const result = toMd(el(html));
  strictEqual(result, expected);
});

test('toMd handles...', () => {
  const html = `
<div class="comment js-suggested-changes-container" data-thread-side="">
  <div class="comment-body markdown-body js-preview-body" style="min-height: 543px;">
    <h3 dir="auto">heading</h3>
    <p dir="auto">
      <strong>bold</strong>
      <br />
      <em>italics</em>
    </p>
    <blockquote>
      <p dir="auto">quote</p>
    </blockquote>
    <p dir="auto">
      <code class="notranslate">code</code>
      <br />
      <a href="https://example.com" rel="nofollow">a link</a>
    </p>
    <ol dir="auto">
      <li>item1</li>
      <li>item2</li>
    </ol>
    <ul class="contains-task-list">
      <li>
        <p dir="auto">itemA</p>
      </li>
      <li>
        <p dir="auto">itemB</p>
      </li>
      <li class="task-list-item">
        <p dir="auto">
          <input type="checkbox" id="" disabled="" class="task-list-item-checkbox" aria-label="Completed task" checked="" > done</input>
        </p>
      </li>
      <li class="task-list-item">
        <p dir="auto">
          <input type="checkbox" id="" disabled="" class="task-list-item-checkbox" aria-label="Incomplete task"> not done</input>
        </p>
      </li>
    </ul>
    <a target="_blank" rel="noopener noreferrer" href="https://private-user-images.githubusercontent.com/78566945/505755490-dd2c.png?jwt=eyJ0e">
      <img width="1024" height="1024" alt="Robot_icon svg" src="https://private-user-images.githubusercontent.com/78566945/505755490-dd2cb34d-e93b-45be-a3b3-26caaac727fb.png?jwt=eyJ0e" style="max-width: 100%; height: auto; max-height: 1024px;" />
    </a>
    <a class="user-mention notranslate" data-hovercard-type="user" data-hovercard-url="/users/koal44/hovercard" data-octo-click="hovercard-link-click" data-octo-dimensions="link_type:self" href="https://github.com/koal44" aria-keyshortcuts="Alt+ArrowUp">@koal44</a> (mention)

    <a class="issue-link js-issue-link" data-error-text="Failed to load title" data-id="224292480" data-permission-text="Title is private" data-url="https://github.com/antlr/antlr4/issues/1839" data-hovercard-type="issue" data-hovercard-url="/antlr/antlr4/issues/1839/hovercard" href="https://github.com/antlr/antlr4/issues/1839" aria-keyshortcuts="Alt+ArrowUp">#1839</a> (reference)

    <p dir="auto">Duplicate of 
      <a class="issue-link js-issue-link" data-error-text="Failed to load title" data-id="224292480" data-permission-text="Title is private" data-url="https://github.com/antlr/antlr4/issues/1839" data-hovercard-type="issue" data-hovercard-url="/antlr/antlr4/issues/1839/hovercard" href="https://github.com/antlr/antlr4/issues/1839" aria-keyshortcuts="Alt+ArrowUp">#1839</a> (saved reply)
    </p>
  </div>
</div>`;

  const expected = `
### heading

**bold**
_italics_

> quote

\`code\`
[a link](https://example.com/)

1. item1
2. item2

- itemA
- itemB
- [x] done
- [ ] not done

[![Robot_icon svg](https://private-user-images.githubusercontent.com/78566945/505755490-dd2cb34d-e93b-45be-a3b3-26caaac727fb.png?jwt=eyJ0e)](https://private-user-images.githubusercontent.com/78566945/505755490-dd2c.png?jwt=eyJ0e) @koal44 (mention) [#1839](https://github.com/antlr/antlr4/issues/1839) (reference)

Duplicate of [#1839](https://github.com/antlr/antlr4/issues/1839) (saved reply)
`.trim();
  // <img width="1024" height="1024" alt="Robot_icon svg" src="https://github.com/user-attachments/assets/dd2cb34d-e93b-45be-a3b3-26caaac727fb" />
  const result = toMd(el(html));
  strictEqual(result, expected);
});

test('toMd handles tagnames', () => {
  const html = `
<div class="comment js-suggested-changes-container" data-thread-side="">
  <div class="comment-body markdown-body js-preview-body" style="min-height: 543px;">
    <p dir="auto">
      <a class="user-mention notranslate" data-hovercard-type="user" data-hovercard-url="/users/koal44/hovercard" data-octo-click="hovercard-link-click" data-octo-dimensions="link_type:self" href="https://github.com/koal44" aria-keyshortcuts="Alt+ArrowUp">@koal44</a>, 
      <a class="user-mention notranslate" data-hovercard-type="user" data-hovercard-url="/users/kaby76/hovercard" data-octo-click="hovercard-link-click" data-octo-dimensions="link_type:self" href="https://github.com/kaby76" aria-keyshortcuts="Alt+ArrowUp">@kaby76</a>
    </p>
    <p dir="auto">
      <a class="user-mention notranslate" data-hovercard-type="user" data-hovercard-url="/users/koal44/hovercard" data-octo-click="hovercard-link-click" data-octo-dimensions="link_type:self" href="https://github.com/koal44" aria-keyshortcuts="Alt+ArrowUp">@koal44</a>
      <br />
      <a class="user-mention notranslate" data-hovercard-type="user" data-hovercard-url="/users/0xFireWolf/hovercard" data-octo-click="hovercard-link-click" data-octo-dimensions="link_type:self" href="https://github.com/0xFireWolf" aria-keyshortcuts="Alt+ArrowUp">@0xFireWolf</a>
    </p>
  </div>
</div>`;
  const expected = `
@koal44, @kaby76

@koal44
@0xFireWolf
`.trim();
  const result = toMd(el(html));
  strictEqual(result, expected);
});

test('toMd handles...', () => {
  const html = `
<div class="comment js-suggested-changes-container" data-thread-side="">
  <div class="comment-body markdown-body js-preview-body" style="min-height: 543px;">
    <p dir="auto">
      <a class="user-mention notranslate" data-hovercard-type="user" data-hovercard-url="/users/koal44/hovercard" data-octo-click="hovercard-link-click" data-octo-dimensions="link_type:self" href="https://github.com/koal44" aria-keyshortcuts="Alt+ArrowUp">@koal44</a>
      <a class="user-mention notranslate" data-hovercard-type="user" data-hovercard-url="/users/koal44/hovercard" data-octo-click="hovercard-link-click" data-octo-dimensions="link_type:self" href="https://github.com/koal44" aria-keyshortcuts="Alt+ArrowUp">@koal44</a>
      <br />
      <a target="_blank" rel="noopener noreferrer" href="https...">
        <img width="48" height="48" alt="icon-full-48" src="https..." style="max-width: 100%; height: auto; max-height: 48px;" />
      </a>
      <br />
      <a class="user-mention notranslate" data-hovercard-type="user" data-hovercard-url="/users/koal44/hovercard" data-octo-click="hovercard-link-click" data-octo-dimensions="link_type:self" href="https://github.com/koal44" aria-keyshortcuts="Alt+ArrowUp">@koal44</a>@koal44
      <br />
      <a target="_blank" rel="noopener noreferrer" href="https...">
        <img width="48" height="48" alt="icon-full-48" src="https..." style="max-width: 100%; height: auto; max-height: 48px;" />
      </a>
      <a target="_blank" rel="noopener noreferrer" href="https...">
        <img width="48" height="48" alt="icon-full-48" src="https..." style="max-width: 100%; height: auto; max-height: 48px;" />
      </a>
      <br />
      <a target="_blank" rel="noopener noreferrer" href="https...">
        <img width="48" height="48" alt="icon-full-48" src="https..." style="max-width: 100%; height: auto; max-height: 48px;" />
      </a>
      <br />
      <a class="user-mention notranslate" data-hovercard-type="user" data-hovercard-url="/users/koal44/hovercard" data-octo-click="hovercard-link-click" data-octo-dimensions="link_type:self" href="https://github.com/koal44" aria-keyshortcuts="Alt+ArrowUp">@koal44</a>
      <a target="_blank" rel="noopener noreferrer" href="https...">
        <img width="48" height="48" alt="icon-full-48" src="https..." style="max-width: 100%; height: auto; max-height: 48px;" />
      </a>
      <a class="user-mention notranslate" data-hovercard-type="user" data-hovercard-url="/users/koal44/hovercard" data-octo-click="hovercard-link-click" data-octo-dimensions="link_type:self" href="https://github.com/koal44" aria-keyshortcuts="Alt+ArrowUp">@koal44</a>
    </p>
  </div>
</div>`.trim();
  const expected = `
@koal44 @koal44
[![icon-full-48](https...)](https...)
@koal44@koal44
[![icon-full-48](https...)](https...) [![icon-full-48](https...)](https...)
[![icon-full-48](https...)](https...)
@koal44 [![icon-full-48](https...)](https...) @koal44
`.trim();
  const result = toMd(el(html));
  strictEqual(result, expected);
});

test('toMd handles...', () => {
  const html = `
<div class="comment js-suggested-changes-container" data-thread-side="">
  <div class="comment-body markdown-body js-preview-body" style="min-height: 543px;"><ol dir="auto">
<li>item1</li>
<li>item2<br>
<a class="user-mention notranslate" data-hovercard-type="user" data-hovercard-url="/users/koal44/hovercard" data-octo-click="hovercard-link-click" data-octo-dimensions="link_type:self" href="https://github.com/koal44" aria-keyshortcuts="Alt+ArrowUp">@koal44</a></li>
</ol></div>
</div>
  `.trim();

  const expected = `
1. item1
2. item2
   @koal44
`.trim();
  const result = toMd(el(html));
  strictEqual(result, expected);
});

test('toMd handles...', () => {
  const html = `
<div class="comment js-suggested-changes-container" data-thread-side="">
  <div class="comment-body markdown-body js-preview-body" style="min-height: 543px;"><ol dir="auto">
<li>item1</li>
<li>item2</li>
</ol>
<p dir="auto"><a class="user-mention notranslate" data-hovercard-type="user" data-hovercard-url="/users/koal44/hovercard" data-octo-click="hovercard-link-click" data-octo-dimensions="link_type:self" href="https://github.com/koal44" aria-keyshortcuts="Alt+ArrowUp">@koal44</a></p></div>
</div>
  `.trim();

  const expected = `
1. item1
2. item2

@koal44
`.trim();
  const result = toMd(el(html));
  strictEqual(result, expected);
});

describe('Code Tables', () => {
  const html = `
<div class="Box Box--condensed my-2">
  <div class="Box-header f6">
    <p class="mb-0 text-bold">
      <a href="https://github.com/rollup/plugins/blob/92daef00b0da30de172868d4e0792c8686da0045/packages/typescript/src/options/validate.ts#L60-L75">plugins/packages/typescript/src/options/validate.ts</a>
    </p>
    <p class="mb-0 color-fg-muted">
        Lines 60 to 75
      in
      <a data-pjax="true" class="commit-tease-sha Link--inTextBlock" href="/rollup/plugins/commit/92daef00b0da30de172868d4e0792c8686da0045">92daef0</a>
    </p>
  </div>
  <div itemprop="text" class="Box-body p-0 blob-wrapper blob-wrapper-embedded data">
    <table class="highlight tab-size mb-0 js-file-line-container" data-tab-size="8" data-paste-markdown-skip="">

        <tbody><tr class="border-0">
          <td id="L60" class="blob-num border-0 px-3 py-0 color-bg-default" data-line-number="60"></td>
          <td id="LC60" class="blob-code border-0 px-3 py-0 color-bg-default blob-code-inner js-file-line"> <span class="pl-c">// Checks if the given path lies within Rollup output dir</span> </td>
        </tr>

        <tr class="border-0">
          <td id="L61" class="blob-num border-0 px-3 py-0 color-bg-default" data-line-number="61"></td>
          <td id="LC61" class="blob-code border-0 px-3 py-0 color-bg-default blob-code-inner js-file-line"> <span class="pl-k">if</span> <span class="pl-kos">(</span><span class="pl-s1">outputOptions</span><span class="pl-kos">.</span><span class="pl-c1">dir</span><span class="pl-kos">)</span> <span class="pl-kos">{</span> </td>
        </tr>

        <tr class="border-0">
          <td id="L62" class="blob-num border-0 px-3 py-0 color-bg-default" data-line-number="62"></td>
          <td id="LC62" class="blob-code border-0 px-3 py-0 color-bg-default blob-code-inner js-file-line">   <span class="pl-k">const</span> <span class="pl-s1">fromRollupDirToTs</span> <span class="pl-c1">=</span> <span class="pl-en">relative</span><span class="pl-kos">(</span><span class="pl-s1">outputDir</span><span class="pl-kos">,</span> <span class="pl-s1">compilerOptions</span><span class="pl-kos">[</span><span class="pl-s1">dirProperty</span><span class="pl-kos">]</span><span class="pl-c1">!</span><span class="pl-kos">)</span><span class="pl-kos">;</span> </td>
        </tr>
    </tbody></table>
  </div>
</div>
`.trim();
  test('toHtml converts GitHub code table into expected HTML', () => {
    const result = toHtml(el(html)) as HTMLElement | null;
    const expected = `
<div>
  <div>
    <p>
      <a href="https://github.com/rollup/plugins/blob/92daef00b0da30de172868d4e0792c8686da0045/packages/typescript/src/options/validate.ts#L60-L75">plugins/packages/typescript/src/options/validate.ts</a>
    </p>
    <p>
        Lines 60 to 75
      in
      <a href="/rollup/plugins/commit/92daef00b0da30de172868d4e0792c8686da0045">92daef0</a>
    </p>
  </div>
  <div>
    <div class="code-table-wrapper"><table class="code-table">

        <tbody><tr>
          <td>60</td>
          <td> <span>// Checks if the given path lies within Rollup output dir</span> </td>
        </tr>

        <tr>
          <td>61</td>
          <td> <span>if</span> <span>(</span><span>outputOptions</span><span>.</span><span>dir</span><span>)</span> <span>{</span> </td>
        </tr>

        <tr>
          <td>62</td>
          <td>   <span>const</span> <span>fromRollupDirToTs</span> <span>=</span> <span>relative</span><span>(</span><span>outputDir</span><span>,</span> <span>compilerOptions</span><span>[</span><span>dirProperty</span><span>]</span><span>!</span><span>)</span><span>;</span> </td>
        </tr>
    </tbody></table></div>
  </div>
</div>`;
    assertNodeEqual(result, expected);
  });

  test('toMd converts GitHub code table box into a fenced code block with line numbers', () => {
    const md = toMd(el(html));
    expect(md).toBe([
      '[plugins/packages/typescript/src/options/validate.ts](https://github.com/rollup/plugins/blob/92daef00b0da30de172868d4e0792c8686da0045/packages/typescript/src/options/validate.ts#L60-L75)',
      '',
      'Lines 60 to 75 in [92daef0](/rollup/plugins/commit/92daef00b0da30de172868d4e0792c8686da0045)',
      '',
      '```js',
      '  60  // Checks if the given path lies within Rollup output dir ',
      '  61  if (outputOptions.dir) { ',
      '  62    const fromRollupDirToTs = relative(outputDir, compilerOptions[dirProperty]!); ',
      '```',
    ].join('\n'));
  });
});



describe('Regression: toMd must run on pristine DOM before toHtml mutations', () => {
  test('toMd sees data-line-number even when toHtml strips/mutates attributes', () => {
    const html = `
      <table class="js-file-line-container">
        <tbody>
          <tr>
            <td class="blob-num" data-line-number="42"></td>
            <td class="blob-code">const x = 1;</td>
          </tr>
        </tbody>
      </table>`.trim();
    const node = el(html);
    const mdBefore = toMd(node);
    toHtml(node);
    const mdAfter = toMd(node);
    expect(mdBefore).toBe(mdAfter); // should be identical
  });
});

describe('code language detection in toMd', () => {
  test('detects language from div.highlight class', () => {
    const html = `
  <div class="highlight highlight-source-json notranslate position-relative overflow-auto" dir="auto"><pre class="notranslate">{
    <span class="pl-ent">"compilerOptions"</span>: {
        <span class="pl-ent">"module"</span>: <span class="pl-s"><span class="pl-pds">"</span>ESNext<span class="pl-pds">"</span></span>,
        <span class="pl-ent">"target"</span>: <span class="pl-s"><span class="pl-pds">"</span>ESNext<span class="pl-pds">"</span></span>,
        <span class="pl-ent">"moduleResolution"</span>: <span class="pl-s"><span class="pl-pds">"</span>Node<span class="pl-pds">"</span></span>,
        <span class="pl-ent">"esModuleInterop"</span>: <span class="pl-c1">true</span>,
        <span class="pl-ent">"importHelpers"</span>: <span class="pl-c1">true</span>,
        <span class="pl-ent">"strict"</span>: <span class="pl-c1">true</span>,
        <span class="pl-ent">"jsx"</span>: <span class="pl-s"><span class="pl-pds">"</span>react-jsx<span class="pl-pds">"</span></span>,
        <span class="pl-ent">"jsxImportSource"</span>: <span class="pl-s"><span class="pl-pds">"</span>preact<span class="pl-pds">"</span></span>,
        <span class="pl-ent">"declaration"</span>: <span class="pl-c1">true</span>,
        <span class="pl-ent">"declarationDir"</span>: <span class="pl-s"><span class="pl-pds">"</span>dist/dts/<span class="pl-pds">"</span></span>,
        <span class="pl-ent">"paths"</span>: {
            <span class="pl-ent">"@/*"</span>: [<span class="pl-s"><span class="pl-pds">"</span>./src/*<span class="pl-pds">"</span></span>]
        }
    },
    <span class="pl-ent">"include"</span>: [
        <span class="pl-s"><span class="pl-pds">"</span>src/**/*<span class="pl-pds">"</span></span>,
        <span class="pl-s"><span class="pl-pds">"</span>test/**/*<span class="pl-pds">"</span></span>,
        <span class="pl-s"><span class="pl-pds">"</span>rollup.config.ts<span class="pl-pds">"</span></span>
    ],
    <span class="pl-ent">"exclude"</span>: [<span class="pl-s"><span class="pl-pds">"</span>node_modules<span class="pl-pds">"</span></span>, <span class="pl-s"><span class="pl-pds">"</span>dist<span class="pl-pds">"</span></span>, <span class="pl-s"><span class="pl-pds">"</span>**/__snapshots__/**/*<span class="pl-pds">"</span></span>]
}</pre></div>
`.trim();
    const expected = `
\`\`\`json
{
    "compilerOptions": {
        "module": "ESNext",
        "target": "ESNext",
        "moduleResolution": "Node",
        "esModuleInterop": true,
        "importHelpers": true,
        "strict": true,
        "jsx": "react-jsx",
        "jsxImportSource": "preact",
        "declaration": true,
        "declarationDir": "dist/dts/",
        "paths": {
            "@/*": ["./src/*"]
        }
    },
    "include": [
        "src/**/*",
        "test/**/*",
        "rollup.config.ts"
    ],
    "exclude": ["node_modules", "dist", "**/__snapshots__/**/*"]
}
\`\`\``.trim();
    const node = el(html);
    const md = toMd(node);
    expect(md).toBe(expected);
  });
});

describe('handling subscripts and superscripts in Markdown tables', () => {
  function createTable(data: string): string {
    return `
<markdown-accessiblity-table data-catalyst="">
  <table>
    <tbody>
      <tr>
        <td>${data}</td>
      </tr>
    </tbody>
  </table>
</markdown-accessiblity-table>
    `.trim();
  }

  it('preserves inline subscripts such as H₂O', () => {
    const html = createTable('H<sub>2</sub>O');
    const md = toMd(el(html));
    const expected = `| H<sub>2</sub>O |`;
    expect(md).toContain(expected);
  });

  it('unwraps full-cell <sub>...</sub> wrappers used by bots for font shrinking', () => {
    const html = createTable('<sub>331,241k (± 0.01%)</sub>');
    const md = toMd(el(html));
    const expected = `| 331,241k (± 0.01%) |`;
    expect(md).toContain(expected);
  });
});
