import { strictEqual } from 'node:assert';
import { describe, expect, it, test } from 'vitest';
import { toHtml, toMd } from '../../src/core';
import { el, assertNodeEqual, setupDom, logPandocHtmlToMd } from '../utils/test-utils';
import { log } from '../../src/utils/logging';
void log; // eslint whining

setupDom();

void logPandocHtmlToMd; // appease eslint whining

test('toHtml spacing challenges', () => {
  const html = `
<div>
  <p>
    This is a test. See
    <a href="example.com">this example</a>
    for more details. A
    <a href="allaboutcats.com">large cat</a>
    was sitting in the tree. Moments later,
    <a href="cat.com">another cat</a>
    appeared beside it.
  </p>

</div>
`.trim();

  const result = toHtml(el(html));
  //   const expected = `
  // <div>
  //     <p>
  //       This is a test. See <a href="example.com">this example</a> for more details. A <a href="allaboutcats.com">large cat</a>
  //       was sitting in the tree. Moments later, <a href="cat.com">another cat</a> appeared beside it.
  //     </p>
  // </div>
  // `.trim();
  assertNodeEqual(result, html); // round-trip preserves spacing
});

test('toHtml preserves escaped html', () => {
  const html = `
    <div>
      <p>
        This is a test with escaped HTML: &lt;div&gt;Hello&lt;/div&gt;.
      </p>
    </div>`.trim();

  const result = toHtml(el(html));
  const expected = `
    <div>
      <p>
        This is a test with escaped HTML: &lt;div&gt;Hello&lt;/div&gt;.
      </p>
    </div>`.trim();

  assertNodeEqual(result, expected);
});

test('toMd collapse linebreaks', () => {
  const html = `
    <div>
      <p>
        This is
        a test.
      </p>
    </div>`;
  const result = toMd(el(html));
  const expected = 'This is a test.';
  strictEqual(result, expected);
});

test('toMd trim after anchor', () => {
  const html = `
    <div>
      <p>
        See <a href="example.com">this</a> 
      </p>
    </div>`;
  const result = toMd(el(html));
  const expected = 'See [this](example.com)';
  strictEqual(result, expected);
});

test('toMd no double space', () => {
  const html = `
    <div>
      <p>
        Hello 
        <a href="cat.com">big cat</a>
        world.
      </p>
    </div>`;
  const result = toMd(el(html));
  const expected = 'Hello [big cat](cat.com) world.';
  strictEqual(result, expected);
});

test('toMd mathjax script', () => {
  const html = `
    <div>
      <p>
        Result:
        <script type="math/tex">(x+y)^2</script>
        is the formula.
      </p>
    </div>`;
  const result = toMd(el(html));
  const expected = 'Result: \\((x+y)^2\\) is the formula.';
  strictEqual(result, expected);
});

test('toMd trailing whitespace node', () => {
  const html = `
    <div>
      <p>Done.</p>
      
    </div>`;
  const result = toMd(el(html));
  const expected = 'Done.';
  strictEqual(result, expected);
});

test('toMd single p', () => {
  const html = '<div><p>Hello world</p></div>';
  const result = toMd(el(html));
  const expected = 'Hello world';
  strictEqual(result, expected);
});

test('toMd div wraps two ps', () => {
  const html = `
    <div>
      <p>Hello</p>
      <p>World</p>
    </div>`;
  const result = toMd(el(html));
  const expected = 'Hello\n\nWorld';
  strictEqual(result, expected);
});

test('toMd nested divs with p', () => {
  const html = `
    <div>
      <div>
        <p>Hello</p>
      </div>
      <div>
        <p>World</p>
      </div>
    </div>`;
  const result = toMd(el(html));
  const expected = 'Hello\n\nWorld';
  strictEqual(result, expected);
});

test('toMd deeply nested divs collapse spacing', () => {
  const html = `
    <div>
      <div>
        <div>
          <div>
            <p>Hello</p>
          </div>
        </div>
      </div>
    </div>`;
  const result = toMd(el(html));
  const expected = 'Hello';
  strictEqual(result, expected);
});

test('toMd deeply nested divs collapse spacing2', () => {
  const html = `
    <div>
      <div>
        <div>
          <div>
            <p>Hello</p>
          </div>
        </div>
      </div>
      <div>
        <div>
          <div>
            <p>Bye</p>
          </div>
        </div>
      </div>
    </div>`;
  const result = toMd(el(html));
  const expected = 'Hello\n\nBye';
  strictEqual(result, expected);
});

test('toMd empty divs do not add spacing', () => {
  const html = `
    <div>
      <div></div>
      <p>Hello</p>
      <div></div>
      <p>World</p>
    </div>`;
  const result = toMd(el(html));
  // console.log(`----------------\n${result}\n----------------`);
  const expected = 'Hello\n\nWorld';
  strictEqual(result, expected);
});

test('toMd div with inline span text', () => {
  const html = '<div><span>Hello</span>, <em>world</em>!</div>';
  const result = toMd(el(html));
  const expected = 'Hello, *world*!';
  strictEqual(result, expected);
});

test('toMd div with empty inline should not count', () => {
  const html = '<div><span> </span></div>';
  const result = toMd(el(html));
  const expected = '';
  strictEqual(result, expected);
});

test('toMd p and inline span spacing', () => {
  const html = '<div><p>Hello</p><span>World</span></div>';
  const result = toMd(el(html));
  const expected = 'Hello\n\nWorld';
  strictEqual(result, expected);
});

test('toMd div text p text', () => {
  const html = `
    <div>
      intro
      <p>Hello</p>
      outro
    </div>`;
  const result = toMd(el(html));
  const expected = 'intro\n\nHello\n\noutro';
  strictEqual(result, expected);
});

test('toMd messy spacing collapse', () => {
  const html = `
    <div>
      <p>Hello   \t\n</p>
      \n\n
      <p>   World</p>
    </div>`;
  const result = toMd(el(html));
  const expected = 'Hello\n\nWorld';
  strictEqual(result, expected);
});

test('toMd span does not add break', () => {
  const html = `
    <div>
      <span>Hello</span>
      <span>World</span>
    </div>`;
  const result = toMd(el(html));
  const expected = 'Hello World'; // no \n
  strictEqual(result, expected);
});

test('toMd p with spans inline', () => {
  const html = '<p><span>Hello</span><span> world</span></p>';
  const result = toMd(el(html));
  const expected = 'Hello world';
  strictEqual(result, expected);
});

test('toMd p with spans inline2', () => {
  const html = `<p>
    <span>
     Hello
    </span>
    <span>
        world 
    </span>
  </p>`;
  const result = toMd(el(html));
  const expected = 'Hello world';
  strictEqual(result, expected);
});

test('toMd spans between ps', () => {
  const html = `<div>
    <p>Hello</p>
    <span> -- </span>
    <p>World</p>
    </div>`;
  const result = toMd(el(html));
  const expected = 'Hello\n\n--\n\nWorld';
  strictEqual(result, expected);
});

test('toMd p span p combo', () => {
  const html = `<div>
    <p>Hello</p>
    <p><span>World</span></p>
    </div>`;
  const result = toMd(el(html));
  const expected = 'Hello\n\nWorld';
  strictEqual(result, expected);
});

test('toMd p with inline span then p', () => {
  const html = `<div>
    <p>This is <span>inline</span> text.</p>
    <p>Second paragraph.</p>
    </div>`;
  const result = toMd(el(html));
  const expected = 'This is inline text.\n\nSecond paragraph.';
  strictEqual(result, expected);
});

test('toMd mixed text span p text', () => {
  const html = `
    <div>
      Intro
      <span>-inline-</span>
      <p>Hello</p>
      <span>again</span>
    </div>`;
  const result = toMd(el(html));
  const expected = 'Intro -inline-\n\nHello\n\nagain';
  strictEqual(result, expected);
});

test('toMd em simple', () => {
  const html = '<p>This is <em>important</em> text.</p>';
  const result = toMd(el(html));
  const expected = 'This is *important* text.';
  strictEqual(result, expected);
});

test('toMd em nested div', () => {
  const html = '<div><p><em>Hello</em> world</p></div>';
  const result = toMd(el(html));
  const expected = '*Hello* world';
  strictEqual(result, expected);
});

test('toMd b simple', () => {
  const html = '<p>This is <b>bold</b> text.</p>';
  const result = toMd(el(html));
  const expected = 'This is **bold** text.';
  strictEqual(result, expected);
});

test('toMd b nested div', () => {
  const html = '<div><p><b>Hello</b> world</p></div>';
  const result = toMd(el(html));
  const expected = '**Hello** world';
  strictEqual(result, expected);
});

test('toMd em and bold', () => {
  const html = '<p>This is <b><em>very important</em></b> text.</p>';
  const result = toMd(el(html));
  const expected = 'This is ***very important*** text.';
  strictEqual(result, expected);
});

test('toMd br inside paragraph', () => {
  const html = '<p>Hello<br/>world</p>';
  const result = toMd(el(html));
  const expected = 'Hello  \nworld';
  strictEqual(result, expected);
});

test('toMd anchor simple', () => {
  const html = '<p>Visit <a href="https://example.com">our site</a> today.</p>';
  const result = toMd(el(html));
  const expected = 'Visit [our site](https://example.com/) today.';
  strictEqual(result, expected);
});

test('toMd anchor nested em', () => {
  const html = '<a href="https://example.com"><em>important link</em></a>';
  const result = toMd(el(html));
  const expected = '[*important link*](https://example.com/)';
  strictEqual(result, expected);
});

test('toMd a inline full url', () => {
  const html = '<a href="https://example.com">Click baby</a>';
  const result = toMd(el(html));
  const expected = '[Click baby](https://example.com/)';
  strictEqual(result, expected);
});

test('toMd a inline relative url', () => {
  const html = '<a href="/questions/1234">See question</a>';
  const result = toMd(el(html));
  const expected = '[See question](/questions/1234)';
  strictEqual(result, expected);
});

test('toMd a with empty href is unlinked', () => {
  const html = '<a href="">No link</a>';
  const result = toMd(el(html));
  const expected = '[No link]()';
  strictEqual(result, expected);
});

test('toMd a name anchor only', () => {
  const html = '<a name="section1"></a>';
  const result = toMd(el(html));
  const expected = ''; // No renderable content
  strictEqual(result, expected);
});

test('toMd naked url text', () => {
  const html = '<div>https://example.com</div>';
  const result = toMd(el(html));
  const expected = 'https://example.com';
  strictEqual(result, expected);
});

test('toMd a with bold child', () => {
  const html = '<a href="https://example.com"><b>Link</b></a>';
  const result = toMd(el(html));
  const expected = '[**Link**](https://example.com/)';
  strictEqual(result, expected);
});

