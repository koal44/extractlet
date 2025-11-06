import { test } from 'vitest';
import { strictEqual } from 'node:assert';
import { toMd } from '../../src/sites/hub';
import { el, setupDom } from '../utils/test-utils';

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

//   const html2 = `<div class="comment js-suggested-changes-container" data-thread-side="">
//   <div class="comment-body markdown-body js-preview-body" style="min-height: 543px;"><h3 dir="auto">heading</h3>
// <p dir="auto"><strong>bold</strong><br>
// <em>italics</em></p>
// <blockquote>
// <p dir="auto">quote</p>
// </blockquote>
// <p dir="auto"><code class="notranslate">code</code><br>
// <a href="https://example.com" rel="nofollow">a link</a></p>
// <ol dir="auto">
// <li>item1</li>
// <li>item2</li>
// </ol>
// <ul class="contains-task-list">
// <li>
// <p dir="auto">itemA</p>
// </li>
// <li>
// <p dir="auto">itemB</p>
// </li>
// <li class="task-list-item">
// <p dir="auto"><input type="checkbox" id="" disabled="" class="task-list-item-checkbox" aria-label="Completed task" checked=""> done</p>
// </li>
// <li class="task-list-item">
// <p dir="auto"><input type="checkbox" id="" disabled="" class="task-list-item-checkbox" aria-label="Incomplete task"> not done</p>
// </li>
// </ul>
// <a target="_blank" rel="noopener noreferrer" href="https://private-user-images.githubusercontent.com/78566945/505755490-dd2c.png?jwt=eyJ0e"><img width="1024" height="1024" alt="Robot_icon svg" src="https://private-user-images.githubusercontent.com/78566945/505755490-dd2cb34d-e93b-45be-a3b3-26caaac727fb.png?jwt=eyJ0e" style="max-width: 100%; height: auto; max-height: 1024px;"></a>
// <a class="user-mention notranslate" data-hovercard-type="user" data-hovercard-url="/users/koal44/hovercard" data-octo-click="hovercard-link-click" data-octo-dimensions="link_type:self" href="https://github.com/koal44" aria-keyshortcuts="Alt+ArrowUp">@koal44</a> (mention)
//  <a class="issue-link js-issue-link" data-error-text="Failed to load title" data-id="224292480" data-permission-text="Title is private" data-url="https://github.com/antlr/antlr4/issues/1839" data-hovercard-type="issue" data-hovercard-url="/antlr/antlr4/issues/1839/hovercard" href="https://github.com/antlr/antlr4/issues/1839" aria-keyshortcuts="Alt+ArrowUp">#1839</a> (reference)
// <p dir="auto">Duplicate of <a class="issue-link js-issue-link" data-error-text="Failed to load title" data-id="224292480" data-permission-text="Title is private" data-url="https://github.com/antlr/antlr4/issues/1839" data-hovercard-type="issue" data-hovercard-url="/antlr/antlr4/issues/1839/hovercard" href="https://github.com/antlr/antlr4/issues/1839" aria-keyshortcuts="Alt+ArrowUp">#1839</a> (saved reply)</p></div>
// </div>`;

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

[![Robot_icon svg](https://private-user-images.githubusercontent.com/78566945/505755490-dd2cb34d-e93b-45be-a3b3-26caaac727fb.png?jwt=eyJ0e)](https://private-user-images.githubusercontent.com/78566945/505755490-dd2c.png?jwt=eyJ0e) @koal44 (mention) #1839 (reference)

Duplicate of #1839 (saved reply)
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

// test('toMd handles images', () => {
//   const html = `
// <div class="comment-body markdown-body js-preview-body" style="min-height: 123px;"><a target="_blank" rel="noopener noreferrer" href="https://private-user-images.githubusercontent.com/78566945/505766843-63995a69-9d24-4253-ae7b-1ffa041f3276.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NjE1MTYwMzksIm5iZiI6MTc2MTUxNTczOSwicGF0aCI6Ii83ODU2Njk0NS81MDU3NjY4NDMtNjM5OTVhNjktOWQyNC00MjUzLWFlN2ItMWZmYTA0MWYzMjc2LnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTEwMjYlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUxMDI2VDIxNTUzOVomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPWU0NzQxYzIxYzMyNzgwODkxZjcxOWZhMDE5Yzg2OWJjMzIxNmYxYjE5MWJjMjE2NTMzMzg3NjBlYzJhNmNjOTMmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.seYJsl5C33j6zt_EcTVHQAQaZxHRFd-ydUdR86k5kvk"><img width="48" height="48" alt="icon-full-48" src="https://private-user-images.githubusercontent.com/78566945/505766843-63995a69-9d24-4253-ae7b-1ffa041f3276.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NjE1MTYwMzksIm5iZiI6MTc2MTUxNTczOSwicGF0aCI6Ii83ODU2Njk0NS81MDU3NjY4NDMtNjM5OTVhNjktOWQyNC00MjUzLWFlN2ItMWZmYTA0MWYzMjc2LnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTEwMjYlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUxMDI2VDIxNTUzOVomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPWU0NzQxYzIxYzMyNzgwODkxZjcxOWZhMDE5Yzg2OWJjMzIxNmYxYjE5MWJjMjE2NTMzMzg3NjBlYzJhNmNjOTMmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.seYJsl5C33j6zt_EcTVHQAQaZxHRFd-ydUdR86k5kvk" style="max-width: 100%; height: auto; max-height: 48px;"></a></div>
// `;
//   const expected = `
// <img width="48" height="48" alt="icon-full-48" src="https://github.com/user-attachments/assets/63995a69-9d24-4253-ae7b-1ffa041f3276" />
// `.trim();
//   const result = toMd(el(html)).trim();
//   strictEqual(result, expected);
// }

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

  `.trim();

  const expected = `

`.trim();
  const result = toMd(el(html));
  // strictEqual(result, expected);
  void expected;
  void result;
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