test('toMd img with empty src renders alt as plain text', () => {
  const html = '<img src="" alt="Diagram">';
  const result = toMd(el(html));
  const expected = '![Diagram]()';
  strictEqual(result, expected);
});

test('toMd img without src renders alt only (ignores title)', () => {
  const html = '<img alt="Logo" title="Company logo">';
  const result = toMd(el(html));
  const expected = '![Logo]()';
  strictEqual(result, expected);
});

test('toMd img keeps alt even if redundant with filename', () => {
  const html = '<img src="/images/a.png" alt="a.png" title="a.png">';
  const result = toMd(el(html, 'https://example.com/'));
  const expected = '![](https://example.com/images/a.png)';
  strictEqual(result, expected);
});

test('toMd h1 simple', () => {
  const html = '<div><h1>Introduction</h1></div>';
  const result = toMd(el(html));
  const expected = '# Introduction';
  strictEqual(result, expected);
});

test('toMd h2 with inline', () => {
  const html = '<div><h2>Usage <em>details</em></h2></div>';
  const result = toMd(el(html));
  const expected = '## Usage *details*';
  strictEqual(result, expected);
});

test('toMd h3 with bold', () => {
  const html = '<div><h3>Important <b>note</b></h3></div>';
  const result = toMd(el(html));
  const expected = '### Important **note**';
  strictEqual(result, expected);
});

test('toMd hr simple', () => {
  const html = '<div>before<hr/>after</div>';
  const result = toMd(el(html));
  const expected = 'before\n\n---\n\nafter';
  strictEqual(result, expected);
});

test('toMd ul simple', () => {
  const html = '<ul><li>Item 1</li><li>Item 2</li></ul>';
  const result = toMd(el(html));
  const expected = '- Item 1\n- Item 2';
  strictEqual(result, expected);
});

test('toMd ol simple', () => {
  const html = '<ol><li>First</li><li>Second</li></ol>';
  const result = toMd(el(html));
  const expected = '1. First\n2. Second';
  strictEqual(result, expected);
});

test('toMd double spaced list', () => {
  const html = '<div><ul><li><p>Item 1</p></li><li><p>Item 2</p></li></ul></div>';
  const result = toMd(el(html));
  const expected = `
- Item 1
- Item 2`.trim();
  strictEqual(result, expected);
});

test('toMd list with two paragraphs', () => {
  const html = `<div><ul>
<li>
<p>Para 1</p>
<p>Para 2</p>
</li>
</ul>
</div>`;
  const result = toMd(el(html));
  const expected = `
- Para 1
  Para 2`.trim();
  strictEqual(result, expected);
});

test('toMd deep list with paragraphs', () => {
  const html = `<div>
<ul>
  <li>
    <p>Li1 Para1</p>
    <p>Li1 Para2</p>
    <ul>
      <li>
      <p>Li2 Para1</p>
      <p>Li2 Para2</p>
      </li>
    </ul>
  </li>
</ul>
</div>`.trim();
  const result = toMd(el(html));
  const expected =
`
- Li1 Para1
  Li1 Para2
  - Li2 Para1
    Li2 Para2
`.trim();
  strictEqual(result, expected);
});

test('toMd nest list with variable bullet length', () => {
  const html = `<div>
<ol>
  <li>Item 1</li>
  <li>Item 2</li>
  <li>Item 3</li>
  <li>Item 4</li>
  <li>Item 5</li>
  <li>Item 6</li>
  <li>Item 7</li>
  <li>Item 8</li>
  <li><p>Item 9 Para1</p><p>Item 9 Para2</p></li>
  <li><p>Item 10 Para1</p><p>Item 10 Para2</p></li>
</ol>
</div>`;
  const result = toMd(el(html));
  const expected =
`
1. Item 1
2. Item 2
3. Item 3
4. Item 4
5. Item 5
6. Item 6
7. Item 7
8. Item 8
9. Item 9 Para1
   Item 9 Para2
10. Item 10 Para1
    Item 10 Para2`.trim();
  strictEqual(result, expected);
});

test('toMd nested list', () => {
  const html = `
<div>
  <ul>
    <li>Indented 0 spaces.
      <ul>
        <li>indented 2 or more spaces.</li>
      </ul>
    </li>
    <li>0 spaces again.</li>
  </ul>
</div>`;
  const result = toMd(el(html));
  const expected = `
- Indented 0 spaces.
  - indented 2 or more spaces.
- 0 spaces again.`.trim();
  strictEqual(result, expected);
});

test('toMd nested list wild', () => {
  const html = `
<div>
  <h1>Nested List Wild</h1>
  <ul>
    <li>a
      <ul>
        <li>b</li>
        <li>c
          <ul>
            <li>d
              <ul>
                <li>e</li>
              </ul>
            </li>
            <li>f</li>
          </ul>
        </li>
        <li>g</li>
      </ul>
    </li>
    <li>h</li>
  </ul>
</div>`;
  const result = toMd(el(html));
  const expected =
`# Nested List Wild

- a
  - b
  - c
    - d
      - e
    - f
  - g
- h`;
  strictEqual(result, expected);
});

test('toMd code fenced basic', () => {
  const html = '<div><pre><code>printf("%d\\n", 42);</code></pre></div>';
  const result = toMd(el(html));
  const expected = '```\nprintf("%d\\n", 42);\n```';
  strictEqual(result, expected);
});

test('toMd inline code basic', () => {
  const html = '<p>The <code>$</code> character is a shortcut for <code>window.jQuery</code>.</p>';
  const result = toMd(el(html));
  const expected = 'The `$` character is a shortcut for `window.jQuery`.';
  strictEqual(result, expected);
});

test('toMd inline code with backtick', () => {
  const html = '<p>The name <code>Tuple`2</code> is valid.</p>';
  const result = toMd(el(html));
  const expected = 'The name `` Tuple`2 `` is valid.';
  strictEqual(result, expected);
});

test('toMd pre with trailing newline', () => {
  const html = '<div><pre>line1\nline2\n</pre></div>';
  const result = toMd(el(html));
  const expected = '```\nline1\nline2\n```';
  strictEqual(result, expected);
});

test('toMd h1 p pre code and inline code mix', () => {
  const html = `
<div><h1>code block</h1>
<p>foo</p>
<pre class="lang-py s-code-block"><code data-highlighted="yes" class="hljs language-python"><span class="hljs-keyword">def</span> <span class="hljs-title function_">hello</span>():
    <span class="hljs-built_in">print</span>(<span class="hljs-string">"hello world"</span>)
</code></pre>
<p>bar <code>function bye() { console.log("bye-bye!") }</code>
baz</p>
</div>`.trim();
  const result = toMd(el(html));
  const expected  =
`# code block

foo

\`\`\`
def hello():
    print("hello world")
\`\`\`

bar \`function bye() { console.log("bye-bye!") }\` baz`;
  strictEqual(result, expected);
});

test('toMd complex mixed markup case', () => {
  const html = `<div><h1>Header One</h1>
<p>This is the first paragraph. It has <em>italic</em> text, <strong>bold</strong> text, and <em><strong>both</strong></em>.</p>
<p>This is the second paragraph.<br>
It contains a manual line break above.</p>
<h2>Header Two</h2>
<p>Another paragraph here with a <a href="https://example.com">Im a Link!</a>.</p>
<hr>
<p><strong>Bold line.</strong><br>
<em>Italic line.</em><br>
<em><strong>Bold and italic line.</strong></em></p>
<h3>Header Three</h3>
<p>Final paragraph.</p>
</div>`;
  const result = toMd(el(html));
  const expected =
`# Header One

This is the first paragraph. It has *italic* text, **bold** text, and ***both***.

This is the second paragraph.  
It contains a manual line break above.

## Header Two

Another paragraph here with a [Im a Link!](https://example.com/).

---

**Bold line.**  
*Italic line.*  
***Bold and italic line.***

### Header Three

Final paragraph.`;
  strictEqual(result, expected);
});

test('toMd StackOverflow example code blocks', () => {
  const html = `<div><h2>Code and Preformatted Text</h2>
<p>Indent four spaces to create an escaped <code>&lt;pre&gt; &lt;code&gt;</code> block:</p>
<pre class="lang-js s-code-block"><code data-highlighted="yes" class="hljs language-javascript"><span class="hljs-title function_">printf</span>(<span class="hljs-string">"%d\n"</span>, <span class="hljs-number">42</span>);  <span class="hljs-comment">/- what was the
                        question again? -/</span>
</code></pre>
<p>You can also select text and press <code>CTRL+K</code> to toggle indenting as code.</p>
<p>The text will be wrapped in tags, and displayed in a monospaced font. The first four spaces will be stripped off, but all other whitespace will be preserved.</p>
<p>Markdown and HTML are ignored within a code block:</p>
<pre class="lang-js s-code-block"><code data-highlighted="yes" class="hljs language-javascript">&lt;blink&gt;
   <span class="hljs-title class_">You</span> would hate <span class="hljs-variable language_">this</span> <span class="hljs-keyword">if</span> it weren<span class="hljs-string">'t
   wrapped in a code block.
&lt;/blink&gt;
</span></code></pre>
<p>Instead of using indentation, you can also create code blocks by using “code fences”, consisting of three or more backticks or tildes:</p>
<pre class="lang-js s-code-block"><code data-highlighted="yes" class="hljs language-javascript"><span class="hljs-title function_">alert</span>(<span class="hljs-literal">false</span>);
</code></pre>
<pre class="lang-js s-code-block"><code data-highlighted="yes" class="hljs language-javascript"><span class="hljs-title function_">alert</span>(<span class="hljs-literal">true</span>);
</code></pre>
<hr>
<h2>Code Spans</h2>
<p>Use backticks to create an inline <code>&lt;code&gt;</code> span:</p>
<p>The <code>$</code> character is just a shortcut for <code>window.jQuery</code>.</p>
<p>(The backtick key is in the upper left corner of most keyboards.)</p>
<p>Like code blocks, code spans will be displayed in a monospaced font. Markdown and HTML will not work within them. Note that, unlike code blocks, code spans require you to manually escape any HTML within!</p>
<p>If your code itself contains backticks, you may have to use multiple backticks as delimiters:</p>
<p>The name <code>Tuple\`2</code> is a valid .NET type name.</p>
</div>`;
  const result = toMd(el(html));
  const expected =
`## Code and Preformatted Text

Indent four spaces to create an escaped \`<pre> <code>\` block:

\`\`\`
printf("%d\n", 42);  /- what was the
                        question again? -/
\`\`\`

You can also select text and press \`CTRL+K\` to toggle indenting as code.

The text will be wrapped in tags, and displayed in a monospaced font. The first four spaces will be stripped off, but all other whitespace will be preserved.

Markdown and HTML are ignored within a code block:

\`\`\`
<blink>
   You would hate this if it weren't
   wrapped in a code block.
</blink>
\`\`\`

Instead of using indentation, you can also create code blocks by using “code fences”, consisting of three or more backticks or tildes:

\`\`\`
alert(false);
\`\`\`

\`\`\`
alert(true);
\`\`\`

---

## Code Spans

Use backticks to create an inline \`<code>\` span:

The \`$\` character is just a shortcut for \`window.jQuery\`.

(The backtick key is in the upper left corner of most keyboards.)

Like code blocks, code spans will be displayed in a monospaced font. Markdown and HTML will not work within them. Note that, unlike code blocks, code spans require you to manually escape any HTML within!

If your code itself contains backticks, you may have to use multiple backticks as delimiters:

The name \`\` Tuple\`2 \`\` is a valid .NET type name.`;
  strictEqual(result, expected);
});

test('toMd pre 1', () => {
  const html = `<div><pre class="lang-js s-code-block"><code data-highlighted="yes" class="hljs language-javascript"><span class="hljs-title function_">printf</span>(<span class="hljs-string">"%d\n"</span>, <span class="hljs-number">42</span>);  <span class="hljs-comment">/- what was the
                        question again? -/</span></code></pre>
</div>`;
  const result = toMd(el(html));
  const expected =
`\`\`\`
printf("%d\n", 42);  /- what was the
                        question again? -/
\`\`\``;
  strictEqual(result, expected);
});

test('toMd pre 2', () => {
  const html = `<div><pre class="lang-js s-code-block"><code data-highlighted="yes" class="hljs language-javascript"><span class="hljs-title function_">alert</span>(<span class="hljs-literal">false</span>);
</code></pre>
<pre class="lang-js s-code-block"><code data-highlighted="yes" class="hljs language-javascript"><span class="hljs-title function_">alert</span>(<span class="hljs-literal">true</span>);
</code></pre>
</div>`;
  const result = toMd(el(html));
  const expected = `
\`\`\`
alert(false);
\`\`\`

\`\`\`
alert(true);
\`\`\`
`.trim();
  strictEqual(result, expected);
});

test('toMd pre 3', () => {
  const html = `<div><hr>
<h2>Code Spans</h2>
</div>`;
  const result = toMd(el(html));
  const expected =
`---

## Code Spans`;
  strictEqual(result, expected);
});

test('toMd simple blockquotes', () => {
  const html = `<div><blockquote>
<p>The syntax is based on the way email programs
usually do quotations. You don't need to hard-wrap
the paragraphs in your blockquotes, but it looks much nicer if you do.  Depends how lazy you feel.</p>
</blockquote>
</div>`;
  const result = toMd(el(html));
  const expected =
'> The syntax is based on the way email programs usually do quotations. You don\'t need to hard-wrap the paragraphs in your blockquotes, but it looks much nicer if you do. Depends how lazy you feel.';
  strictEqual(result, expected);
});

test('toMd spaced blockquote', () => {
  const html = `<div><blockquote>
<p>The <code>&gt;</code> on the blank lines is required
to create a single blockquote.</p>
<p>If you leave out the extra <code>&gt;</code>
you will end up with
two distinct blockquotes.</p>
</blockquote>
</div>`;
  const result = toMd(el(html));
  const expected =
`
> The \`>\` on the blank lines is required to create a single blockquote.
> 
> If you leave out the extra \`>\` you will end up with two distinct blockquotes.`.trim();
  strictEqual(result, expected);
});

test('toMd blockquotes within blockquotes', () => {
  const html = `<div><blockquote>
<p>A standard blockquote is indented</p>
<blockquote>
<p>A nested blockquote is indented more</p>
<blockquote>
<blockquote>
<p>You can nest to any depth.</p>
</blockquote>
</blockquote>
</blockquote>
</blockquote>
</div>`;
  const result = toMd(el(html));
  const expected =
`
> A standard blockquote is indented
> 
> > A nested blockquote is indented more
> > 
> > > > You can nest to any depth.`.trim();
  strictEqual(result, expected);
});

test('toMd lists in a blockquote', () => {
  const html = `<div><blockquote>
<ul>
<li>A list in a blockquote</li>
<li>With a &gt; and space in front of it
<ul>
<li>A sublist</li>
</ul>
</li>
</ul>
</blockquote>
</div>`;
  const result = toMd(el(html));
  const expected =
`
> - A list in a blockquote
> - With a > and space in front of it
>   - A sublist`.trim();
  strictEqual(result, expected);
});

test('toMd preformatted text in a blockquote', () => {
  const html = `<div><blockquote>
<p>Intro</p>
<pre class="lang-js s-code-block"><code data-highlighted="yes" class="hljs language-javascript"><span class="hljs-title class_">Indent</span> five spaces total.  <span class="hljs-title class_">The</span> first
one is part <span class="hljs-keyword">of</span> the blockquote designator.
</code></pre>
<p>Outro</p>
</blockquote>
</div>`;
  const result = toMd(el(html));
  const expected =
`
> Intro
> 
> \`\`\`
> Indent five spaces total.  The first
> one is part of the blockquote designator.
> \`\`\`
> 
> Outro`.trim();
  strictEqual(result, expected);
});

test('toMd blockquote with anchor', () => {
  const html = `<div><blockquote>
<p>Check out <a href="https://example.com">this link</a> with <strong>bold</strong> and <code>code</code>.</p>
</blockquote>
</div>`;
  const result = toMd(el(html));
  const expected = '> Check out [this link](https://example.com/) with **bold** and `code`.';
  strictEqual(result, expected);
});

test('toMd blockquote with list', () => {
  const html = `<div>
<blockquote>
<p>Here are my thoughts:</p>
<ul>
<li>One</li>
<li>Two</li>
</ul>
</blockquote>
</div>`;
  const result = toMd(el(html));
  const expected = `
> Here are my thoughts:
> 
> - One
> - Two`.trim();
  strictEqual(result, expected);
});

test('toMd blockquote with header', () => {
  const html = `<div><blockquote>
<h2>Important</h2>
<p>Pay attention to this header.</p>
</blockquote>
</div>`;
  const result = toMd(el(html));
  const expected = `
> ## Important
> 
> Pay attention to this header.`.trim();
  strictEqual(result, expected);
});

test('toMd blockquote with code block', () => {
  const html = `<div><blockquote>
<pre class="lang-js s-code-block"><code data-highlighted="yes" class="hljs language-javascript"><span class="hljs-keyword">const</span> x = <span class="hljs-number">42</span>;
</code></pre>
</blockquote>
</div>`;
  const result = toMd(el(html));
  const expected = `
> \`\`\`
> const x = 42;
> \`\`\`
`.trim();
  strictEqual(result, expected);
});

test('toMd blockquote with nested blockquote', () => {
  const html = `<div><blockquote>
<p>Here's what they said:</p>
<blockquote>
<p>It was great!</p>
</blockquote>
</blockquote>
</div>`;
  const result = toMd(el(html));
  const expected = `
> Here's what they said:
> 
> > It was great!`.trim();
  strictEqual(result, expected);
});

test('toMd blockquote with ruler', () => {
  const html = `<div><blockquote>
<p>Before</p>
<hr>
<p>After</p>
</blockquote>
</div>`;
  const result = toMd(el(html));
  const expected = `
> Before
> 
> ---
> 
> After`.trim();
  strictEqual(result, expected);
});

test('toMd list advanced', () => {
  const html = `
<div>
  <ol>
    <li>
      <p>Lists in a list item:</p>
      <ul>
        <li>Indented 3 spaces.
          <ul>
            <li>indented 5 spaces.</li>
          </ul>
        </li>
        <li>3 spaces again.</li>
      </ul>
    </li>
    <li>
      <p>Multiple paragraphs in a list items:
It's best to indent the paragraphs four spaces
You can get away with three, but it can get
confusing when you nest other things.
Stick to four.</p>
      <p>We indented the first line an extra space to align
it with these paragraphs. In real use, we might do
that to the entire list so that all items line up.</p>
      <p>This paragraph is still part of the list item, but it looks messy to humans. So it's a good idea to wrap your nested paragraphs manually, as we did with the first two.</p>
    </li>
    <li>
      <p>Blockquotes in a list item:</p>
      <blockquote>
        <p>Skip a line and
indent the &gt;'s four spaces.</p>
      </blockquote>
    </li>
    <li>
      <p>Preformatted text in a list item:</p>
<pre class="lang-js s-code-block"><code data-highlighted="yes" class="hljs language-javascript"> <span class="hljs-title class_">Skip</span> a line and indent eight spaces.
 <span class="hljs-title class_">That</span><span class="hljs-string">'s four spaces for the list
 and four to trigger the code block.</span></code></pre>
    </li>
  </ol>
</div>`;
  const result = toMd(el(html));
  // console.log('result:\n', result);
  const expected = `
1. Lists in a list item:
   - Indented 3 spaces.
     - indented 5 spaces.
   - 3 spaces again.
2. Multiple paragraphs in a list items: It's best to indent the paragraphs four spaces You can get away with three, but it can get confusing when you nest other things. Stick to four.
   We indented the first line an extra space to align it with these paragraphs. In real use, we might do that to the entire list so that all items line up.
   This paragraph is still part of the list item, but it looks messy to humans. So it's a good idea to wrap your nested paragraphs manually, as we did with the first two.
3. Blockquotes in a list item:
   > Skip a line and indent the >'s four spaces.
4. Preformatted text in a list item:
   \`\`\`
    Skip a line and indent eight spaces.
    That's four spaces for the list
    and four to trigger the code block.
   \`\`\`
`.trim();
  strictEqual(result, expected);
});

test('toMd stackoverflow help style', () => {
  const html = `<div><h1>StackOverflow Advanced List Example</h1>
<ol>
<li>
<p>List nesting:</p>
<ul>
<li>Level 1</li>
<li>Level 2
<ul>
<li>Level 3</li>
</ul>
</li>
</ul>
</li>
<li>
<p>Multiple paragraphs:</p>
<p>Paragraph 1 of item 2.</p>
<p>Paragraph 2 of item 2.</p>
</li>
<li>
<p>Blockquote:</p>
<blockquote>
<p>Quoted inside a list.</p>
</blockquote>
</li>
<li>
<p>Code block:</p>
<pre class="lang-js s-code-block"><code data-highlighted="yes" class="hljs language-javascript"><span class="hljs-keyword">function</span> <span class="hljs-title function_">foo</span>(<span class="hljs-params"></span>) {
  <span class="hljs-keyword">return</span> <span class="hljs-string">"bar"</span>;
}
</code></pre>
</li>
</ol>
</div>`;

  const result = toMd(el(html));
  const expected = `
# StackOverflow Advanced List Example

1. List nesting:
   - Level 1
   - Level 2
     - Level 3
2. Multiple paragraphs:
   Paragraph 1 of item 2.
   Paragraph 2 of item 2.
3. Blockquote:
   > Quoted inside a list.
4. Code block:
   \`\`\`
   function foo() {
     return "bar";
   }
   \`\`\`
`.trim();

  strictEqual(result, expected);
});

test('toMd ordered list with start', () => {
  const html = `<div><ol start="4">
<li>Starting at four, baby!</li>
<li>List item</li>
</ol>
</div>`;
  const result = toMd(el(html));
  const expected = `
4. Starting at four, baby!
5. List item`.trim();
  strictEqual(result, expected);
});

test('toMd nested ols should respect independent start values', () => {
  const html = `
<div>
<ol start="10">
  <li>Outer item 1
    <ol start="3">
      <li>Inner item 1</li>
      <li>Inner item 2</li>
    </ol>
  </li>
  <li>Outer item 2</li>
</ol>
</div>`;

  const result = toMd(el(html));
  const expected = `
10. Outer item 1
    3. Inner item 1
    4. Inner item 2
11. Outer item 2`.trim();

  strictEqual(result.trim(), expected);
});

test('toMd nested ols without start should default correctly', () => {
  const html = `<div>
<ol start="2">
  <li>Outer item A
    <ol>
      <li>Inner item a</li>
      <li>Inner item b</li>
    </ol>
  </li>
</ol>
</div>`;

  const result = toMd(el(html));
  const expected = `
2. Outer item A
   1. Inner item a
   2. Inner item b`.trim();

  strictEqual(result.trim(), expected);
});

test('toMd simple img', () => {
  const html = `<div><p><img src="https://i.sstatic.net/fzsVsZw6.png" alt="wikilogo"></p>
</div>`;
  const result = toMd(el(html));
  const expected = '![wikilogo](https://i.sstatic.net/fzsVsZw6.png)';

  strictEqual(result.trim(), expected);
});

test('toMd imgs combined dump', () => {
  const html = `<div><p><img src="https://i.sstatic.net/fzsVsZw6.png" alt="wikilogo">
<img src="https://i.sstatic.net/fzsVsZw6.png" alt="wikilogo" title="Wikipedia Logo">
<img src="https://i.sstatic.net/fzsVsZw6.png" alt="">
<img src="https://i.sstatic.net/fzsVsZw6.png" alt="">
<img src="https://i.sstatic.net/fzsVsZw6.png" alt="wiki logo" title="logo for wiki">
<a href="https://example.com"></a>
</p>
</div>`;

  const expected = '![wikilogo](https://i.sstatic.net/fzsVsZw6.png) ![wikilogo](https://i.sstatic.net/fzsVsZw6.png "Wikipedia Logo") ![](https://i.sstatic.net/fzsVsZw6.png) ![](https://i.sstatic.net/fzsVsZw6.png) ![wiki logo](https://i.sstatic.net/fzsVsZw6.png "logo for wiki") [](https://example.com/)';
  const result = toMd(el(html));
  // console.log(`--------------\n${result}\n--------------`);
  strictEqual(result, expected);
});

test('toMd img inline with text', () => {
  const html = `<div><p>here's an inline image: <img src="https://i.sstatic.net/fzsVsZw6.png" alt="wikilogo">. it's a picture of a globe!<br>
<img src="https://i.sstatic.net/fzsVsZw6.png" alt="wikilogo"></p>
</div>`;

  const expected = `
here's an inline image: ![wikilogo](https://i.sstatic.net/fzsVsZw6.png). it's a picture of a globe!  
![wikilogo](https://i.sstatic.net/fzsVsZw6.png)
`.trim();

  const result = toMd(el(html));
  strictEqual(result, expected);
});

test('toMd inline html kbd', () => {
  const html = '<div><p>To reboot your computer, press <kbd>ctrl</kbd>+<kbd>alt</kbd>+<kbd>del</kbd>.</p></div>';
  const expected = 'To reboot your computer, press <kbd>ctrl</kbd>+<kbd>alt</kbd>+<kbd>del</kbd>.';

  const result = toMd(el(html));
  strictEqual(result, expected);
});

test('toMd kbd with styling', () => {
  const html = '<div><p>To reboot your computer, press <kbd><b>ctrl</b></kbd>+<i><kbd>alt</kbd></i>+<kbd><strong>del</strong></kbd>.</p></div>';
  const expected = 'To reboot your computer, press <kbd>**ctrl**</kbd>+*<kbd>alt</kbd>*+<kbd>**del**</kbd>.';

  const result = toMd(el(html));
  strictEqual(result, expected);
});

test('toMd sub sup', () => {
  const html = '<div><p>H<sub>2</sub>O, and E = mc<sup>2</sup></p></div>';

  const expected = 'H<sub>2</sub>O, and E = mc<sup>2</sup>';

  const result = toMd(el(html));
  strictEqual(result, expected);
});

describe('toMd tables', () => {
  it('aligns columns using first header row styles', () => {
    const html = `<div>
      <div class="s-table-container">
      <table class="s-table">
      <thead>
      <tr>
      <th style="text-align:left">left</th>
      <th style="text-align:center">center</th>
      <th style="text-align:right">right</th>
      </tr>
      </thead>
      <tbody>
      <tr>
      <td style="text-align:left">First</td>
      <td style="text-align:center">Row</td>
      <td style="text-align:right">#1</td>
      </tr>
      <tr>
      <td style="text-align:left">2nd</td>
      <td style="text-align:center">Row</td>
      <td style="text-align:right">#2</td>
      </tr>
      </tbody>
      </table></div></div>`;

    const expected = `
| left | center | right |
|:--- |:---:| ---:|
| First | Row | #1 |
| 2nd | Row | #2 |
`.trim();

    const result = toMd(el(html));
    strictEqual(result, expected);
  });

  it('renders mixed inline content with correct pipe/HTML escaping', () => {
    const html = `<div><div class="s-table-container"><table class="s-table"><thead>
      <tr>
      <th style="text-align:left">Name <strong>bold</strong></th>
      <th style="text-align:center">Description</th>
      <th style="text-align:right">Code Sample</th>
      <th style="text-align:right">Misc</th>
      </tr>
      </thead>
      <tbody>
      <tr>
      <td style="text-align:left">Alice</td>
      <td style="text-align:center"><em>italic</em> and code</td>
      <td style="text-align:right"><code>let x = 1 \\ 2;</code></td>
      <td style="text-align:right">&lt; shown</td>
      </tr>
      <tr>
      <td style="text-align:left">&lt;tag&gt;</td>
      <td style="text-align:center">Plain</td>
      <td style="text-align:right"><code>foo</code></td>
      <td style="text-align:right">&amp; useful</td>
      </tr>
      <tr>
      <td style="text-align:left"></td>
      <td style="text-align:center">|||||</td>
      <td style="text-align:right"><code>x &lt; y</code></td>
      <td style="text-align:right">Hello, world!</td>
      </tr>
      <tr>
      <td style="text-align:left">Bob</td>
      <td style="text-align:center"></td>
      <td style="text-align:right"><code>&lt;div&gt;hi&lt;/div&gt;</code></td>
      <td style="text-align:right">link</td>
      </tr>
      </tbody>
      </table></div></div>`;

    // logPandocHtmlToMd(html);

    const expected = `
| Name **bold** | Description | Code Sample | Misc |
|:--- |:---:| ---:| ---:|
| Alice | *italic* and code | \`let x = 1 \\ 2;\` | < shown |
| <tag> | Plain | \`foo\` | & useful |
| | \\|\\|\\|\\|\\| | \`x < y\` | Hello, world! |
| Bob | | \`<div>hi</div>\` | link |
`.trim();

    const result = toMd(el(html));
    strictEqual(result, expected);
  });

  it('flattens block content in cells (compact mode)', () => {
    const html = `<div><div class="s-table-container"><table class="s-table"><thead>
      <tr>
      <th>left</th>
      <th>center</th>
      <th>right</th>
      </tr>
      </thead>
      <tbody>
      <tr>
      <td>First</td>
      <td>Row</td>
      <td>#1</td>
      </tr>
      <tr>
      <td>2nd</td>
      <td>Row</td>
      <td>#2 <p> hello</p></td>
      </tr>
      </tbody>
      </table></div></div>`;

    const expected = `
| left | center | right |
| --- | --- | --- |
| First | Row | #1 |
| 2nd | Row | #2 hello |
`.trim();

    const result = toMd(el(html));
    strictEqual(result, expected);
  });

  it('honors header colspan visually (single wide cell)', () => {
    const html = `
      <div>
        <table>
          <thead>
            <tr>
              <th colspan="2">A</th>
              <th>B</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>x</td><td>y</td><td>z</td>
            </tr>
          </tbody>
        </table>
      </div>`.trim();

    const expected = `
| A | | B |
| --- | --- | --- |
| x | y | z |
`.trim();

    const result = toMd(el(html));
    // console.log(result);

    strictEqual(result, expected);
  });

  it('honors data-row colspan visually (no placeholder cells)', () => {
    const html = `
      <div>
        <table>
          <thead>
            <tr><th>H1</th><th>H2</th><th>H3</th></tr>
          </thead>
          <tbody>
            <tr><td colspan="2">wide</td><td>r</td></tr>
            <tr><td>1</td><td>2</td><td>3</td></tr>
          </tbody>
        </table>
      </div>`.trim();

    const expected = `
| H1 | H2 | H3 |
| --- | --- | --- |
| wide | | r |
| 1 | 2 | 3 |
`.trim();

    const result = toMd(el(html));
    // console.log(result);
    strictEqual(result, expected);
  });

  it('lets a long spanning col resize other columns', () => {
    const html = `
      <div>
        <table>
          <thead>
            <tr><th colspan="2">Name</th><th>Age</th></tr>
          </thead>
          <tbody>
            <tr><td colspan="3">* Note: values as of 2024/2025</td></tr>
            <tr><td>Ada</td><td>Lovelace</td><td>36</td></tr>
            <tr><td>Alan</td><td>Turing</td><td>41</td></tr>
          </tbody>
        </table>
      </div>`.trim();

    const expected = `
| Name | | Age |
| --- | --- | --- |
| * Note: values as of 2024/2025 | | |
| Ada | Lovelace | 36 |
| Alan | Turing | 41 |
`.trim();

    const result = toMd(el(html));
    // log(result, { escapeWhitespace: false, jsonifyStrings: false });
    expect(result).toBe(expected);
  });

  it('renders mixed-width Unicode and emoji (length-based width, current behavior)', () => {
    const html = `<div>
      <table>
        <thead>
          <tr>
            <th style="text-align:left">left</th>
            <th style="text-align:center">center</th>
            <th style="text-align:right">right</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>ASCII</td>
            <td>漢字</td>
            <td>e\u0301</td>        <!-- 'e' + combining acute -->
          </tr>
          <tr>
            <td>سلام</td>            <!-- Arabic -->
            <td>😊</td>              <!-- emoji (surrogate pair, length 2) -->
            <td>mix😊e\u0301</td>    <!-- mix of ASCII + emoji + combining -->
          </tr>
        </tbody>
      </table>
    </div>`;

    // Widths under current logic:
    // col1 max len = max(len('left')=4, 'ASCII'=5, 'سلام'=4) = 5
    // col2 max len = max(len('center')=6, '漢字'=2, '😊'=2)   = 6
    // col3 max len = max(len('right')=5, 'é'=2, 'mix😊é'=7) = 7

    // TODO: This is beyond unsatisfactory.
    const expected = `
| left | center | right |
|:--- |:---:| ---:|
| ASCII | 漢字 | é |
| سلام | 😊 | mix😊é |
`.trim();

    const result = toMd(el(html));
    // log(result, { escapeWhitespace: false, jsonifyStrings: false });
    strictEqual(result, expected);
  });

  it('handles row spans', () => {
    const html = `
      <div>
        <table>
          <tr>
            <th rowspan="2">Name</th>
            <th colspan="2">Scores</th>
          </tr>
          <tr>
            <th>Math</th>
            <th>Science</th>
          </tr>
          <tr>
            <td>Alice</td><td>90</td><td>95</td>
          </tr>
        </table>
      </div>`.trim();

    const expected = `
| Name | Scores | |
| --- | --- | --- |
| | Math | Science |
| Alice | 90 | 95 |
`.trim();
    // Visual representation. how it should be damnit :-/
    // | Name  | Scores           |
    // | ----- | ------ | ------- |
    // |       | Math   | Science |
    // | Alice | 90     | 95      |

    const result = toMd(el(html));
    strictEqual(result, expected);
  });

  it('flattens rowspan+colspan that push later headers right (wonky Foo)', () => {
    const html = `
      <div>
        <table>
          <tr>
            <th rowspan="2" colspan="3">Foo</th>
          </tr>
          <tr>
            <th rowspan="2">Name</th>
            <th colspan="2">Scores</th>
          </tr>
          <tr>
            <th>Math</th>
            <th>Science</th>
          </tr>
          <tr>
            <td>Alice</td><td>90</td><td>95</td>
          </tr>
        </table>
      </div>`.trim();

    // Physical width becomes 6 after row 2.
    const expected = `
| Foo | | | | | |
| --- | --- | --- | --- | --- | --- |
| | | | Name | Scores | |
| Math | Science | | | | |
| Alice | 90 | 95 | | | |
`.trim();

    const result = toMd(el(html));
    strictEqual(result, expected);
  });

});

test('toHtml preserves spoiler blockquote', () => {
  const html = `
    <div class="s-prose py16 js-md-preview">
      <blockquote class="spoiler" data-spoiler="Reveal spoiler">
        <p> don't spoil me!!</p>
      </blockquote>
    </div>`.trim();

  const result = toHtml(el(html));
  const expected = `
    <div>
      <blockquote data-spoiler="Reveal spoiler">
        <p> don't spoil me!!</p>
      </blockquote>
    </div>`.trim();

  assertNodeEqual(result, expected);
});

test('toMd figure handling', () => {
  const html = '<figure><img src="pic.jpg" alt="desc"><figcaption>Caption</figcaption></figure>';
  const result = toMd(el(html));
  const expected = ':::figure\n![desc](pic.jpg)\n\nCaption\n:::';
  strictEqual(result, expected);
});

test('toMd figure two images and caption', () => {
  const html = `
    <figure>
      <img src="foo.jpg" alt="foo alt">
      <img src="bar.jpg" alt="bar alt">
      <figcaption>This is a <b>caption</b> with a <a href="/wiki/Link">link</a>.</figcaption>
    </figure>
  `;
  const expected = [
    ':::figure',
    '![foo alt](foo.jpg)',
    '![bar alt](bar.jpg)',
    '',
    'This is a **caption** with a [](/wiki/Link).',
    ':::',
  ].join('\n');
  const result = toMd(el(html));
  strictEqual(result, expected);
});

test('toMd divs block separation', () => {
  const html = `<div>
    <div>Hello</div>
    <div>World</div>
  </div>`;
  const result = toMd(el(html));
  const expected = 'Hello\n\nWorld';
  strictEqual(result, expected);
});

test('toMd anchor with escaped url', () => {
  const html = '<a href="https://en.wikipedia.org/wiki/Stress%E2%80%93energy_tensor" title="Stress–energy tensor">stress–energy tensor</a>';
  const result = toMd(el(html));
  const expected = '[](https://en.wikipedia.org/wiki/Stress–energy_tensor)';
  strictEqual(result, expected);
});

test('toMd div with two spans', () => {
  const html = `<div>
    <span>First</span>
    <span>Second</span>
  </div>`.trim();
  const result = toMd(el(html));
  const expected = 'First Second';
  strictEqual(result, expected);
});

test('toMd listitem with two paragraphs', () => {
  const html = `
<li>
  <p>Para 1</p>
  <p>Para 2</p>
</li>`.trim();
  const result = toMd(el(html));
  // console.log(`----------------\n${result}\n----------------`);
  const expected = `
- Para 1
  Para 2`.trim();
  strictEqual(result, expected);
});

test('white space in a span isnt ignored', () => {
  const html = '<div>Text before<span> </span>and after.</div>';
  const expectedMd = 'Text before and after.';
  strictEqual(toMd(el(html)), expectedMd);
});


describe('toHtml — HTML attributes for inputs', () => {
  it('preserves type=text and value (including empty string) for text inputs', () => {
    const html = `
      <div>
        <input type="text" value="hello" />
        <input type="text" value="" />
      </div>
    `.trim();

    const out = toHtml(el(html));

    const expected = `
      <div>
        <input type="text" value="hello" />
        <input type="text" value="" />
      </div>
    `.trim();
    assertNodeEqual(out, expected);
  });

  it('preserves checkbox checked state via attribute or property', () => {
    const html = `
      <div>
        <input type="checkbox" checked />
        <input type="checkbox" />
      </div>
    `.trim();

    const out = toHtml(el(html));

    const expected = `
      <div>
        <input type="checkbox" checked="" />
        <input type="checkbox" />
      </div>
    `.trim();
    assertNodeEqual(out, expected);
  });

  it('preserves disabled and readonly (boolean attributes + properties)', () => {
    const html = `
      <div>
        <input type="text" value="x" disabled readonly>
        <input type="text" value="y">
      </div>
    `.trim();

    const out = toHtml(el(html));

    const expected = `
      <div>
        <input type="text" value="x" disabled="" readonly="">
        <input type="text" value="y">
      </div>
    `.trim();
    assertNodeEqual(out, expected);
  });

  it('does not force .value for checkbox/radio (but preserves attribute value if present)', () => {
    const html = `
      <div>
        <input type="checkbox" value="on" checked>
        <input type="radio" value="A">
      </div>
    `.trim();

    const out = toHtml(el(html));

    const expected = `
      <div>
        <input type="checkbox" value="on" checked="">
        <input type="radio" value="A">
      </div>
    `.trim();
    assertNodeEqual(out, expected);
  });

  it('handles attribute order: value before type still yields correct .type and .value', () => {
    const html = `
      <div>
        <input value="secret" type="password">
      </div>
    `.trim();

    const out = toHtml(el(html));

    const expected = `
      <div>
        <input type="password" value="secret">
      </div>
    `.trim();
    assertNodeEqual(out, expected);
  });

  it('preserves textarea text as .value (not just attribute/textContent)', () => {
    const html = `
      <div>
        <textarea rows="3" cols="10">line1
line2</textarea>
      </div>
    `.trim();

    const out = toHtml(el(html));

    const expected = `
      <div>
        <textarea rows="3" cols="10">line1
line2</textarea>
      </div>
    `.trim();
    assertNodeEqual(out, expected);
  });

  it('unchecked checkbox has no checked attribute and checked=false', () => {
    const html = `
      <div>
        <input type="checkbox">
      </div>
    `.trim();

    const out = toHtml(el(html));

    const expected = `
      <div>
        <input type="checkbox">
      </div>
    `.trim();
    assertNodeEqual(out, expected);
  });
});

describe('tables with vertical inclinations', () => {
  test('unordered list inside <td> → single-line bullets with reference-style links', () => {
    const html = `
    <div>
      <table class="wikitable">
        <thead>
          <tr>
            <th style="text-align:left">Tensor</th>
            <th style="text-align:left">Related</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="text-align:left">A</td>
            <td style="text-align:left">
              <ul>
                <li><a href="/wiki/Kronecker_delta" title="Kronecker delta"></a></li>
                <li><a href="/wiki/Levi-Civita_symbol">Levi-Civita symbol</a></li>
                <li><a href="/wiki/Metric_tensor">Metric tensor</a></li>
              </ul>
            </td>
          </tr>
          <tr>
            <td style="text-align:left">B</td>
            <td style="text-align:left">
              <ul>
                <li><a href="/wiki/foo">foo</a></li>
                <li><a href="/wiki/bar">bar</a></li>
                <li><a href="/wiki/baz">baz</a></li>
              </ul>
            </td>
          </tr>
        </tbody>
      </table>
    </div>`;

    const expected = `
| Tensor | Related |
|:--- |:--- |
| A | • [Kronecker delta][1] • [Levi-Civita symbol][2] • [Metric tensor][3] |
| B | • [foo][4] • [bar][5] • [baz][6] |

[1]: https://en.wikipedia.org/wiki/Kronecker_delta
[2]: https://en.wikipedia.org/wiki/Levi-Civita_symbol
[3]: https://en.wikipedia.org/wiki/Metric_tensor
[4]: https://en.wikipedia.org/wiki/foo
[5]: https://en.wikipedia.org/wiki/bar
[6]: https://en.wikipedia.org/wiki/baz
`.trim();

    const result = toMd(el(html, 'https://en.wikipedia.org'));
    strictEqual(result, expected);
  });

  test('UL of <img> inside <td> flattens to single line with bullets; refs appended; list spacing ok', () => {
    const html = `
    <div>
      <table class="wikitable">
        <thead>
          <tr>
            <th style="text-align:left">Group</th>
            <th style="text-align:left">Figures</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="text-align:left">Tensors</td>
            <td style="text-align:left">
              <ul>
                <li><img src="/images/kronecker.png" alt="Kronecker delta"></li>
                <li><img src="/images/metric.png" alt="Metric tensor"></li>
                <li><img src="/images/riemann.png" alt="Riemann tensor"></li>
              </ul>
            </td>
          </tr>
        </tbody>
      </table>

      <ul>
        <li>alpha</li>
        <li>beta</li>
      </ul>
    </div>`;

    const doc = el(html, 'https://en.wikipedia.org/wiki/');

    const expected = `
| Group | Figures |
|:--- |:--- |
| Tensors | • ![Kronecker delta][A] • ![Metric tensor][B] • ![Riemann tensor][C] |

[A]: https://en.wikipedia.org/images/kronecker.png
[B]: https://en.wikipedia.org/images/metric.png
[C]: https://en.wikipedia.org/images/riemann.png

- alpha
- beta
`.trim();

    const result = toMd(doc).trim();
    strictEqual(result, expected);
  });

  test('same link and image URL map to same labels', () => {
    const html = `
      <div>
        <table class="wikitable">
          <thead><tr>
            <th style="text-align:left">Col</th>
            <th style="text-align:left">Stuff</th>
          </tr></thead>
          <tbody><tr>
            <td style="text-align:left">X</td>
            <td style="text-align:left">
              <ul>
                <li><a href="/wiki/Foo">Foo</a></li>
                <li><a href="/wiki/Foo">Foo again</a></li>
                <li><img src="/images/a.png" alt="A"></li>
                <li><img src="/images/a.png" alt="A again"></li>
              </ul>
            </td>
          </tr></tbody>
        </table>
      </div>`;
    const doc = el(html, 'https://en.wikipedia.org/wiki/');

    const expected = `
| Col | Stuff |
|:--- |:--- |
| X | • [Foo][1] • [Foo again][1] • ![A][A] • ![A again][A] |

[1]: https://en.wikipedia.org/wiki/Foo
[A]: https://en.wikipedia.org/images/a.png
`.trim();

    strictEqual(toMd(doc).trim(), expected);
  });
});

describe('table cell rendering: blockquote & code in <td>', () => {
  test('blockquote inside <td> (inspect current output)', () => {
    const html = `
      <div>
        <table class="wikitable">
          <thead><tr>
            <th style="text-align:left">Col</th>
            <th style="text-align:left">Content</th>
          </tr></thead>
          <tbody><tr>
            <td style="text-align:left">BQ</td>
            <td style="text-align:left">
              <blockquote>
                <p>Quoted line 1.</p>
                <p>Quoted line 2 with <a href="/wiki/Foo">Foo</a>.</p>
              </blockquote>
            </td>
          </tr></tbody>
        </table>
      </div>`;
    const doc = el(html, 'https://en.wikipedia.org/wiki/');
    const actual = toMd(doc);
    // console.log(actual);
    const expected = `
| Col | Content |
|:--- |:--- |
| BQ | > Quoted line 1. > Quoted line 2 with [Foo][1]. |

[1]: https://en.wikipedia.org/wiki/Foo
`.trim();
    strictEqual(actual, expected);
  });

  test('code/pre inside <td> (inspect current output)', () => {
    const html = `
      <div>
        <table class="wikitable">
          <thead><tr>
            <th style="text-align:left">Col</th>
            <th style="text-align:left">Content</th>
          </tr></thead>
          <tbody>
            <tr>
              <td style="text-align:left">CODE</td>
              <td style="text-align:left">
                <code>sum(x[i] for i in S)</code>
              </td>
            </tr>
            <tr>
              <td style="text-align:left">PRE</td>
              <td style="text-align:left">
<pre><code class="language-js">function f(a, b) {
  return a + b;
}</code></pre>
              </td>
            </tr>
          </tbody>
        </table>
      </div>`;
    const doc = el(html, 'https://en.wikipedia.org/wiki/');
    const actual = toMd(doc);
    // console.log(actual);
    const expected = `
| Col | Content |
|:--- |:--- |
| CODE | \`sum(x[i] for i in S)\` |
| PRE | \`function f(a, b) {\\n  return a + b;\\n}\` |
`.trim();
    strictEqual(actual, expected);
  });
  // | Col  | Content                                    |
  // |:---- |:------------------------------------------ |
  // | CODE | \`sum(x[i] for i in S)\`                     |
  // | PRE  | \` function f(a, b) {\\n  return a + b;\\n} \` |
});

describe('in compact mode', () => {
  test('blockquote: two paragraphs at depth 1 → single line with chevrons', () => {
    const html = `
      <div>
        <blockquote>
          <p>Quoted line 1.</p>
          <p>Quoted line 2 with <a href="https://en.wikipedia.org/wiki/Foo">Foo</a>.</p>
        </blockquote>
      </div>`;
    const expected = `
> Quoted line 1.
> Quoted line 2 with [Foo](https://en.wikipedia.org/wiki/Foo).
`.trim();
    const out = toMd(el(html), { compact: true, filterRedundantLabels: false });
    // console.log(out);
    strictEqual(out, expected);
  });

  test('blockquote: nested (outer + two inner paras) → depth via repeated chevrons', () => {
    const html = `<div><blockquote>
<p>Quoted line 1.</p>
<p>Quoted line 2 with <a href="https://en.wikipedia.org/wiki/Foo">Foo</a>.</p>
</blockquote>
<blockquote>
<p>Outer para.</p>
<blockquote>
<p>Inner para A.</p>
<p>Inner para B.</p>
</blockquote>
</blockquote>
</div>`.trim();
    const expected = `
> Quoted line 1.
> Quoted line 2 with [Foo](https://en.wikipedia.org/wiki/Foo).

> Outer para.
>> Inner para A.
>> Inner para B.
`.trim();
    const out = toMd(el(html), { compact: true, filterRedundantLabels: false });
    strictEqual(out, expected);
  });

  test('blockquote compact: nested inner empty paragraph is removed (no stray >> line)', () => {
    const html = `
<div>
  <blockquote>
    <p>Outer para.</p>
    <blockquote>
      <p>Inner A.</p>
      <p></p>   <!-- empty paragraph -->
      <p>Inner B.</p>
    </blockquote>
  </blockquote>
</div>`.trim();

    // Desired compact output (no blank quoted line between A and B):
    const expected = `
> Outer para.
>> Inner A.
>> Inner B.
`.trim();

    const out = toMd(el(html), { compact: true });
    strictEqual(out, expected);
  });

  test('blockquote compact: canonicalize spacing after chevrons to a single space', () => {
    const html = `
<div>
  <blockquote>
    <p>Outer.</p>
    <blockquote>
      <!-- simulate " >  Inner" style via a text node prefix -->
      <p>  InnerX.</p>
      <p>  InnerY.</p>
    </blockquote>
  </blockquote>
</div>`.trim();

    // Desired: one space after the chevron run, not multiple.
    const expected = `
> Outer.
>> InnerX.
>> InnerY.
`.trim();

    const out = toMd(el(html), { compact: true });
    strictEqual(out, expected);
  });


  test('pre-code block: multiline → inline span with \\n/\\t preserved, spaces unchanged', () => {
    const html = `
<div>
  <pre><code><span>greeting:</span>
  <span>farewell:</span> <span>Goodbye\`</span>
</code></pre>
</div>
`.trim();
    // Ends with a backtick inside payload → use 2-backtick fence with inner padding.
    const expected = `\`\` greeting:\\n  farewell: Goodbye\` \`\``;
    const out = toMd(el(html), { compact: true });
    strictEqual(out, expected);
  });


  test('pre block: multiline → inline span with (no code tag)', () => {
    const html = `
<div>
  <div><pre><span>greeting</span>:
  <span>farewell</span>: <span>Goodbye\`</span></pre>
  </div>
</div>
`.trim();
    const expected = `\`\` greeting:\\n  farewell: Goodbye\` \`\``;
    const out = toMd(el(html), { compact: true });
    strictEqual(out, expected);
  });

  test('inline code: one-liner remains a simple backtick span', () => {
    const html = `
      <div>
        <p>Inline: <code>sum(x[i] for i in S)</code></p>
      </div>`;
    // Single-line target; if your renderer prefixes "Inline: " text, include it here.
    const expected = `
Inline: \`sum(x[i] for i in S)\`
`.trim();
    const out = toMd(el(html), { compact: true });
    strictEqual(out, expected);
  });
});

describe('toMd, NOBR handling', () => {
  it('collapses internal line breaks to single spaces', () => {
    const html = `
      <div>
        <p>A <nobr>alpha
beta
gamma</nobr> Z.</p>
      </div>`.trim();

    const actual = toMd(el(html));
    const expected = `A alpha beta gamma Z.`;
    expect(actual).toBe(expected);
  });

  it('treats <br> inside <nobr> as a space', () => {
    const html = `
      <div>
        <p>Phone:<nobr>+1<br />555<br />1234</nobr></p>
      </div>`.trim();

    const actual = toMd(el(html));
    const expected = `Phone:+1 555 1234`;
    expect(actual).toBe(expected);
  });

  it('preserves inline markup without introducing breaks', () => {
    const html = `
      <div>
        <p>Ref <nobr><em>Foo</em>
          <strong>Bar</strong>   Baz</nobr> end.
        </p>
      </div>`.trim();
    const actual = toMd(el(html));
    const expected = `Ref *Foo* **Bar** Baz end.`;
    expect(actual).toBe(expected);
  });
});

describe('toMd, BR handling', () => {
  it('emits soft line breaks for <br> in normal mode (no collapsing)', () => {
    const html = `
      <div>
        <div>Alpha<span><br />Beta<br /><br /><br />Gamma</span>Omega</div>
      </div>`
      .trim();
    const actual = toMd(el(html));
    const expected = `Alpha  \nBeta  \n  \n  \nGammaOmega`.trim();
    expect(actual).toBe(expected);
  });

  it('trims trailing ASCII run before <br> in normal mode', () => {
    const html = `<p>X   <br/>Y</p>`;
    expect(toMd(el(html))).toBe('X  \nY');
  });

  it('collapses single ASCII space before <br> to soft break', () => {
    const html = `<p>X <br/>Y</p>`;
    expect(toMd(el(html))).toBe('X  \nY');
  });

  it('preserves NBSP before <br> (semantic space)', () => {
    const html = `<p>X\u00A0<br/>Y</p>`;
    expect(toMd(el(html))).toBe('X  \nY');
  });

  it('uses a hard LF inside a PRE tag (wsMode = pre)', () => {
    const html = `<pre>foo   <br/>bar</pre>`;
    expect(toMd(el(html))).toBe('```\nfoo   \nbar\n```');
  });

  it('can spam multiple hard LFs while in pre mode', () => {
    const html = `<pre>x<br/><br/><br/>y</pre>`;
    expect(toMd(el(html))).toBe('```\nx\n\n\ny\n```');
  });

  it('uses soft breaks and hard breaks depending on context; preserves trim spacing within PRE', () => {
    const html = `<div>before<pre> a  <br/>b\t</pre>after</div>`;
    const expected = `
before

\`\`\`
 a  \nb\t
\`\`\`

after
`.trim();
    expect(toMd(el(html))).toBe(expected);
  });
});

describe('toMd – <pre> handling (no <br>)', () => {
  it('renders simple pre as fenced code with exact text', () => {
    const html = `<pre>line1\nline2</pre>`;
    expect(toMd(el(html))).toBe([
      '```',
      'line1',
      'line2',
      '```',
    ].join('\n'));
  });

  it('preserves leading/trailing spaces and tabs exactly', () => {
    const html = `<pre>\tfoo  \n  bar\t</pre>`;
    expect(toMd(el(html))).toBe([
      '```',
      '\tfoo  ',
      '  bar\t',
      '```',
    ].join('\n'));
  });

  it('decodes entities and preserves the resulting characters', () => {
    const html = `<pre>&lt;div class="x"&gt;A&amp;B&lt;/div&gt;</pre>`;
    expect(toMd(el(html))).toBe([
      '```',
      '<div class="x">A&B</div>',
      '```',
    ].join('\n'));
  });

  it('treats inline markup as literal text (no emphasis/links)', () => {
    const html = `<pre>*not italics* [link](x) _nope_</pre>`;
    expect(toMd(el(html))).toBe([
      '```',
      '*not italics* [link](x) _nope_',
      '```',
    ].join('\n'));
  });

  it('collapses <pre><code>…</code></pre> into a single fenced block', () => {
    const html = `<pre><code>const x = 1;\n</code></pre>`;
    expect(toMd(el(html))).toBe([
      '```',
      'const x = 1;',
      '```',
    ].join('\n'));
  });

  it('concatenates child text nodes inside <pre> verbatim', () => {
    const html = `<pre>foo<span> </span>bar<span>  </span>baz</pre>`;
    expect(toMd(el(html))).toBe([
      '```',
      'foo bar  baz',
      '```',
    ].join('\n'));
  });

  it('preserves NBSP exactly inside <pre>', () => {
    const html = `<pre>foo\u00A0bar</pre>`;
    expect(toMd(el(html))).toBe([
      '```',
      'foo\u00A0bar',
      '```',
    ].join('\n'));
  });

  it('ensures final newline before closing fence even if source lacks it', () => {
    const html = `<pre>no-trailing-newline</pre>`;
    expect(toMd(el(html))).toBe([
      '```',
      'no-trailing-newline',
      '```',
    ].join('\n'));
  });

  it('surrounds <pre> with blank lines in block context', () => {
    const html = `<div><div>before</div><pre>x</pre><div>after</div></div>`;
    expect(toMd(el(html))).toBe([
      'before',
      '',
      '```',
      'x',
      '```',
      '',
      'after',
    ].join('\n'));
  });

  it('switches fence when payload contains triple backticks', () => {
    const html = `<pre>alpha\n\`\`\`\nbeta</pre>`;
    // Accept either automatic fence upgrade or escaping strategy; assuming upgrade:
    expect(toMd(el(html))).toBe([
      '````',
      'alpha',
      '```',
      'beta',
      '````',
    ].join('\n'));
  });
});

describe('toMd – <pre> torture pack (no <br>)', () => {
  it('preserves mixed ASCII spaces, tabs, NBSP, and trailing spaces', () => {
    const html = `<pre>␠foo␠\tbar␠\u00A0baz␠␠</pre>`
      .replace(/␠/g, ' ');
    expect(toMd(el(html))).toBe([
      '```',
      ' foo \tbar \u00A0baz  ', // 2 trailing ASCII spaces must survive
      '```',
    ].join('\n'));
  });

  it('decodes entities then preserves literally', () => {
    const html = `<pre>&lt;h1&gt;A&amp;B&nbsp;C&lt;/h1&gt;</pre>`;
    expect(toMd(el(html))).toBe([
      '```',
      '<h1>A&B\u00A0C</h1>', // NBSP remains NBSP
      '```',
    ].join('\n'));
  });

  it.todo('concatenates child nodes verbatim (spans, emphasis, code)', () => {
    const html = `<pre>foo<span>  </span><em>*</em><code>bar</code>_baz_</pre>`;
    expect(toMd(el(html))).toBe([
      '```',
      'foo  *bar_baz_', // no markdown parsing; literal characters
      '```',
    ].join('\n'));
  });

  it('ensures a final newline if source has none', () => {
    const html = `<pre>no-trailing-newline</pre>`;
    expect(toMd(el(html))).toBe([
      '```',
      'no-trailing-newline',
      '```',
    ].join('\n'));
  });

  it.todo('preserves leading and trailing blank lines inside <pre>', () => {
    const html = `<pre>\n\nalpha\n\nbeta\n\n</pre>`;
    expect(toMd(el(html))).toBe([
      '```',
      '',
      'alpha',
      '',
      'beta',
      '',
      '```',
    ].join('\n'));
  });

  it('normalizes CRLF to LF before preservation', () => {
    const html = `<pre>line1\r\nline2\r\nline3</pre>`;
    expect(toMd(el(html))).toBe([
      '```',
      'line1',
      'line2',
      'line3',
      '```',
    ].join('\n'));
  });

  it('handles zero-width spaces and combining marks verbatim', () => {
    const ZWSP = '\u200B';
    const COMB = 'e\u0301'; // e + combining acute
    const html = `<pre>${ZWSP}a${ZWSP} ${COMB}</pre>`;
    expect(toMd(el(html))).toBe([
      '```',
      '\u200Ba\u200B e\u0301',
      '```',
    ].join('\n'));
  });

  it('upgrades fence when payload contains ```', () => {
    const html = `<pre>alpha\n\`\`\`\ninside\n\`\`\`\nomega</pre>`;
    // Expect fence upgrade to tildes for this block
    expect(toMd(el(html))).toBe([
      '````',
      'alpha',
      '```',
      'inside',
      '```',
      'omega',
      '````',
    ].join('\n'));
  });

  it('chooses fence long enough when payload contains ~~~~', () => {
    const html = `<pre>aaa\n~~~~\nbbb</pre>`;
    // Either switch to backticks (preferred) or longer tildes.
    expect(toMd(el(html))).toBe([
      '```',
      'aaa',
      '~~~~',
      'bbb',
      '```',
    ].join('\n'));
  });

  it('keeps exact leading spaces caused by pretty-print + inline child on first line', () => {
    const html = `<pre> <span>x</span> y</pre>`;
    expect(toMd(el(html))).toBe([
      '```',
      ' x y',
      '```',
    ].join('\n'));
  });

  it('multiple adjacent <pre> blocks round-trip with blank lines between', () => {
    const html = `<div><pre>a</pre><pre>b</pre></div>`;
    expect(toMd(el(html))).toBe([
      '```',
      'a',
      '```',
      '',
      '```',
      'b',
      '```',
    ].join('\n'));
  });

  it('empty <pre> becomes empty fenced block', () => {
    const html = `<pre></pre>`;
    expect(toMd(el(html))).toBe([
      '```',
      '',
      '```',
    ].join('\n'));
  });

  it('list-item context: fences align and inner bytes remain verbatim', () => {
    const html = `
      <ol>
        <li><pre>  a\n b</pre>
        </li>
      </ol>`.trim();
    const result = toMd(el(html));
    expect(result).toBe(`
1. \`\`\`
     a
    b
   \`\`\`
`.trim());
  });

  it('nested markup inside pre/code is flattened: <pre><code>…</code></pre>', () => {
    const html = `<pre><code> const x=1;\n  const y=2;</code></pre>`;
    expect(toMd(el(html))).toBe([
      '```',
      ' const x=1;',
      '  const y=2;',
      '```',
    ].join('\n'));
  });

  it('very long line is untouched (no wrapping)', () => {
    const long = 'x'.repeat(200);
    const html = `<pre>${long}</pre>`;
    expect(toMd(el(html))).toBe([
      '```',
      long,
      '```',
    ].join('\n'));
  });
});

describe('toMd – list first-child policy (two-item <ol>)', () => {
  it('p (single paragraph → inline)', () => {
    const html = `
      <ol>
        <li><p>Alpha para only</p></li>
        <li><p>Bravo para only</p></li>
      </ol>
    `.trim();

    const expected = `
1. Alpha para only
2. Bravo para only
`.trim();

    expect(toMd(el(html))).toBe(expected);
  });

  it('p (multiple paragraphs → first inline, rest indented)', () => {
    const html = `
      <ol>
        <li>
          <p>Alpha first paragraph.</p>
          <p>Alpha second paragraph.</p>
        </li>
        <li>
          <p>Bravo first paragraph.</p>
          <p>Bravo second paragraph.</p>
        </li>
      </ol>
    `.trim();

    const expected = `
1. Alpha first paragraph.
   Alpha second paragraph.
2. Bravo first paragraph.
   Bravo second paragraph.
`.trim();

    expect(toMd(el(html))).toBe(expected);
  });

  it('div (generic block → on next line)', () => {
    const html = `
      <ol>
        <li><div>Alpha in a div</div></li>
        <li><div>Bravo in a div</div></li>
      </ol>
    `.trim();

    const expected = `
1. Alpha in a div
2. Bravo in a div
`.trim();

    expect(toMd(el(html))).toBe(expected);
  });

  it('span (inline → same line)', () => {
    const html = `
      <ol>
        <li><span>Alpha in a span</span></li>
        <li><span>Bravo in a span</span></li>
      </ol>
    `.trim();

    const expected = `
1. Alpha in a span
2. Bravo in a span
`.trim();

    expect(toMd(el(html))).toBe(expected);
  });

  it('strong/b (inline → same line)', () => {
    const html = `
      <ol>
        <li><strong>Alpha</strong> bold</li>
        <li><b>Bravo</b> bold</li>
      </ol>
    `.trim();

    const expected = `
1. **Alpha** bold
2. **Bravo** bold
`.trim();

    expect(toMd(el(html))).toBe(expected);
  });

  it('a (inline link → same line)', () => {
    const html = `
      <ol>
        <li><a href="https://x.test/a">Alpha link</a></li>
        <li><a href="https://x.test/b">Bravo link</a></li>
      </ol>
    `.trim();

    const expected = `
1. [Alpha link](https://x.test/a)
2. [Bravo link](https://x.test/b)
`.trim();

    expect(toMd(el(html))).toBe(expected);
  });

  it('h1 (block heading → on next line, indented)', () => {
    const html = `
      <ol>
        <li><h1>Alpha Heading</h1></li>
        <li><h1>Bravo Heading</h1></li>
      </ol>
    `.trim();

    const expected = `
1. # Alpha Heading
2. # Bravo Heading
`.trim();

    expect(toMd(el(html))).toBe(expected);
  });

  it('nested ol (block list → on next line; inner list indented)', () => {
    const html = `
      <ol id="1">
        <li id="2">
          <ol id="3">
            <li id="4">Alpha.1</li>
            <li id="5">Alpha.2</li>
          </ol>
        </li>
        <li id="6">
          <ol id="7">
            <li id="8">Bravo.1</li>
            <li id="9">Bravo.2</li>
          </ol>
        </li>
      </ol>
    `.trim();

    const expected = `
1.
   1. Alpha.1
   2. Alpha.2
2.
   1. Bravo.1
   2. Bravo.2
`.trim();
    //     const foo = `
    // 1.
    //    1. Alpha.1
    //    2. Alpha.2
    // 2. 1. Bravo.1
    //    2. Bravo.2
    // `;
    const result = toMd(el(html));
    // console.log(result);
    expect(result).toBe(expected);
  });
});

describe('inline whitespace contributed by elements', () => {
  it('fuses adjacent inline spans with no separator', () => {
    const html = `
      <div>
        <span>A</span><span>B</span>
      </div>
    `.trim();
    const result = toMd(el(html));
    const expected = `AB`;
    strictEqual(result, expected);
  });

  it('preserves a single collapsed space when a whitespace-only span sits between inline spans', () => {
    const html = `
      <div>
        <span>A</span><span> </span><span>B</span>
      </div>
    `.trim();
    const result = toMd(el(html));
    const expected = `A B`;
    strictEqual(result, expected);
  });

  it('preserves a single collapsed space when a whitespace-only span sits between p tags', () => {
    const html = `
      <div>
        <span>A</span><p> </p><span>B</span>
      </div>
    `.trim();
    const result = toMd(el(html));
    // console.log(`-------------\n${result}\n-------------`);
    const expected = `A B`;
    strictEqual(result, expected);
  });

  it('drops leading/trailing whitespace-only elements at container edges', () => {
    const html = `
      <div>
        <span> </span><span>A</span><span> </span>
      </div>
    `.trim();
    const result = toMd(el(html));
    const expected = `A`;
    strictEqual(result, expected);
  });

  it('does not emit a space when a whitespace-only element precedes a block emission', () => {
    const html = `
      <div>
        <span>A</span><p> </p><p>B</p>
      </div>
    `.trim();
    const result = toMd(el(html));
    const expected = `A\n\nB`; // no "A ␣\n\nB"
    strictEqual(result, expected);
  });

  it('does not insert a space for an empty element with no text between inline siblings', () => {
    const html = `
      <div>
        <span>A</span><span></span><span>B</span>
      </div>
    `.trim();
    const result = toMd(el(html));
    const expected = `AB`; // no space — the middle <span> is empty, not whitespace
    strictEqual(result, expected);
  });

  it('does not treat a nontext-only container with formatting whitespace as whitespace', () => {
    const html = `
      <div>
        <div>
          <img src="https://i.sstatic.net/fzsVsZw6.png" alt="wikilogo">
        </div>
      </div>
    `.trim();

    const result = toMd(el(html));
    const expected = '![wikilogo](https://i.sstatic.net/fzsVsZw6.png)';
    strictEqual(result, expected);
  });


});

describe('toMd – list item formatting', () => {
  it('UL: strong + text has no leading newline inside LI', () => {
    const html = `
      <ul><li><strong>Bold</strong> then text</li></ul>
    `.trim();

    const result = toMd(el(html));

    expect(result).toBe(`
- **Bold** then text
`.trim());
  });

  it('UL: <br> soft-wraps continuation lines under bullet', () => {
    const html = `
      <ul><li>First line<br>Second line<br>Third</li></ul>
    `.trim();

    const result = toMd(el(html));

    expect(result).toBe(`
- First line  
  Second line  
  Third
`.trim());
  });

  it('UL: two paragraphs in one LI keep a blank line with continuation indent', () => {
    const html = `
      <ul><li><p>Para1</p><p>Para2</p></li></ul>
    `.trim();

    const result = toMd(el(html));

    expect(result).toBe(`
- Para1
  Para2
`.trim());
  });

  it('UL: neighboring LIs remain intact across blank line inside previous item', () => {
    const html = `
      <ul>
        <li><p>Para1</p><p>Para2</p></li>
        <li><p>Next</p></li>
      </ul>
    `.trim();

    const result = toMd(el(html));

    expect(result).toBe(`
- Para1
  Para2
- Next
`.trim());
  });

  it('OL: honors start index and aligns continuation by marker width', () => {
    const html = `
      <ol start="9">
        <li><p>L9 line1<br><br>line2</p></li>
        <li><p>L10 line1<br>line2</p></li>
      </ol>
    `.trim();

    const result = toMd(el(html));
    // console.log(`----------------\n${result}\n----------------\n\n`);

    expect(result).toBe(`
9. L9 line1  
  
   line2
10. L10 line1  
    line2
`.trim());
  });

  it('UL: preserves required space after marker even if content would begin with a newline', () => {
    const html = `
      <ul><li><p></p><p>A</p></li></ul>
    `.trim();

    const result = toMd(el(html));

    expect(result).toBe(`
- A
`.trim());
  });

  it('UL: first child blockquote does not leave an extra blank line after marker', () => {
    const html = `
      <ul><li><blockquote><p>A</p><p>B</p></blockquote></li></ul>
    `.trim();

    const result = toMd(el(html));
    // console.log(`----------------\n${result}\n----------------\n\n`);

    expect(result).toBe(`
- > A
  > B
`.trim());
  });

  it('UL: first child pre/code keeps bullet space, renders as a block', () => {
    const html = `
      <ul><li><pre><code>line</code></pre></li></ul>
    `.trim();

    const result = toMd(el(html));
    // console.log(`------------\n${result}\n----------------\n`);

    expect(result).toBe(`
- \`\`\`
  line
  \`\`\`
`.trim());
  });

  it('UL: compact mode uses "• " and pads continuation to length of marker', () => {
    const html = `
      <ul><li>Cell item<br>wrap</li></ul>
    `.trim();

    const result = toMd(el(html), { compact: true });

    expect(result).toBe(`
• Cell item
  wrap
`.trim());
  });

  it('OL: <br><br> yields a blank line; continuation padded; no spaces-only line', () => {
    const html = `
      <ol start="9">
        <li><p>L9 line1<br><br>line2</p></li>
      </ol>
    `.trim();

    const result = toMd(el(html));
    expect(result).toBe(`
9. L9 line1  
  
   line2
`.trim());
  });

  it('UL: single <br> keeps continuation pad on next line', () => {
    const html = `
      <ul><li>First<br>Second</li></ul>
    `.trim();

    const result = toMd(el(html));
    // console.log(`------------\n${result}\n----------------\n`);
    expect(result).toBe(`
- First  
  Second
  `.trim());
  });

  it('handles hard breaks', () => {
    const html = `
      <ol start="9">
        <li><p>line1<br><br>line2</p></li>
        <li><p>line1<br><br><br>line2</p></li>
      </ol>
    `.trim();

    const result = toMd(el(html), { brMode: 'hard' });
    expect(result).toBe(`
9. line1

   line2
10. line1


    line2
`.trim());
  });

  it('UL: <br> with brMode=escape', () => {
    const html = `<ul><li>A<br>B</li></ul>`;
    const result = toMd(el(html), { brMode: 'escape' });
    expect(result).toBe(`
- A\\
  B
  `.trim());
  });

  it('compact mode collapses <br> to a space regardless of brMode', () => {
    const html = `<ul><li>X<br>Y</li></ul>`;
    const r1 = toMd(el(html), { compact: true, brMode: 'hard' });
    const r2 = toMd(el(html), { compact: true, brMode: 'escape' });
    const r3 = toMd(el(html), { compact: true, brMode: 'soft' });
    // console.log(`---\n${r1}\n---`); console.log(`---\n${r2}\n---`); console.log(`---\n${r3}\n---`);
    expect(r1).toBe(`• X\n  Y`);
    expect(r2).toBe(`• X\n  Y`);
    expect(r3).toBe(`• X\n  Y`);
  });

});

test('skipped elements between inline and block content do not introduce phantom spaces', () => {
  const html = `<div>foo <script>d</script><p>bar</p></div>`;
  const md = toMd(el(html));
  const expected = `foo\n\nbar`;

  expect(md).toBe(expected);
});

describe('SVG handling', () => {
  const svgHtml = `
    <svg
      class="octicon octicon-git-merge merged color-fg-done mr-1"
      title="Merged"
      viewBox="0 0 16 16"
      version="1.1"
      width="16"
      height="16"
      aria-hidden="true"
    >
      <path
        d="M5.45 5.154A4.25 4.25 0 0 0 9.25 7.5h1.378a2.251 2.251 0 1 1 0 1.5H9.25A5.734 5.734 0 0 1 5 7.123v3.505a2.25 2.25 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.95-.218ZM4.25 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm8.5-4.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM5 3.25a.75.75 0 1 0 0 .005V3.25Z"
      ></path>
    </svg>
  `.trim();

  test('toHtml() preserves inline svg elements and key attributes', () => {
    const html = `
      <div>
        <p>PR status:</p>
        ${svgHtml}
      </div>
    `.trim();
    const result = toHtml(el(html));
    const expected = `
      <div>
        <p>PR status:</p>
        <svg
          title="Merged"
          viewBox="0 0 16 16"
          width="16"
          height="16"
        >
          <path
            d="M5.45 5.154A4.25 4.25 0 0 0 9.25 7.5h1.378a2.251 2.251 0 1 1 0 1.5H9.25A5.734 5.734 0 0 1 5 7.123v3.505a2.25 2.25 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.95-.218ZM4.25 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm8.5-4.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM5 3.25a.75.75 0 1 0 0 .005V3.25Z"
          ></path>
        </svg>
      </div>
    `.trim();

    assertNodeEqual(result, expected, { dropWsNodes: true });
  });

  test('toMd() emits a compact SVG sentinel instead of raw svg markup', () => {
    const html = `
      <div>
        <p>PR status:</p>
        ${svgHtml}
      </div>
    `.trim();
    const md = toMd(el(html));
    expect(md).toBe('PR status:\n\n[[SVG]]');
  });

  test('toMd() inlines the SVG sentinel when svg appears inside a paragraph', () => {
    const html = `
      <p>PR status:  ${svgHtml}</p>
    `.trim();
    const md = toMd(el(html));
    expect(md).toBe('PR status: [[SVG]]');
  });
});
